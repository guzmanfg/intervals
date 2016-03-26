/*global define, describe, expect, describe, it, Interval*/
describe('interval', function() {
    'use strict';
    function isInstanceOfInterval(interval) {
        return interval instanceof Interval;
    }

    describe('constructor', function() {
        it('should create an empty float interval', function() {
            var interval = new Interval();
            expect(isInstanceOfInterval(interval)).toBe(true);
            expect(interval.type).toBe('float');
        });

        it('should create an empty integer interval', function() {
            var interval = new Interval({
                type: 'integer'
            });
            expect(isInstanceOfInterval(interval)).toBe(true);
            expect(interval.type).toBe('integer');
        });

        it('should create an open integer interval (1,2)', function() {
            var interval = new Interval({
                type: 'integer',
                from: {
                    value: 1,
                    included: false
                },
                to: {
                    value: 2,
                    included: false
                }
            });

            expect(interval.from.value).toBe(1);
            expect(interval.from.included).toBe(false);
            expect(interval.to.value).toBe(2);
            expect(interval.to.included).toBe(false);
            expect(interval.type).toBe('integer');
        });

        it('should create a closed float interval (1,2)', function() {
            var interval = new Interval({
                type: 'float',
                from: {
                    value: 1,
                    included: true
                },
                to: {
                    value: 2,
                    included: true
                }
            });

            expect(interval.from.value).toBe(1);
            expect(interval.from.included).toBe(true);
            expect(interval.to.value).toBe(2);
            expect(interval.to.included).toBe(true);
            expect(interval.type).toBe('float');
        });
    });

    describe('test', function() {
        describe('open integer interval', function() {

            var openInteger = new Interval({
                type: 'integer',
                from: {
                    value: -5,
                    included: false
                },
                to: {
                    value: 5,
                    included: false
                }
            });

            it('should check inner value is within the open integer interval', function() {
                expect(openInteger.test(1)).toBe(true);
            });
            it('should check left endpoint value is not within the open integer interval', function() {
                expect(openInteger.test(-5)).toBe(false);
            });
            it('should check right endpoint value is not within the open integer interval', function() {
                expect(openInteger.test(5)).toBe(false);
            });
            it('should check a value lower than left endpoint is not within the open integer interval', function() {
                expect(openInteger.test(-6)).toBe(false);
            });
            it('should check a value greater than right endpoint is not within the open integer interval', function() {
                expect(openInteger.test(6)).toBe(false);
            });
        });
        describe('closed integer interval', function() {
            var closedInteger = new Interval({
                type: 'integer',
                from: {
                    value: -5,
                    included: true
                },
                to: {
                    value: 5,
                    included: true
                }
            });
            it('should check inner value is within the closed integer interval', function() {
                expect(closedInteger.test(1)).toBe(true);
            });
            it('should check left endpoint value is within the closed integer interval', function() {
                expect(closedInteger.test(-5)).toBe(true);
            });

            it('should check right endpoint value is within the closed integer interval', function() {
                expect(closedInteger.test(5)).toBe(true);
            });

            it('should check a value lower than left endpoint is not within the closed integer interval', function() {
                expect(closedInteger.test(-6)).toBe(false);
            });

            it('should check a value greater than right endpoint is not within the closed integer interval', function() {
                expect(closedInteger.test(6)).toBe(false);
            });
        });
    });
});
