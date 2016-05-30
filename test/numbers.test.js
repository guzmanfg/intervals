/*global define, describe, it, expect, Utils, beforeEach */
var expect = require('chai').expect;
var Numbers = require('../src/numbers');

describe('Numbers', function() {
    'use strict';

    describe('getNumber', function() {
        it('returns infinity when value is infinity symbol', function(){
            expect(Numbers.getNumber(decodeURI('\u221E'))).to.equal(Number.POSITIVE_INFINITY);
        });
        it('returns negative infinity when value is negative infinity symbol', function(){
            expect(Numbers.getNumber('-' + decodeURI('\u221E'))).to.equal(Number.NEGATIVE_INFINITY);
        });
    });
    describe('isArray', function() {
        it('returns true when value is an array');
        it('returns false when value is not an array');
    });
    describe('isBoolean', function() {
        it('returns true when value is boolean');
        it('returns false when value is not boolean');
    });
    describe('isFloat', function() {
        it('returns true when value is float', function(){
            expect(Numbers.isFloat(0)).to.be.true;
            expect(Numbers.isFloat(0.1)).to.be.true;
            expect(Numbers.isFloat(Number.POSITIVE_INFINITY)).to.be.true;
            expect(Numbers.isFloat(-0.1)).to.be.true;
            expect(Numbers.isFloat(-1)).to.be.true;
        });
        it('returns false when value is not float', function(){
            expect(Numbers.isFloat("0")).to.be.false;
        });
    });
    describe('isFloatString', function() {
        it('returns true when value is float string');
        it('returns false when value is not a float string');
    });
    describe('isInteger', function() {
        it('returns true when value is integer', function(){
            expect(Numbers.isInteger(0)).to.be.true;
            expect(Numbers.isInteger(-1)).to.be.true;
            expect(Numbers.isInteger(1)).to.be.true;
            expect(Numbers.isInteger(Number.POSITIVE_INFINITY)).to.be.true;
            expect(Numbers.isInteger(Number.NEGATIVE_INFINITY)).to.be.true;
        });
        it('returns false when value is not integer');
    });
    describe('isInfinite', function() {
        it('returns true when value is infinite');
        it('returns false when value is finite');
    });
    describe('isNumber', function() {
        it('returns true when value is number');
        it('returns false when value is not a number');
    });
});