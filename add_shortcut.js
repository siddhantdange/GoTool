
$(document).ready(function(){
  var getParameterByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  var title = getParameterByName("title");
  if (title) {
    $('#form_title').val(title);
  }

  $('#submit_form_button').click(function(e){
    var title = $('#form_title').val();
    var url = $('#form_url').val();
    saveShortcut(title, url, function() {
      navigate(url);
    }, function() {
      alert('Could not update shortcuts at this time!');
    })
  });
});
