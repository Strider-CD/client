import Ember from 'ember';
import DS from 'ember-data';

const { copy } = Ember;

export default DS.JSONAPISerializer.extend({
  normalizeFindAllResponse(store, modelClass, payload, id, requestType) {
    return {
      data: payload.map(item => {
        let attributes = copy(item, true);

        delete attributes.meta;
        delete attributes.id;

        return {
          id: item.id,
          type: modelClass.modelName,
          attributes
        };
      })
    };
  }
});
