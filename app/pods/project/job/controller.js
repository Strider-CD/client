import Ember from 'ember';
import ENV from "../../../config/environment";

export default Ember.Controller.extend({

  socketService: Ember.inject.service('primus'),

  session: Ember.inject.service('session'),

  destroyPrimus() {
    console.log('destroyPrimus called')
    this.get('session').authorize('authorizer:core', (authorizationData) => {
      var token = authorizationData.Authorization;
      console.log('destroying socket for', `${ENV.PRIMUS_CLIENT_URL}?token=${token}`)
      this.get('socketService').closeSocketFor(`${ENV.PRIMUS_CLIENT_URL}?token=${token}`);
    });
  },

  setupPrimus: function() {
    var self = this;

    this.get('session').authorize('authorizer:core', (authorizationData) => {
      var token = authorizationData.Authorization;
      var socket = self.get('socketService').socketFor(`${ENV.PRIMUS_CLIENT_URL}?token=${token}`);

      console.log('setupPrimus installing handlers for', {id: self.get('model'), token: token, socket: socket});

      socket.on('open', self.openConnection.bind(self, token), self);
      socket.on('message', self.messageReceived, self);
      socket.on('close', function() {
      }, self);
    });
  },

  openConnection: function(token) {
    console.log('openConnection called')
    var self = this;
    var socket = self.get('socketService').socketFor(`${ENV.PRIMUS_CLIENT_URL}?token=${token}`);
    console.log('sending ', {msg: {room: self.get('model').id, type: 'join', msg: {}}, socket: socket, token: token});
    socket.send({room: self.get('model').id, type: 'join', msg: {}});
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

  followLog: function () {
    if (this.get('model.hasOutput')) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        window.scrollTo(0, document.body.scrollHeight)
        console.log('scrolling');
        //Ember.$("#afterOutput").animate({ scrollTop: Ember.$("#afterOutput")[0].scrollHeight}, 1000);
      });
    }
  }.observes('model.outputString')
});
