
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

function saveShortcut(title, url, success, error) {

   if (!title || !url) {
     if (error) {
       error('Error: No value specified');
     }

     return;
   }

   var pack = {};
   pack[title] = url;

   ChromeStorageManager.add(pack, success);
}

function getShortcut(title, callback) {
  return ChromeStorageManager.getValue(title, function(url_dict) {
    var len = Object.keys(url_dict).length;
    if (!len) {
      if (callback) {
        callback(null);
      }
      return;
    }

    if (callback) {
      callback(url_dict[title]);
    }
  });
}

function getAllShortcuts(callback) {
  return ChromeStorageManager.getAllKeyValuePairs(callback);
}

function removeShortcut(title, callback) {
  return ChromeStorageManager.removeKey(title, callback);
}

chrome.omnibox.onInputEntered.addListener(function(text) {
  if (text == 'manage') {
    url = chrome.extension.getURL('templates/manage_shortcuts.html');
    navigate(url);
    return;
  }
  getShortcut(text, function(url_back){
    url = url_back;
    if (!url) {
      url = chrome.extension.getURL('templates/add_shortcut.html?title=' + text);
    }
    navigate(url);
  });
});
