"use strict";
var Numbers = (function () {
    function Numbers() {
    }
    /**
     * Gets number value of string.
     * @param {String} str String representing a numeric value.
     */
    Numbers.getNumber = function (str) {
        if (typeof str === 'undefined' || str === null) {
            return;
        }
        if (!isNaN(Number(str))) {
            return Number(str);
        }
        if (str.toUpperCase() === 'INF' || str === decodeURI('\u221E')) {
            return Number.POSITIVE_INFINITY;
        }
        if (str.toUpperCase() === '-INF' || str === ('-' + decodeURI('\u221E'))) {
            return Number.NEGATIVE_INFINITY;
        }
    };
    Numbers.isArray = function (arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };
    Numbers.isBoolean = function (value) {
        return typeof value === 'boolean';
    };
    /**
     * Checks if a value is a float number.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is a float number, false in other case.
     */
    Numbers.isFloat = function (n) {
        return n === Number(n);
    };
    Numbers.isFloatString = function (str) {
        var n = Numbers.getNumber(str);
        return (typeof str === 'string' || str instanceof String) && !isNaN(n);
    };
    /**
     * Check if a value is an integer number.
     * @private
     * @param   {Number}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is an integer number, false in other case.
     */
    Numbers.isInteger = function (n) {
        return Number(n) === n && (!isFinite(n) || n % 1 === 0); // infinite is a valid integer value
    };
    /**
     * Checks if a value is infinite.
     * @private
     * @param   {Number}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is infinite, false in other case.
     */
    Numbers.isInfinite = function (n) {
        return Number(n) === n && !isFinite(n);
    };
    Numbers.isNumber = function (n) {
        return !isNaN(n);
    };
    return Numbers;
}());
module.exports = Numbers;
//# sourceMappingURL=numbers.js.map