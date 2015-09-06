import Ember from 'ember';

export default Ember.Controller.extend({
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
