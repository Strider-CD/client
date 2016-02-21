import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login')

  this.route('projects', function () {
    this.route('view', { path: ':project_id' }, function() {
      this.route('jobs', function () {
        this.route('view', { path: ':job_id' });
      });
    });
  });

  this.route('drones', function () {
    this.route('new');
    this.route('view', { path: ':drone_id' });
  });
});

export default Router;
