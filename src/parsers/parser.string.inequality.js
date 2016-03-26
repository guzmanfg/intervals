// TODO: decimal comma (semicolon as separator)
// TODO: scientific notation (e.g. 1e-17)

/*global define, module, require*/
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['Utils'], function(Utils) {
            return (root.Parsers = factory(Utils));
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = (root.Parsers = factory(require('Utils')));
    } else {
        root.Parsers = factory(root.Utils);
    }
}(this, function(Utils) {
    'use strict';
    var multiregexp = Utils.multiregexp;
    var emptySet = decodeURI('\u2205'), // ∅
    // Regexp for inequality notation
        regex,
        infinity = decodeURI('\u221E'), // ∞
        prev = root && root.Interval;

    // Regexp for inequality notation
    regex = multiregexp([
        /^\s*/,
        /([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205|\w)/, // Group 1 - First term
        /\s*/,
        /([<>]=?|=)/, // Group 5 - Operator
        /\s*/,
        /([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205|\w)/, // Group 6 - Second term
        /\s*/,
        /(([<>]=?|=)\s*([+\-]?(\d+(\.\d+)?|inf(inity)?|\u221E)|\u2205|\w))?/, // Optionals: Group 11 - Second operator,
                                                                              // Group 12 - Third term
        /\s*$/
    ], 'i');


    function parser(str) {
        // Inequality
        // TODO: integer / float
        var matches = str.match(regex);
        if (!Utils.isArray(matches)) {
            // TODO: invalid parse
        }

        var firstTerm = Utils.getNumber(matches[1]),
            firstOperator = matches[5],
            secondTerm = Utils.getNumber(matches[6]),
            secondOperator = matches[11],
            thirdTerm = Utils.getNumber(matches[12]),
            isFloatInterval,
            ltr,
            result,
            ep,
            larger,
            value,
            compare;


        // First or second term (and only one of them) must be the variable
        if (isNaN(firstTerm) === isNaN(secondTerm)) {
            throw error;
        }

        ltr = isNaN(secondTerm);

        isFloatInterval =
            // First or second term (depending on ltr) are float
            isNaN(ltr ? firstTerm : secondTerm) || isFloatString(ltr ? matches[1] : matches[6]) ||
            // If ltr, check third term
            (ltr && !isNaN(thirdTerm) && isFloatString(matches[12]));

        result = new Interval({
            type: isFloatInterval ? 'float' : 'integer'
        });

        // from: 3 < x | x > 3, to: 3 > x | x < 3
        result[ltr !== firstOperator.indexOf('>') >= 0 ? 'from' : 'to'] = new Endpoint({
            value: Number(ltr ? firstTerm : secondTerm),
            included: firstOperator.indexOf('=') >= 0
        });

        // Three terms
        if (typeof secondOperator !== 'undefined') {
            if (isNaN(thirdTerm) || !ltr) {
                throw error;
            }
            if ((firstOperator.indexOf('>') >= 0) !== (secondOperator.indexOf('>') >= 0)) {
                // Weird but possible: 3 > x < 4 --> x < 3 < 4
                root.console.warn('Weird form of defining an interval.');
                larger = secondOperator.indexOf('>') >= 0;
                ep = result[larger ? 'from' : 'to'];
                value = Math[larger ? 'max' : 'min'](ep.value, thirdTerm);

                // Included when larger/lower value is included
                // Compare > 0 when (larger and b > a) or (!larger and b < a)
                compare = (thirdTerm - firstTerm) * (larger ? 1 : (-1));
                ep.included = (ep.included || compare > 0) && (secondOperator.indexOf('=') >= 0 || compare < 0);

                // TODO: included ep.included = ep.value === value
                ep.value = value;
            } else {
                result[secondOperator.indexOf('>') >= 0 ? 'from' : 'to'] = new Endpoint({
                    value: Number(thirdTerm),
                    included: secondOperator.indexOf('=') >= 0
                });
            }
        }

        return result;
    }

    function toString(interval) {
    };
}));