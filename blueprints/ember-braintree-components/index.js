'use strict';

module.exports = {

  isDevelopingAddon: function() {
    return true;
  },

  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  afterInstall: function() {

    const packages = [
      { name: 'braintree-web', target: '~3.36.0' },
      { name: 'braintree-auth-connect', target: '~2.0.0' }
    ]

    return this.addPackagesToProject(packages);
  }
};
