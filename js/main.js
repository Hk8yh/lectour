$(function() {
  var mode = location.pathname.substr(1);
  lectour.init(mode, '#slides');

  // ==========================================================================
  // slide nagivation
  // ==========================================================================
  $('#slides').jmpress();

  $('.step').on('enterStep', function(event) {
    if (lectour.mode === 'presenter') {
      lectour.pub(['audience', 'projector'], 'goto', event.target.id);
    }
  });


  // ==========================================================================
  // user actions on slides
  // ==========================================================================
  $('.help').each(function(i, node) {
    lectour.get('#' + node.id, 'help');
  });

  $('[data-lt-multichoice]').each(function(i, node) {
    if (!node.id || lectour.mode !== 'audience')
      return;
    $('li', node).each(function(j, li) {
      var $li = $(li);
      var onClick = function(event) {
        $li.off('click', onClick);
        var sel = '#' + node.id + ' [data-lt-multichoice-option=' + j + ']';
        lectour.hincr(sel, 'multichoice', j, ['presenter']);
      };
      $li
        .attr('data-lt-multichoice-option', j)
        .on('click', onClick);
    });
  });


  // ==========================================================================
  // responding to events
  // ==========================================================================
  $('.comment').on('lt:up:comment', function(event, item, value) {
    console.log('lt:up:comment', item, value);
  });

  $('body').on('lt:up:multichoice', '[data-lt-multichoice-option]', function(event, data, value) {
    $(this).attr('data-lt-multichoice-count', value);
  });

  $('.help').on('lt:up:help', function(event, item, value) {
    $(event.target).text(value);
  });

  $('#slides').on('lt:audience:goto', function(event, slide) {
    $('#slides').jmpress('goTo', '#' + slide);
  });

  $('#slides').on('lt:presenter:goto', function(event, slide) {
    $('#slides').jmpress('goTo', '#' + slide);
  });
});
