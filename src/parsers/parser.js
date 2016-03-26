/*global define, module, require*/
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['Interval', 'Utils'], function(Interval, Utils) {
            return (root.Interval = factory(Interval, Utils));
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = (root.Interval = factory(require('Interval'), require('Utils')));
    } else {
        root.Interval = factory(root.Interval, root.Utils);
    }
}(this, function(Interval) {
    'use strict';
    var emptySet = decodeURI('\u2205'), // ∅
        infinity = decodeURI('\u221E'); // ∞

    Interval.Parsers = {};

    function getParsers() {
        var keys = Object.keys(Interval.Parsers),
            parsers = [],
            p;

        for (p = 0; p < keys.length; p++) {
            parsers.push(Interval.Parsers[keys[p]]);
        }

        return parsers;
    }

    /**
     * Gets an interval from another object.
     * @param {*} interval Object representing the interval
     */
    Interval.parse = function(interval, parser) {
        // Degenerate:  {a}
        // Open:        (a,b[
        // Closed:      [a,b]
        // Integer:     a..b
        // Empty set:   {} or ∅
        // Infinity:    ∞, Infinity and -Infinity
        return parser.parse(interval);
    };

    Interval.toString = function(interval, parser, options) {
        return interval.toString(parser, options);
    };


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
        return !decimal || Utils.isFloat(value) ? value : value.toFixed(1);
    }

    /**
     * Exports interval to a human-readable format
     * @param   {String}  notation  use 'interval' for '(a,e]',
     *                                  'bourbaki' for ']a,e]',
     *                                  'integer' for 'a.e' (integer only),
     *                                  'inequality' for 'a < x <= e' or
     *                                  'list' for 'a, b, c, d, e' (integer only)
     * @param   {Boolean} doNotSimpilfy Setted to true avoids simplification (e.g. [2,2] --> {2})
     * @returns {String}  String representing interval in human-readable notation (e.g. [2,2]).
     */
    Object.defineProperty(Interval.prototype, 'toString', {
        configurable: false,
        value: function toString(parser, options) {
            var str = '';

            if (options.simplify) {
                if (this.isDegenerate) {
                    return '{' + (this.from.value + (this.type === 'integer' && !this.from.included ? 1 : 0)) + '}';
                }

                if (this.isEmpty) {
                    return emptySet;
                }
            }

            // TODO: apply parser
            if (notation === 'integer' && this.t === 'integer') {
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

            return str;
        }
    };

    return Interval;
}));