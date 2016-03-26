/*global define, module, require*/
// Based on https://github.com/vluzrmos/interval-js and https://github.com/Semigradsky/math-interval-parser
// TODO: decimal comma (semicolon as separator)
// TODO: scientific notation (e.g. 1e-17)
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['Interval', 'Parser', 'Utils'], function(Interval, Parser, Utils) {
            return (root.Parsers = factory(Interval, Parser,Utils));
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = (root.Parsers = factory(require('Interval'), require('Parser'), require('Utils')));
    } else {
        root.Parsers = factory(root.Interval, root.Parser, root.Utils);
    }
}(this, function(Interval, Parsers, Utils) {
    'use strict';
    var multiregexp = root.multiregexp;
    var emptySet = decodeURI('\u2205'), // ∅
        infinity = decodeURI('\u221E'), // ∞
    // Regexp for interval notation
        regex;

    regex = multiregexp([
        /^\s*/,
        /(\(|\]|\[|\{)?/, // Group 1 - Opening bracket
        /\s*/,
        /([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205)?/, // Group 2 - First term: Number, infinity or empty set
                                                            // (∅)
        /\s*/,
        /(,|(\.\.))?/, // Group 6 - Separator (, or ..)
        /\s*/,
        /([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E))?/, // Group 8 - Second term: Number or infinity
        /\s*/,
        /(\)|\[|\]|\})?/, // Group 12 - Closing bracket
        /\s*$/
    ], 'i');

    function Parser() {
    }

    Parser.prototype = {
        isEmptySet: function(firstTerm) {
            return firstTerm === emptySet;
        },
        isEmptySetWellFormed: function(openingBracket, separator, secondTerm, closingBracket) {
            return typeof openingBracket === typeof separator === typeof separator === typeof secondTerm ===
                   typeof closingBracket === 'undefined';
        },
        parse: function(str) {
            var matches = str.match(regex),
                openingBracket,
                firstTerm,
                separator,
                secondTerm,
                closingBracket,
                isFloatInterval;

            if (!Utils.isArray(matches)) {
                return false;
            }

            // Group 1 - Opening bracket
            openingBracket = matches[1];
            // Group 2 - First term: Number, infinity or empty set (∅)
            firstTerm = Utils.getNumber(matches[2]);
            // Group 6 - Separator (, or ..)
            separator = matches[6];
            // Group 8 - Second term: Number or infinity
            secondTerm = Utils.getNumber(matches[8]);
            // Group 12 - Closing bracket
            closingBracket = matches[12];

            isFloatInterval = isNaN(firstTerm) || Utils.isFloatString(matches[2]) ||
                              (!isNaN(secondTerm) && Utils.isFloatString(matches[8]));

            // Check empty set special character form
            if (this.isEmptySet(firstTerm)) {
                if (this.isEmptySetWellFormed(openingBracket, separator, secondTerm, closingBracket)) {
                    return new Interval();
                }
                throw false;
            }

            // Check curly brackets
            if (openingBracket === '{' || closingBracket === '}') {
                if (openingBracket !== '{' || closingBracket !== '}' || typeof separator === 'undefined' ||
                    typeof secondTerm === 'undefined') {
                    throw false;
                }

                if (typeof firstTerm === 'undefined') {
                    // Empty interval
                    return new Interval();
                }

                // Degenerate interval {a}
                return new Interval({
                    type: isFloatInterval,
                    from: {
                        value: firstTerm,
                        included: true
                    },
                    to: {
                        value: firstTerm,
                        included: true
                    }
                });
            }

            // Check double dot notation (integer)
            if (separator === '..') {
                if (typeof firstTerm === 'undefined' || Utils.isFloat(firstTerm) || typeof secondTerm === 'undefined' ||
                    Utils.isFloat(secondTerm)) {
                    throw error;
                }
                return {
                    type: 'integer',
                    from: {
                        value: Utils.getNumber(firstTerm),
                        included: true
                    },
                    to: {
                        value: Utils.getNumber(secondTerm),
                        included: true
                    }
                };
            }

            return {
                type: isFloatInterval,
                from: {
                    value: firstTerm,
                    included: openingBracket === '['
                },
                to: {
                    value: Utils.getNumber(secondTerm),
                    included: closingBracket === ']'
                }
            };
        }
    };


    function toString(interval) {
    };


    Parsers = Parsers || {};
    Parsers.String = Parsers.String || {};
    Parsers.String.Interval = {};

    return Parsers;
}));