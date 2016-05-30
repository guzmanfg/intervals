var Numbers = require('./numbers');
var Endpoint = (function () {
    function Endpoint(config) {
        this.v = 0;
        this.k = true;
        if (config) {
            if (config.value) {
                this.value = config.value;
            }
            if (config.included) {
                this.included = config.included;
            }
        }
        return this;
    }
    Object.defineProperty(Endpoint.prototype, "value", {
        // Getters and setters
        get: function () {
            return this.v;
        },
        set: function (value) {
            var val = Numbers.getNumber(value);
            if (Numbers.isInteger(val) || Numbers.isFloat(val)) {
                this.v = val;
            }
            else {
                throw new TypeError('value called with invalid param value: "' + value + '".');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Endpoint.prototype, "included", {
        get: function () {
            return this.k;
        },
        set: function (value) {
            this.k = value;
        },
        enumerable: true,
        configurable: true
    });
    Endpoint.checkValue = function (value, type) {
        if (type === 'integer' && !Numbers.isInteger(value)) {
            throw new TypeError('Invalid integer value.');
        }
    };
    Endpoint.tryParseValue = function (ep) {
        var numericValue = Numbers.getNumber(ep.value);
        Endpoint.checkValue(numericValue, ep.type);
        return numericValue;
    };
    Endpoint.tryParseInclusion = function (ep) {
        if (ep.included === 'true' || ep.included === 'false') {
            return ep.included === 'true';
        }
        else if (typeof ep.included === 'boolean') {
            return ep.included;
        }
        throw new TypeError('Invalid inclusion type: "' + ep.included + '"');
    };
    Endpoint.parse = function (ep) {
        return new Endpoint({
            included: Endpoint.tryParseInclusion(ep),
            value: Endpoint.tryParseValue(ep)
        });
    };
    return Endpoint;
})();
module.exports = Endpoint;
//# sourceMappingURL=endpoint.js.map