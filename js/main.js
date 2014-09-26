
$(function() {
  var mode = document.URL.split('#')[0].split('/').pop();
  lectour.init(mode, '#slides');

	$('#slides').jmpress();

  $('.step').on('enterStep', function(event) {
    if (mode === 'presenter') {
      lectour.pub(['audience', 'projector'], 'goto', event.target.id);
    }
  });

  $('.help').on('lt:up:help', function(event, item, value) {
    $(event.target).text(value);
  });

  $('.help').each(function(i, node) {
    lectour.get('#' + node.id, 'help');
  });

  $('.comment').on('lt:up:comment', function(event, item, value) {
    console.log('lt:up:comment', item, value);
  });

  $('#slides').on('lt:audience:goto', function(event, slide) {
    $('#slides').jmpress('goTo', '#' + slide);
  });

  $('#slides').on('lt:presenter:goto', function(event, slide) {
    $('#slides').jmpress('goTo', '#' + slide);
  });

});
