import Component from '@ember/component';
import { computed } from '@ember/object';
import { classify } from '@ember/string';
import dropin from 'braintree-web-drop-in';
import layout from '../templates/components/braintree-dropin';


export default Component.extend({
  classNames: ['braintree-dropin'],
  layout,

  dropinRef: null,
  token: null,

  _dropinInstance: null,

  /**
   * Events that the Braintree drop-in UI emits.
   */
  _braintreeEvents: Object.freeze([
    'noPaymentMethodRequestable',
    'paymentMethodRequestable',
    'paymentOptionSelected'
  ]),

  init() {
    this._super(...arguments);
    this.options = {};
  },

  didInsertElement() {
    this._super(...arguments);

    const options = Object.assign({
      authorization: this.get('token'),
      container: this.get('container')
    }, this.get('options'));

    if (options.authorization && options.container) {
      dropin.create(options).then((dropinInstance) => {
        // create our "global drop-in instance"
        this.set('_dropinInstance', dropinInstance);

        // make the dropin instance available outside of the component
        this.set('dropinRef', dropinInstance);

        // register events
        this._addEventListeners();
      })
    }
    else {
      throw new Error('A valid authorization and container must be provided.');
    }
  },

  /**
   * Returns a boolean indicating if a payment method is available through `requestPaymentMethod`.
   * Particularly useful for detecting if using a client token with a customer ID to show vaulted payment methods.
   */
  isPaymentMethodRequestable: computed(function() {
    const dropinInstance = this.get('_dropinInstance');
    return dropinInstance.isPaymentMethodRequestable();
  }).volatile(),

  /**
   * Determines available events
   */
  _availableEvents: computed('_braintreeEvents', function() {
    return this.get('_braintreeEvents').filter((eventName) => {
      const actionName = `on${classify(eventName)}`;
      return this.get(actionName) !== undefined;
    });
  }),

  /**
   * Adds event listeners for events exposed by drop in UI.
   */
  _addEventListeners() {
    const dropinInstance = this.get('_dropinInstance');
    if (dropinInstance) {
      this._eventHandlers = {};
      this.get('_availableEvents').forEach((eventName) => {
        const actionName = `on${classify(eventName)}`;
        this._eventHandlers[eventName] = this.get(actionName);
        dropinInstance.on(eventName, this._eventHandlers[eventName]);
      });
    }
  },

  actions: {
    /**
     * Submits the payment method to Braintree and returns the nonce.
     */
    submitPaymentMethod() {
      this.get('_dropinInstance').requestPaymentMethod().then((payload) => {
        this.get('onSubmit')(payload);
      })
    },

    /**
     * Clears the selected payment method.
     */
    clearSelectedPaymentMethod() {
      this.get('_dropinInstance').clearSelectedPaymentMethod().then(() => {
        this.get('onClear')();
      })
    }
  },

  /**
   * Destroys the drop-in instance.
   */
  willDestroyElement() {
    const dropinInstance = this.get('_dropinInstance');
    if (dropinInstance) {
      dropinInstance.teardown()
    }
  }
});
