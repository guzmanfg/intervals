"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Endpoint = require('./endpoint');
var Base = require('./intervals.classification');
var Interval = (function (_super) {
    __extends(Interval, _super);
    function Interval() {
        _super.apply(this, arguments);
        /**
         * Gets union of intervals
         * @param {...*} var_args
         * @returns {Array<Interval>}  Interval or array of intervals representing union of this method parameters.
         */
        this.union = function () {
            var intervals = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                intervals[_i - 0] = arguments[_i];
            }
            // Use of arguments
            var current;
            var k;
            var result = [];
            var stack = Array.prototype.slice.call(intervals);
            var united;
            while (stack.length) {
                current = stack.shift();
                for (k = 0; k < result.length; k++) {
                    united = Interval.union(result[k], current);
                    if (united.length === 1) {
                        // remove from results
                        result.splice(k, 1);
                        // push union to stack
                        stack.push(united[0]);
                        k = -1;
                        break;
                    }
                }
                if (k >= result.length) {
                    result.push(current);
                }
            }
            return result;
        };
    }
    /**
     * Gets complementary interval.
     * @static
     * @param {Interval} interval Interval of which complementary will be calculated.
     * @returns {Array<Interval>} Interval array representing complementary.
     */
    Interval.complementary = function (interval) {
        // Empty
        if (interval.isEmpty) {
            // Total of R
            return [
                new Interval({
                    type: interval.type,
                    endpoints: [
                        {
                            value: Number.NEGATIVE_INFINITY,
                            included: false
                        }, {
                            value: Number.POSITIVE_INFINITY,
                            included: false
                        }
                    ]
                })
            ];
        }
        // Bounded
        if (interval.isBounded) {
            return [
                new Interval({
                    type: interval.type,
                    from: {
                        value: Number.NEGATIVE_INFINITY,
                        included: false
                    },
                    to: {
                        value: interval.from.value,
                        included: !interval.from.included
                    }
                }),
                new Interval({
                    type: interval.type,
                    from: {
                        value: interval.to.value,
                        included: !interval.to.included
                    }, to: {
                        value: Number.POSITIVE_INFINITY,
                        included: false
                    }
                })
            ];
        }
        // Unbounded
        var result = new Interval();
        if (interval.from.value === Number.NEGATIVE_INFINITY) {
            // !(-∞, b) = [b, +∞)
            result.from = {
                value: interval.to.value,
                included: !interval.to.included
            };
            result.to = {
                value: Number.POSITIVE_INFINITY,
                included: false
            };
        }
        else {
            // !(a, +∞) = (-∞, a]
            result.from = {
                value: Number.NEGATIVE_INFINITY,
                included: false
            };
            result.to = {
                value: interval.from.value,
                included: !interval.from.included
            };
        }
        result.type = interval.type;
        return result;
    };
    Interval.prototype.complementary = function () {
        return Interval.complementary(this);
    };
    Interval.intersects = function (a, b) {
        var d1 = a.from.value - b.to.value, d2 = a.to.value - b.from.value;
        return !a.isEmpty && !b.isEmpty &&
            ((d1 === 0 && (a.from.included || b.to.included)) || (d2 === 0 && (a.to.included || b.from.included)) ||
                ((d1 <= 0) !== (d2 <= 0)));
    };
    ;
    Interval.binaryIntersection = function (a, b) {
        if (a.type !== b.type) {
            throw new TypeError('Both intervals types must match.');
        }
        if (!Interval.intersects(a, b)) {
            return Interval.Empty;
        }
        // Get larger and smaller values and if they are included or not
        var d = a.from.value - b.from.value;
        var from = d > 0 ? a.from : d < 0 ? b.from : new Endpoint({
            value: a.from.value,
            included: a.from.included && b.from.included
        });
        var to = d < 0 ? a.to : d > 0 ? b.to : new Endpoint({
            value: a.to.value,
            included: a.to.included && b.to.included
        });
        return new Interval({
            type: (a.type === 'float' || b.type === 'float') ? 'float' : 'integer',
            from: from,
            to: to
        });
    };
    Interval.intersection = function () {
        var intervals = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            intervals[_i - 0] = arguments[_i];
        }
        var stack = Array.prototype.slice.call(intervals);
        var current;
        var result;
        while (stack.length) {
            result = current;
            current = stack.shift();
            if (typeof result === 'undefined') {
                continue;
            }
            result = Interval.binaryIntersection(result, current);
            if (result.isEmpty) {
                break;
            }
        }
        return result;
    };
    ;
    Interval.prototype.intersection = function () {
        return Interval.intersection.apply(null, Array.prototype.concat([this], Array.prototype.slice.call(arguments)));
    };
    ;
    Interval.getUnionFromIncluded = function (a, b) {
        var result;
        if (a.value < b.value) {
            result = a.included;
        }
        else if (a.value > b.value) {
            result = b.included;
        }
        else {
            result = a.included || b.included;
        }
        return result;
    };
    Interval.getUnionFrom = function (a, b) {
        return new Endpoint({
            value: Math.min(a.value, b.value),
            included: Interval.getUnionFromIncluded(a, b)
        });
    };
    Interval.getUnionToIncluded = function (a, b) {
        var result;
        if (a.value < b.value) {
            result = b.included;
        }
        else if (a.value > b.value) {
            result = a.included;
        }
        else {
            result = a.included || b.included;
        }
        return result;
    };
    Interval.getUnionTo = function (a, b) {
        return new Endpoint({
            value: Math.max(a.value, b.value),
            included: Interval.getUnionToIncluded(a, b)
        });
    };
    Interval.union = function (a, b) {
        if (a.type !== b.type) {
            throw new TypeError('Both intervals types must match.');
        }
        // If intervals do not intersect, union is both intervals
        if (!Interval.intersects(a, b)) {
            return [a, b];
        }
        // Get larger and smaller values and if they are included or not
        var from = Interval.getUnionFrom(a.from, b.from);
        var to = Interval.getUnionTo(a.to, b.to);
        return [
            new Interval({
                type: a.type === 'float' || b.type === 'float' ? 'float' : 'integer',
                endpoints: [from, to]
            })
        ];
    };
    return Interval;
}(Base));
module.exports = Interval;
//# sourceMappingURL=intervals.operators.js.map