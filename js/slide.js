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


  $('[data-lt-brainstorm]').each(function(i, el) {
    if (!el.id)
      return;
    var tags = {
      'Hello': 1,
      'world': 3,
      'normally': 3,
      'you': 2,
      'want': 5,
      'more': 5,
      'words': 1,
      'than': 3,
      'this': 1,
    };
    var maxFreq = 0;
    for (var tag in tags)
      maxFreq = Math.max(maxFreq, tags[tag]);

    var fill = d3.scale.category20();
    function draw(tags) {
      d3.select('#' + el.id).append('svg')
          .attr('width', 300)
          .attr('height', 300)
        .append('g')
          .attr('transform', 'translate(150,150)')
        .selectAll('text')
          .data(tags)
        .enter().append('text')
          .style('font-size', function(d) { return d.size + 'px'; })
          .style('font-family', 'Impact')
          .style('fill', function(d, i) { return fill(i); })
          .attr('text-anchor', 'middle')
          .attr('transform', function(d) {
            return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
          })
          .text(function(d) { return d.text; });
    }
    d3.layout.cloud()
      .size([300, 300])
      .words(Object.keys(tags).map(function(tag) {
        return {text: tag, size: 20 + (90 * (tags[tag]/maxFreq))};
      }))
      .padding(5)
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font('Impact')
      .fontSize(function(d) { return d.size; })
      .on('end', draw)
      .start();
  });

  function registerToVote(ul, li) {
    var $li = $(li);
    var option = $li.text().toLowerCase();
    var onClick = function(event) {
      $(this).off('click', onClick);
      var sel = '#' + ul.id;  // + ' [data-lt-poll-option="' + option + '"]';
      lectour.hinc(sel, 'poll', option, ['presenter', 'projector']);
    };
    $li.attr('data-lt-poll-option', option);
    if (lectour.mode === 'audience')
      $li.on('click', onClick);
  }

  $('[data-lt-poll]').each(function(i, node) {
    if (!node.id)
      return;

    $('li', node).each(function(j, li) {
      registerToVote(node, li);
    });
  });


  $('[data-lt-addable]').each(function(i, el) {
    if (lectour.mode !== 'audience')
      return;

    var $text = $('<input type="text" x-webkit-speech/>');
    var $submit = $('<input type="submit" />');
    var $form = $('<form action="#" method="POST" class="lt-added"></form>');
    $form.append($text).append($submit);
    $(el).append($form);

    var onSubmit = function(event) {
      var option = $text.val().toLowerCase();
      var $li = $('<li></li>').text(option).appendTo($(el));
      registerToVote(el, $li);
      $li.trigger('click');
      $form.off('submit', onSubmit).remove();
      return false;
    };
    $form.on('submit', onSubmit);
  });


  // ==========================================================================
  // responding to events
  // ==========================================================================
  $('.comment').on('lt:up:comment', function(event, item, value) {
    console.log('lt:up:comment', item, value);
  });

  $('body').on('lt:up:poll', '[data-lt-poll]', function(event, option, value) {
    var $li = $('[data-lt-poll-option="' + option + '"]', $(this));
    if ($li.size() === 0)
      $('<li></li>')
        .attr('data-lt-poll-option', option)
        .text(option)
        .appendTo($(this));
    $('[data-lt-poll-option="' + option + '"]', $(this)).attr('data-lt-poll-count', value);
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
