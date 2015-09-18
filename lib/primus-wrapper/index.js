var ENV = require("../../config/environment")

module.exports = {
  name: 'primus-wrapper',

  isDevelopingAddon: function() {
    return false;
  },

  contentFor: function(type, config) {
    if (type === 'head'){
      return '';
    } else if (type === 'head-footer'){
      return '';
    } else if (type === 'body'){
      return '';
    } else if (type === 'body-footer'){
      return '<script src="' + ENV().PRIMUS_CLIENT_URL + '"></script>';
    }
  }
}
