import Ember from 'ember';
import BaseAuthorizer from 'ember-simple-auth/authorizers/base';

export default BaseAuthorizer.extend({
  authorize(data, block) {
    var token = this.buildToken();

    var dat = data || {};

    if (this.get('session.isAuthenticated') && !Ember.isEmpty(token)) {
      block({ 'Authorization': token });
    } else {
      block({ 'Authorization': dat.token });
    }
  },

  buildToken() {
    return this.get('session.authenticated.token');
  }
});
