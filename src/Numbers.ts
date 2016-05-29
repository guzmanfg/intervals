class Numbers {
    /**
     * Gets number value of string.
     * @param {String} str String representing a numeric value.
     */
    static getNumber(str):number {
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
    }

    static isArray(arr):boolean {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    static isBoolean(value):boolean {
        return typeof value === 'boolean';
    }

    /**
     * Checks if a value is a float number.
     * @private
     * @param   {Object}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is a float number, false in other case.
     */
    static isFloat(n):boolean {
        return n === Number(n);
    }

    static isFloatString(str):boolean {
        var n = Numbers.getNumber(str);
        return (typeof str === 'string' || str instanceof String) && !isNaN(n);
    }

    /**
     * Check if a value is an integer number.
     * @private
     * @param   {Number}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is an integer number, false in other case.
     */
    static isInteger(n):boolean {
        return Number(n) === n && (!isFinite(n) || n % 1 === 0); // infinite is a valid integer value
    }

    /**
     * Checks if a value is infinite.
     * @private
     * @param   {Number}  n Parameter to be tested.
     * @returns {Boolean} true if parameter is infinite, false in other case.
     */
    static isInfinite(n):boolean {
        return Number(n) === n && !isFinite(n);
    }

    static isNumber(n):boolean {
        return !isNaN(n);
    }
}

export = Numbers