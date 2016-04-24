// TODO: decimal comma (semicolon as separator)
// TODO: scientific notation (e.g. 1e-17)

/*global define, module, require, JSON*/
(function(root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['Interval', 'Endpoint'], function(Interval, Endpoint) {
            return (root.Parsers = factory(Interval, Endpoint));
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = (root.Parsers = factory(require('Interval'), require('Endpoint')));
    } else {
        root.Parsers = factory(root.Interval, root.Endpoint);
    }
}(this, function(Interval, Endpoint) {
    'use strict';
    
    function parse(json) {
        return new Interval({
            type: json.type,
            from: new Endpoint(json.from),
            to: new Endpoint(json.to)
        });
    }

    /**
     * Exports interval to a plain JSON string
     * @returns {String}  JSON stringified
     */
    function stringify(interval) {
        return JSON.stringify(interval);
    }

    return {
        parse: parse,
        stringify: stringify
    };
}));