/*global describe, expect, describe, it*/
describe('interval classification', function() {
    'use strict';
    describe('isEmpty', function() {
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
            expect(interval.isEmpty).toBe(true);
        });
    });

    describe('isDegenerate', function() {
        it('(a,b] where a = b - 1 should create an integer interval wich is degenerate {b}', function() {
            var interval = new Interval({
                type: 'integer',
                from: {
                    value: 1,
                    included: false
                },
                to: {
                    value: 2,
                    included: true
                }
            });
            expect(interval.isDegenerate).toBe(true);
        });
    });
});