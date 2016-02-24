import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    save(name) {
      var model = this.store.createRecord('drone', {
        name: name
      });

      model.save()
        .then(res => console.log(res))
        .catch(err => console.error(err));
    }
  }
});
