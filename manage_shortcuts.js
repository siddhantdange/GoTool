
$(document).ready(function(){
  var updateListView = function(shortcut_dict) {

    $("#shortcut_list").empty();
    
    var keys = Object.keys(shortcut_dict);
    for (var i = 0; i < keys.length; i+=1) {
      var title = keys[i];
      var url = shortcut_dict[title];

      $pair = $('<li>').append($('<div>').append($('<span>').text(title)).attr({class:'shortcutDiv titleDiv'}))
                       .append($('<div>').append($('<span>').text(url)).attr({class:'shortcutDiv urlDiv'}))
                       .append($('<div>').append($('<img>').attr({src:'../res/x.png'})).attr({class:'shortcutDiv deleteDiv'}));

      $("#shortcut_list").append($pair);
    }
  }


  getAllShortcuts(function(shortcut_dict) {
    updateListView(shortcut_dict);

    $('.deleteDiv').click(function(e){
      var titleText = $(this).parent().find('.titleDiv').text();
      var retVal = confirm("Sure you want to delete " + titleText + "?");
      if(retVal) {
        removeShortcut(titleText, function(){
          getAllShortcuts(function(shortcut_dict) {
            updateListView(shortcut_dict);
          });
        });
      }
    });
  });
});
