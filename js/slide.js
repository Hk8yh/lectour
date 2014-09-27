$(function() {
  var mode = location.pathname.substr(1);
  lectour.init(mode);

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
      lectour.inc('#' + el.id, 'help', ['*']);
      $(this).addClass('clicked').off('click', onClick);
    };
    $clicker.on('click', onClick);
  });

  $('[data-lt-multichoice]').each(function(i, node) {
    if (!node.id || lectour.mode !== 'audience')
      return;

    function registerToVote(j, li) {
      var $li = $(li);
      var onClick = function(event) {
        $li.off('click', onClick);
        $(this).off('click', onClick);
        var sel = '#' + node.id + ' [data-lt-multichoice-option="' + j + '"]';
        lectour.hinc(sel, 'multichoice', j, ['presenter']);
      };
      $li
        .attr('data-lt-multichoice-option', j)
        .on('click', onClick);
    }

    $('li', node).each(registerToVote);
  });

  $('[data-lt-addable]').each(function(i, node) {
    console.log('lt-addable', node);

    var $text = $('<input type="text" />');
    var $submit = $('<input type="submit" />');
    var $li = $('<li class="lt-added"></li>');
    $li.append($text);
    $li.append($submit);
    $(node).append($li);

    function registerToVote(j, li) {
      var $li = $(li);
      var onClick = function(event) {
        $li.off('click', onClick);
        var sel = '#' + node.id + ' [data-lt-multichoice-option="' + j + '"]';
        lectour.hinc(sel, 'multichoice', j, ['presenter']);
      };
      $li
        .attr('data-lt-multichoice-option', j)
        .on('click', onClick);
    }

    var onAddClick = function(event) {
      $submit.off('click', onAddClick);
      var option = $text.val().toLowerCase();
      $li.html('');
      registerToVote(option, $li);
    };

    $submit.on('click', onAddClick);
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

  $('body').on('lt:up:help', '[data-lt-help]', function(event, item, value) {
    var $clicker = $('h1', $(this));
    if ($clicker.size() !== 1)
      $clicker = $(this);
    $clicker.attr('data-lt-help-count', value);
    lectour.checkHelpThreshold(value, $(this).data('lt-help'));
  });

  $('body').on('lt:up:survey', '[data-lt-survey-type="list"]', function(event, data, value) {
    console.log('survey', data, value);
  });

  $('#slides').on('lt:audience:goto lt:projector:goto', function(event, slide) {
    lectour.moveToSlideID(slide);
  });
});
