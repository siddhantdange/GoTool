
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

chrome.omnibox.onInputEntered.addListener(function(text) {
	  navigate("http://google.com");
});
