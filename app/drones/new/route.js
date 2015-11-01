import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    save(name) {
      this.store.createRecord('drone', {
        name: name
      }).save()
        .then(res => console.log(res))
        .catch(err => console.error(err));
    }
  }
});
