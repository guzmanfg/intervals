/*global define, module, require*/
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['Interval', 'Parsers', 'Utils'], function(Interval, Parsers, Utils) {
            return factory(Interval, Parsers, Utils);
        });
    } else if (typeof module === 'object' && module.exports) {
        factory(require('Interval'), require('Parsers'), require('Utils'));
    } else {
        factory(root.Interval, root.Interval.Parsers, root.Utils);
    }
}(this, function(Interval, Parsers, Utils) {
    'use strict';

    var emptySetWord = 'empty',
    // Regexp for interval notation
        regex = Utils.multiregexp([
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
        ], 'i'),
    // Closures
        bourbakiOpenClosures = [']', '['],
        intervalOpenClosures = ['(', ')'],
        intervalClosedClosures = ['[', ']'],
    // Parser notations
        notations = {
            TRADITIONAL: 'traditional',
            BOURBAKI: 'bourbaki',
            INTEGER: 'integer'
        };

    function Parser() {

    }

    Parser.prototype = {
        parse: function(str) {
            var result;

            if (!this.ingest(str)) {
                return false;
            }

            // Check empty set special character form
            if (this.isEmptySet(this.firstTerm)) {
                result = this.isEmptySetWellFormed() ? Interval.empty : false;
            }
            // Check curly brackets
            else if (this.hasCurlyBrackets()) {
                result = this.parseCurlyBracketsIntervalDefinition();
            }
            // Check double dot notation (integer)
            else if (this.hasIntegerSeparator()) {
                result = this.parseIntegerIntervalDefinition();
            }
            else {
                result = this.parseInterval();
            }

            return result;
        },
        ingest: function(str) {
            var matches = str.match(regex);

            if (!Utils.isArray(matches)) {
                return false;
            }
            // Group 1 - Opening bracket
            this.openingBracket = matches[1];
            // Group 2 - First term: Number, infinity or empty set (∅)
            this.firstTerm = Utils.getNumber(matches[2]);
            // Group 6 - Separator (, or ..)
            this.separator = matches[6];
            // Group 8 - Second term: Number or infinity
            this.secondTerm = Utils.getNumber(matches[8]);
            // Group 12 - Closing bracket
            this.closingBracket = matches[12];

            var isFirstTermInteger = Utils.isInteger(this.firstTerm) || typeof this.firstTerm === 'undefined';
            var isSecondTermInteger = Utils.isInteger(this.secondTerm) || typeof this.secondTerm === 'undefined';
            this.type = isFirstTermInteger && isSecondTermInteger ? 'integer' : 'float';

            return true;
        },
        isEmptySet: function() {
            return this.firstTerm === Interval.Symbols.emptySet;
        },
        isEmptySetWellFormed: function() {
            return typeof this.openingBracket === typeof this.separator === typeof this.separator ===
                   typeof this.secondTerm === typeof this.closingBracket === 'undefined';
        },
        hasCurlyBrackets: function() {
            return this.openingBracket === '{' || this.closingBracket === '}';
        },
        parseCurlyBracketsIntervalDefinition: function() {
            var result;
            if (this.isEmpty()) {
                // Empty interval
                result = Interval.empty;
            }
            else if (this.isDegenerate()) {
                // Degenerate interval {a}
                result = {
                    type: this.type,
                    from: {
                        value: this.firstTerm,
                        included: true
                    },
                    to: {
                        value: this.firstTerm,
                        included: true
                    }
                };
            }
            else {
                result = false;
            }
            return result;
        },
        hasIntegerSeparator: function() {
            return this.separator === '..';
        },
        parseIntegerIntervalDefinition: function() {
            var result;

            if (!Utils.isInteger(this.firstTerm) || !Utils.isInteger(this.secondTerm)) {
                result = false;
            } else {
                result = {
                    type: 'integer',
                    from: {
                        value: this.firstTerm,
                        included: true
                    },
                    to: {
                        value: this.secondTerm,
                        included: true
                    }
                };
            }
            return result;
        },
        parseInterval: function() {
            return {
                type: this.type,
                from: {
                    value: this.firstTerm,
                    included: this.openingBracket === '['
                },
                to: {
                    value: Utils.getNumber(this.secondTerm),
                    included: this.closingBracket === ']'
                }
            };
        },
        hasBothCurlyBrackets: function() {
            return this.openingBracket === '{' && this.closingBracket === '}';
        },
        hasNoSeparator: function() {
            return typeof this.separator === 'undefined';
        },
        isEmpty: function() {
            var hasEmptyTerms = typeof this.secondTerm === 'undefined' && typeof this.firstTerm === 'undefined';
            return this.hasBothCurlyBrackets() && this.hasNoSeparator() &&
                   hasEmptyTerms;
        },
        isDegenerate: function() {
            return this.hasBothCurlyBrackets() &&
                   typeof this.secondTerm === 'undefined' && typeof this.firstTerm !== 'undefined' &&
                   this.hasNoSeparator();
        }
    };


    function Stringifier() {
    }

    Stringifier.notations = (function() {
        var keys = Object.keys(notations);
        return keys.map(function(k) {
            return notations[k];
        });
    }());

    Stringifier.defaults = {
        notation: notations.TRADITIONAL,
        simplify: true,
        useSymbols: true
    };

    Stringifier.getOptions = function(options) {
        return !options ? Stringifier.defaults : {
            notation: options.notation || Stringifier.defaults.notation,
            simplify: Utils.isBoolean(options.simplify) ? options.simplify : Stringifier.defaults.simplify,
            useSymbols: Utils.isBoolean(options.useSymbols) ? options.useSymbols : Stringifier.defaults.useSymbols
        };
    };

    Stringifier.hasNotation = function(notation) {
        return Stringifier.notations.indexOf(notation) >= 0;
    };

    Stringifier.prototype = {
        isIntegerNotation: function(options) {
            return options.notation === 'integer';
        },

        /**
         *
         * @param interval
         * @param {Object}  [options]
         * @param {Boolean} [options.simplify=true]
         * @param {String}  [options.notation='traditional'}        Use Interval.Notation.TRADITIONAL for '(a,e]'
         *                                                          (default),
         *                                                          Interval.Notation.BOURBAKI for ']a,e]',
         *                                                          Interval.Notation.INTEGER for 'a..e'.
         * @param {Number}  [options.digits]        Number of digits to appear after decimal point (0-20). This will
         *                                          force zeroes in case of less number of digits in endpoint value.
         * @returns {*}
         */
        stringify: function(interval, options) {
            var str = '',
                opts = Stringifier.getOptions(options);

            if (!this.canParse(opts.notation)) {
                throw new Error('Unknown notation "' + opts.notation + '".');
            }

            if (opts.simplify && interval.isDegenerate) {
                str = '{' + this.getDegenerateValue(interval) + '}';
            } else if (opts.simplify && interval.isEmpty) {
                str = opts.useSymbols ? Interval.Symbols.emptySet : emptySetWord;
            } else if (this.isIntegerNotation(opts)) {
                // Integer notation
                str = this.toIntervalIntegerNotation(interval, opts);
            } else {
                // Traditional and Bourbaki notations
                str = this.toIntervalNotation(interval, opts);
            }

            return str;
        },

        getDegenerateValue: function(interval) {
            return (interval.from.value + (interval.type === 'integer' && !interval.from.included ? 1 : 0));
        },

        canParse: function(notation) {
            return typeof notation === 'undefined' || Stringifier.hasNotation(notation);
        },

        getDirectionIndex: function(direction) {
            return (direction === 'to') ? 1 : 0;
        },

        getClosedClosure: function(direction) {
            var directionIndex = this.getDirectionIndex(direction);
            return (intervalClosedClosures[directionIndex]);
        },

        getOpenClosure: function(direction, notation) {
            var closures = (notation === 'bourbaki') ? bourbakiOpenClosures : intervalOpenClosures;
            var directionIndex = this.getDirectionIndex(direction);
            return (closures[directionIndex]);
        },

        /**
         * Gets printable closure based on direction and open notation.
         * @private
         * @param   {Endpoint|Object}   endpoint   Endpoint { value, included }
         * @param   {String}            direction 'from' or 'to'
         * @param   {String}            notation  'interval' or 'bourbaki'
         * @returns {string} closure: (, ), [, ]
         */
        getClosure: function(endpoint, direction, notation) {
            return (endpoint.included) ? this.getClosedClosure(direction) : this.getOpenClosure(direction, notation);
        },

        /**
         * Gets printable value (useful for float intervals with integer values)
         * @private
         * @param   {Number}    value               Number to be parsed
         * @param   {Number}    options.digits      Number of forced digits
         * @param   {boolean}   options.useSymbols  Number of forced digits
         * @returns {string} value with forced decimal positions if required
         */
        getValue: function(value, options) {
            var str;
            if (isFinite(value) || !options.useSymbols) {
                str = this.getNumber(value, options.digits).toString();
            } else {
                var sign = (value < 0 ? '-' : '+');
                str = sign + Interval.Symbols.infinity;
            }
            return str;
        },

        getNumber: function(value, digits) {
            return isNaN(digits) ? value : value.toFixed(digits);
        },

        toIntervalIntegerNotation: function(interval, options) {
            // Left
            var str = this.getValue(interval.from.value + (interval.from.included ? 0 : 1), options);
            // Separator
            str += '..';
            // Right
            str += this.getValue(interval.to.value - (interval.to.included ? 0 : 1), options);
            return str;
        },

        toIntervalNotation: function(interval, options) {
            // Left
            var str = this.getClosure(interval.from, 'from', options.notation) +
                      this.getValue(interval.from.value, options);
            // Separator
            str += ',';
            // Right
            str += this.getValue(interval.to.value, options) +
                   this.getClosure(interval.to, 'to', options.notation);
            return str;
        }
    };

    var parser = new Parser();
    var stringifier = new Stringifier();

    // Register notations
    (function() {
        var createStringifyRegister = function(notation) {
            return function(interval, options) {
                var config = options || {};
                config.notation = notation;
                return stringifier.stringify.bind(stringifier)(interval, config);
            };
        };
        var keys = Object.keys(notations);
        var k;
        var key;
        var notation;
        for (k = 0; k < keys.length; k++) {
            key = keys[k];
            notation = notations[key];
            Interval.registerNotation({
                name: key,
                value: notation,
                parse: parser.parse.bind(parser),
                stringify: createStringifyRegister(notation)
            });
        }
    }());
}));