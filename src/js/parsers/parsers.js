/*global define, module, require*/
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['../intervals', '../utils'], function(Interval, Utils) {
            factory(Interval, Utils);
        });
    } else if (typeof module === 'object' && module.exports) {
        root.Interval = factory(require('../intervals'), require('../utils'));
    } else {
        factory(root.Interval, root.Utils);
    }
}(this, function(Interval) {
    'use strict';
    var parsers = {};

    Interval.Symbols = {
        emptySet: decodeURI('\u2205'), // ∅
        infinity: decodeURI('\u221E') // ∞
    };
    Interval.Notation = {};

    /**
     * Parser interface.
     * @typedef {Object} Parser
     * @property {parser} parse
     */

    /**
     * Way to define a parse method for parsers.
     * @typedef {Function} parse
     * @param {Interval}  interval
     * @param {Object}    [options]
     */

    /**
     * Stringifier interface.
     * @typedef {Object} Stringifier
     * @property {stringify} stringify
     */

    /**
     * Way to define a stringify method for parsers.
     * @typedef {Function} stringify
     * @param {Interval}    interval
     * @param {Object}      [options]
     */

    /**
     * Adds a notation parser to Interval.Notations enum.
     * @param {Object}      parameters
     * @param {stringify}   parameters.stringify
     * @param {parse}       parameters.parse
     * @param {String}      parameters.name         Interval.Notation enum name.
     * @param {String}      parameters.value        Parser identifier.
     */
    Interval.registerNotation = function(parameters) {
        Interval.Notation[parameters.name] = parameters.value;
        parsers[parameters.value] = {
            parser: parameters.parse,
            stringify: parameters.stringify
        };
    };

    /**
     * Adds a collection of notation parsers to Interval.Notation enum.
     * @param {Object}      parameters
     * @param {Object}      parameters.notations    {key: value} where key is Interval.Notation enum name and value is
     *                                              parser identifier.
     * @param {stringify}   parameters.stringify
     * @param {parse}       parameters.parse
     */
    Interval.registerNotations = function(parameters) {
        var keys = Object.keys(parameters.notations);
        var k;
        for (k = 0; k < keys.length; k++) {
            Interval.registerNotation({
                name: keys[k],
                value: parameters.notations[keys[k]],
                parse: parameters.parse,
                stringify: parameters.stringify
            });
        }
    };

    /**
     * Gets an interval from another object.
     * @param {string}          str     Object representing the interval
     * @param {Parser|string}   parser
     */
    Interval.parse = function(str, parser, options) {
        var interval;
        if (typeof parser === 'string' && typeof parsers[parser].parse === 'function') {
            interval = parsers[parser].parse(str, options);
        } else if (parser && typeof parser.parse === 'function') {
            interval = parser.parse(str, options);
        }
        return interval;
    };

    /**
     *
     * Exports interval to a human-readable format
     * @param   {Interval|Object}       interval        Instance of Interval class.
     * @param   {Stringifier|String}    [stringifier]   Object with parse method receiving an intervals and optionally
     *                                                  a set of options.
     * @param   {Object}                [options]       Object with options for parser method.
     * @returns {String} String representing interval in human-readable notation (e.g. [2,2]).
     */
    Interval.stringify = function(interval, stringifier, options) {
        var str;

        if (typeof stringifier === 'string' && typeof parsers[stringifier].stringify === 'function') {
            str = parsers[stringifier].stringify(interval, options);
        } else if (stringifier && typeof stringifier.stringify === 'function') {
            str = stringifier.stringify(interval, options);
        } else {
            str = Object.prototype.toString.call(interval);
        }
        return str;
    };


    /**
     * Exports interval to a human-readable format
     * @param   {Stringifier|String}    [stringifier]
     * @param   {Object}                [options]   Object with options for parser method.
     * @returns {String} String representing interval in human-readable notation (e.g. [2,2]).
     */
    Interval.prototype.stringify = function(stringifier, options) {
        return Interval.stringify(this, stringifier, options);
    };

    return Interval;
}));