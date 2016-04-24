/*global require*/
// TODO: decimal comma (semicolon as separator)
// TODO: scientific notation (e.g. 1e-17)
(function(root) {
    'use strict';
    var multiregexp = root.multiregexp;
    var emptySet = decodeURI('\u2205'), // ∅
        infinity = decodeURI('\u221E'), // ∞
    // Regexp for interval notation
        regex;

    regex = multiregexp([
        /^\s*/,
        /\(/, // Opening bracket
        /\s*/,
        /([+\-]?(\d+(\.\d+)?))/, // Group 1 - First term
        /\s*/,
        /(,\s*([+\-]?(\d+(\.\d+)?\s*)))*/, // Optional and repeatable: Group 5 - n term
        /\)/, // Closing bracket
        /\s*$/
    ], 'i');

    function parser(str) {
        var result;

        // List
        // TODO: integer / float
        if (regex.test(str)) {
            return false;
        }
            result = str.replace('(', '').replace(')', '').trim().split(',').map(function(o) {
                return Number(o.trim());
            });
            // TODO: process results

        return result;
    }

    function toString(interval) {
    };
}(this));