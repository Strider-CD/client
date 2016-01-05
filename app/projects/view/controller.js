import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  breadCrumb: 'Current Builds',
  breadCrumbPath: 'projects.view.jobs',
  breadCrumbModel: computed.alias('model'),

  actions: {
    showJobs() {
      var showJobs = this.toggleProperty('showJobs');

      if (showJobs) {
        this.transitionToRoute('projects.view.jobs');
      } else {
        this.transitionToRoute('projects.view');
      }
    }
  }
});
