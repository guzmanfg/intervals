import Numbers = require('./numbers')
class Endpoint {
    private v:number = 0;
    private k:boolean = true;
    
    constructor(config:any){
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

    // Getters and setters
    get value():number {
        return this.v;
    }

    set value(value:number) {
        var val = Numbers.getNumber(value);
        if (Numbers.isInteger(val) || Numbers.isFloat(val)) {
            this.v = val;
        } else {
            throw new TypeError('value called with invalid param value: "' + value + '".');
        }
    }

    get included():boolean {
        return this.k;
    }

    set included(value:boolean) {
        this.k = value;
    }

    private static checkValue(value, type):void {
        if (type === 'integer' && !Numbers.isInteger(value)) {
            throw new TypeError('Invalid integer value.');
        }
    }

    private static tryParseValue(ep):number {
        var numericValue = Numbers.getNumber(ep.value);
        Endpoint.checkValue(numericValue, ep.type);
        return numericValue;
    }

    private static tryParseInclusion(ep):boolean {
        if (ep.included === 'true' || ep.included === 'false') {
            return ep.included === 'true';
        }
        else if (typeof ep.included === 'boolean') {
            return ep.included;
        }

        throw new TypeError('Invalid inclusion type: "' + ep.included + '"');
    }

    static parse(ep):Endpoint {
        return new Endpoint({
            included: Endpoint.tryParseInclusion(ep),
            value: Endpoint.tryParseValue(ep)
        });
    }
}

export = Endpoint