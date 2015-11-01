import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  beforeModel() {
    Ember.$.ajaxSetup({
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
  },

  actions: {
    signout: function () {
      this.set('sessionService.user', undefined);
    },
    invalidateSession: function() {
      this.get('session').invalidate();
    }
  }
});
