import DS from 'ember-data';
import ENV from '../config/environment';

export default DS.JSONAPIAdapter.extend({
  host: ENV.CORE_URL,
  namespace: ENV.CORE_API_PREFIX
});
