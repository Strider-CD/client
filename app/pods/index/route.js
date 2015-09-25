import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    return {};
  },
  afterModel (transition) {
    this.transitionTo('projects')
  }
});
