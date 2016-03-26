/*global define, describe, expect, describe, it*/
describe('interval operators', function() {
    'use strict';
    describe('and', function() {
        it('[a,b] where a > b should be an empty interval', function() {
            var interval = new Interval({
                from: {
                    value: 2,
                    included: true
                },
                to: {
                    value: 1,
                    included: true
                }
            });
            expect(interval.from.value).toBe(2);
            expect(interval.to.value).toBe(1);
            expect(interval.isEmpty).toBe(true);
        });
    });
});