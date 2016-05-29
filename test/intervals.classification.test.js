/*global describe, it, expect, Interval*/
var expect = require('chai').expect;
var Interval = require('../src/intervals.classification');

describe('interval classification', function() {
    'use strict';
    describe('isEmpty', function() {
        it('returns true for [a,b] where a > b', function() {
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
            expect(interval.isEmpty).to.be.true;
        });
    });

    describe('isDegenerate', function() {
        it('returns true for (a,b] where a = b - 1', function() {
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
            expect(interval.isDegenerate).to.be.true;
        });
    });
});