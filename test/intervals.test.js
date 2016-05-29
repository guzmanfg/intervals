
/*global define, describe, expect, describe, it, Interval*/
var expect = require('chai').expect;
var Interval = require('../src/intervals');

describe('interval', function() {
    'use strict';
    function isInstanceOfInterval(interval) {
        return interval instanceof Interval;
    }

    describe('constructor', function() {
        it('creates an empty float interval', function() {
            var interval = new Interval();
            expect(interval).to.satisfy(isInstanceOfInterval);
            expect(interval.type).to.equal('float');
        });

        it('creates an empty integer interval', function() {
            var interval = new Interval({
                type: 'integer'
            });
            expect(interval).to.satisfy(isInstanceOfInterval);
            expect(interval.type).to.equal('integer');
        });

        it('creates an open integer interval (1,2)', function() {
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

            expect(interval.from.value).to.equal(1);
            expect(interval.from.included).to.be.false;
            expect(interval.to.value).to.equal(2);
            expect(interval.to.included).to.be.false;
            expect(interval.type).to.equal('integer');
        });

        it('creates a closed float interval (1,2)', function() {
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

            expect(interval.from.value).to.equal(1);
            expect(interval.from.included).to.be.true;
            expect(interval.to.value).to.equal(2);
            expect(interval.to.included).to.be.true;
            expect(interval.type).to.equal('float');
        });
    });

    describe('contains', function() {
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

            it('checks inner value is within the open integer interval', function() {
                expect(openInteger.contains(1)).to.be.true;
            });
            it('checks left endpoint value is not within the open integer interval', function() {
                expect(openInteger.contains(-5)).to.be.false;
            });
            it('checks right endpoint value is not within the open integer interval', function() {
                expect(openInteger.contains(5)).to.be.false;
            });
            it('checks a value lower than left endpoint is not within the open integer interval', function() {
                expect(openInteger.contains(-6)).to.be.false;
            });
            it('checks a value greater than right endpoint is not within the open integer interval', function() {
                expect(openInteger.contains(6)).to.be.false;
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
            it('checks inner value is within the closed integer interval', function() {
                expect(closedInteger.contains(1)).to.be.true;
            });
            it('checks left endpoint value is within the closed integer interval', function() {
                expect(closedInteger.contains(-5)).to.be.true;
            });

            it('checks right endpoint value is within the closed integer interval', function() {
                expect(closedInteger.contains(5)).to.be.true;
            });

            it('checks a value lower than left endpoint is not within the closed integer interval', function() {
                expect(closedInteger.contains(-6)).to.be.false;
            });

            it('checks a value greater than right endpoint is not within the closed integer interval', function() {
                expect(closedInteger.contains(6)).to.be.false;
            });
        });
    });
});
