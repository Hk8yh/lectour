
lectour = {
  audience: {},
  presenter: {},
  projector: {},
  socket: null,
};

lectour.HELP_THRESHOLD = 10;  // hardcoded for lols.

lectour.init = function(mode) {
  lectour.mode = mode;
  lectour.socket = io();

  // insert the appropriate CSS.
  $('body').append($('<link rel="stylesheet" href="/css/' + mode + '.css">'));

  // bind top-level events
  $('#show-question').click(function(event) {
    event.preventDefault();
    $('#question textarea').val('');
    $('#question').fadeIn();
  });

  $('#hide-question').click(function(event) {
    event.preventDefault();
    $('#question').fadeOut();
  });

  $('#submit-question').click(function(event) {
    event.preventDefault();
    $('#question').fadeOut();
  });

  $('#show-history').click(function(event) {
    event.preventDefault();
    $('body').addClass('show-history');
  });

  $('main article').click(function() {
    event.stopImmediatePropagation();

    if (lectour.mode === 'audience') {
      if ($('body').hasClass('show-history')) {
        $('body').removeClass('show-history');
      }
    }
    else if (lectour.mode === 'projector') {
      lectour.moveToNextSlide();
    }
  });

  $('html').keydown(function(event) {
    event.stopImmediatePropagation();
    switch (event.keyCode) {
    case 37:  // left
      lectour.moveToPrevSlide();
      break;
    case 39:  // right
      lectour.moveToNextSlide();
      break;
    }
  });

  // discover the set of slides
  lectour.discoverSlides();

  // subscribe to the appropriate channel.
  lectour.sub(mode);

  lectour.socket.on('do', function(channel, cmd, data) {
    $('#slides').trigger('lt:' + channel + ':' + cmd, data);
  });

  lectour.socket.on('up', function(sel, type, item, value) {
    console.log('update', sel, type, item, value);
    $(sel).trigger('lt:up:' + type, [item, value]);
  });
};

lectour.send = function() {
  lectour.socket.emit.apply(lectour.socket, arguments);
};

lectour.sub = function(channels) {
  lectour.send('sub', channels);
};

lectour.pub = function(channels, cmd, data) {
  lectour.send('pub', channels, cmd, data);
};

lectour.get = function(sel, type) {
  lectour.send('get', sel, type);
};

lectour.set = function(sel, type, value, tell) {
  lectour.send('set', sel, type, value, tell);
};

lectour.inc = function(sel, type, tell) {
  lectour.send('inc', sel, type, tell);
};

lectour.hget = function(sel, type, item) {
  lectour.send('hget', sel, type, item);
};

lectour.hset = function(sel, type, item, value, tell) {
  lectour.send('hset', sel, type, item, value, tell);
};

lectour.hinc = function(sel, type, item, tell) {
  lectour.send('hinc', sel, type, item, tell);
};

lectour.hitems = function(sel, type) {
  lectour.send('hitems', sel, type);
};


// ==========================================================================
// slide movement
// ==========================================================================
lectour.moveSlideDelta = function(delta) {
  var nextSlideNum = (lectour.slideNum + lectour.slideIDs.length + delta) % lectour.slideIDs.length;
  $('#' + lectour.slideIDs[lectour.slideNum]).fadeOut(1000);
  $('#' + lectour.slideIDs[nextSlideNum]).fadeIn(1000);
  lectour.slideNum = nextSlideNum;

  if (lectour.mode === 'presenter') {
    lectour.pub(['audience', 'projector'], 'goto', lectour.slideIDs[nextSlideNum]);
  }
};

lectour.moveToNextSlide = function() {
  lectour.moveSlideDelta(1);
};

lectour.moveToPrevSlide = function() {
  lectour.moveSlideDelta(-1);
};

lectour.moveToSlideID = function(id) {
  var index =  lectour.slideIDs.indexOf(id);
  if (index !== -1)
    lectour.moveSlideDelta(index - lectour.slideNum);
};


// ==========================================================================
// slide discovery
// ==========================================================================
lectour.discoverSlides = function() {
  lectour.slideIDs = [];
  $('#slides [data-lt-slide]').each(function(i, slide) {
    if ($(slide).data('lt-slide') !== 'optional')
      lectour.slideIDs.push(slide.id);
  });
  if (!lectour.slideNum)
    lectour.slideNum = 0;
};


lectour.checkHelpThreshold = function(count, helpSlideID) {
  // If the help counter is greater than some arbitrary threshold, enable the
  // extra help slide, if one exists.
  if (count >= lectour.HELP_THRESHOLD && helpSlideID) {
    $('#' + helpSlideID).data('lt-slide', '');
    lectour.discoverSlides();
  }
};
