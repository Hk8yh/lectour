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
    $('li', node).each(function(j, li) {
      var $li = $(li);
      var onClick = function(event) {
        var sel = '#' + node.id + ' [data-lt-multichoice-option=' + j + ']';
        lectour.hincr(sel, 'multichoice', j, ['presenter']);
        $(this).off('click', onClick);
      };
      $li
        .attr('data-lt-multichoice-option', j)
        .on('click', onClick);
    });
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

  $('#slides').on('lt:audience:goto lt:projector:goto', function(event, slide) {
    lectour.moveToSlideID(slide);
  });
});
