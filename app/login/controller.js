import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  queryParams: ['guestlogin'],
  guestlogin: false,

  doAutoGuestLogin () {
    if(!this.guestlogin) {
      // allow user to login
    } else {
      this.setProperties({'identification': 'guest', 'password': 'guest'});
      this.send('authenticate');
    }
  },

  actions: {
    authenticate() {
      if(this.nonguest) {
        // allow user to login
        this.set('session.guestlogin', false);
      } else {
        this.set('session.guestlogin', true);
      }

      let data = this.getProperties('identification', 'password');

      if (data.identification === 'guest') {
        this.set('session.guestlogin', true);
      }

      this.get('session').authenticate('authenticator:core', data)
        .then(() => this.transitionToRoute('projects'))
        .catch((reason) => {
          this.set('errorMessage', reason.errorThrown);
        });
    }
  }
});
