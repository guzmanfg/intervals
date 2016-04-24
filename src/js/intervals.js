/*global define, module, require*/

// TODO: decimal comma (semicolon as separator)
// TODO: scientific notation (e.g. 1e-17)
// TODO: Interval sets parser (discontinuous intervals)
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['Endpoint', 'Utils'], function(Endpoint, Utils) {
            return (root.Interval = factory(Endpoint, Utils));
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = (root.Interval = factory(require('Endpoint'), require('Utils')));
    } else {
        root.Interval = factory(root.Endpoint, root.Utils);
    }
}(this, function(Endpoint, Utils) {
    'use strict';
    var prev;

    /**
     * @class Interval Interval class
     * @param {Object} config Interval configuration options
     * @param {string}  [config.type=float] 'float' or 'integer'
     * @param {Object|Endpoint} [config.from]   left endpoint of the interval.
     * @param {Object|Endpoint} [config.to]   right endpoint of the interval.
     */
    function Interval(config) {
        /**
         * Type attribute ('integer' or 'float'). Use Interval#type to work with interval type correctly.
         * @member Interval
         * @private
         */
        this.t = 'float';
        /**
         * Left endpoint. Use Interval#from and Interval#to to work with interval left endpoint correctly.
         * @member Interval
         * @private
         */
        this.l = new Endpoint({
            value: Number.NEGATIVE_INFINITY,
            included: false
        });
        /**
         * Right endpoint. Interval#to to work with interval right endpoint correctly.
         * @member Interval
         * @private
         */
        this.r = new Endpoint({
            value: Number.POSITIVE_INFINITY,
            included: false
        });

        if (config) {
            if (config.type) {
                this.type = config.type;
            }
            if (config.from) {
                this.from = config.from;
            }
            if (config.to) {
                this.to = config.to;
            }
        }
    }

    /**
     * Prevents library conflicts
     */
    if (this === window) {
        prev = this.Interval
        Interval.noConflict = function() {
            this.Interval = prev;
            delete Interval.noConflict; // noConflict cannot be invoked again
            return Interval;
        };
    }

    Object.defineProperty(Interval.prototype, 'diameter', {
        get: function diameter() {
            if (this.isEmpty) {
                return 0;
            }
            if (!this.isBounded) {
                return Number.POSITIVE_INFINITY;
            }
            return Math.abs(this.from.value - this.r.value);
        }
    });

    Object.defineProperty(Interval, 'empty', {
        get: function empty() {
            return new Interval({
                from: {
                    value: 0,
                    included: false
                },
                to: {
                    value: 0,
                    included: false
                }
            });
        }
    });

    Object.defineProperty(Interval.prototype, 'midpoint', {
        get: function midpoint() {
            if (this.isEmpty || !this.isBounded) {
                return;
            }
            return (this.from.value + this.r.value) / 2;
        }
    });

    Object.defineProperty(Interval.prototype, 'radius', {
        get: function midpoint() {
            if (this.isEmpty || !this.isBounded) {
                return 0;
            }
            return Math.abs(this.from.value - this.r.value) / 2;
        }
    });


    /**
     * Check if parameter is within interval.
     * @param {Number} value Value to test if is within this interval.
     */
    Interval.prototype.test = function test(value) {
        if (this.isEmpty) {
            return false;
        }
        return (this.from.included ? value >= this.from.value : value > this.from.value) &&
               (this.r.included ? value <= this.r.value : value < this.r.value);
    };

    /**
     * Gets or sets interval type.
     * @throws  {Error}  Will throw an error if parameter value is neither 'integer' or 'float'.
     * @param   {String} value 'integer' or 'float'.
     * @returns {String} 'integer or 'float'.
     */
    Object.defineProperty(Interval.prototype, 'type', {
        get: function() {
            return this.t;
        },
        set: function(value) {
            if (value === 'integer' || value === 'float') {
                this.t = value;
            } else {
                throw new Error('type called with invalid param value: "' + value + '". Use "integer" or "float".');
            }
        }
    });

    function checkValue(value, type) {
        if (type === 'integer' && !Utils.isInteger(value)) {
            throw new TypeError('Invalid integer value.');
        }
    }

    function tryParseValue(ep) {
        var numericValue = Utils.getNumber(ep.value);
        checkValue(numericValue, ep.type);
        return numericValue;
    }

    function tryParseInclusion(ep) {
        if (ep.included === 'true' || ep.included === 'false') {
            return ep.included === 'true';
        }
        else if (typeof ep.included === 'boolean') {
            return ep.included;
        }

        throw new TypeError('Invalid inclusion type: "' + ep.included + '"');
    }

    function parseEndpoint(ep) {
        return new Endpoint({
            included: tryParseInclusion(ep),
            value: tryParseValue(ep)
        });
    }

    /**
     * Gets or sets interval from endpoint.
     * @aside guide endpoints
     * @param   {Number|Endpoint} [value]           New from value of interval.
     * @param   {Boolean}         [included, false] Specify inclusion/exclusion of the endpoint within the interval.
     * @returns {Endpoint}        Left endpoint { value, included }
     */
    Object.defineProperty(Interval.prototype, 'from', {
        get: function() {
            return this.l;
        },
        set: function(value) {
            try {
                this.l = parseEndpoint(value);
            }
            catch (e) {
                throw e;
                var error = (e instanceof TypeError) ? new TypeError() : new Error();
                error.message = 'Invalid call to "from". See inner error for more info.';
                error.inner = e;
                throw error;
            }
        }
    });

    /**
     * Gets or sets interval to endpoint.
     * @aside guide endpoints
     * @param   {Number|Endpoint} [value]           New from value of interval.
     * @param   {Boolean}         [included, false] Specify inclusion/exclusion of the endpoint within the interval.
     * @returns {Endpoint}        Right endpoint { value, included }
     */
    Object.defineProperty(Interval.prototype, 'to', {
        get: function() {
            return this.r;
        },
        set: function(value) {
            try {
                this.r = parseEndpoint(value);
            }
            catch (e) {
                var error = (e instanceof TypeError) ? new TypeError() : new Error();
                error.message = 'Invalid call to "to". See inner error for more info.';
                error.inner = e;
                throw error;
            }
        }
    });

    /**
     * Clears interval endpoints. Interval will be R (-Infinite, Infinite).
     */
    Interval.prototype.clear = function() {
        this.from = new Endpoint({
            value: Number.NEGATIVE_INFINITY,
            included: false
        });
        this.r = new Endpoint({
            value: Number.POSITIVE_INFINITY,
            included: false
        });
    };

    // STATIC

    function isValueWithinInterval(interval, value) {
        var isLowerThanRightEndpoint = interval.from.value < value;
        var IsEqualToIncludedRightEndpoint = (interval.from.included && interval.from.value <= value);
        var isGreaterThanLeftEndpoint = value < interval.to.value;
        var isEqualToIncludedLeftEndpoint = (interval.to.included && value <= interval.to.value);

        return (isLowerThanRightEndpoint || IsEqualToIncludedRightEndpoint) &&
               (isGreaterThanLeftEndpoint || isEqualToIncludedLeftEndpoint);
    }

    /**
     * Checks if value is within a interval
     * @throws  {TypeError}     Will throw an error if value does not match interval type
     *                          (float value to integer interval).
     * @return {Boolean} true if value is whitin the interval, false in other case.
     */
    Interval.test = function(value, interval) {
        var isFloatValue = (Utils.isFloat(value) || Utils.isFloatString(value));
        var number = Utils.getNumber(value);
        var isInteger = interval.type === 'integer';

        if (isNaN(number) || (isInteger && isFloatValue)) {
            throw new TypeError('"' + value + '" is not a valid ' + interval.type + ' value.');
        }

        if (interval.isEmpty) {
            return false;
        }

        value = number;

        return isValueWithinInterval(interval, value);
    };

    return Interval;
}));