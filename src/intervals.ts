import Numbers = require('./numbers');
import Endpoint = require('./endpoint');

class Interval {
    /**
     * Type attribute ('integer' or 'float'). Use Interval#type to work with interval type correctly.
     * @member Interval
     * @private
     */
    private t:string = 'float';

    /**
     * Left endpoint. Use Interval#from and Interval#to to work with interval left endpoint correctly.
     * @member Interval
     * @private
     */
    private l:Endpoint = new Endpoint({
        value: Number.NEGATIVE_INFINITY,
        included: false
    });

    /**
     * Right endpoint. Interval#to to work with interval right endpoint correctly.
     * @member Interval
     * @private
     */
    private r:Endpoint = new Endpoint({
        value: Number.POSITIVE_INFINITY,
        included: false
    });

    constructor(interval:any) {
        this.l = new Endpoint({
            value: Number.NEGATIVE_INFINITY,
            included: false
        });


        if (interval) {
            if (interval.type) {
                this.type = interval.type;
            }
            if (interval.from) {
                this.from = interval.from;
            }
            if (interval.to) {
                this.to = interval.to;
            }
        }
    }

    // Getters and setters
    get type():string {
        return this.t;
    }

    set type(value:string) {
        if (value === 'integer' || value === 'float') {
            this.t = value;
        } else {
            throw new Error('type called with invalid param value: "' + value + '". Use "integer" or "float".');
        }
    }

    get from():Endpoint {
        return this.l;
    }

    set from(value:Endpoint) {
        this.l = value;
    }

    get to():Endpoint {
        return this.r;
    }

    set to(value:Endpoint) {
        this.r = value;
    }

    // Methods
    /**
     * Clears interval endpoints. Interval will be R (-Infinite, Infinite).
     */
    clear():void {
        this.from = Endpoint.parse({
            value: Number.NEGATIVE_INFINITY,
            included: false
        });
        this.to = Endpoint.parse({
            value: Number.POSITIVE_INFINITY,
            included: false
        });
    }

    contains(value:number):boolean {
        var isIntegerValue = Numbers.isInteger(value);
        var isInteger = this.type === 'integer';

        if (isNaN(value) || isInteger !== isIntegerValue) {
            throw new TypeError('"' + value + '" is not a valid ' + this.type + ' value.');
        }

        return this.isValueWithinInterval(value);
    }

    private isValueWithinInterval(value:number):boolean {
        var isLowerThanRightEndpoint = this.from.value < value;
        var IsEqualToIncludedRightEndpoint = (this.from.included && this.from.value <= value);
        var isGreaterThanLeftEndpoint = value < this.to.value;
        var isEqualToIncludedLeftEndpoint = (this.to.included && value <= this.to.value);

        return (isLowerThanRightEndpoint || IsEqualToIncludedRightEndpoint) &&
            (isGreaterThanLeftEndpoint || isEqualToIncludedLeftEndpoint);
    }

    static extend(extensions:Array<any>):void {
        var i;
        for (i = 0; i < extensions.length; i++) {
            Interval.prototype[extensions[i].name] = extensions[i].fn.bind(this, this);
        }
    }

    // Static methods

    /**
     * Gets an interval instance representing an empty set (0,0)
     * @returns {Interval}
     * @constructor
     */
    static get Empty():Interval {
        return new Interval({
            type: 'float',
            from: {
                value: 0,
                included: false
            },
            to: {
                value: 0,
                included: false
            }
        });
    }

    /**
     * Gets an interval instance representing the real numbers set
     * @returns {Interval}
     * @constructor
     */
    static get R():Interval {
        return new Interval({
            type: 'float',
            from: {
                value: Number.NEGATIVE_INFINITY,
                included: false
            },
            to: {
                value: Number.POSITIVE_INFINITY,
                included: false
            }
        });
    }

    /**
     * Gets an interval instance representing the integer numbers set
     * @returns {Interval}
     * @constructor
     */
    static get Z():Interval {
        return new Interval({
            type: 'integer',
            from: {
                value: Number.NEGATIVE_INFINITY,
                included: false
            },
            to: {
                value: Number.POSITIVE_INFINITY,
                included: false
            }
        });
    }

    /**
     * Gets an interval instance representing the natural numbers set (integers greater than zero)
     * @returns {Interval}
     * @constructor
     */
    static get N():Interval {
        return new Interval({
            type: 'integer',
            from: {
                value: 0,
                included: false
            },
            to: {
                value: Number.POSITIVE_INFINITY,
                included: false
            }
        });
    }

    /**
     * Gets an interval instance representing the non negative numbers set (integers equal or greater than zero)
     * @returns {Interval}
     * @constructor
     */
    static get NN():Interval {
        return new Interval({
            type: 'integer',
            from: {
                value: 0,
                included: true
            },
            to: {
                value: Number.POSITIVE_INFINITY,
                included: false
            }
        });
    }

    static Factory(...modules){
        let i:number;
        for(i = 0; i < modules.length; i++){
           // Object.assing(Intervals, module[i]);
        }
    }
}

export = Interval