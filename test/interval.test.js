/*global require, Interval, Endpoint, describe, it*/
(function (global) {
    'use strict';
    var chai = global.chai || require('chai'),
        // test = global.test || require('unit'),
        expect,
        Interval = global.Interval || require('../src/interval').Interval;

    if (!chai) {
        throw new Error('chai library is not present!');
    }
    if (!describe) {
        throw new Error('mocha library is not present!');
    }
    expect = chai.expect;

    describe('interval', function () {
        it('should create an empty float interval', function () {
            var interval = new Interval();
            expect(interval).to.exist.and
                .to.be.an.instanceof(Interval);
            if (!interval.isEmpty()) {
                throw new Error('Interval is not empty');
            }
            expect(interval.type()).to.equal('float');
        });

        it('should create an empty integer interval', function () {
            var interval = new Interval({
                type: 'integer'
            });
            expect(interval).to.exist.and
                .to.be.an.instanceof(Interval);

            if (!interval.isEmpty()) {
                throw new Error('Interval is not empty');
            }

            expect(interval.type()).to.equal('integer');
        });

        it('should create an open integer interval (1,2), which is empty', function () {
            var interval = new Interval({
                type: 'integer',
                endpoints: [
                    {
                        value: 1,
                        isClosed: false
                    },
                    {
                        value: 2,
                        isClosed: false
                    }
                ]
            });
            expect(interval).to.exist.and
                .to.be.an.instanceof(Interval);

            if (!interval.isEmpty()) {
                throw new Error('Interval is not empty');
            }

            expect(interval.left().value()).to.equal(1);
            expect(interval.right().value()).to.equal(2);
            expect(interval.type()).to.equal('integer');
        });

        it('should create an empty interval [a,b] where a > b', function () {
            var interval = new Interval({
                endpoints: [
                    {
                        value: 2,
                        isClosed: true
                    },
                    {
                        value: 1,
                        isClosed: true
                    }
                ]
            });
            expect(interval).to.exist.and
                .to.be.an.instanceof(Interval);

            if (!interval.isEmpty()) {
                throw new Error('Interval is not empty');
            }

            expect(interval.left().value()).to.equal(2);
            expect(interval.right().value()).to.equal(1);
        });

        it('should create an integer interval (a,b] where a = b - 1, wich is degenerate {b}', function () {
            var interval = new Interval({
                type: 'integer',
                endpoints: [
                    {
                        value: 1,
                        isClosed: false
                    },
                    {
                        value: 2,
                        isClosed: true
                    }
                ]
            });
            expect(interval).to.exist.and
                .to.be.an.instanceof(Interval);

            if (!interval.isDegenerate()) {
                throw new Error('Interval is not degenerate');
            }
            expect(interval.left().value()).to.equal(1);
            expect(interval.right().value()).to.equal(2);
            expect(interval.toString()).to.equal('{2}');
            expect(interval.type()).to.equal('integer');
        });

        it('should test an open integer interval (inner, outer and limit values)', function () {
            var interval = new Interval({
                endpoints: [
                    {
                        value: -5,
                        isClosed: false
                    },
                    {
                        value: 5,
                        isClosed: false
                    }
                ]
            });

            if (interval.test(-5)) {
                throw new Error('Interval left endpoint is within the interval');
            }
            if (interval.test(5)) {
                throw new Error('Interval right endpoint is within the interval');
            }
            if (!interval.test(1)) {
                throw new Error('Value between interval left and right endpoints is outside the interval');
            }
            if (interval.test(-7)) {
                throw new Error('Value lower than interval left endpoint is within the interval');
            }
            if (interval.test(7)) {
                throw new Error('Value higher than interval right endpoint is within the interval');
            }
        });
        
        it('should test a closed integer interval (inner, outer and limit values)', function () {
            var interval = new Interval({
                endpoints: [
                    {
                        value: -5,
                        isClosed: true
                    },
                    {
                        value: 5,
                        isClosed: true
                    }
                ]
            });

            if (!interval.test(-5)) {
                throw new Error('Interval left endpoint is outside the interval');
            }
            if (!interval.test(5)) {
                throw new Error('Interval right endpoint is outside the interval');
            }
            if (!interval.test(1)) {
                throw new Error('Value between interval left and right endpoints is outside the interval');
            }
            if (interval.test(-7)) {
                throw new Error('Value lower than interval left endpoint is within the interval');
            }
            if (interval.test(7)) {
                throw new Error('Value higher than interval right endpoint is within the interval');
            }
        });
    });

}(this));