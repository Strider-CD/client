import Ember from 'ember';
import ENV from '../config/environment';
import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function () {
    var _this = this;
    return new Ember.RSVP.Promise(function (resolve, reject) {
      _this.get('session').authorize('authorizer:core', (authorizationData) => {
        ajax({
          url: `${ENV.CORE_FULL_URL}/projects`,
          headers: authorizationData,
          type: 'GET'
        }).then(function (projects) {
          resolve(projects);
        }).catch(function (error) {
          reject(error);
        });
      });
    });
  }
});
