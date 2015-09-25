import Ember from 'ember';
import BaseAuthorizer from 'ember-simple-auth/authorizers/base';

export default BaseAuthorizer.extend({
  authorize: function(block) {
    var token = this.buildToken();

    if (this.get('session.isAuthenticated') && !Ember.isEmpty(token)) {
      block({'Authorization': token});
    } else {
    }
  },

  buildToken: function() {
    return this.get('session.authenticated.token');
  }
});
