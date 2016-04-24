/*global define, module*/
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return (root.Utils = factory());
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = (root.Utils = factory());
    } else {
        root.Utils = factory();
    }
}(this, function() {
    'use strict';

    var Utils = {};

    // Helpers
    /**
     * Gets number value of string.
     * @param {String} str String representing a numeric value.
     */
    Utils.getNumber = function getNumber(str) {
        if (typeof str === 'undefined' || str === null) {
            return;
        }
        if (!isNaN(Number(str))) {
            return Number(str);
        }
        if (str.toUpperCase() === 'INF' || str === '∞') {
            return Number.POSITIVE_INFINITY;
        }
        if (str.toUpperCase() === '-INF' || str === '-∞') {
            return Number.NEGATIVE_INFINITY;
        }
    };

    Utils.isArray = function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };

    Utils.isBoolean = function(value) {
        return typeof value === 'boolean';
    };

    /**
     * Checks if a value is a float number.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is a float number, false in other case.
     */
    Utils.isFloat = function isFloat(n) {
        return n === Number(n) && n % 1 !== 0;
    };

    Utils.isFloatString = function isFloatString(str) {
        var n = Utils.getNumber(str);
        return (typeof str === 'string' || str instanceof String) && // is string
               !isNaN(n) && // represents a number
               ((n % 1 !== 0) || str.indexOf('.') >= 0 || !isFinite(n)); // actually is a float number, has decimal
                                                                         // separator (e.g. 1.0) or is infinite
    };

    /**
     * Check if a value is an integer number.
     * @private
     * @param   {Number}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is an integer number, false in other case.
     */
    Utils.isInteger = function isInt(n) {
        return Number(n) === n && (!isFinite(n) || n % 1 === 0); // infinite is a valid integer value
    };

    /**
     * Checks if a value is infinite.
     * @private
     * @param   {Number}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is infinite, false in other case.
     */
    Utils.isInfinite = function isInfinite(n) {
        return Number(n) === n && !isFinite(n);
    };

    Utils.isNumber = function isNumber(n) {
        return !isNaN(n);
    };


    /**
     * Combines several regular expressions into a single one
     * @param {Array} regs Regular expressions
     * @param {String} options (optional) RegExp flags
     */
    Utils.multiregexp = function multiregexp(regs, options) {
        return new RegExp(regs.map(function(reg) {
            return reg.source;
        }).join(''), options);
    };

    return Utils;
}));