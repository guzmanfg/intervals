/*global define, module, require*/
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['Utils'], function(Utils) {
            return (root.Endpoint = factory(Utils));
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = (root.Endpoint = factory(require('Utils')));
    } else {
        root.Endpoint = factory(root.Utils);
    }
}(this, function(Utils) {
    'use strict';

    /**
     * Endpoint class
     * @param config
     * @constructor
     */
    function Endpoint(config) {
        this.v = 0;
        this.i = false;

        if (config) {
            if (config.value) {
                this.value = config.value;
            }
            if (config.included) {
                this.included = config.included;
            }
        }
    }

    Object.defineProperty(Endpoint.prototype, 'included', {
        configurable: false,
        get: function() {
            return this.i;
        },
        set: function(value) {
            if (typeof value === 'boolean') {
                this.i = value;
            } else {
                throw new TypeError('included called with invalid value: "' + value + '".');
            }
        }
    });

    Object.defineProperty(Endpoint.prototype, 'value', {
        configurable: false,
        get: function() {
            return this.v;
        },
        set: function(value) {
            var val = Utils.getNumber(value);
            if (Utils.isInteger(val) || Utils.isFloat(val)) {
                this.v = val;
            } else {
                throw new TypeError('value called with invalid param value: "' + value + '".');
            }
        }
    });

    return Endpoint;
}));