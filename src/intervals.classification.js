"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Base = require('./intervals');
var Interval = (function (_super) {
    __extends(Interval, _super);
    function Interval() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Interval.prototype, "isBounded", {
        /**
         * Gets if interval is bounded
         * @returns {Boolean} true if both endpoints are numbers (not infinite), false in other case.
         */
        get: function () {
            return !!this.from && !!this.to && this.from.value > Number.NEGATIVE_INFINITY &&
                this.to.value < Number.POSITIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "isClosed", {
        /**
         * Gets if interval is closed.
         * @returns {Boolean} true if both endpoints are closed, false in other case.
         */
        get: function () {
            return !!this.from && !!this.to && this.from.included && this.to.included;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "isDegenerate", {
        /**
         * Gets if interval is degenerate.
         * @returns {Boolean} true if interval represents a single value (e.g. [a,a]), false in other case.
         */
        get: function () {
            return (this.isClosed && this.from.value === this.to.value) ||
                (this.type === 'integer' && (this.from.value + 1) === this.to.value &&
                    (this.from.included !== this.to.included)); // [a, b) : a = b - 1 and [a,b) ⊆ Z
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "isEmpty", {
        /**
         * Gets if interval is empty.
         * @returns {Boolean} true if interval is empty, false in other case.
         */
        get: function () {
            // [b,a] : a < b
            var endpointsAreSwitched = this.from.value > this.to.value;
            // (a,a) | (a,a] | [a,a)
            var isEmptySingleValueInterval = (this.from.value === this.to.value &&
                (!this.from.included || !this.to.included));
            // (a,b) : a = b - 1 and (a,b) ⊆ Z
            var isEmptyIntegerInterval = (this.type === 'integer' && (this.from.value + 1) === this.to.value && !this.from.included && !this.to.included);
            return endpointsAreSwitched || isEmptySingleValueInterval || isEmptyIntegerInterval;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "isLeftBounded", {
        /**
         * Gets if there is some real number that is smaller than all its elements
         * @returns {Boolean} true if there is some real number that is smaller than all its elements, false in other
         *     case.
         */
        get: function () {
            return !!this.from && this.from.value > Number.NEGATIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "isLeftClosed", {
        /**
         * Gets if interval has a minimum.
         * @returns {Boolean} true if interval has a minimum, false in other case.
         */
        get: function () {
            return !!this.from && this.from.included;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "isOpen", {
        /**
         * Gets if interval is open.
         * @returns {Boolean} true if both endpoints are open, false in other case.
         */
        get: function () {
            return !!this.from && !!this.to && !this.from.included && !this.to.included;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "isRightBounded", {
        /**
         * Gets if there is some real number that is larger than all its elements
         * @returns {Boolean} true if there is some real number that is larger than all its elements, false in other
         *     case.
         */
        get: function () {
            return !!this.to && this.to.value < Number.POSITIVE_INFINITY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "isRightClosed", {
        /**
         * Gets if interval has a maximum.
         * @returns {Boolean} true if interval has a maximum, false in other case.
         */
        get: function () {
            return !!this.to && this.to.included;
        },
        enumerable: true,
        configurable: true
    });
    return Interval;
}(Base));
module.exports = Interval;
//# sourceMappingURL=intervals.classification.js.map