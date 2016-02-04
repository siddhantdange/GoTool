$(document).ready(function(){
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
