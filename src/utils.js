(function (root) {
    'use strict';

    // Helpers
    /**
     * Gets number value of string.
     * @param {String} str String representing a numeric value.
     */
    root.getNumber = function getNumber(str) {
        if (typeof str === 'undefined' || str === null) {
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
    };

    root.isArray = function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };

    /**
     * Checks if a value is a float number.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is a float number, false in other case.
     */
    root.isFloat = function isFloat(n) {
        return n === Number(n) && n % 1 !== 0;
    };

    root.isFloatString = function isFloatString(str) {
        var n = root.getNumber(str);
        return (typeof str === 'string' || str instanceof String) && // is string
            !isNaN(n) && // represents a number 
            ((n % 1 !== 0) || str.indexOf('.') >= 0 || !isFinite(n)); // actually is a float number, has decimal separator (e.g. 1.0) or is infinite
    };

    /**
     * Check if a value is an integer number.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is an integer number, false in other case.
     */
    root.isInt = function isInt(n) {
        return Number(n) === n && (!isFinite(n) || n % 1 === 0); // infinite is a valid integer value
    };

    /**
     * Checks if a value is infinite.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is infinite, false in other case.
     */
    root.isInfinite = function isInfinite(n) {
        return Number(n) === n && !isFinite(n);
    };

    root.isNumber = function isNumber(n) {
        return !isNaN(n);
    };


    /** 
     * Combines several regular expressions into a single one
     * @param {Array} regs Regular expressions
     * @param {Strng} options (optional) RegExp flags
     */
    root.multiregexp = function multiregexp(regs, options) {
        return new RegExp(regs.map(
            function (reg) {
                return reg.source;
            }
        ).join(''), options);
    };
}(this));