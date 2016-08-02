/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-braintree-components',

  isDevelopingAddon: function() {
    return false;
  },

  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/braintree-web/dist/braintree.js', { prepend: true });
    app.import(app.bowerDirectory + '/braintree-oauth-connect/braintree-oauth-connect.js', { prepend: true });
  }
};
