
lectour = {};

lectour.PRESENTER = false;
// lectour.URL = 'ws://ec2-54-252-243-156.ap-southeast-2.compute.amazonaws.com:9379/.json';
lectour.URL = 'ws://0.0.0.0:9379/';
lectour.ws = null;

lectour.init = function() {
  lectour.connect(lectour.URL);

  $('.step').on('enterStep', function(event) {
    console.log('enterStep', event);
    if (lectour.PRESENTER) {
      lectour.goto('#' + event.target.id);
    }
  });
}

lectour.connect = function(url) {
  lectour.ws = new WebSocket(url);
  lectour.ws.onopen = function() {
    lectour.subscribe('events');
  };

  lectour.ws.onmessage = function(event) {
    console.log("JSON received:", event);
    lectour.dispatch(JSON.parse(event.data));
  };
}

lectour.send = function(data) {
  lectour.ws.send(JSON.stringify(data));
}

lectour.subscribe = function(channel) {
  console.log('subscribe', arguments);
  lectour.send(["SUBSCRIBE", channel]);
}

lectour.publish = function(channel, msg) {
  console.log('publish', arguments);
  lectour.send(['PUBLISH', channel, msg]);
}

lectour.dispatch = function(msg) {
  if (msg.SUBSCRIBE !== undefined) {
    msg = msg.SUBSCRIBE;
    if (msg[0] === "message") {
      if (msg[1] === "events") {
        lectour.onGoto(msg[2]);
      }
    }
  }
}

lectour.goto = function(slide) {
  console.log('goto', arguments);
  lectour.publish('events', slide);
}

lectour.onGoto = function(slide) {
  console.log('onGoto', arguments);
  $('#slides').jmpress('select', slide);
}
