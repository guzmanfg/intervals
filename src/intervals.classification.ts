import Endpoint = require('./endpoint')
import Base = require('./intervals')

class Interval extends Base {
    /**
     * Gets if interval is bounded
     * @returns {Boolean} true if both endpoints are numbers (not infinite), false in other case.
     */
    get isBounded():boolean {
        return !!this.from && !!this.to && this.from.value > Number.NEGATIVE_INFINITY &&
            this.to.value < Number.POSITIVE_INFINITY;
    }

    /**
     * Gets if interval is closed.
     * @returns {Boolean} true if both endpoints are closed, false in other case.
     */
    get isClosed():boolean {
        return !!this.from && !!this.to && this.from.included && this.to.included;
    }

    /**
     * Gets if interval is degenerate.
     * @returns {Boolean} true if interval represents a single value (e.g. [a,a]), false in other case.
     */
    get isDegenerate():boolean {
        return (this.isClosed && this.from.value === this.to.value) || // [a,a]
            (this.type === 'integer' && (this.from.value + 1) === this.to.value &&
            (this.from.included !== this.to.included)); // [a, b) : a = b - 1 and [a,b) ⊆ Z
    }

    /**
     * Gets if interval is empty.
     * @returns {Boolean} true if interval is empty, false in other case.
     */
    get isEmpty():boolean {
        // [b,a] : a < b
        var endpointsAreSwitched = this.from.value > this.to.value;
        // (a,a) | (a,a] | [a,a)
        var isEmptySingleValueInterval = (this.from.value === this.to.value &&
        (!this.from.included || !this.to.included));
        // (a,b) : a = b - 1 and (a,b) ⊆ Z
        var isEmptyIntegerInterval = (this.type === 'integer' && (this.from.value + 1) === this.to.value && !this.from.included && !this.to.included);
        return endpointsAreSwitched || isEmptySingleValueInterval || isEmptyIntegerInterval;
    }

    /**
     * Gets if there is some real number that is smaller than all its elements
     * @returns {Boolean} true if there is some real number that is smaller than all its elements, false in other
     *     case.
     */
    get isLeftBounded():boolean {
        return !!this.from && this.from.value > Number.NEGATIVE_INFINITY;
    }

    /**
     * Gets if interval has a minimum.
     * @returns {Boolean} true if interval has a minimum, false in other case.
     */
    get isLeftClosed():boolean {
        return !!this.from && this.from.included;
    }

    /**
     * Gets if interval is open.
     * @returns {Boolean} true if both endpoints are open, false in other case.
     */
    get isOpen():boolean {
        return !!this.from && !!this.to && !this.from.included && !this.to.included;
    }

    /**
     * Gets if there is some real number that is larger than all its elements
     * @returns {Boolean} true if there is some real number that is larger than all its elements, false in other
     *     case.
     */
    get  isRightBounded():boolean {
        return !!this.to && this.to.value < Number.POSITIVE_INFINITY;
    }

    /**
     * Gets if interval has a maximum.
     * @returns {Boolean} true if interval has a maximum, false in other case.
     */
    get isRightClosed():boolean {
        return !!this.to && this.to.included;
    }
}

export = Interval