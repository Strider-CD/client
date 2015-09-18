import Ember from 'ember';
import ENV from "../../../config/environment";
import ajax from 'ic-ajax';

export default Ember.Route.extend({
    model: function(params) {
        return ajax({
            url: `${ENV.CORE_FULL_URL}/projects/${this.modelFor("project").id}/jobs`,
            type: 'get'
        }).then(function(jobs) {
            jobs.forEach(function(job) {
              if (job.parent.length > 0) {
                job.hasParent = true;
              }
              job.receivedAt = new Date(job.receivedAt).toString();
              if(job.trigger === 'github') {
                job.trigger = `${job.trigger}:${job.triggerInfo.type}/${job.triggerInfo.general.author.username}`;
              }
            });
            return jobs;
        }).catch(function(err) {
          return [];
        });
    }
});
