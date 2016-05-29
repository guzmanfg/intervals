/*global define, describe, expect, describe, it*/
var expect = require('chai').expect;
var Interval = require('../src/intervals.operators');

describe('interval operators', function() {
    'use strict';
    describe('and', function() {
        it('returns and empty interval for [a,b] where a > b', function() {
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
            expect(interval.from.value).to.equal(2);
            expect(interval.to.value).to.equal(1);
            expect(interval.isEmpty).to.be.true;
        });
    });
});