$(function() {
  var mode = location.pathname.substr(1);
  lectour.init(mode, '#slides');

  // ==========================================================================
  // user actions on slides
  // ==========================================================================
  $('[data-lt-help]').each(function(i, el) {
    if (lectour.mode !== 'audience')
      return;
    var $el = $(el);
    var $clicker = $('h1', $el);
    if ($clicker.size() !== 1)
      $clicker = $el;
    var onClick = function(event) {
      $(this).addClass('clicked');
      lectour.inc('#' + el.id, 'help', ['*']);
      $(this).off('click', onClick);
    };
    $clicker.on('click', onClick);
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

  $('#slides').on('lt:audience:goto lt:projector:goto', function(event, slide) {
    lectour.moveToSlideID(slide);
  });
});
