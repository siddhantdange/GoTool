
Shortcut.prototype.getDomObject = function() {
  var self_shortcut = this;
  return $('<li>').append($('<div>').append($('<span>').text(this.title)).attr({class:'shortcutDiv titleDiv'}))
                        .append($('<div>').append($('<span>').text(this.url)).attr({class:'shortcutDiv urlDiv'}))
                        .append($('<div>').append($('<img>').attr({src:'../res/x.png'}))
                                          .attr({class:'shortcutDiv deleteDiv'})
                                          .click(function(e){
                                            self_shortcut.remove();
                                            $(this).parent().remove();
                                          }));
}

$(document).ready(function() {
  $("#shortcut_list").empty();
  ShortcutFactory.getAllShortcuts(function(shortcuts){
    for (var i = 0; i < shortcuts.length; i+=1) {
      var shortcut = shortcuts[i];
      $("#shortcut_list").append(shortcut.getDomObject());
    }
  });
});
