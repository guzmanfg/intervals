// TODO: decimal comma (semicolon as separator)
// TODO: scientific notation (e.g. 1e-17)
/*global define, exports*/

// Based on https://github.com/vluzrmos/interval-js and https://github.com/Semigradsky/math-interval-parser

// TODO: Interval sets (discontinuous intervals)
(function (root) {
    'use strict';

    var emptySet = decodeURI('\u2205'), // ∅
        // Regexp for inequality notation
        inequalityRegex = multiregexp([
            /^\s*/,
            /([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205|\w)/, // Group 1 - First term
            /\s*/,
            /([<>]=?|=)/, // Group 5 - Operator
            /\s*/,
            /([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205|\w)/, // Group 6 - Second term
            /\s*/,
            /(([<>]=?|=)\s*([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205|\w))?/, // Optionals: Group 11 - Second operator, Group 12 - Third term
            /\s*$/
        ], 'i'),
        infinity = decodeURI('\u221E'), // ∞
        // Regexp for interval notation
        intervalRegex = multiregexp([
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
        ], 'i'),
        listRegex = multiregexp([
            /^\s*/,
            /\(/, // Opening bracket
            /\s*/,
            /([+\-]?(\d+(\.\d+)?))/, // Group 1 - First term
            /\s*/,
            /(,\s*([+\-]?(\d+(\.\d+)?\s*)))*/, // Optional and repeatable: Group 5 - n term
            /\)/, // Closing bracket
            /\s*$/
        ], 'i'),
        prev = root && root.Interval;

    /**
     * Test if given value type is valid for given interval.
     * @param   {Object}  interval 
     * @param   {Number}  value    Value to be tested.
     * @returns {Boolean} true when value type is valid for given interval, false in other case.
     */
    function isValidValueType(value, type) {
        var float = false,
            infinite = false,
            integer = false;
        switch (type) {
        case 'integer':
            integer = infinite = true;
            break;
        case 'float':
            float = integer = infinite = true;
            break;
        }

        return isInfinite(value) === infinite || // Accepts infinite values
            (integer && isInt(value)) || // Integer interval 
            (isFloat(value) && (integer || float)); // Float interval
    }

    /**
     * Adds an endpoint to interval
     * @private
     * @throws  {TypeError}     Will throw an error if neither value nor direction are numbers or included is not a boolean.
     * @throws  {RangeError}    Will throw an error if direction is not  0 or 1.
     * @param   {Number}        value               Numeric value of the endpoint (from or to will depend on its position). Type must match with Interval.type.
     * @param   {Number}        direction           Sets the direction of the endpoint (0 is the begining of the interval, 1 is the end).
     * @param   {Boolean}       [included, false]   true if this endpoint is closed (excludes value from interval), false in other case.
     */
    function addEndPoint(interval, value, included, direction) {

        if (!isValidValueType(value, interval.type)) {
            throw new TypeError('addEndPoint called with invalid param "value" type. Use "' + interval.type + '".');
        }

        if (typeof included === 'undefined') {
            included = false;
        } else if (typeof included !== 'boolean') {
            throw new TypeError('addEndPoint called with invalid param "included" type.');
        }

        if (Number(direction) !== direction) {
            throw new TypeError('addEndPoint called with invalid param "direction" type.');
        } else if (direction !== 0 && direction !== 1) {
            throw new RangeError('addEndPoint called with invalid param "direction" value. Use 0 for from, 1 for to.');
        }

        // Set endpoint
        interval.ep[direction] = new Endpoint({
            value: value,
            included: included
        });
    }

    /**
     * Gets printable closure based on direction and open notation.
     * @private
     * @param   {Object} endpoint  Endpoint { value, included }
     * @param   {String} direction 'from' or 'to'
     * @param   {String} notation  'interval' or 'bourbaki'
     * @returns {string} Closure: ( ) [ ]
     */
    function getClosure(endpoint, direction, notation) {
        var closures = notation === 'bourbaki' ? [']', '['] : ['(', ')'];
        // Closed
        if (endpoint.included) {
            return direction === 'to' ? ']' : '[';
        }
        // Open 
        return closures[direction === 'to' ? 1 : 0];
    }

    /** 
     * Gets printable value (useful for float intervals with integer values)
     * @private
     * @param   {Number}    value   Number to be parsed
     * @param   {Boolean}   decimal true if must have decimal values, false in other case
     * @returns {Number} value with forced decimal positions if required
     */
    function getValue(value, decimal) {
        return !decimal || isFloat(value) ? value : value.toFixed(1);
    }

    /**
     * Check if value fulfills endpoint restriction.
     * @private
     * @param   {Object}  endpoint  Endpoint { value, included }
     * @param   {Number}  value     Value to be tested
     * @param   {Number}  direction 0 for from, 1 for to
     * @returns {Boolean} true when value fulfills endpoint restriction, false in other case
     */
    function testEndpoint(endpoint, value, direction) {
        if (direction === 1) {
            return endpoint.included ? value <= endpoint.value : value < endpoint.value;
        } else {
            return endpoint.included ? value >= endpoint.value : value > endpoint.value;
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
         * Endpoints. Use Interval#from and Interval#to to work with interval endpoints properly.
         * @member Interval
         * @private
         */
        this.ep = [
            new Endpoint({
                value: Number.NEGATIVE_INFINITY,
                included: false
            }),
            new Endpoint({
                value: Number.POSITIVE_INFINITY,
                included: false
            })
        ];

        if (config) {
            if (config.type) {
                this.type = config.type;
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
                        addEndPoint(this, endpoint.value, endpoint.included || false, idx);
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

    Object.defineProperty(Interval.prototype, 'diameter', {
        get: function diameter() {
            if (this.isEmpty) {
                return 0;
            }
            if (!this.isBounded) {
                return Number.POSITIVE_INFINITY;
            }
            return Math.abs(this.from.value - this.to.value);
        }
    });

    Object.defineProperty(Interval, 'empty', {
        get: function empty() {
            return new Interval({
                endpoints: [new Endpoint({
                    value: 0,
                    included: false
                }), new Endpoint({
                    value: 0,
                    included: false
                })]
            });
        }
    });

    Object.defineProperty(Interval.prototype, 'midpoint', {
        get: function midpoint() {
            if (this.isEmpty || !this.isBounded) {
                return;
            }
            return (this.from.value + this.to.value) / 2;
        }
    });

    Object.defineProperty(Interval.prototype, 'radius', {
        get: function midpoint() {
            if (this.isEmpty || !this.isBounded) {
                return 0;
            }
            return Math.abs(this.from.value - this.to.value) / 2;
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
            (this.to.included ? value <= this.to.value : value < this.to.value);
    };

    /**
     * Exports interval to a plain JSON
     * @returns {Object}  JSON
     */
    Interval.prototype.toJson = function toJson() {
        return {
            from: {
                included: this.ep[0].included,
                value: this.ep[0].value
            }
        };
    };

    /**
     * Exports interval to a human-readable format
     * @param   {String}  openNotation  use 'interval' for '(a,e]',
     *                                      'bourbaki' for ']a,e]', 
     *                                      'integer' for 'a.e' (integer only),
     *                                      'inequality' for 'a < x <= e' or 
     *                                      'list' for 'a, b, c, d, e' (integer only)
     * @param   {Boolean} doNotSimpilfy Setted to true avoids simplification (e.g. [2,2] --> {2})
     * @returns {String}  String representing interval in human-readable notation (e.g. [2,2]).
     */
    Interval.prototype.toString = function toString(notation, doNotSimpilfy) {
        var str = '';
        doNotSimpilfy = arguments.length > 1 ? doNotSimpilfy : false;

        if (!doNotSimpilfy) {
            if (this.isDegenerate) {
                return '{' + (this.from.value + (this.type === 'integer' && !this.from.included ? 1 : 0)) + '}';
            }

            if (this.isEmpty) {
                return emptySet;
            }
        }

        if (this.t === 'integer' && notation === 'integer') {
            // Left
            str = this.from.value + (this.from.included ? 0 : 1);
            // Separator
            str += '..';
            // Right
            str += this.to.value - (this.to.included ? 0 : 1);
        } else {
            // Left
            str = getClosure(this.from, 'from', notation) + getValue(this.from.value, this.type === 'float');
            // Separator
            str += ',';
            // Right
            str += getValue(this.to.value, this.type === 'float') + getClosure(this.to, 'to', notation);
        }

        // TODO: integer, inequality and list notation

        return str;
    };

    /**
     * Gets or sets interval type.
     * @throws  {Error}  Will throw an error if parameter value is neither 'integer' or 'float'.
     * @param   {String} value 'integer' or 'float'.
     * @returns {String} 'integer or 'float'.
     */
    Object.defineProperty(Interval.prototype, 'type', {
        get: function () {
            return this.t;
        },
        set: function (value) {
            if (value === 'integer' || value === 'float') {
                this.t = value;
            } else {
                throw new Error('type called with invalid param value: "' + value + '". Use "integer" or "float".');
            }
        }
    });

    /**
     * Gets or sets interval from endpoint. 
     * @aside guide endpoints
     * @param   {Number|Endpoint} [value]           New from value of interval.
     * @param   {Boolean}         [included, false] Specify inclusion/exclusion of the endpoint within the interval.
     * @returns {Endpoint}        Left endpoint { value, included }
     */
    Object.defineProperty(Interval.prototype, 'from', {
        get: function () {
            return this.ep[0];
        },
        set: function (value) {
            try {
                addEndPoint(this, value.value, value.included, 0);
            } catch (e) {
                var error = (e instanceof TypeError) ? new TypeError() : new Error();
                error.message = 'Invalid call to from. See inner error for more info.';
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
        get: function () {
            return this.ep[1];
        },
        set: function (value) {
            try {
                addEndPoint(this, value.value, value.included, 1);
            } catch (e) {
                var error = e instanceof TypeError ? new TypeError() : new Error();
                error.message = 'Invalid call to to. See inner error for more info.';
                error.inner = e;
                throw error;
            }
        }
    });

    /**
     * Clears interval endpoints. Interval will be R (-Infinite, Infinite).
     */
    Interval.prototype.clear = function () {
        this.ep = [
            new Endpoint({
                value: Number.NEGATIVE_INFINITY,
                included: false
            }),
            new Endpoint({
                value: Number.POSITIVE_INFINITY,
                included: false
            })
        ];
    };

    // STATIC

    /**
     * Checks if value is within a interval
     * @throws  {TypeError}     Will throw an error if value does not match interval type (float value to integer interval).
     * @return {Boolean} true if value is whitin the interval, false in other case.
     */
    Interval.test = function (value, interval) {

        if (isNaN(getNumber(value)) || (interval.type === 'integer' && (isFloat(value) || isFloatString(value)))) {
            throw new TypeError('"' + value + '" is not a valid ' + interval.type + ' value.');
        }

        if (interval.isEmpty) return false;

        value = getNumber(value);

        return (interval.from.value < value || (interval.from.included && interval.from.value <= value)) &&
            (value < interval.to.value || (interval.to.included && value <= interval.to.value));
    };

    /**
     * Gets an interval from a string.
     * @param {String} str string representing the interval
     */
    Interval.parse = function (str) {
        // Degenerate:  {a}
        // Open:        (a,b[
        // Closed:      [a,b]
        // Integer:     a..b
        // Empty set:   {} or ∅ 
        // Infinity:    ∞, Infinity and -Infinity
        if (typeof str !== 'string' && !(str instanceof String)) {
            throw new TypeError('parse called with a not string argument.');
        }
        var closingBracket,
            compare,
            ep,
            error = new Error('"' + str + '" cannot be parsed to interval.'),
            firstTerm,
            firstOperator,
            larger,
            isFloatInterval = false,
            ltr,
            matches,
            openingBracket,
            result,
            secondTerm,
            secondOperator,
            separator,
            thirdTerm,
            value;

        // Interval
        matches = str.match(intervalRegex);
        if (isArray(matches)) {

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


            isFloatInterval = isNaN(firstTerm) || isFloatString(matches[2]) || (!isNaN(secondTerm) && isFloatString(matches[8]));

            // Check empty set special character form
            if (firstTerm === emptySet) {
                if (typeof openingBracket === typeof separator === typeof separator === typeof secondTerm === typeof closingBracket === 'undefined') {
                    return new Interval();
                }
                throw error;
            }

            // Check curly brackets
            if (openingBracket === '{' || closingBracket === '}') {
                if (openingBracket !== '{' || closingBracket !== '}' || typeof separator === 'undefined' || typeof secondTerm === 'undefined') {
                    throw error;
                }

                if (typeof firstTerm === 'undefined') {
                    // Empty interval
                    return new Interval();
                }

                // Degenerate interval {a}
                return new Interval({
                    type: isFloatInterval,
                    endpoints: [{
                        value: firstTerm,
                        included: true
                    }, {
                        value: firstTerm,
                        isClosde: true
                    }]
                });

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
                        included: true
                    }, {
                        value: getNumber(secondTerm),
                        included: true
                    }]
                });
            }

            return new Interval({
                type: isFloatInterval,
                endpoints: [{
                    value: firstTerm,
                    included: openingBracket === '['
                }, {
                    value: getNumber(secondTerm),
                    included: closingBracket === ']'
                }]
            });
        }

        // Inequality
        // TODO: integer / float
        matches = str.match(inequalityRegex);
        if (isArray(matches)) {
            firstTerm = getNumber(matches[1]);
            firstOperator = matches[5];
            secondTerm = getNumber(matches[6]);
            secondOperator = matches[11];
            thirdTerm = getNumber(matches[12]);


            // First or second term (and only one of them) must be the variable
            if (isNaN(firstTerm) === isNaN(secondTerm)) {
                throw error;
            }

            ltr = isNaN(secondTerm);

            isFloatInterval =
                isNaN(ltr ? firstTerm : secondTerm) || isFloatString(ltr ? matches[1] : matches[6]) || // First or second term (depending on ltr) are float
                (ltr && !isNaN(thirdTerm) && isFloatString(matches[12])); // If ltr, check third term

            result = new Interval({
                type: isFloatInterval ? 'float' : 'integer'
            });

            // from: 3 < x | x > 3, to: 3 > x | x < 3
            result[ltr !== firstOperator.indexOf('>') >= 0 ? 'from' : 'to'] = new Endpoint({
                value: Number(ltr ? firstTerm : secondTerm),
                included: firstOperator.indexOf('=') >= 0
            });

            // Three terms
            if (typeof secondOperator !== 'undefined') {
                if (isNaN(thirdTerm) || !ltr) {
                    throw error;
                }
                if ((firstOperator.indexOf('>') >= 0) !== (secondOperator.indexOf('>') >= 0)) {
                    // Weird but possible: 3 > x < 4 --> x < 3 < 4
                    root.console.warn('Weird form of defining an interval.');
                    larger = secondOperator.indexOf('>') >= 0;
                    ep = result[larger ? 'from' : 'to'];
                    value = Math[larger ? 'max' : 'min'](ep.value, thirdTerm);

                    // Included when larger/lower value is included
                    // Compare > 0 when (larger and b > a) or (!larger and b < a)
                    compare = (thirdTerm - firstTerm) * (larger ? 1 : (-1));
                    ep.included = (ep.included || compare > 0) && (secondOperator.indexOf('=') >= 0 || compare < 0);

                    // TODO: included ep.included = ep.value === value 
                    ep.value = value;
                } else {
                    result[secondOperator.indexOf('>') >= 0 ? 'from' : 'to'] = new Endpoint({
                        value: Number(thirdTerm),
                        included: secondOperator.indexOf('=') >= 0
                    });
                }
            }

            return result;
        }


        // List
        // TODO: integer / float
        if (listRegex.test(str)) {

            result = str.replace('(', '').replace(')', '').trim().split(',').map(function (o) {
                return Number(o.trim());
            });
            // TODO: process results
        }


        throw error;
    };

    // CLASSIFICATION

    /**
     * Gets if interval is bounded
     * @returns {Boolean} true if both endpoints are numbers (not infinite), false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isBounded', {
        get: function () {
            return !!this.from && !!this.to && this.from.value > Number.NEGATIVE_INFINITY && this.to.value < Number.POSITIVE_INFINITY;
        }
    });

    /**
     * Gets if interval is closed.
     * @returns {Boolean} true if both endpoints are closed, false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isClosed', {
        get: function isClosed() {
            return !!this.from && !!this.to && this.from.included && this.to.included;
        }
    });

    /**
     * Gets if interval is degenerate.
     * @returns {Boolean} true if interval represents a single value (e.g. [a,a]), false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isDegenerate', {
        get: function () {
            return (this.isClosed && this.from.value === this.to.value) || // [a,a]
                (this.type === 'integer' && (this.from.value + 1) === this.to.value && (this.from.included !== this.to.included)); // [a, b) : a = b - 1 and [a,b) ⊆ Z 
        }
    });

    /**
     * Gets if interval is empty.
     * @returns {Boolean} true if interval is empty, false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isEmpty', {
        get: function () {
            return (this.from.value > this.to.value || // [b,a] : a < b
                    (this.from.value === this.to.value && (!this.from.included || !this.to.included))) || // (a,a) | (a,a] | [a,a)
                (this.type === 'integer' && (this.from.value + 1) === this.to.value && !this.from.included && !this.to.included); // (a,b) : a = b - 1 and (a,b) ⊆ Z 
        }
    });

    /**
     * Gets if there is some real number that is smaller than all its elements
     * @returns {Boolean} true if there is some real number that is smaller than all its elements, false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isLeftBounded', {
        get: function () {
            return !!this.from && this.from.value > Number.NEGATIVE_INFINITY;
        }
    });

    /**
     * Gets if interval has a minimum.
     * @returns {Boolean} true if interval has a minimum, false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isLeftClosed', {
        get: function () {
            return !!this.from && this.from.included;
        }
    });

    /**
     * Gets if interval is open.
     * @returns {Boolean} true if both endpoints are open, false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isOpen', {
        get: function () {
            return !!this.from && !!this.to && !this.from.included && !this.to.included;
        }
    });

    /**
     * Gets if there is some real number that is larger than all its elements
     * @returns {Boolean} true if there is some real number that is larger than all its elements, false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isRightBounded', {
        get: function () {
            return !!this.to && this.to.value < Number.POSITIVE_INFINITY;
        }
    });

    /**
     * Gets if interval has a maximum.
     * @returns {Boolean} true if interval has a maximum, false in other case.
     */
    Object.defineProperty(Interval.prototype, 'isRightClosed', {
        get: function () {
            return !!this.to && this.to.included;
        }
    });

    // OPERATIONS
    /**
     * Gets complementary interval of the current one.
     * @static
     * @param   {Interval}       interval Interval of which complementary will be calculated.
     * @returns {Intervla|Array} New interval or array of intervals representing complementary.
     */
    Interval.complementary = function (interval) {
        // Empty
        if (interval.isEmpty) {
            // Total of R
            return new Interval({
                type: interval.type,
                endpoints: [{
                    value: Number.NEGATIVE_INFINITY,
                    included: false
                }, {
                    value: Number.POSITIVE_INFINITY,
                    included: false
                }]
            });
        }

        // Bounded
        if (interval.isBounded) {
            return [
                new Interval({
                    type: interval.type,
                    endpoints: [{
                        value: Number.NEGATIVE_INFINITY,
                        included: false
                    }, {
                        value: interval.from.value,
                        included: !interval.from.included
                    }]
                }),
                new Interval({
                    type: interval.type,
                    endpoints: [{
                        value: interval.to.value,
                        included: !interval.to.included
                    }, {
                        value: Number.POSITIVE_INFINITY,
                        included: false
                    }]
                })
            ];
        }

        // Unbounded
        var endpoints = [];
        if (interval.from.value === Number.NEGATIVE_INFINITY) {
            // !(-∞, b) = [b, +∞)
            endpoints = [{
                value: interval.to.value,
                included: !interval.to.included
            }, {
                value: Number.POSITIVE_INFINITY,
                included: false
            }];

        } else {
            // !(a, +∞) = (-∞, a]
            endpoints = [{
                value: Number.NEGATIVE_INFINITY,
                included: false
            }, {
                value: interval.from.value,
                included: !interval.from.included
            }];
        }

        return new Interval({
            type: interval.type,
            endpoints: endpoints
        });
    };

    /**
     * Gets complementary interval of the current one.
     * @returns {Interval|Array} Interval or array of intervals representing complementary of current one.
     */
    Interval.prototype.complementary = function () {
        return Interval.complementary(this);
    };


    /** 
     * @alias Interval.complementary 
     * @static
     */
    Interval.nor = Interval.complementary;

    /** @alias Interval.prototype.complementary */
    Interval.prototype.nor = Interval.prototype.complementary;


    Interval.intersects = function intersects(a, b) {
        var d1 = a.from.value - b.to.value,
            d2 = a.to.value - b.from.value;

        return !a.isEmpty && !b.isEmpty && // Empty interval does not intersect with anyone else
            ((d1 === 0 && (a.from.included || b.to.included)) || (d2 === 0 && (a.to.included || b.from.included)) || ((d1 <= 0) !== (d2 <= 0)));
    };

    function intersection(a, b) {
        if (a.type !== b.type) {
            throw new TypeError('Both intervals types must match.');
        }

        if (!Interval.intersects(a, b)) {
            return Interval.empty;
        }

        // Get larger and smaller values and if they are included or not
        var d = a.from.value - b.from.value,
            d2 = a.to.value - b.to.value,
            from = d > 0 ? a.from : d < 0 ? b.from : new Endpoint({
                value: a.from.value,
                included: a.from.included && b.from.included
            }),
            to = d < 0 ? a.to : d > 0 ? b.to : new Endpoint({
                value: a.to.value,
                included: a.to.included && b.to.included
            });


        return new Interval({
            type: a.type === 'float' || b.type === 'float' ? 'float' : 'integer',
            endpoints: [from, to]
        });
    }

    Interval.intersection = function () {
        var current, result,
            stack = Array.prototype.slice.call(arguments);

        while (stack.length) {
            result = current;
            current = stack.shift();

            if (typeof result === 'undefined') {
                continue;
            }

            result = intersection(result, current);
            if (result.isEmpty) {
                break;
            }
        }

        return result;
    };

    Interval.prototype.intersection = function () {
        return Interval.intersection.apply(null, Array.prototype.concat([this], Array.prototype.slice.call(arguments)));
    };

    Interval.and = Interval.intersection;

    Interval.prototype.and = Interval.prototype.intersection;

    function union(a, b) {
        if (a.type !== b.type) {
            throw new TypeError('Both intervals types must match.');
        }

        // If intervals do not intersect, union is both intervals
        if (!Interval.intersects(a, b)) {
            return [a, b];
        }

        // Get larger and smaller values and if they are included or not
        var d = a.from.value - b.from.value,
            d2 = a.to.value - b.to.value,
            from = d < 0 ? a.from : d > 0 ? b.from : new Endpoint({
                value: a.from.value,
                included: a.from.included || b.from.included
            }),
            to = d > 0 ? a.to : d < 0 ? b.to : new Endpoint({
                value: a.to.value,
                included: a.to.included || b.to.included
            });


        return [new Interval({
            type: a.type === 'float' || b.type === 'float' ? 'float' : 'integer',
            endpoints: [from, to]
        })];

    }

    /**
     * Gets union of intervals
     * @param {...*} var_args 
     * @returns {Interval|Array}  Interval or array of intervals representing union of this method parameters.
     */
    Interval.union = function () {
        // Use of arguments
        var current, i,
            result = [],
            stack = Array.prototype.slice.call(arguments),
            united;

        while (stack.length) {
            current = stack.shift();

            for (i = 0; i < result.length; i++) {
                united = union(result[i], current);
                if (united.length === 1) {
                    // remove from results
                    result.splice(i, 1);
                    // push union to stack
                    stack.push(united[0]);
                    i = -1;
                    break;
                }
            }

            if (i >= result.length) {
                result.push(current);
            }
        }

        return result;
    };

    Interval.prototype.union = function () {
        return Interval.union.apply(null, Array.prototype.concat([this], Array.prototype.slice.call(arguments)));
    };

    Interval.or = Interval.union;

    Interval.prototype.or = Interval.prototype.union;

    // FUTURE: Interval intersections

    // FUTURE: Interval arithmetics

    // return Interval;
    root.Interval = Interval;

}(this));