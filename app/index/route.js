import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return {};
  },

  afterModel (transition) {
    this.transitionTo('projects')
  }
});
