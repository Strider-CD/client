import Ember from 'ember';
import ENV from '../../../config/environment';
import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  setupController (controller, model) {
    controller.willDestroy();
    controller.set('model', model);
    controller.setupPrimus();
    window.scrollTo(0, document.body.scrollHeight);
  },

  beforeModel (transition) {
    this._super(transition)
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
      return job;
    }).catch(function (error) {
      console.error(error);
      return [];
    });
  },

  events: {
    error: function (reason) {
      console.error('error loading model', reason);
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
    job.children = children;
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
  if (!(Ember.keys(job.stdout).length === 0 && Ember.keys(job.stderr).length === 0)) {
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
