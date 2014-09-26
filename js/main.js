
lectour = {
  presenter: {},
  projector: {},
  audience: {}
};

lectour.PRESENTER = document.URL.indexOf('presenter') !== -1;
lectour.CHANNEL = lectour.PRESENTER ? 'presenter' : 'audience';
lectour.SERVER = 'ec2-54-252-243-156.ap-southeast-2.compute.amazonaws.com:9379';
lectour.ws = null;

lectour.init = function() {
  lectour.connect(lectour.SERVER);

  $('.step').on('enterStep', function(event) {
    console.log('enterStep', event);
    if (lectour.PRESENTER) {
      lectour.presenter.goto(event.target.id);
    }
  });
}

lectour.connect = function(server) {
  lectour.ws = new WebSocket('ws://' + server + '/');
  lectour.ws.onopen = function() {
    lectour.send(["SUBSCRIBE", lectour.CHANNEL]);
  };

  lectour.ws.onmessage = function(event) {
    console.log("JSON received:", event);
    lectour.dispatch(JSON.parse(event.data));
  };
}

lectour.send = function(data) {
  lectour.ws.send(JSON.stringify(data));
}

lectour.pub = function(channel, data) {
  $.ajax({
    url: "http://" + lectour.SERVER + '/PUBLISH/' + channel,
    type: "PUT",
    data: data,
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  });
}

lectour.dispatch = function(msg) {
  if (msg.SUBSCRIBE !== undefined) {
    msg = msg.SUBSCRIBE;
    if (msg[0] === "message") {
      if (msg[1] === "audience") {
        lectour.audience.onGoto(msg[2]);
      }
    }
  }
}

lectour.presenter.goto = function(slide) {
  console.log('goto', arguments);
  lectour.pub('audience', slide);
}

lectour.audience.onGoto = function(slide) {
  console.log('onGoto', arguments);
  $('#slides').jmpress('select', '#' + slide);
}
