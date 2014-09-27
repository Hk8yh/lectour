var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');

app.use(express.static('.'));

app.get('/audience', function(req, res){
  res.sendFile('slide.html', {root: '.'});
});

app.get('/presenter', function(req, res){
  res.sendFile('slide.html', {root: '.'});
});

app.get('/projector', function(req, res){
  res.sendFile('slide.html', {root: '.'});
});

io.on('connection', function(socket){
  console.log('connected...');
  var client = redis.createClient();
  var subscriber = redis.createClient();

  function error_log(msg) {
    console.log('error:' + msg);
  }
  client.on('error', error_log);
  subscriber.on('error', error_log);

  function notify(id, type, item, val, err, tell) {
    if (err === null && tell) {
      tell.forEach(function(channel) {
        var msg = {cmd: 'up', id: id, type: type, item: item, val: val};
        console.log('notify', channel, msg);
        client.publish(channel, JSON.stringify(msg));
      });
    }
  }

  socket.on('disconnect', function() {
    subscriber.unsubscribe();
    subscriber.end();
    client.end();
  });

  socket.on('sub', function(channels) {
    console.log('socket:sub', channels);

    if (typeof(channels) === 'string') {
      subscriber.subscribe(channels);
    } else {
      channels.forEach(function(channel) {
        subscriber.subscribe(channel);
      });
    }
  });

  socket.on('pub', function(channels, cmd, data) {
    var msg = {cmd: cmd, data: data};
    console.log('socket:pub', channels, msg);

    if (typeof(channels) === 'string') {
      client.publish(channels, JSON.stringify(msg));
    } else {
      channels.forEach(function(channel) {
        client.publish(channel, JSON.stringify(msg));
      });
    }
  });

  subscriber.on('message', function (channel, msg) {
    msg = JSON.parse(msg);
    console.log('redis:message', channel, msg);

    if (msg.cmd === 'up') {
      socket.emit('up', msg.id, msg.type, msg.item, msg.val);
    } else {
      socket.emit('do', channel, msg.cmd, msg.data);
    }
  });

  socket.on('get', function(id, type) {
    var key = id + ':' + type;
    console.log('socket:get', key);

    client.get(key, function(err, reply) {
      console.log('redis:get', key, err, reply);
      socket.emit('up', id, type, null, reply);
    });
  });

  socket.on('set', function(id, type, val, tell) {
    var key = id + ':' + type;
    console.log('socket:set', key, val, tell);

    client.set(key, val, function(err, reply) {
      console.log('redis:set', key, err, val);
      notify(id, type, null, val, err, tell);
    });
  });

  socket.on('inc', function(id, type, tell) {
    var key = id + ':' + type;
    console.log('socket:inc', key, tell);

    client.incr(key, function(err, reply) {
      console.log('redis:incr', key, err, reply);
      notify(id, type, null, reply, err, tell);
    });
  });

  socket.on('hget', function(id, type, item) {
    var key = id + ':' + type;
    console.log('socket:hget', key, item);

    client.hget(key, item, function(err, reply) {
      console.log('redis:hget', key, item, err, reply);
      socket.emit('up', id, type, item, reply);
    });
  });

  socket.on('hset', function(id, type, item, val, tell) {
    var key = id + ':' + type;
    console.log('socket:hset', key, val, tell);

    client.hset(key, item, val, function(err, reply) {
      console.log('redis:hset', key, err, val);
      notify(id, type, item, val, err, tell);
    });
  });

  socket.on('hincr', function(id, type, item, tell) {
    var key = id + ':' + type;
    console.log('socket:hincr', key, item, tell);

    client.hincrby(key, item, 1, function(err, reply) {
      console.log('redis:hincr', key, item, 1, err, reply);
      notify(id, type, item, reply, err, tell);
    });
  });

  socket.on('hitems', function(id, type) {
    var key = id + ':' + type;
    console.log('socket:hget', key);

    client.hgetall(key, function(err, reply) {
      console.log('redis:hgetall', key, err, reply);
      socket.emit('up', id, type, null, reply);
    });
  });

});

http.listen(8000, function(){
  console.log('listening on *:8000');
});
