import Ember from 'ember';
import ENV from "../../../config/environment";
import ajax from 'ic-ajax';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
    beforeModel (transition) {
      this._super(transition);
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

    model: function(params) {
      var self = this;
      return ajax({
        url: `${ENV.CORE_FULL_URL}/projects/${self.modelFor("project").id}/jobs`,
        headers: {Authorization: self.get('Authorization')},
        type: 'GET'
      }).then(function (jobs) {
        jobs.forEach(function(job) {
          if (job.parent.length > 0) {
            job.hasParent = true;
          }
          job.receivedAt = new Date(job.receivedAt).toString();
          if(job.trigger === 'github') {
            job.trigger = `${job.trigger}:${job.triggerInfo.type}/${job.triggerInfo.general.author.username}`;
          }
        });
        return _(jobs).reverse().value();
      }).catch(function (error) {
        return [];
      });
    }
});
