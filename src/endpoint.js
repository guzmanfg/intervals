(function (root) {
    'use strict';

    // Endpoint
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
        get: function () {
            return this.i;
        },
        set: function (value) {
            if (typeof value === 'boolean') {
                this.i = value;
            } else {
                throw new TypeError('included called with invalid value: "' + value + '".');
            }
        }
    });

    Object.defineProperty(Endpoint.prototype, 'value', {
        configurable: false,
        get: function () {
            return this.v;
        },
        set: function (value) {
            if (isInt(value) || isFloat(value)) {
                this.v = value;
            } else {
                throw new TypeError('value called with invalid param value: "' + value + '".');
            }
        }
    });

    root.Endpoint = Endpoint;
    // return Endpoint;

}(this));