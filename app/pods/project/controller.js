import Ember from 'ember';

export default Ember.Controller.extend({
  breadCrumb: 'Current Builds',

  breadCrumbPath: 'project.jobs',

  breadCrumbModel: Ember.computed.alias("model"),

  actions: {
    showJobs: function () {
      this.toggleProperty('showJobs');
      if(this.getProperties('showJobs').showJobs) {
        this.transitionToRoute('project.jobs');
      } else {
        this.transitionToRoute('project');
      }
    }
  }
});
