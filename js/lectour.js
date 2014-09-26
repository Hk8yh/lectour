lectour = {
  audience: {},
  presenter: {},
  projector: {},
  socket: null,
};

lectour.init = function(mode, el) {
  lectour.mode = mode;
  lectour.socket = io();

  lectour.sub(mode);

  lectour.socket.on('do', function(channel, cmd, data) {
    $(el).trigger('lt:' + channel + ':' + cmd, data);
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
  lectour.send('hget', sel, type);
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
