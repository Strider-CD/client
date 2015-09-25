import Ember from 'ember';
import ENV from '../config/environment';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { request } from 'ic-ajax';

export default BaseAuthenticator.extend({
  restore: function (data) {
    return new Ember.RSVP.Promise(function (resolve, reject) {
      if (!Ember.isEmpty(data.token)) {
        resolve(data);
      } else {
        reject();
      }
    });
  },
  authenticate: function (credentials) {
    // var _this = this
    return request(`${ENV.CORE_FULL_URL}/users/login`, {
      headers: {Authorization: 'Basic ' + btoa(credentials.identification + ':' + credentials.password)},
      data: { },
      type: 'GET'
    }).then(function (result) {
      var token = result.token;
      return { 'token': token };
    });
  },

  invalidate: function (credentials) {
    // var _this = this
    return request(`${ENV.CORE_FULL_URL}/users/login`, {
      headers: {Authorization: 'Basic ' + btoa(credentials.identification + ':' + credentials.password)},
      data: { },
      type: 'DELETE'
    }).then(function (result) {
      var token = result.token;
      return { 'token': token };
    }).catch(function(error){
    });
  },
});
