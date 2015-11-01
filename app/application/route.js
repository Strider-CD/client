import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';


export default Ember.Route.extend(ApplicationRouteMixin, {
  beforeModel() {
    var isAuthenticated = this.get('session.isAuthenticated');

    if (!isAuthenticated) {
      this.transitionTo('login');
    }
  },

  actions: {
    signout() {
      this.set('sessionService.user', undefined);
    },

    invalidateSession() {
      this.get('session').invalidate();
    }
  }
});
