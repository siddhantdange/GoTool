
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

   ChromeStorageManager.add(pack, success);
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
  return ChromeStorageManager.getAllKeyValuePairs(function(shortcut_raw_dict){
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

    return navigate(shortcut.url);
  });
});
