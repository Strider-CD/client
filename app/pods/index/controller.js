import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    toggleBranches: function () {
      this.toggleProperty('showBranches');
    }
  }
});
