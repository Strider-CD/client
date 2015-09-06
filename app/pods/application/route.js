import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    signout: function () {
      this.set('sessionService.user', undefined);
    }
  }
});
