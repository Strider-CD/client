import Ember from 'ember';
import ansiUp from 'npm:ansi_up';
import ENV from '../../../config/environment';

export default Ember.Controller.extend({
  breadCrumbs: Ember.computed("model.id", {
    get() {
      var crumbs = Ember.A([]);
      if(this.get('model.parent')) {

      }
      if(this.get('model.parent')) {
        var label = 'parent'
        if (this.get('model.isPullRequest') && this.get('model.isPullRequest')) {
          label = `PR: ${this.get('model.prNumber')}`;
        }

        crumbs.push({
          label: label,
          path: 'project.job',
          model: this.get('model.parent'),
        })
        var label = `${this.get('model.childNo')} (${this.get('model.cmdsEnv')})`

        crumbs.push({
          label: label,
          path: 'project.job',
          model: this.get('model.id'),
        })
      } else {
        var label = this.get('model').id
        if (this.get('model.isPullRequest') && this.get('model.isPullRequest')) {
          label = `PR: ${this.get('model.prNumber')}`;
        }
        crumbs.push({
          label: label,
          path: 'project.job',
          model: this.get('model.id'),
        })
      }
      return crumbs;
    }
  }),

  socketService: Ember.inject.service('primus'),

  session: Ember.inject.service('session'),

  destroyPrimus() {
    this.get('session').authorize('authorizer:core', (authorizationData) => {
      var token = authorizationData.Authorization;
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
      let output = this.get("model.outputString").concat(ansiUp.ansi_to_html(data.msg.line + '\n'));
      this.set("model.outputString", output);
      //this.get("model").notifyPropertyChange("model")
    }

    if (data.type === 'job.update' && data.room === this.get("model").id) {
      this.applyChangesToModel(data.msg);
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
      this.set('model.hasChildren', true);
      this.set('model.children', children.sortBy('childNo'));
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

  followLogOutput: true,

  followLog: function () {
    if (this.get('model.hasOutput') && this.followLogOutput) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        window.scrollTo(0, document.body.scrollHeight)
      });
    }
  }.observes('model.outputString'),

  actions: {
    scrollToTop: function() {
      window.scrollTo(0, 0);
    },

    scrollToBottom: function() {
      window.scrollTo(0, document.body.scrollHeight);
    },

    toggleAutoScroll: function() {
      this.toggleProperty('followLogOutput');
      Ember.$('.toggleAutoScroll').toggleClass('glyphicon-collapse-down').toggleClass('glyphicon-unchecked');
    }
  }
});
