import Ember from 'ember';
import ENV from '../../../config/environment';
import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  setupController (controller, model) {
    controller.willDestroy();
    controller.set('model', model);
    controller.setupPrimus();
    //window.scrollTo(0, document.body.scrollHeight);
  },

  beforeModel (transition) {
    this._super(transition);
    var self = this;
    return new Ember.RSVP.Promise(function (resolve, reject) {
      if (!self.get('session.isAuthenticated')) {
        return reject(new Error('Not authenticated'));
      }
      self.get('session').authorize('authorizer:core', (authorizationData) => {
        return resolve(self.set('Authorization', authorizationData.Authorization));
      });
    });
  },

  model (params) {
    var self = this;
    return ajax({
      url: `${ENV.CORE_FULL_URL}/projects/${self.modelFor('project').id}/jobs/id/${params.job_id}`,
      headers: {Authorization: self.get('Authorization')},
      type: 'GET'
    }).then(function (jobArray) {
      var job = jobArray[0];
      job = transformStatusAndResult(job);
      job = transformChildren(job);
      job = transformOutput(job);
      job = transformUrlAndInfo(job);
      job = transformTime(job);
      return job;
    }).catch(function (error) {
      console.error('error whilst fetching job', error);
      return [];
    });
  },

  afterModel (model) {
    var self = this;
    var job = model;
    if (job.parent) {
      console.log('afterModel doing ajax call')
      return ajax({
        url: `${ENV.CORE_FULL_URL}/projects/${self.modelFor('project').id}/jobs/id/${job.parent}`,
        headers: {Authorization: self.get('Authorization')},
        type: 'GET'
      }).then(function (jobArray) {
        var parent = jobArray[0];
        job.parentJob = transformChildren(parent);
        job = getCmdEnvAndNumber(job);
        job = transformUrlAndInfoWithParent(job);
        return job;
      }).catch(function (error) {
        console.error('error whilst fetching parent job', error);
        return job;
      });
    } else {
      return model;
    }
  },

  fetchParent: function () {
    var self = this;
    let job = self.get('model');
    if (job.parent && !(job.parentJob)) {
      if (job.parent.length > 0) {
        var parModel = this.model({job_id: job.parent});

        return parModel.then(function (parent) {
          self.set('model.parentJob', parent);
        });
      }
    }
  }.observes('model'),

  events: {
    error: function (reason) {
      console.error('error loading model', reason);
    }
  },

  actions: {
    willTransition: function() {
      this.controller.destroyPrimus();
    }
  }
});

function transformChildren (job) {
  if (job.hasChildren) {
    var children = [];
    for (var childId in job.children) {
      if (job.children.hasOwnProperty(childId)) {
        var child = job.children[childId];
        child.id = childId;
        child = transformStatusAndResult(child);
        children.push(child);
      }
    }
    job.children = _.sortBy(children, function(child) { return child.childNo; });
    console.log('job.children', job.children)
  }
  return job;
}

function transformStatusAndResult (job) {
  if (job.status !== 'received' && job.result === 'pending') {
    job.statusSpinner = true; // either running or restarting
  }
  if (job.status === 'received') {
    job.statusHourGlass = true; // waiting for drone to run
  }
  if ( (job.status !== 'restarted' && job.result === 'success')) {
    job.statusSuccess = true; // waiting for drone to run
  }
  if ( (job.status !== 'restarted' && job.result === 'failed')) {
    job.statusFailed = true; // waiting for drone to run
  }
  return job;
}

function transformOutput (job) {
  if (!job.stdout) {
    job.stdout = {};
  }
  if (!job.stderr) {
    job.stderr = {};
  }
  if (!(Object.keys(job.stdout).length === 0 && Object.keys(job.stderr).length === 0)) {
    job.hasOutput = true;

    Object.keys(job.stderr).forEach(function (key) {
      let line = job.stderr[key];
      job.stderr[key] = `\x1B[1;31m${line}\x1B[0m`;
    });

    var output = {};
    job.output = [];
    job.outputString = '';
    Ember.merge(output, job.stdout);
    Ember.merge(output, job.stderr);
    for (var lineNo in output) {
      if (output.hasOwnProperty(lineNo)) {
        // var line = ansi_up.ansi_to_html(`${output[lineNo]}\n`)
        var line = `${output[lineNo]}\n`;
        job.output.push(line);
        job.outputString = job.outputString.concat(ansi_up.ansi_to_html(line));
      }
    }
  }
  return job;
}

function transformUrlAndInfo (job) {
  if (job.trigger === 'github') {
    job.isGithub = true;
    if (job.triggerInfo.type === 'pull_request') {
      job.isPullRequest = true;
      job.prNumber = job.triggerInfo.data.number;
      job.message = job.triggerInfo.general.message;
    }
    job.url = job.triggerInfo.general.url;
    job.author = job.triggerInfo.general.author;
    job.author.url = `https://github.com/${job.author.username}`;
  }

  return job;
}

function transformUrlAndInfoWithParent (job) {
  if (job.parentJob) {
    if (job.parentJob.trigger === 'github') {
      job.isGithub = true;
      if (job.parentJob.triggerInfo.type === 'pull_request') {
        job.isPullRequest = true;
        job.prNumber = job.parentJob.triggerInfo.data.number;
        job.message = job.parentJob.triggerInfo.general.message;
      }
      job.url = job.parentJob.triggerInfo.general.url;
      job.author = job.parentJob.triggerInfo.general.author;
      job.author.url = `https://github.com/${job.author.username}`;
    }
  }

  return job;
}

function transformTime (job) {
  let timestamps = ['receivedAt', 'updatedAt', 'runningSince'];
  timestamps.forEach(function (elem) {
    let time = job[elem];
    job[elem] = new Date(time);
  });
  return job;
}

function getCmdEnvAndNumber (job) {
  if (Array.isArray(job.parentJob.children)) {
    job.parentJob.children.forEach(function (elem) {
      if (elem.id === job.id) {
        job.childNo = elem.childNo;
        job.cmdsEnv = elem.cmdsEnv;
      }
    });
  }
  return job;
}
