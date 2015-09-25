import Ember from 'ember';
import ENV from '../../config/environment';
import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
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

  model: function (params) {
    var self = this;
    return ajax({
      url: `${ENV.CORE_FULL_URL}/projects/${params.project_id}`,
      headers: {Authorization: self.get('Authorization')},
      type: 'GET'
    }).then(function (project) {
      return project;
    }).catch(function (error) {
      return {};
    });
  },
});
