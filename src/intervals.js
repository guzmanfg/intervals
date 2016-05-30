var Numbers = require('./numbers');
var Endpoint = require('./endpoint');
var Interval = (function () {
    function Interval(interval) {
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
        this.l = new Endpoint({
            value: Number.NEGATIVE_INFINITY,
            included: false
        });
        if (interval) {
            if (interval.type) {
                this.type = interval.type;
            }
            if (interval.from) {
                this.from = interval.from;
            }
            if (interval.to) {
                this.to = interval.to;
            }
        }
    }
    Object.defineProperty(Interval.prototype, "type", {
        // Getters and setters
        get: function () {
            return this.t;
        },
        set: function (value) {
            if (value === 'integer' || value === 'float') {
                this.t = value;
            }
            else {
                throw new Error('type called with invalid param value: "' + value + '". Use "integer" or "float".');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "from", {
        get: function () {
            return this.l;
        },
        set: function (value) {
            this.l = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "to", {
        get: function () {
            return this.r;
        },
        set: function (value) {
            this.r = value;
        },
        enumerable: true,
        configurable: true
    });
    // Methods
    /**
     * Clears interval endpoints. Interval will be R (-Infinite, Infinite).
     */
    Interval.prototype.clear = function () {
        this.from = Endpoint.parse({
            value: Number.NEGATIVE_INFINITY,
            included: false
        });
        this.to = Endpoint.parse({
            value: Number.POSITIVE_INFINITY,
            included: false
        });
    };
    Interval.prototype.contains = function (value) {
        var isIntegerValue = Numbers.isInteger(value);
        var isInteger = this.type === 'integer';
        if (isNaN(value) || isInteger !== isIntegerValue) {
            throw new TypeError('"' + value + '" is not a valid ' + this.type + ' value.');
        }
        return this.isValueWithinInterval(value);
    };
    Interval.prototype.isValueWithinInterval = function (value) {
        var isLowerThanRightEndpoint = this.from.value < value;
        var IsEqualToIncludedRightEndpoint = (this.from.included && this.from.value <= value);
        var isGreaterThanLeftEndpoint = value < this.to.value;
        var isEqualToIncludedLeftEndpoint = (this.to.included && value <= this.to.value);
        return (isLowerThanRightEndpoint || IsEqualToIncludedRightEndpoint) &&
            (isGreaterThanLeftEndpoint || isEqualToIncludedLeftEndpoint);
    };
    Interval.extend = function (extensions) {
        var i;
        for (i = 0; i < extensions.length; i++) {
            Interval.prototype[extensions[i].name] = extensions[i].fn.bind(this, this);
        }
    };
    Object.defineProperty(Interval, "Empty", {
        // Static methods
        /**
         * Gets an interval instance representing an empty set (0,0)
         * @returns {Interval}
         * @constructor
         */
        get: function () {
            return new Interval({
                type: 'float',
                from: {
                    value: 0,
                    included: false
                },
                to: {
                    value: 0,
                    included: false
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval, "R", {
        /**
         * Gets an interval instance representing the real numbers set
         * @returns {Interval}
         * @constructor
         */
        get: function () {
            return new Interval({
                type: 'float',
                from: {
                    value: Number.NEGATIVE_INFINITY,
                    included: false
                },
                to: {
                    value: Number.POSITIVE_INFINITY,
                    included: false
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval, "Z", {
        /**
         * Gets an interval instance representing the integer numbers set
         * @returns {Interval}
         * @constructor
         */
        get: function () {
            return new Interval({
                type: 'integer',
                from: {
                    value: Number.NEGATIVE_INFINITY,
                    included: false
                },
                to: {
                    value: Number.POSITIVE_INFINITY,
                    included: false
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval, "N", {
        /**
         * Gets an interval instance representing the natural numbers set (integers greater than zero)
         * @returns {Interval}
         * @constructor
         */
        get: function () {
            return new Interval({
                type: 'integer',
                from: {
                    value: 0,
                    included: false
                },
                to: {
                    value: Number.POSITIVE_INFINITY,
                    included: false
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval, "NN", {
        /**
         * Gets an interval instance representing the non negative numbers set (integers equal or greater than zero)
         * @returns {Interval}
         * @constructor
         */
        get: function () {
            return new Interval({
                type: 'integer',
                from: {
                    value: 0,
                    included: true
                },
                to: {
                    value: Number.POSITIVE_INFINITY,
                    included: false
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    Interval.Factory = function () {
        var modules = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            modules[_i - 0] = arguments[_i];
        }
        var i;
        for (i = 0; i < modules.length; i++) {
        }
    };
    return Interval;
})();
module.exports = Interval;
//# sourceMappingURL=intervals.js.map