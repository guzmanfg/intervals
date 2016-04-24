/*global define, describe, it, expect, Utils, beforeEach */
var expect = require('chai').expect;
var Interval = require('../src/numbers');

describe('Numbers', function() {
    'use strict';

    describe('getNumber', function() {
        it('return infinity when value is infinity symbol');
    });
    describe('isArray', function() {
        it('should return true when value is an array');
        it('should return false when value is not an array');
    });
    describe('isBoolean', function() {
        it('should return true when value is boolean');
        it('should return false when value is not boolean');
    });
    describe('isFloat', function() {
        it('should return true when value is float');
        it('should return false when value is not float');
    });
    describe('isFloatString', function() {
        it('should return true when value is float string');
        it('should return false when value is not a float string');
    });
    describe('isInteger', function() {
        it('should return true when value is integer');
        it('should return false when value is not integer');
    });
    describe('isInfinite', function() {
        it('should return true when value is infinite');
        it('should return false when value is finite');
    });
    describe('isNumber', function() {
        it('should return true when value is number');
        it('should return false when value is not a number');
    });
});