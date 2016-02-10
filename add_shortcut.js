
var getParameterByName = function(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).ready(function(){
  var title = getParameterByName("title");
  if (title) {
    $('#form_title').val(title);
  }

  var url = getParameterByName("url");
  if (url) {
    $('#form_url').val(url);
  }

  $('#submit_form_button').click(function(e) {
    var title = $('#form_title').val();
    var url = $('#form_url').val();

    var shortcut = new Shortcut(title, url);

    shortcut.save(function() {
      navigate(url);
    }, function() {
      alert('Could not update shortcuts at this time!');
    });
  });
});
