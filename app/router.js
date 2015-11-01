import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login')
  this.route('projects', { path: '/projects' });
  this.route('project', {path: '/projects/:project_id'}, function() {
      this.route('jobs');
      this.route('job', {path: '/jobs/:job_id'});
  });

  this.route('drones', function () {
    this.route('new');
  });
});

export default Router;
