/*global define, describe, it, expect, beforeEach, Interval*/
describe('interval string parser', function() {
    'use strict';
    describe('parse', function() {
        it('should be tested');
    });
    describe('stringify', function() {
        describe('default usage', function() {
            it('should be [object Object]', function() {
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
                expect(interval.toString()).toBe('[object Object]');
            });
        });

        describe('traditional notation', function() {
            it('should be ∅', function() {
                expect(Interval.empty.stringify(Interval.Notation.TRADITIONAL), {
                    simplify: true,
                    useSymbols: true
                }).toBe('∅');
            });
            it('should be [2,1]', function() {
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
                expect(interval.stringify(Interval.Notation.TRADITIONAL, { simplify: false })).toBe('[2,1]');
            });
        });

        describe('bourbaki notation', function() {
            it('should be ∅', function() {
                expect(Interval.empty.stringify(Interval.Notation.BOURBAKI), {
                    simplify: true,
                    useSymbols: true
                }).toBe('∅');
            });
            it('should be [2,1]', function() {
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
                expect(interval.stringify(Interval.Notation.BOURBAKI, { simplify: false })).toBe('[2,1]');
            });
        });

        describe('integer notation', function() {
            it('should be ∅', function() {
                expect(Interval.empty.stringify(Interval.Notation.INTEGER), {
                    simplify: true,
                    useSymbols: true
                }).toBe('∅');
            });
            it('should be 2..1', function() {
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
                expect(interval.stringify(Interval.Notation.INTEGER, { simplify: false })).toBe('2..1');
            });
        });
    });
});