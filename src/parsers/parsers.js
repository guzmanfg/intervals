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
    Interval.Notation = {};

    function getParsers() {
        var keys = Object.keys(Interval.Parsers),
            parsers = [],
            p;

        for (p = 0; p < keys.length; p++) {
            parsers.push(Interval.Parsers[keys[p]]);
        }

        return parsers;
    }

    function registerNotation(name, value) {
        // TODO: do not accept duplicate entries
        Interval.Notation[name] = value;
    }

    /**
     * Gets an interval from another object.
     * @param {*} interval Object representing the interval
     */
    Interval.parse = function(interval, parser) {
        return parser.parse(interval);
    };
    /**
     *
     * Exports interval to a human-readable format
     * @param   {Interval}  interval    Instance of Interval class.
     * @param   {Object}    [parser]    Object with parse method receiving an intervals and optionally a set of options.
     * @param   {Object}    [options]   Object with options for parser method.
     * @returns {String}    String representing interval in human-readable notation (e.g. [2,2]).
     */
    Interval.toString = function(interval, parser, options) {
        return interval.toString(parser, options);
    };

    /**
     * Exports interval to a human-readable format
     * @param   {Notation}  [parser]
     * @param   {Object}    [options]   Object with options for parser method.
     * @returns {String}    String representing interval in human-readable notation (e.g. [2,2]).
     */
    Object.defineProperty(Interval.prototype, 'toString', {
        configurable: false,
        value: function toString(parser, options) {
            var str;

            if (typeof parser === 'string') {
                str = Interval.Notation[parser].toString(this, options);
            } else if (parser && typeof parser.parse === 'function') {
                str = parser.toString(this, options);
            } else {
                str = Object.prototype.toString.call(this);
            }
            return str;
        }
    });
    
    /**
     * @param {String}      name
     * @param {Object}      value
     * @param {Function}    value.toString
     * @param {Function}    value.parse
     */
    Object.defineProperty(Interval.prototype, 'registerNotation', {
        value: registerNotation
    });

    /**
     * Converts an interval into a string.
     * @callback toString
     * @param {Interval}    interval
     * @param {Object}      options
     * @return {String}     interval stringified
     */

    /**
     * Converts an object into an interval.
     * @callback Requester~requestCallback
     * @param {*}           source
     * @param {Object}      options
     * @return {Interval}
     */

    return Interval;
}));