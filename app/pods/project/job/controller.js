import Ember from 'ember';
import ENV from "../../../config/environment";

export default Ember.Controller.extend({

  /*
  * 1) First step you need to do is inject the websocket service into your object. You
  * can inject the service into component, controllers, object, mixins, routes, and views.
  */
  socketService: Ember.inject.service('primus'),

  willDestroy() {
    this.get('socketService').closeSocketFor(ENV.PRIMUS_CLIENT_URL);
  },

  setupPrimus: function() {
    /*
    * 2) The next step you need to do is to create your actual websocket. Calling socketFor
    * will retrieve a cached websocket if one exists or in this case it
    * will create a new one for us.
    */
    var socket = this.get('socketService').socketFor(ENV.PRIMUS_CLIENT_URL);
    //setInterval(function () {
    //  console.log('setInterval(1000, function ()')
    //  socket.send({room: model.id})
    //}, 1000)


    /*
    * 3) The final step is to define your event handlers. All event handlers
    * are added via the `on` method and take 3 arguments: event name, callback
    * function, and the context in which to invoke the callback. All 3 arguments
    * are required.
    */
    socket.on('open', this.openConnection, this);
    socket.on('message', this.messageReceived, this);
    socket.on('close', function() {
      // anonymous functions work as well
    }, this);
  },

  openConnection: function() {
    var socket = this.get('socketService').socketFor(ENV.PRIMUS_CLIENT_URL);
    socket.send({room: this.get("model").id, type: 'join', msg: {}});
    console.log('On open event has been called: ' + this.get("model").id);
  },


  messageReceived: function(data) {
    console.log('Message: ', data);

    if (data.type === 'stdout' || data.type === 'stderr') {
      if(!(this.get("model").hasOutput)) {
        this.set("model.hasOutput", true);
        this.set("model.outputString", "");
      }
      if (data.type === 'stderr') {
        data.msg.line = `\x1B[1;31m${data.msg.line}\x1B[0m`;
      }
      let output = this.get("model.outputString").concat(ansi_up.ansi_to_html(data.msg.line + '\n'));
      this.set("model.outputString", output);
      //this.get("model").notifyPropertyChange("model")
    }

    if (data.type === 'job.update' && data.room === this.get("model").id) {
      this.applyChangesToModel(data.msg);
      console.log('model is now', this.get("model"));
    }
  },

  applyChangesToModel: function (msg) {
    for (var key in msg) {
      if (msg.hasOwnProperty(key)) {
        let model = this.get("model");
        if (model.hasOwnProperty(key)) {
          if (model[key] !== msg[key]) {
            this.set(`model.${key}`, msg[key]);
          }
        }
      }
    }
    this.transformStatusAndResult();
    this.transformChildren();
  },

  transformChildren: function () {
    let job = this.get("model");
    if (job.hasChildren) {
      var children = [];
      for (var childId in job.children) {
        if (job.children.hasOwnProperty(childId)) {
          var child = job.children[childId];
          child.id = childId;
          child = this.transformStatusAndResultForChildren(child);
          children.push(child);
        }
      }
      this.set("model.hasChildren", true);
      this.set("model.children", children);
    }
  },

  transformStatusAndResultForChildren: function (job) {
    job.statusSpinner = false;
    job.statusHourGlass = false;
    job.statusSuccess = false;
    job.statusFailed = false;
    if (job.status !== 'received' && job.result === 'pending') {
      job.statusSpinner = true;
    }
    if (job.status === 'received') {
      job.statusHourGlass = true;
    }
    if ( (job.status !== 'restarted' && job.result === 'success')) {
      job.statusSuccess = true;
    }
    if ( (job.status !== 'restarted' && job.result === 'failed')) {
      job.statusFailed = true;
    }
    return job;
  },

  transformStatusAndResult: function () {
    let job = this.get("model");
    this.set("model.statusSpinner", false);
    this.set("model.statusHourGlass", false);
    this.set("model.statusSuccess", false);
    this.set("model.statusFailed", false);
    if (job.status !== 'received' && job.result === 'pending') {
      this.set("model.statusSpinner", true);
    }
    if (job.status === 'received') {
      this.set("model.statusHourGlass", true);
    }
    if ( (job.status !== 'restarted' && job.result === 'success')) {
      this.set("model.statusSuccess", true);
    }
    if ( (job.status !== 'restarted' && job.result === 'failed')) {
      this.set("model.statusFailed", true);
    }
  },
  //actions: {
  //  sendButtonPressed: function() {
      /*
      * If you need to retrieve your websocket from another function or method you can simply
      * get the cached version at no penalty
      */
  //    var socket = this.get('socketService').socketFor('ws://localhost:7000/');
  //    socket.send('Hello Websocket World');
  //  }
  //}
});
