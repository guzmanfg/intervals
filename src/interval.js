// TODO: decimal comma (semicolon as separator)
// TODO: scientific notation (e.g. 1e-17)
/*global define, exports*/
(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object' && exports) {
        // CommonJs 
        root.module.exports = factory(root);
    } else {
        // Browser global
        root.Interval = factory(root);
    }

}(this, function (root) {
    'use strict';

    var infinity = '∞',
        emptySet = '∅',
        prev = root && root.Interval,
        regex;

    // Helpers
    /**
     * Gets number value of string.
     * @param {String} str String representing a numeric value.
     */
    function getNumber(str) {
        if (typeof str === 'undefined') {
            return;
        }
        if (!isNaN(str)) {
            return Number(str);
        }
        if (str.toUpperCase() === 'INF' || str === '∞') {
            return Number.POSITIVE_INFINITY;
        }
        if (str.toUpperCase() === '-INF' || str === '-∞') {
            return Number.NEGATIVE_INFINITY;
        }
    }

    /**
     * Checks if a value is a float number.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is a float number, false in other case.
     */
    function isFloat(n) {
        return n === Number(n) && n % 1 !== 0;
    }

    /**
     * Check if a value is an integer number.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is an integer number, false in other case.
     */
    function isInt(n) {
        return Number(n) === n && n % 1 === 0;
    }

    /**
     * Checks if a value is infinite.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is infinite, false in other case.
     */
    function isInfinite(n) {
        return Number(n) === n && !isFinite(n);
    }

    function isNumber(n) {
        return !isNaN(n);
    }

    /** 
     * Combines several regular expressions into a single one
     * @param {Array} regs Regular expressions
     * @param {Strng} options (optional) RegExp flags
     */
    function multilineRegExp(regs, options) {
        return new RegExp(regs.map(
            function (reg) {
                return reg.source;
            }
        ).join(''), options);
    }

    // ^\s*(\(|\]|\[|\{)?\s*([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205)?\s*(,|(\.\.))?\s*([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E))?\s*(\)|\[|\]|\})?\s*$
    regex = multilineRegExp([
        /^\s*/,
        /(\(|\]|\[|\{)?/, // Group 1 - Opening bracket 
        /\s*/,
        /([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205)?/, // Group 2 - First term: Number, infinity or empty set (∅)
        /\s*/,
        /(,|(\.\.))?/, // Group 6 - Separator (, or ..)
        /\s*/,
        /([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E))?/, // Group 8 - Second term: Number or infinity
        /\s*/,
        /(\)|\[|\]|\})?/, // Group 12 - Closing bracket
        /\s*$/
    ], 'i');

    // Endpoint
    function Endpoint(config) {
        this.v = 0;
        this.c = false;

        if (config) {
            if (config.value) {
                this.value(config.value);
            }
            if (config.isClosed) {
                this.isClosed(config.isClosed);
            }
        }
    }

    Endpoint.prototype.isClosed = function (value) {
        if (arguments.length > 0) {
            if (typeof value === 'boolean') {
                this.c = value;
            } else {
                throw new TypeError('isClosed called with invalid param value: "' + value + '".');
            }
        }
        return this.c;
    };

    Endpoint.prototype.value = function (value) {
        if (arguments.length > 0) {
            if (isInt(value) || isFloat(value)) {
                this.v = value;
            } else {
                throw new TypeError('value called with invalid param value: "' + value + '".');
            }
        }
        return this.v;
    };

    /**
     * Test if given value type is valid for given interval.
     * @param   {Object}  interval 
     * @param   {Number}  value    Value to be tested.
     * @returns {Boolean} true when value type is valid for given interval, false in other case.
     */
    function isValidEndpointValue(interval, value) {
        var float = false,
            infinite = false,
            integer = false;
        switch (interval.type()) {
        case 'integer':
            integer = infinite = true;
            break;
        case 'float':
            float = integer = infinite = true;
            break;
        }

        return isInfinite(value) === infinite && isInt(value) === integer && isFloat(value) === float;
    }

    /**
     * Adds an endpoint to interval
     * @private
     * @throws  {TypeError}     Will throw an error if neither value nor direction are numbers or isClosed is not a boolean.
     * @throws  {RangeError}    Will throw an error if direction is not  0 or 1.
     * @param   {Number}        value               Numeric value of the endpoint (left or right will depend on its position). Type must match with Interval.type.
     * @param   {Number}        direction           Sets the direction of the endpoint (0 is the begining of the interval, 1 is the end).
     * @param   {Boolean}       [isClosed, false]   true if this endpoint is closed (excludes value from interval), false in other case.
     */
    function addEndPoint(interval, value, isClosed, direction) {

        if (isValidEndpointValue(interval, value)) {
            throw new TypeError('addEndPoint called with invalid param "value" type. Use "' + interval.type() + '".');
        }

        if (typeof isClosed === typeof undefined) {
            isClosed = false;
        } else if (typeof isClosed !== 'boolean') {
            throw new TypeError('addEndPoint called with invalid param "isClosed" type.');
        }

        if (Number(direction) !== direction) {
            throw new TypeError('addEndPoint called with invalid param "direction" type.');
        } else if (direction !== 0 && direction !== 1) {
            throw new RangeError('addEndPoint called with invalid param "direction" value. Use 0 for left, 1 for right.');
        }

        // Set endpoint
        interval.ep[direction] = new Endpoint({
            value: value,
            isClosed: isClosed
        });
    }

    /**
     * Gets printable closure based on direction and open notation.
     * @private
     * @param   {Object} endpoint  Endpoint { value, isClosed }
     * @param   {String} direction 'left' or 'right'
     * @param   {String} notation  'parenthesis' or 'reversed'
     * @returns {string} Closure: ( ) [ ]
     */
    function getClosure(endpoint, direction, notation) {
        var closures = notation === 'reversed' ? [']', '['] : ['(', ')'];
        // Closed
        if (endpoint.isClosed) {
            return direction === 'right' ? ']' : '[';
        }
        // Open 
        return closures[direction === 'right' ? 1 : 0];
    }

    /**
     * Check if value fulfills endpoint restriction.
     * @private
     * @param   {Object}  endpoint  Endpoint { value, isClosed }
     * @param   {Number}  value     Value to be tested
     * @param   {Number}  direction 0 for left, 1 for right
     * @returns {Boolean} true when value fulfills endpoint restriction, false in other case
     */
    function testEndpoint(endpoint, value, direction) {
        if (direction === 1) {
            return endpoint.isClosed ? value <= endpoint.value : value < endpoint.value;
        } else {
            return endpoint.isClosed ? value >= endpoint.value : value > endpoint.value;
        }
    }

    /** 
     * @class Interval Interval class
     * @param {Object} config Interval configuration options: 
     *                        { type: String 'float' (default) | 'integer', endpoints: Array }
     */
    function Interval(config) {
        /**
         * Type attribute ('integer' or 'float'). Use Interval#type to get/set this value properly.
         * @member Interval 
         * @private
         */
        this.t = 'float';
        /**
         * Endpoints. Use Interval#left and Interval#right to work with interval endpoints properly.
         * @member Interval
         * @private
         */
        this.ep = [
            new Endpoint({
                value: 0,
                isClosed: false
            }),
            new Endpoint({
                value: 0,
                isClosed: false
            })
        ];

        if (config) {
            if (config.type) {
                this.type(config.type);
            }
            if (config.endpoints) {
                var idx,
                    direction,
                    endpoint;

                if (!Array.isArray(config.endpoints) || config.endpoints.length !== 2) {
                    throw new TypeError('endpoints called with invalid type.');
                }

                for (idx = 0; idx < 2; idx += 1) {
                    endpoint = config.endpoints[idx];
                    if (endpoint instanceof Endpoint || (typeof endpoint === 'object' && typeof endpoint.value !== 'undefined')) {
                        addEndPoint(this, endpoint.value, endpoint.isClosed || false, idx);
                    } else {
                        addEndPoint(this, endpoint, true, idx);
                    }
                }
            }
        }
    }

    /** Prevents library conflicts */
    Interval.noConflict = function () {
        root.Interval = prev;
        delete Interval.noConflict; // noConflict cannot be invoked again
        return Interval;
    };

    /**
     * Check if parameter is within interval.
     * @param {Number} value Value to test if is within this interval.
     */
    Interval.prototype.test = function test(value) {
        if (this.isEmpty()) {
            return false;
        }
        return (this.left().isClosed() ? value >= this.left().value() : value > this.left().value()) &&
            (this.right().isClosed() ? value <= this.right().value() : value < this.right().value());
    };

    /**
     * Exports interval to a human-readable format
     * @param   {String}  openNotation  If x | a < x <= b, use 'parenthesis' for '(a,b]' or 'reversed' for ']a,b]'
     * @param   {Boolean} doNotSimpilfy Setted to true avoids simplification (e.g. [2,2] --> {2})
     * @returns {String}  String representing interval in human-readable notation (e.g. [2,2]).
     */
    Interval.prototype.toString = function toString(openNotation, doNotSimpilfy) {
        var str = '';
        doNotSimpilfy = arguments.length > 1 ? doNotSimpilfy : false;

        if (!doNotSimpilfy) {
            if (this.isDegenerate()) {
                return '{' + (this.left().value() + (this.type() === 'integer' && !this.left().isClosed() ? 1 : 0)) + '}';
            }

            if (this.isEmpty()) {
                return emptySet;
            }
        }

        if (this.t === 'integer') {
            // Left
            str = this.left().value() + (this.left().isClosed() ? 0 : 1);
            // Separator
            str += '..';
            // Right
            str += this.right().value() - (this.right().isClosed() ? 0 : 1);
        } else {
            // Left
            str = getClosure(this.left(), 'left', openNotation) + this.left().value();
            // Separator
            str += ',';
            // Right
            str += this.right().value() + getClosure(this.right(), 'right', openNotation);
        }
        return str;
    };

    /**
     * Gets or sets interval type.
     * @throws  {Error}  Will throw an error if parameter value is neither 'integer' or 'float'.
     * @param   {String} value 'integer' or 'float'.
     * @returns {String} 'integer or 'float'.
     */
    Interval.prototype.type = function (value) {
        if (arguments.length > 0) {
            if (value === 'integer' || value === 'float') {
                this.t = value;
            } else {
                throw new Error('type called with invalid param value: "' + value + '". Use "integer" or "float".');
            }
        }
        return this.t;
    };

    /**
     * Gets or sets interval left endpoint. 
     * @aside guide endpoints
     * @param   {Number|Endpoint} [value]           New left value of interval.
     * @param   {Boolean}         [isClosed, false] Specify inclusion/exclusion of the endpoint within the interval.
     * @returns {Endpoint}        Left endpoint { value, isClosed }
     */
    Interval.prototype.left = function (value, isClosed) {
        if (arguments.length > 0) {
            try {
                addEndPoint(this, value, 0, isClosed);
            } catch (e) {
                var error = (e instanceof TypeError) ? new TypeError() : new Error();
                error.message = 'Invalid call to left. See inner error for more info.';
                error.inner = e;
                throw error;
            }
        }

        return this.ep[0];
    };

    /**
     * Gets or sets interval right endpoint. 
     * @aside guide endpoints
     * @param   {Number|Endpoint} [value]           New left value of interval.
     * @param   {Boolean}         [isClosed, false] Specify inclusion/exclusion of the endpoint within the interval.
     * @returns {Endpoint}        Right endpoint { value, isClosed }
     */
    Interval.prototype.right = function (value, isClosed) {
        if (arguments.length > 0) {
            try {
                addEndPoint(this, value, 1, isClosed);
            } catch (e) {
                var error = (e instanceof TypeError) ? new TypeError() : new Error();
                error.message = 'Invalid call to right. See inner error for more info.';
                error.inner = e;
                throw error;
            }
        }
        return this.ep[1];
    };

    /**
     * Clears interval endpoints. Interval will be empty (0,0).
     */
    Interval.prototype.clear = function () {
        this.ep = [
            new Endpoint({
                value: 0,
                isClosed: false
            }),
            new Endpoint({
                value: 0,
                isClosed: false
            })
        ];
    };

    // Static
    // Based on https://github.com/vluzrmos/interval-js
    Interval.test = function (value, interval) {

    };

    Interval.parse = function (str) {
        // Degenerate:  {a}
        // Open:        (a,b[
        // Closed:      [a,b]
        // Integer:     a..b
        // Empty set: {} or ∅ 
        // Infinity: ∞, Infinity and -Infinity
        if (typeof str !== 'string' && !(str instanceof String)) {
            throw new TypeError('parse called with a not string argument.');
        }
        var closingBracket,
            error = new Error('"' + str + '" cannot be parsed to interval.'),
            firstTerm,
            matches = str.match(regex),
            openingBracket,
            secondTerm,
            separator;

        if (typeof matches === 'undefined' || !matches) {
            throw error;
        }

        // Group 1 - Opening bracket 
        openingBracket = matches[1];
        // Group 2 - First term: Number, infinity or empty set (∅)
        firstTerm = getNumber(matches[2]);
        // Group 6 - Separator (, or ..)
        separator = matches[6];
        // Group 8 - Second term: Number or infinity
        secondTerm = getNumber(matches[8]);
        // Group 12 - Closing bracket
        closingBracket = matches[12];

        // Check empty set special character form
        if (firstTerm === emptySet) {
            if (typeof openingBracket === typeof separator === typeof separator === typeof secondTerm === typeof closingBracket === 'undefined') {
                return new Interval();
            }
            throw error;
        }

        // Check curly brackets
        if (openingBracket === '{' || closingBracket === '}') {
            if (openingBracket === '{' && closingBracket === '}' && typeof separator !== 'undefined' && typeof secondTerm !== 'undefined') {
                if (typeof firstTerm === 'undefined') {
                    // Empty interval
                    return new Interval();
                }

                // Degenerate interval {a}
                return new Interval({
                    type: isInt(firstTerm) ? 'integer' : 'float',
                    endpoints: [{
                        value: firstTerm,
                        isClosed: true
                    }, {
                        value: firstTerm,
                        isClosde: true
                    }]
                });

            }
            throw error;
        }

        // Check double dot notation (integer)
        if (separator === '..') {
            if (typeof firstTerm === 'undefined' || isFloat(firstTerm) || typeof secondTerm === 'undefined' || isFloat(secondTerm)) {
                throw error;
            }
            return new Interval({
                type: 'integer',
                endpoints: [{
                    value: getNumber(firstTerm),
                    isClosed: true
                }, {
                    value: getNumber(secondTerm),
                    isClosed: true
                }]
            });
        }

        return new Interval({
            type: (isFloat(firstTerm) || isFloat(secondTerm)) ? 'float' : 'integer',
            endpoints: [
                {
                    value: firstTerm,
                    isClosed: openingBracket === '['
                },
                {
                    value: getNumber(secondTerm),
                    isClosed: closingBracket === ']'
                }
            ]
        });
    };

    // Classification

    /**
     * Gets if interval is bounded
     * @returns {Boolean} true if both endpoints are numbers (not infinite), false in other case.
     */
    Interval.prototype.isBounded = function () {
        return !!this.left() && !!this.right() && this.left().value() > Number.NEGATIVE_INFINITY && this.right().value() < Number.POSITIVE_INFINITY;
    };

    /**
     * Gets if interval is closed.
     * @returns {Boolean} true if both endpoints are closed, false in other case.
     */
    Interval.prototype.isClosed = function () {
        return !!this.left() && !!this.right() && this.left().isClosed() && this.right().isClosed();
    };

    /**
     * Gets if interval is degenerate.
     * @returns {Boolean} true if interval represents a single value (e.g. [a,a]), false in other case.
     */
    Interval.prototype.isDegenerate = function () {
        return (this.isClosed() && this.left().value() === this.right().value()) || // [a,a]
            (this.type() === 'integer' && (this.left().value() + 1) === this.right().value() && (this.left().isClosed() !== this.right().isClosed())); // [a, b) : a = b - 1 and [a,b) ⊆ Z 
    };

    /**
     * Gets if interval is empty.
     * @returns {Boolean} true if interval is empty, false in other case.
     */
    Interval.prototype.isEmpty = function () {
        return (this.left().value() > this.right().value() || // [b,a] : a < b
                (this.left().value() === this.right().value() && (!this.left().isClosed() || !this.right().isClosed()))) || // (a,a) | (a,a] | [a,a)
            (this.type() === 'integer' && (this.left().value() + 1) === this.right().value() && !this.left().isClosed() && !this.right().isClosed()); // (a,b) : a = b - 1 and (a,b) ⊆ Z 
    };

    /**
     * Gets if interval is open.
     * @returns {Boolean} true if both endpoints are open, false in other case.
     */
    Interval.prototype.isOpen = function () {
        return !!this.left() && !!this.right() && !this.left().isClosed() && !this.right().isClosed();
    };

    // FUTURE: classification (string representing interval)

    // Operations
    /**
     * Gets complementary interval of the current one.
     * @static
     * @param   {Interval}       interval Interval of which complementary will be calculated.
     * @returns {Intervla|Array} New interval or array of intervals representing complementary.
     */
    Interval.complementary = function (interval) {
        // Empty
        if (interval.isEmpty()) {
            // Total of R
            return new Interval({
                type: interval.type(),
                endpoints: [{
                    value: Number.NEGATIVE_INFINITY,
                    isClosed: false
                }, {
                    value: Number.POSITIVE_INFINITY,
                    isClosed: false
                }]
            });
        }

        // Bounded
        if (interval.isBounded()) {
            return [
                new Interval({
                    type: interval.type(),
                    endpoints: [{
                        value: Number.NEGATIVE_INFINITY,
                        isClosed: false
                    }, {
                        value: interval.left().value(),
                        isClosed: !interval.left().isClosed()
                    }]
                }),
                new Interval({
                    type: interval.type(),
                    endpoints: [{
                        value: interval.right().value(),
                        isClosed: !interval.right().isClosed()
                    }, {
                        value: Number.POSITIVE_INFINITY,
                        isClosed: false
                    }]
                })
            ];
        }

        // Unbounded
        var endpoints = [];
        if (interval.left().value === Number.NEGATIVE_INFINITY) {
            // !(-∞, b) = [b, +∞)
            endpoints = [{
                value: interval.right().value(),
                isClosed: !interval.right().isClosed()
            }, {
                value: Number.POSITIVE_INFINITY,
                isClosed: false
            }];

        } else {
            // !(a, +∞) = (-∞, a]
            endpoints = [{
                value: Number.NEGATIVE_INFINITY,
                isClosed: false
            }, {
                value: interval.left().value(),
                isClosed: !interval.left().isClosed()
            }];
        }

        return new Interval({
            type: interval.type(),
            endpoints: endpoints
        });
    };

    /** 
     * @alias Interval.complementary 
     * @static
     */
    Interval.nor = Interval.complementary;

    /**
     * Gets complementary interval of the current one.
     * @returns {Interval|Array} Interval or array of intervals representing complementary of current one.
     */
    Interval.prototype.complementary = function () {
        return Interval.complementary(this);
    };

    /** @alias Interval.prototype.complementary */
    Interval.prototype.nor = Interval.prototype.complementary;

    // FUTURE: Interval logical operations: nor / complementary (done), or / union, and / intersection, etc.
    /**
     * Gets union of intervals
     * @param {...*} var_args 
     * @returns {Interval|Array}  Interval or array of intervals representing union of this method parameters.
     */
    Interval.union = function () {
        // Use of arguments
        return {};
    };

    Interval.or = Interval.union;

    Interval.prototype.union = function (other) {
        return Interval.union(this, other);
    };

    Interval.prototype.or = Interval.prototype.union;

    // FUTURE: Interval intersections

    // FUTURE: Interval arithmetics

    return Interval;
}));