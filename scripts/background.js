
function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
     description : 'Go To:'
  });
}
resetDefaultSuggestion();

function navigate(url) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     chrome.tabs.update(tabs[0].id, {url: url});
  });
}

function ChromeStorageManager() {}

ChromeStorageManager.add = function(key_value_dict, success) {
  chrome.storage.sync.set(key_value_dict, success);
}

ChromeStorageManager.getValue = function(key, callback) {
  return chrome.storage.sync.get(key, callback);
}

ChromeStorageManager.getAllKeyValuePairs = function(callback) {
  return chrome.storage.sync.get(null, callback);
}

ChromeStorageManager.removeKey = function(key, callback) {
  return chrome.storage.sync.remove(key, callback);
}

ChromeStorageManager.getUrlForResourcePath = function(resPath, query) {
  if (query) {
    var queryStr = ''
    var keys = Object.keys(query);
    for (var idx in keys) {
      var key = keys[idx];
      queryStr += '&' + key + '=' + query[key];
    }

    if (queryStr && queryStr.length) {
      resPath += '?' + queryStr;
    }
  }

  return chrome.extension.getURL(resPath);
}

function APIConnector () {};

APIConnector.baseURL = "https://burning-heat-1784.firebaseio.com/";

APIConnector.getUsageURL = function(user_id, timestamp) {
  var url = APIConnector.baseURL;
  url += "usage/" + user_id + '/' + timestamp + '.json';
  return url;
}

APIConnector.getShortcutLibraryURL = function(user_id, timestamp) {
  var url = APIConnector.baseURL;
  url += "shortcut_library/" + user_id + '/' + timestamp + '.json';
  return url;
}

APIConnector.sendPUTRequest = function(url, data, callback) {
  var http = new XMLHttpRequest();
  http.open("PUT", url, true);

  //Send the proper header information along with the request
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.send(data);

  if (callback) {
    callback();
  }
}

APIConnector.sendUsageData = function(data, callback) {
  var url = APIConnector.getUsageURL(data['user_id'], data['timestamp']);
  APIConnector.sendPUTRequest(url, JSON.stringify(data), callback);
}

APIConnector.sendShortcutLibraryData = function(data, callback) {
  var url = APIConnector.getShortcutLibraryURL(data['user_id'], data['timestamp']);
  APIConnector.sendPUTRequest(url, JSON.stringify(data), callback);
}

// We want to track #times/day usage
// We want to track size of shortcut library
function AnalyticsManager() {};

AnalyticsManager.generateGuid = function() {
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  return guid();
}

AnalyticsManager.getUserId = function(callback) {
   ChromeStorageManager.getValue('user_id', function(user_id) {

     if (!Object.keys(user_id).length) {
       user_id = AnalyticsManager.generateGuid();
       ChromeStorageManager.add({
         'user_id' : user_id
       });
     }

     callback(user_id['user_id']);
   });
}

AnalyticsManager.getShortcutLibraryLength = function(callback) {
  ShortcutFactory.getAllShortcuts(function(shortcuts) {
    callback(shortcuts.length);
  });
}

AnalyticsManager.createUsagePacket = function(callback) {
  AnalyticsManager.getUserId(function(uuid) {
    var usage_packet = {
      user_id : uuid,
      timestamp : Date.now(),
      packet_type: 'USAGE'
    }

    callback(usage_packet);
  });
}

AnalyticsManager.createShortcutLibraryDataPacket = function(callback) {
  AnalyticsManager.getUserId(function(uuid) {
    AnalyticsManager.getShortcutLibraryLength(function(num_shortcuts) {
      var library_packet = {
        user_id : uuid,
        timestamp : Date.now(),
        shortcut_library_length : num_shortcuts,
        packet_type: 'SHORTCUT_LIBRARY'
      }

      callback(library_packet);
    });
  });
}

AnalyticsManager.logUsage = function(callback) {
  AnalyticsManager.createUsagePacket(function(usage_packet) {
    APIConnector.sendUsageData(usage_packet, callback);
  });
}

AnalyticsManager.logShortcutLibraryData = function(callback) {
  AnalyticsManager.createShortcutLibraryDataPacket(function(data_packet) {
    APIConnector.sendShortcutLibraryData(data_packet, callback);
  });
}

function Shortcut(title, url) {
  this.title = title;
  this.url = url;
}

Shortcut.prototype.save = function(success, error) {
   if (!this.title || !this.url) {
     if (error) {
       error('Error: No value specified');
     }

     return;
   }

   var pack = {};
   pack[this.title] = this.url;

   ChromeStorageManager.add(pack, function() {
     success();
   });
}

Shortcut.prototype.remove = function(callback) {
  return ChromeStorageManager.removeKey(this.title, callback);
}

function ShortcutFactory() {}

ShortcutFactory.getShortcut = function(title, callback) {
  return ChromeStorageManager.getValue(title, function(url_dict) {
    var len = Object.keys(url_dict).length;
    if (!len) {
      if (callback) {
        return callback(null);
      }
      return;
    }

    if (callback) {
      var shortcut = new Shortcut(title, url_dict[title]);
      return callback(shortcut);
    }
  });
}

ShortcutFactory.getAllShortcuts = function (callback) {
  return ChromeStorageManager.getAllKeyValuePairs(function(shortcut_raw_dict) {
    var titles = Object.keys(shortcut_raw_dict);
    var shortcuts = [];
    for (var i = 0; i < titles.length; i+=1) {
      var title = titles[i];
      var url = shortcut_raw_dict[title];
      var shortcut = new Shortcut(title, url);
      shortcuts.push(shortcut);
    }

    callback(shortcuts);
  });
}

chrome.omnibox.onInputEntered.addListener(function(text) {

  if (text == 'manage') {
    url = ChromeStorageManager.getUrlForResourcePath('templates/manage_shortcuts.html', null);
    return navigate(url);
  }

  if (text == 'add') {
    return chrome.tabs.query({
      'active': true,
      'lastFocusedWindow': true,
      'currentWindow': true
    }, function (tabs) {
      var url = tabs[0].url;
      var add_shortcut_url = ChromeStorageManager.getUrlForResourcePath('templates/add_shortcut.html',
                                                                        { 'url' : url }
                                                                      );
      return navigate(add_shortcut_url);
    });
  }

  if (text == 'help') {
    return navigate('https://github.com/siddhantdange/GoTool#readme');
  }

  ShortcutFactory.getShortcut(text, function(shortcut) {
    if (!shortcut) {
      return alert('no such shortcut has been made!');
    }

    AnalyticsManager.logUsage();

    return navigate(shortcut.url);
  });
});
