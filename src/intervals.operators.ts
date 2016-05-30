import Endpoint = require('./endpoint')
import Interval = require('./intervals.classification')

export class Operators {
    /**
     * Gets complementary interval.
     * @static
     * @param {Interval} interval Interval of which complementary will be calculated.
     * @returns {Array<Interval>} Interval array representing complementary.
     */
    static complementary(interval:Interval):Array<Interval> {
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

        } else {
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
    }

    private static intersects(a, b) {
        var d1 = a.from.value - b.to.value,
            d2 = a.to.value - b.from.value;

        return !a.isEmpty && !b.isEmpty && // Empty interval does not intersect with anyone else
            ((d1 === 0 && (a.from.included || b.to.included)) || (d2 === 0 && (a.to.included || b.from.included)) ||
            ((d1 <= 0) !== (d2 <= 0)));
    };

    private static binaryIntersection(a, b):Interval {
        if (a.type !== b.type) {
            throw new TypeError('Both intervals types must match.');
        }

        if (!Operators.intersects(a, b)) {
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
    }

    static intersection(...intervals:Array<Interval>):Interval {
        var stack = Array.prototype.slice.call(intervals);
        var current = null;
        var result;

        while (stack.length) {
            result = current;
            current = stack.shift();

            if (typeof result === 'undefined') {
                continue;
            }

            result = Operators.binaryIntersection(result, current);
            if (result.isEmpty) {
                break;
            }
        }

        return result;
    };

    private static getUnionFromIncluded(a, b):boolean {
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
    }

    private static getUnionFrom(a, b):Endpoint {
        return new Endpoint({
            value: Math.min(a.value, b.value),
            included: Operators.getUnionFromIncluded(a, b)
        });
    }

    private static getUnionToIncluded(a, b):boolean {
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
    }

    private static getUnionTo(a, b):Endpoint {
        return new Endpoint({
            value: Math.max(a.value, b.value),
            included: Operators.getUnionToIncluded(a, b)
        });
    }

    private static binaryUnion(a:Interval, b:Interval):Array<Interval> {
        if (a.type !== b.type) {
            throw new TypeError('Both intervals types must match.');
        }

        // If intervals do not intersect, union is both intervals
        if (!Operators.intersects(a, b)) {
            return [a, b];
        }

        // Get larger and smaller values and if they are included or not
        var from = Operators.getUnionFrom(a.from, b.from);
        var to = Operators.getUnionTo(a.to, b.to);


        return [
            new Interval({
                type: a.type === 'float' || b.type === 'float' ? 'float' : 'integer',
                endpoints: [from, to]
            })
        ];

    }

    /**
     * Gets union of intervals
     * @param {...Interval} intervals
     * @returns {Array<Interval>} intervals Interval or array of intervals representing union of this method parameters.
     */
    static union(...intervals:Array<Interval>):Array<Interval> {
        // Use of arguments
        var current;
        var k;
        var result = [];
        var stack = intervals.slice();
        var united;

        while (stack.length) {
            current = stack.shift();

            for (k = 0; k < result.length; k++) {
                united = Operators.binaryUnion(result[k], current);
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
    }

// FUTURE: Interval arithmetics
}