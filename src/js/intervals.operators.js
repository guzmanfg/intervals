/*global define, module, require*/
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['intervals', 'endpoint'], function(Interval, Endpoint) {
                return (Interval.Operators = factory(Interval, Endpoint));
            }
        );
    } else if (typeof module === 'object' && module.exports) {
        module.exports = (factory(require('./intervals'), require('./endpoint')));
    } else {
        root.Interval.Operators = factory(root.Interval, root.Utils);
    }
}(this, function(Interval, Endpoint) {
    'use strict';

    /**
     * Gets complementary interval.
     * @static
     * @param {Interval} interval Interval of which complementary will be calculated.
     * @returns {Interval|Array<Interval>} New Interval or Interval array representing complementary.
     */
    Interval.complementary = function(interval) {
        // Empty
        if (interval.isEmpty) {
            // Total of R
            return new Interval({
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
            });
        }

        // Bounded
        if (interval.isBounded) {
            return [
                new Interval({
                    type: interval.type,
                    endpoints: [
                        {
                            value: Number.NEGATIVE_INFINITY,
                            included: false
                        }, {
                            value: interval.from.value,
                            included: !interval.from.included
                        }
                    ]
                }),
                new Interval({
                    type: interval.type,
                    endpoints: [
                        {
                            value: interval.to.value,
                            included: !interval.to.included
                        }, {
                            value: Number.POSITIVE_INFINITY,
                            included: false
                        }
                    ]
                })
            ];
        }

        // Unbounded
        var endpoints = [];
        if (interval.from.value === Number.NEGATIVE_INFINITY) {
            // !(-∞, b) = [b, +∞)
            endpoints = [
                {
                    value: interval.to.value,
                    included: !interval.to.included
                }, {
                    value: Number.POSITIVE_INFINITY,
                    included: false
                }
            ];

        } else {
            // !(a, +∞) = (-∞, a]
            endpoints = [
                {
                    value: Number.NEGATIVE_INFINITY,
                    included: false
                }, {
                    value: interval.from.value,
                    included: !interval.from.included
                }
            ];
        }

        return new Interval({
            type: interval.type,
            endpoints: endpoints
        });
    };

    /**
     * Gets complementary interval
     * @returns {Interval|Array} Interval or Interval array representing complementary.
     */
    Interval.prototype.complementary = function() {
        return Interval.complementary(this);
    };


    /**
     * @alias Interval.complementary
     * @static
     */
    Interval.nor = Interval.complementary;

    /** @alias Interval.prototype.complementary */
    Interval.prototype.nor = Interval.prototype.complementary;


    Interval.intersects = function intersects(a, b) {
        var d1 = a.from.value - b.to.value,
            d2 = a.to.value - b.from.value;

        return !a.isEmpty && !b.isEmpty && // Empty interval does not intersect with anyone else
               ((d1 === 0 && (a.from.included || b.to.included)) || (d2 === 0 && (a.to.included || b.from.included)) ||
                ((d1 <= 0) !== (d2 <= 0)));
    };

    function intersection(a, b) {
        if (a.type !== b.type) {
            throw new TypeError('Both intervals types must match.');
        }

        if (!Interval.intersects(a, b)) {
            return Interval.empty;
        }

        // Get larger and smaller values and if they are included or not
        var d = a.from.value - b.from.value,
            from = d > 0 ? a.from : d < 0 ? b.from : new Endpoint({
                value: a.from.value,
                included: a.from.included && b.from.included
            }),
            to = d < 0 ? a.to : d > 0 ? b.to : new Endpoint({
                value: a.to.value,
                included: a.to.included && b.to.included
            });


        return new Interval({
            type: a.type === 'float' || b.type === 'float' ? 'float' : 'integer',
            endpoints: [from, to]
        });
    }

    Interval.intersection = function() {
        var current, result,
            stack = Array.prototype.slice.call(arguments);

        while (stack.length) {
            result = current;
            current = stack.shift();

            if (typeof result === 'undefined') {
                continue;
            }

            result = intersection(result, current);
            if (result.isEmpty) {
                break;
            }
        }

        return result;
    };

    Interval.prototype.intersection = function() {
        return Interval.intersection.apply(null, Array.prototype.concat([this], Array.prototype.slice.call(arguments)));
    };

    Interval.and = Interval.intersection;

    Interval.prototype.and = Interval.prototype.intersection;

    function getUnionFromIncluded(a, b) {
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

    function getUnionFrom(a, b) {
        return new Endpoint({
            value: Math.min(a.value, b.value),
            included: getUnionFromIncluded(a, b)
        });
    }

    function getUnionToIncluded(a, b) {
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

    function getUnionTo(a, b) {
        return new Endpoint({
            value: Math.max(a.value, b.value),
            included: getUnionToIncluded(a, b)
        });
    }

    function union(a, b) {
        if (a.type !== b.type) {
            throw new TypeError('Both intervals types must match.');
        }

        // If intervals do not intersect, union is both intervals
        if (!Interval.intersects(a, b)) {
            return [a, b];
        }

        // Get larger and smaller values and if they are included or not
        var from = getUnionFrom(a.from, b.from),
            to = getUnionTo(a.to, b.to);


        return [
            new Interval({
                type: a.type === 'float' || b.type === 'float' ? 'float' : 'integer',
                endpoints: [from, to]
            })
        ];

    }

    /**
     * Gets union of intervals
     * @param {...*}
     * @returns {Interval|Array}  Interval or array of intervals representing union of this method parameters.
     */
    Interval.union = function() {
        // Use of arguments
        var current,
	        k,
            result = [],
            stack = Array.prototype.slice.call(arguments),
            united;

        while (stack.length) {
            current = stack.shift();

            for (k = 0; k < result.length; k++) {
                united = union(result[k], current);
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

    Interval.prototype.union = function() {
        return Interval.union.apply(null, Array.prototype.concat([this], Array.prototype.slice.call(arguments)));
    };

    Interval.or = Interval.union;

    Interval.prototype.or = Interval.prototype.union;

    // FUTURE: Interval intersections

    // FUTURE: Interval arithmetics

    return Interval;
}));