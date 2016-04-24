# Intervals endpoints

A guide about how endpoints are defined.

## Endpoint

An endpoint is an object with following structure:

* `value`:  Type should match with `Interval.type`.
* `included` (`default: true`) : Specifies if endpoint of interval includes (`true: closed`) or excludes (`false: opened`) value.

Example:

```
var endpoint = { value: 25, included: false };
```

## Intervals
Intervals are defined by endpoints. On this version, each interval must have two endpoints (one left, one right). 

Following example defines interval: (25,40] or ]25,40] or 26..40 (depending on notation):

```
var i = new Interval({
    type: 'integer',
    from: {
        value: 25,
        included: false
    },
    to: {
        value: 40,
        included: true
    }
});
```