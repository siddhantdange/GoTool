
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

function saveShortcut(name, url, success, error) {

   if (!name || !url) {
     if (error) {
       error('Error: No value specified');
     }

     return;
   }

   var pack = {};
   pack[name] = url;
   chrome.storage.sync.set(pack, function() {
     if (success) {
       success();
     }
   });
}

function getShortcut(name, callback) {
  return chrome.storage.sync.get(name, function(url_dict) {
    var len = Object.keys(url_dict).length;
    if (!len) {
      if (callback) {
        callback(null);
      }
      return;
    }

    if (callback) {
      callback(url_dict[name]);
    }
  });
}

function getAllShortcuts(callback) {
  return chrome.storage.sync.get(null, function(url_dict) {
    if (callback) {
      callback(url_dict);
    }
  });
}

chrome.omnibox.onInputEntered.addListener(function(text) {
  getShortcut(text, function(url_back){
    url = url_back;
    if (!url) {
      url = chrome.extension.getURL('templates/add_shortcut.html');
      console.log(url);
    }
    navigate(url);
  });
});
