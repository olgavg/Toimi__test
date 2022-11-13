/*
 * Metro 4 Components Library 4.4.3  (https://metroui.org.ua)
 * Copyright 2012-2022 by Serhii Pimenov (https://pimenov.com.ua). All rights reserved.
 * Built at 11/11/2022 17:11:33
 * Licensed under MIT
 */



/*
 * m4q v1.0.10, (https://github.com/olton/m4q.git)
 * Copyright 2018 - 2020 by Sergey Pimenov
 * Helper for DOM manipulation, animation, and ajax routines.
 * Licensed under MIT
 */

 (function (global, undefined) {

// Source: src/mode.js

/* jshint -W097 */
'use strict';

// Source: src/func.js

/* global dataSet */
/* exported isTouch, isSimple, isHidden, isPlainObject, isEmptyObject, isArrayLike, str2arr, parseUnit, getUnit, setStyleProp, acceptData, dataAttr, normName, strip, dashedName, isLocalhost */

var numProps = ['opacity', 'zIndex'];

function isSimple(v){
    return typeof v === "string" || typeof v === "boolean" || typeof v === "number";
}

function isVisible(elem) {
    return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
}

function isHidden(elem) {
    var s = getComputedStyle(elem);
    return !isVisible(elem) || +s.opacity === 0 || elem.hidden || s.visibility === "hidden";
}

function not(value){
    return value === undefined || value === null;
}

function camelCase(string){
    return string.replace( /-([a-z])/g, function(all, letter){
        return letter.toUpperCase();
    });
}

function dashedName(str){
    return str.replace(/([A-Z])/g, function(u) { return "-" + u.toLowerCase(); });
}

function isPlainObject( obj ) {
    var proto;
    if ( !obj || Object.prototype.toString.call( obj ) !== "[object Object]" ) {
        return false;
    }
    proto = obj.prototype !== undefined;
    if ( !proto ) {
        return true;
    }
    return proto.constructor && typeof proto.constructor === "function";
}

function isEmptyObject( obj ) {
    for (var name in obj ) {
        if (hasProp(obj, name)) return false;
    }
    return true;
}

function isArrayLike (o){
    return o instanceof Object && 'length' in o;
}

function str2arr (str, sep) {
    sep = sep || " ";
    return str.split(sep).map(function(el){
        return  (""+el).trim();
    }).filter(function(el){
        return el !== "";
    });
}

function parseUnit(str, out) {
    if (!out) out = [ 0, '' ];
    str = String(str);
    out[0] = parseFloat(str);
    out[1] = str.match(/[\d.\-+]*\s*(.*)/)[1] || '';
    return out;
}

function getUnit(val, und){
    var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    return typeof split[1] !== "undefined" ? split[1] : und;
}

function setStyleProp(el, key, val){
    key = camelCase(key);

    if (["scrollLeft", "scrollTop"].indexOf(key) > -1) {
        el[key] = (parseInt(val));
    } else {
        el.style[key] = isNaN(val) || numProps.indexOf(""+key) > -1 ? val : val + 'px';
    }
}

function acceptData(owner){
    return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
}

function getData(data){
    try {
        return JSON.parse(data);
    } catch (e) {
        return data;
    }
}

function dataAttr(elem, key, data){
    var name;

    if ( not(data) && elem.nodeType === 1 ) {
        name = "data-" + key.replace( /[A-Z]/g, "-$&" ).toLowerCase();
        data = elem.getAttribute( name );

        if ( typeof data === "string" ) {
            data = getData( data );
            dataSet.set( elem, key, data );
        } else {
            data = undefined;
        }
    }
    return data;
}

function normName(name) {
    return typeof name !== "string" ? undefined : name.replace(/-/g, "").toLowerCase();
}

function strip(name, what) {
    return typeof name !== "string" ? undefined : name.replace(what, "");
}

function hasProp(obj, prop){
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isLocalhost(host){
    var hostname = host || window.location.hostname;
    return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]" ||
        hostname === "" ||
        hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/) !== null
    );
}

function isTouch() {
    return (('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0));
}

// Source: src/setimmediate.js

/* global global */
/*
 * setImmediate polyfill
 * Version 1.0.5
 * Url: https://github.com/YuzuJS/setImmediate
 * Copyright (c) 2016 Yuzu (https://github.com/YuzuJS)
 * Licensed under MIT
 */
(function (global) {

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1;
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var registerImmediate;

    function setImmediate(callback) {
        if (typeof callback !== "function") {
            /* jshint -W054 */
            callback = new Function("" + callback);
        }
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i + 1];
        }
        tasksByHandle[nextHandle] = { callback: callback, args: args };
        registerImmediate(nextHandle);
        return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
            case 0:
                callback();
                break;
            case 1:
                callback(args[0]);
                break;
            case 2:
                callback(args[0], args[1]);
                break;
            case 3:
                callback(args[0], args[1], args[2]);
                break;
            default:
                callback.apply(undefined, args);
                break;
        }
    }

    function runIfPresent(handle) {
        if (currentlyRunningATask) {
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    // global.process
    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            global.process.nextTick(function () { runIfPresent(handle); });
        };
    }

    // web workers
    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    // Browsers
    function installPostMessageImplementation() {
        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        global.addEventListener("message", onGlobalMessage, false);

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    if ({}.toString.call(global.process) === "[object process]") {

        installNextTickImplementation();

    } else if (global.MessageChannel) {

        installMessageChannelImplementation();

    } else {

        installPostMessageImplementation();

    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;

}(typeof self === "undefined" ? typeof global === "undefined" ? window : global : self));

// Source: src/promise.js

/* global setImmediate */

/*
 * Promise polyfill
 * Version 1.2.0
 * Url: https://github.com/lahmatiy/es6-promise-polyfill
 * Copyright (c) 2014 Roman Dvornov
 * Licensed under MIT
 */
(function (global) {

    if (global.Promise) {
        return;
    }

    // console.log("Promise polyfill v1.2.0");

    var PENDING = 'pending';
    var SEALED = 'sealed';
    var FULFILLED = 'fulfilled';
    var REJECTED = 'rejected';
    var NOOP = function(){};

    function isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    // async calls
    var asyncSetTimer = typeof setImmediate !== 'undefined' ? setImmediate : setTimeout;
    var asyncQueue = [];
    var asyncTimer;

    function asyncFlush(){
        // run promise callbacks
        for (var i = 0; i < asyncQueue.length; i++)
            asyncQueue[i][0](asyncQueue[i][1]);

        // reset async asyncQueue
        asyncQueue = [];
        asyncTimer = false;
    }

    function asyncCall(callback, arg){
        asyncQueue.push([callback, arg]);

        if (!asyncTimer)
        {
            asyncTimer = true;
            asyncSetTimer(asyncFlush, 0);
        }
    }

    function invokeResolver(resolver, promise) {
        function resolvePromise(value) {
            resolve(promise, value);
        }

        function rejectPromise(reason) {
            reject(promise, reason);
        }

        try {
            resolver(resolvePromise, rejectPromise);
        } catch(e) {
            rejectPromise(e);
        }
    }

    function invokeCallback(subscriber){
        var owner = subscriber.owner;
        var settled = owner.state_;
        var value = owner.data_;
        var callback = subscriber[settled];
        var promise = subscriber.then;

        if (typeof callback === 'function')
        {
            settled = FULFILLED;
            try {
                value = callback(value);
            } catch(e) {
                reject(promise, e);
            }
        }

        if (!handleThenable(promise, value))
        {
            if (settled === FULFILLED)
                resolve(promise, value);

            if (settled === REJECTED)
                reject(promise, value);
        }
    }

    function handleThenable(promise, value) {
        var resolved;

        try {
            if (promise === value)
                throw new TypeError('A promises callback cannot return that same promise.');

            if (value && (typeof value === 'function' || typeof value === 'object'))
            {
                var then = value.then;  // then should be retrived only once

                if (typeof then === 'function')
                {
                    then.call(value, function(val){
                        if (!resolved)
                        {
                            resolved = true;

                            if (value !== val)
                                resolve(promise, val);
                            else
                                fulfill(promise, val);
                        }
                    }, function(reason){
                        if (!resolved)
                        {
                            resolved = true;

                            reject(promise, reason);
                        }
                    });

                    return true;
                }
            }
        } catch (e) {
            if (!resolved)
                reject(promise, e);

            return true;
        }

        return false;
    }

    function resolve(promise, value){
        if (promise === value || !handleThenable(promise, value))
            fulfill(promise, value);
    }

    function fulfill(promise, value){
        if (promise.state_ === PENDING)
        {
            promise.state_ = SEALED;
            promise.data_ = value;

            asyncCall(publishFulfillment, promise);
        }
    }

    function reject(promise, reason){
        if (promise.state_ === PENDING)
        {
            promise.state_ = SEALED;
            promise.data_ = reason;

            asyncCall(publishRejection, promise);
        }
    }

    function publish(promise) {
        var callbacks = promise.then_;
        promise.then_ = undefined;

        for (var i = 0; i < callbacks.length; i++) {
            invokeCallback(callbacks[i]);
        }
    }

    function publishFulfillment(promise){
        promise.state_ = FULFILLED;
        publish(promise);
    }

    function publishRejection(promise){
        promise.state_ = REJECTED;
        publish(promise);
    }

    /**
     * @class
     */
    function Promise(resolver){
        if (typeof resolver !== 'function')
            throw new TypeError('Promise constructor takes a function argument');

        if (!(this instanceof Promise))
            throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');

        this.then_ = [];

        invokeResolver(resolver, this);
    }

    Promise.prototype = {
        constructor: Promise,

        state_: PENDING,
        then_: null,
        data_: undefined,

        then: function(onFulfillment, onRejection){
            var subscriber = {
                owner: this,
                then: new this.constructor(NOOP),
                fulfilled: onFulfillment,
                rejected: onRejection
            };

            if (this.state_ === FULFILLED || this.state_ === REJECTED)
            {
                // already resolved, call callback async
                asyncCall(invokeCallback, subscriber);
            }
            else
            {
                // subscribe
                this.then_.push(subscriber);
            }

            return subscriber.then;
        },

        done: function(onFulfillment){
            return this.then(onFulfillment, null);
        },

        always: function(onAlways){
            return this.then(onAlways, onAlways);
        },

        'catch': function(onRejection) {
            return this.then(null, onRejection);
        }
    };

    Promise.all = function(promises){
        var Class = this;

        if (!isArray(promises))
            throw new TypeError('You must pass an array to Promise.all().');

        return new Class(function(resolve, reject){
            var results = [];
            var remaining = 0;

            function resolver(index){
                remaining++;
                return function(value){
                    results[index] = value;
                    if (!--remaining)
                        resolve(results);
                };
            }

            for (var i = 0, promise; i < promises.length; i++)
            {
                promise = promises[i];

                if (promise && typeof promise.then === 'function')
                    promise.then(resolver(i), reject);
                else
                    results[i] = promise;
            }

            if (!remaining)
                resolve(results);
        });
    };

    Promise.race = function(promises){
        var Class = this;

        if (!isArray(promises))
            throw new TypeError('You must pass an array to Promise.race().');

        return new Class(function(resolve, reject) {
            for (var i = 0, promise; i < promises.length; i++)
            {
                promise = promises[i];

                if (promise && typeof promise.then === 'function')
                    promise.then(resolve, reject);
                else
                    resolve(promise);
            }
        });
    };

    Promise.resolve = function(value){
        var Class = this;

        if (value && typeof value === 'object' && value.constructor === Class)
            return value;

        return new Class(function(resolve){
            resolve(value);
        });
    };

    Promise.reject = function(reason){
        var Class = this;

        return new Class(function(resolve, reject){
            reject(reason);
        });
    };

    if (typeof  global.Promise === "undefined") {
        global.Promise = Promise;
    }
}(window));

// Source: src/core.js

/* global hasProp */

var m4qVersion = "v1.0.10. Built at 08/12/2020 00:01:48";

/* eslint-disable-next-line */
var matches = Element.prototype.matches
    || Element.prototype.matchesSelector
    || Element.prototype.webkitMatchesSelector
    || Element.prototype.mozMatchesSelector
    || Element.prototype.msMatchesSelector
    || Element.prototype.oMatchesSelector;

var $ = function(selector, context){
    return new $.init(selector, context);
};

$.version = m4qVersion;

$.fn = $.prototype = {
    version: m4qVersion,
    constructor: $,
    length: 0,
    uid: "",

    push: [].push,
    sort: [].sort,
    splice: [].splice,
    indexOf: [].indexOf,
    reverse: [].reverse
};

$.extend = $.fn.extend = function(){
    var options, name,
        target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length;

    if ( typeof target !== "object" && typeof target !== "function" ) {
        target = {};
    }

    if ( i === length ) {
        target = this;
        i--;
    }

    for ( ; i < length; i++ ) {
        if ( ( options = arguments[ i ] ) != null ) {
            for ( name in options ) {
                if (hasProp(options, name))
                    target[ name ] = options[ name ];
            }
        }
    }

    return target;
};

$.assign = function(){
    var options, name,
        target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length;

    if ( typeof target !== "object" && typeof target !== "function" ) {
        target = {};
    }

    if ( i === length ) {
        target = this;
        i--;
    }

    for ( ; i < length; i++ ) {
        if ( ( options = arguments[ i ] ) != null ) {
            for ( name in options ) {
                if (hasProp(options, name) && options[name] !== undefined)
                    target[ name ] = options[ name ];
            }
        }
    }

    return target;
};

// if (typeof window["hideM4QVersion"] === "undefined") console.info("m4q " + $.version);

// Source: src/interval.js

/* global $ */

var now = function(){
    return Date.now();
};

$.extend({

    intervalId: -1,
    intervalQueue: [],
    intervalTicking: false,
    intervalTickId: null,

    setInterval: function(fn, int){
        var that = this;

        this.intervalId++;

        this.intervalQueue.push({
            id: this.intervalId,
            fn: fn,
            interval: int,
            lastTime: now()
        });

        if (!this.intervalTicking) {
            var tick = function(){
                that.intervalTickId = requestAnimationFrame(tick);
                $.each(that.intervalQueue, function(){
                    var item = this;
                    if (item.interval < 17 || now() - item.lastTime >= item.interval) {
                        item.fn();
                        item.lastTime = now();
                    }
                });
            };
            this.intervalTicking = true;
            tick();
        }

        return this.intervalId;
    },

    clearInterval: function(id){
        for(var i = 0; i < this.intervalQueue.length; i++){
            if (id === this.intervalQueue[i].id) {
                this.intervalQueue.splice(i, 1);
                break;
            }
        }
        if (this.intervalQueue.length === 0) {
            cancelAnimationFrame(this.intervalTickId);
            this.intervalTicking = false;
        }
    },

    setTimeout: function(fn, interval){
        var that = this, id = this.setInterval(function(){
            that.clearInterval(id);
            fn();
        }, interval);

        return id;
    },

    clearTimeout: function(id){
        return this.clearInterval(id);
    }
});

// Source: src/contains.js

/* global $, not, matches, isArrayLike, isVisible */

$.fn.extend({
    index: function(sel){
        var el, _index = -1;

        if (this.length === 0) {
            return _index;
        }

        if (not(sel)) {
            el = this[0];
        } else if (sel instanceof $ && sel.length > 0) {
            el = sel[0];
        } else if (typeof sel === "string") {
            el = $(sel)[0];
        } else {
            el = undefined;
        }

        if (not(el)) {
            return _index;
        }

        if (el && el.parentNode) $.each(el.parentNode.children, function(i){
            if (this === el) {
                _index = i;
            }
        });
        return _index;
    },

    get: function(i){
        if (i === undefined) {
            return this.items();
        }
        return i < 0 ? this[ i + this.length ] : this[ i ];
    },

    eq: function(i){
        return !not(i) && this.length > 0 ? $.extend($(this.get(i)), {_prevObj: this}) : this;
    },

    is: function(s){
        var result = false;

        if (this.length === 0) {
            return false;
        }

        if (s instanceof $) {
            return this.same(s);
        }

        if (s === ":selected") {
            this.each(function(){
                if (this.selected) result = true;
            });
        } else

        if (s === ":checked") {
            this.each(function(){
                if (this.checked) result = true;
            });
        } else

        if (s === ":visible") {
            this.each(function(){
                if (isVisible(this)) result = true;
            });
        } else

        if (s === ":hidden") {
            this.each(function(){
                var styles = getComputedStyle(this);
                if (
                    this.getAttribute('type') === 'hidden'
                        || this.hidden
                        || styles.display === 'none'
                        || styles.visibility === 'hidden'
                        || parseInt(styles.opacity) === 0
                ) result = true;
            });
        } else

        if (typeof  s === "string" && [':selected'].indexOf(s) === -1) {
            this.each(function(){
                if (matches.call(this, s)) {
                    result = true;
                }
            });
        } else

        if (isArrayLike(s)) {
            this.each(function(){
                var el = this;
                $.each(s, function(){
                    var sel = this;
                    if (el === sel) {
                        result = true;
                    }
                });
            });
        } else

        if (typeof s === "object" && s.nodeType === 1) {
            this.each(function(){
                if  (this === s) {
                    result = true;
                }
            });
        }

        return result;
    },

    same: function(o){
        var result = true;

        if (!(o instanceof $)) {
            o = $(o);
        }

        if (this.length !== o.length) return false;

        this.each(function(){
            if (o.items().indexOf(this) === -1) {
                result = false;
            }
        });

        return result;
    },

    last: function(){
        return this.eq(this.length - 1);
    },

    first: function(){
        return this.eq(0);
    },

    odd: function(){
        var result = this.filter(function(el, i){
            return i % 2 === 0;
        });
        return $.extend(result, {_prevObj: this});
    },

    even: function(){
        var result = this.filter(function(el, i){
            return i % 2 !== 0;
        });
        return $.extend(result, {_prevObj: this});
    },

    filter: function(fn){
        if (typeof fn === "string") {
            var sel = fn;
            fn = function(el){
                return matches.call(el, sel);
            };
        }

        return $.extend($.merge($(), [].filter.call(this, fn)), {_prevObj: this});
    },

    find: function(s){
        var res = [], result;

        if (s instanceof $) return s;

        if (this.length === 0) {
            result = this;
        } else {
            this.each(function () {
                var el = this;
                if (typeof el.querySelectorAll === "undefined") {
                    return ;
                }
                res = res.concat([].slice.call(el.querySelectorAll(s)));
            });
            result = $.merge($(), res);
        }

        return $.extend(result, {_prevObj: this});
    },

    contains: function(s){
        return this.find(s).length > 0;
    },

    children: function(s){
        var i, res = [];

        if (s instanceof $) return s;

        this.each(function(){
            var el = this;
            for(i = 0; i < el.children.length; i++) {
                if (el.children[i].nodeType === 1)
                    res.push(el.children[i]);
            }
        });
        res = s ? res.filter(function(el){
            return matches.call(el, s);
        }) : res;

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    parent: function(s){
        var res = [];
        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            if (this.parentNode) {
                if (res.indexOf(this.parentNode) === -1) res.push(this.parentNode);
            }
        });
        res = s ? res.filter(function(el){
            return matches.call(el, s);
        }) : res;

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    parents: function(s){
        var res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            var par = this.parentNode;
            while (par) {
                if (par.nodeType === 1 && res.indexOf(par) === -1) {
                    if (!not(s)) {
                        if (matches.call(par, s)) {
                            res.push(par);
                        }
                    } else {
                        res.push(par);
                    }
                }
                par = par.parentNode;
            }
        });

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    siblings: function(s){
        var res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            var el = this;
            if (el.parentNode) {
                $.each(el.parentNode.children, function(){
                    if (el !== this) res.push(this);
                });
            }
        });

        if (s) {
            res = res.filter(function(el){
                return matches.call(el, s);
            });
        }

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    _siblingAll: function(dir, s){
        var res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            var el = this;
            while (el) {
                el = el[dir];
                if (!el) break;
                res.push(el);
            }
        });

        if (s) {
            res = res.filter(function(el){
                return matches.call(el, s);
            });
        }

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    _sibling: function(dir, s){
        var res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        this.each(function(){
            var el = this[dir];
            if (el && el.nodeType === 1) {
                res.push(el);
            }
        });

        if (s) {
            res = res.filter(function(el){
                return matches.call(el, s);
            });
        }

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    prev: function(s){
        return this._sibling('previousElementSibling', s);
    },

    next: function(s){
        return this._sibling('nextElementSibling', s);
    },

    prevAll: function(s){
        return this._siblingAll('previousElementSibling', s);
    },

    nextAll: function(s){
        return this._siblingAll('nextElementSibling', s);
    },

    closest: function(s){
        var res = [];

        if (this.length === 0) {
            return ;
        }

        if (s instanceof $) return s;

        if (!s) {
            return this.parent(s);
        }

        this.each(function(){
            var el = this;
            while (el) {
                if (!el) break;
                if (matches.call(el, s)) {
                    res.push(el);
                    return ;
                }
                el = el.parentElement;
            }
        });

        return $.extend($.merge($(), res.reverse()), {_prevObj: this});
    },

    has: function(selector){
        var res = [];

        if (this.length === 0) {
            return ;
        }

        this.each(function(){
            var el = $(this);
            var child = el.children(selector);
            if (child.length > 0) {
                res.push(this);
            }
        });

        return $.extend($.merge($(), res), {_prevObj: this});
    },

    back: function(to_start){
        var ret;
        if (to_start === true) {
            ret = this._prevObj;
            while (ret) {
                if (!ret._prevObj) break;
                ret = ret._prevObj;
            }
        } else {
            ret = this._prevObj ? this._prevObj : this;
        }
        return ret;
    }
});

// Source: src/script.js

/* global $, not */

function createScript(script){
    var s = document.createElement('script');
    s.type = 'text/javascript';

    if (not(script)) return $(s);

    var _script = $(script)[0];

    if (_script.src) {
        s.src = _script.src;
    } else {
        s.textContent = _script.innerText;
    }

    document.body.appendChild(s);

    if (_script.parentNode) _script.parentNode.removeChild(_script);

    return s;
}

$.extend({
    script: function(el){

        if (not(el)) {
            return createScript();
        }

        var _el = $(el)[0];

        if (_el.tagName && _el.tagName === "SCRIPT") {
            createScript(_el);
        } else $.each($(_el).find("script"), function(){
            createScript(this);
        });
    }
});

$.fn.extend({
    script: function(){
        return this.each(function(){
            $.script(this);
        });
    }
});

// Source: src/prop.js

/* global $, not */

$.fn.extend({
    _prop: function(prop, value){
        if (arguments.length === 1) {
            return this.length === 0 ? undefined : this[0][prop];
        }

        if (not(value)) {
            value = '';
        }

        return this.each(function(){
            var el = this;

            el[prop] = value;

            if (prop === "innerHTML") {
                $.script(el);
            }
        });
    },

    prop: function(prop, value){
        return arguments.length === 1 ? this._prop(prop) : this._prop(prop, typeof value === "undefined" ? "" : value);
    },

    val: function(value){
        if (not(value)) {
            return this.length === 0 ? undefined : this[0].value;
        }

        return this.each(function(){
            var el = $(this);
            if (typeof this.value !== "undefined") {
                this.value = value;
            } else {
                el.html(value);
            }
        });
    },

    html: function(value){
        var that = this, v = [];

        if (arguments.length === 0) {
            return this._prop('innerHTML');
        }

        if (value instanceof $) {
            value.each(function(){
                v.push($(this).outerHTML());
            });
        } else {
            v.push(value);
        }

        that._prop('innerHTML', v.length === 1 && not(v[0]) ? "" : v.join("\n"));

        return this;
    },

    outerHTML: function(){
        return this._prop('outerHTML');
    },

    text: function(value){
        return arguments.length === 0 ? this._prop('textContent') : this._prop('textContent', typeof value === "undefined" ? "" : value);
    },

    innerText: function(value){
        return arguments.length === 0 ? this._prop('innerText') : this._prop('innerText', typeof value === "undefined" ? "" : value);
    },

    empty: function(){
        return this.each(function(){
            if (typeof this.innerHTML !== "undefined") this.innerHTML = "";
        });
    },

    clear: function(){
        return this.empty();
    }
});

// Source: src/each.js

/* global $, isArrayLike, hasProp */

$.each = function(ctx, cb){
    var index = 0;
    if (isArrayLike(ctx)) {
        [].forEach.call(ctx, function(val, key) {
            cb.apply(val, [key, val]);
        });
    } else {
        for(var key in ctx) {
            if (hasProp(ctx, key))
                cb.apply(ctx[key], [key, ctx[key],  index++]);
        }
    }

    return ctx;
};

$.fn.extend({
    each: function(cb){
        return $.each(this, cb);
    }
});


// Source: src/data.js

/* global acceptData, camelCase, $, not, dataAttr, isEmptyObject, hasProp */

/*
 * Data routines
 * Url: https://jquery.com
 * Copyright (c) Copyright JS Foundation and other contributors, https://js.foundation/
 * Licensed under MIT
 */
var Data = function(ns){
    this.expando = "DATASET:UID:" + ns.toUpperCase();
    Data.uid++;
};

Data.uid = -1;

Data.prototype = {
    cache: function(owner){
        var value = owner[this.expando];
        if (!value) {
            value = {};
            if (acceptData(owner)) {
                if (owner.nodeType) {
                    owner[this.expando] = value;
                } else {
                    Object.defineProperty(owner, this.expando, {
                        value: value,
                        configurable: true
                    });
                }
            }
        }
        return value;
    },

    set: function(owner, data, value){
        var prop, cache = this.cache(owner);

        if (typeof data === "string") {
            cache[camelCase(data)] = value;
        } else {
            for (prop in data) {
                if (hasProp(data, prop))
                    cache[camelCase(prop)] = data[prop];
            }
        }
        return cache;
    },

    get: function(owner, key){
        return key === undefined ? this.cache(owner) : owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
    },

    access: function(owner, key, value){
        if (key === undefined || ((key && typeof key === "string") && value === undefined) ) {
            return this.get(owner, key);
        }
        this.set(owner, key, value);
        return value !== undefined ? value : key;
    },

    remove: function(owner, key){
        var i, cache = owner[this.expando];
        if (cache === undefined) {
            return ;
        }
        if (key !== undefined) {
            if ( Array.isArray( key ) ) {
                key = key.map( camelCase );
            } else {
                key = camelCase( key );

                key = key in cache ? [ key ] : ( key.match( /[^\x20\t\r\n\f]+/g ) || [] ); // ???
            }

            i = key.length;

            while ( i-- ) {
                delete cache[ key[ i ] ];
            }
        }
        if ( key === undefined || isEmptyObject( cache ) ) {
            if ( owner.nodeType ) {
                owner[ this.expando ] = undefined;
            } else {
                delete owner[ this.expando ];
            }
        }
        return true;
    },

    hasData: function(owner){
        var cache = owner[ this.expando ];
        return cache !== undefined && !isEmptyObject( cache );
    }
};

var dataSet = new Data('m4q');

$.extend({
    hasData: function(elem){
        return dataSet.hasData(elem);
    },

    data: function(elem, key, val){
        return dataSet.access(elem, key, val);
    },

    removeData: function(elem, key){
        return dataSet.remove(elem, key);
    },

    dataSet: function(ns){
        if (not(ns)) return dataSet;
        if (['INTERNAL', 'M4Q'].indexOf(ns.toUpperCase()) > -1) {
            throw Error("You can not use reserved name for your dataset");
        }
        return new Data(ns);
    }
});

$.fn.extend({
    data: function(key, val){
        var res, elem, data, attrs, name, i;

        if (this.length === 0) {
            return ;
        }

        elem = this[0];

        if ( arguments.length === 0 ) {
            if ( this.length ) {
                data = dataSet.get( elem );

                if ( elem.nodeType === 1) {
                    attrs = elem.attributes;
                    i = attrs.length;
                    while ( i-- ) {
                        if ( attrs[ i ] ) {
                            name = attrs[ i ].name;
                            if ( name.indexOf( "data-" ) === 0 ) {
                                name = camelCase( name.slice( 5 ) );
                                dataAttr( elem, name, data[ name ] );
                            }
                        }
                    }
                }
            }

            return data;
        }

        if ( arguments.length === 1 ) {
            res = dataSet.get(elem, key);
            if (res === undefined) {
                if ( elem.nodeType === 1) {
                    if (elem.hasAttribute("data-"+key)) {
                        res = elem.getAttribute("data-"+key);
                    }
                }
            }
            return res;
        }

        return this.each( function() {
            dataSet.set( this, key, val );
        } );
    },

    removeData: function( key ) {
        return this.each( function() {
            dataSet.remove( this, key );
        } );
    },

    origin: function(name, value, def){

        if (this.length === 0) {
            return this;
        }

        if (not(name) && not(value)) {
            return $.data(this[0]);
        }

        if (not(value)) {
            var res = $.data(this[0], "origin-"+name);
            return !not(res) ? res : def;
        }

        this.data("origin-"+name, value);

        return this;
    }
});

// Source: src/utils.js

/* global $, not, camelCase, dashedName, isPlainObject, isEmptyObject, isArrayLike, acceptData, parseUnit, getUnit, isVisible, isHidden, matches, strip, normName, hasProp, isLocalhost, isTouch */

$.extend({

    device: (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())),
    localhost: isLocalhost(),
    isLocalhost: isLocalhost,
    touchable: isTouch(),

    uniqueId: function (prefix) {
        var d = new Date().getTime();
        if (not(prefix)) {
            prefix = 'm4q';
        }
        return (prefix !== '' ? prefix + '-' : '') + 'xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    toArray: function(n){
        var i, out = [];

        for (i = 0 ; i < n.length; i++ ) {
            out.push(n[i]);
        }

        return out;
    },

    import: function(ctx){
        var res = [];
        this.each(ctx, function(){
            res.push(this);
        });
        return this.merge($(), res);
    },

    merge: function( first, second ) {
        var len = +second.length,
            j = 0,
            i = first.length;

        for ( ; j < len; j++ ) {
            first[ i++ ] = second[ j ];
        }

        first.length = i;

        return first;
    },

    type: function(obj){
        return Object.prototype.toString.call(obj).replace(/^\[object (.+)]$/, '$1').toLowerCase();
    },

    sleep: function(ms) {
        ms += new Date().getTime();
        /* eslint-disable-next-line */
        while (new Date() < ms){}
    },

    isSelector: function(selector){
        if (typeof selector !== 'string') {
            return false;
        }
        try {
            document.querySelector(selector);
        } catch(error) {
            return false;
        }
        return true;
    },

    remove: function(s){
        return $(s).remove();
    },

    camelCase: camelCase,
    dashedName: dashedName,
    isPlainObject: isPlainObject,
    isEmptyObject: isEmptyObject,
    isArrayLike: isArrayLike,
    acceptData: acceptData,
    not: not,
    parseUnit: parseUnit,
    getUnit: getUnit,
    unit: parseUnit,
    isVisible: isVisible,
    isHidden: isHidden,
    matches: function(el, s) {return matches.call(el, s);},
    random: function(from, to) {
        if (arguments.length === 1 && isArrayLike(from)) {
            return from[Math.floor(Math.random()*(from.length))];
        }
        return Math.floor(Math.random()*(to-from+1)+from);
    },
    strip: strip,
    normName: normName,
    hasProp: hasProp,

    serializeToArray: function(form){
        var _form = $(form)[0];
        if (!_form || _form.nodeName !== "FORM") {
            console.warn("Element is not a HTMLFromElement");
            return;
        }
        var i, j, q = [];
        for (i = _form.elements.length - 1; i >= 0; i = i - 1) {
            if (_form.elements[i].name === "") {
                continue;
            }
            switch (_form.elements[i].nodeName) {
                case 'INPUT':
                    switch (_form.elements[i].type) {
                        case 'checkbox':
                        case 'radio':
                            if (_form.elements[i].checked) {
                                q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                            }
                            break;
                        case 'file':
                            break;
                        default: q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                    }
                    break;
                case 'TEXTAREA':
                    q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                    break;
                case 'SELECT':
                    switch (_form.elements[i].type) {
                        case 'select-one':
                            q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                            break;
                        case 'select-multiple':
                            for (j = _form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                if (_form.elements[i].options[j].selected) {
                                    q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].options[j].value));
                                }
                            }
                            break;
                    }
                    break;
                case 'BUTTON':
                    switch (_form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                            q.push(_form.elements[i].name + "=" + encodeURIComponent(_form.elements[i].value));
                            break;
                    }
                    break;
            }
        }
        return q;
    },
    serialize: function(form){
        return $.serializeToArray(form).join("&");
    }
});

$.fn.extend({
    items: function(){
        return $.toArray(this);
    }
});

// Source: src/events.js

/* global $, not, camelCase, str2arr, normName, matches, isEmptyObject, isPlainObject */

(function () {
    if ( typeof window.CustomEvent === "function" ) return false;

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();

var overriddenStop =  Event.prototype.stopPropagation;
var overriddenPrevent =  Event.prototype.preventDefault;

Event.prototype.stopPropagation = function(){
    this.isPropagationStopped = true;
    overriddenStop.apply(this, arguments);
};
Event.prototype.preventDefault = function(){
    this.isPreventedDefault = true;
    overriddenPrevent.apply(this, arguments);
};

Event.prototype.stop = function(immediate){
    return immediate ? this.stopImmediatePropagation() : this.stopPropagation();
};

$.extend({
    events: [],
    eventHooks: {},

    eventUID: -1,

    /*
    * el, eventName, handler, selector, ns, id, options
    * */
    setEventHandler: function(obj){
        var i, freeIndex = -1, eventObj, resultIndex;
        if (this.events.length > 0) {
            for(i = 0; i < this.events.length; i++) {
                if (this.events[i].handler === null) {
                    freeIndex = i;
                    break;
                }
            }
        }

        eventObj = {
            element: obj.el,
            event: obj.event,
            handler: obj.handler,
            selector: obj.selector,
            ns: obj.ns,
            id: obj.id,
            options: obj.options
        };

        if (freeIndex === -1) {
            this.events.push(eventObj);
            resultIndex = this.events.length - 1;
        } else {
            this.events[freeIndex] = eventObj;
            resultIndex = freeIndex;
        }

        return resultIndex;
    },

    getEventHandler: function(index){
        if (this.events[index] !== undefined && this.events[index] !== null) {
            this.events[index] = null;
            return this.events[index].handler;
        }
        return undefined;
    },

    off: function(){
        $.each(this.events, function(){
            this.element.removeEventListener(this.event, this.handler, true);
        });
        this.events = [];
        return this;
    },

    getEvents: function(){
        return this.events;
    },

    getEventHooks: function(){
        return this.eventHooks;
    },

    addEventHook: function(event, handler, type){
        if (not(type)) {
            type = "before";
        }
        $.each(str2arr(event), function(){
            this.eventHooks[camelCase(type+"-"+this)] = handler;
        });
        return this;
    },

    removeEventHook: function(event, type){
        if (not(type)) {
            type = "before";
        }
        $.each(str2arr(event), function(){
            delete this.eventHooks[camelCase(type+"-"+this)];
        });
        return this;
    },

    removeEventHooks: function(event){
        var that = this;
        if (not(event)) {
            this.eventHooks = {};
        } else {
            $.each(str2arr(event), function(){
                delete that.eventHooks[camelCase("before-"+this)];
                delete that.eventHooks[camelCase("after-"+this)];
            });
        }
        return this;
    }
});

$.fn.extend({
    on: function(eventsList, sel, handler, options){
        if (this.length === 0) {
            return ;
        }

        if (typeof sel === 'function') {
            options = handler;
            handler = sel;
            sel = undefined;
        }

        if (!isPlainObject(options)) {
            options = {};
        }

        return this.each(function(){
            var el = this;
            $.each(str2arr(eventsList), function(){
                var h, ev = this,
                    event = ev.split("."),
                    name = normName(event[0]),
                    ns = options.ns ? options.ns : event[1],
                    index, originEvent;

                $.eventUID++;

                h = function(e){
                    var target = e.target;
                    var beforeHook = $.eventHooks[camelCase("before-"+name)];
                    var afterHook = $.eventHooks[camelCase("after-"+name)];

                    if (typeof beforeHook === "function") {
                        beforeHook.call(target, e);
                    }

                    if (!sel) {
                        handler.call(el, e);
                    } else {
                        while (target && target !== el) {
                            if (matches.call(target, sel)) {
                                handler.call(target, e);
                                if (e.isPropagationStopped) {
                                    e.stopImmediatePropagation();
                                    break;
                                }
                            }
                            target = target.parentNode;
                        }
                    }

                    if (typeof afterHook === "function") {
                        afterHook.call(target, e);
                    }

                    if (options.once) {
                        index = +$(el).origin( "event-"+e.type+(sel ? ":"+sel:"")+(ns ? ":"+ns:"") );
                        if (!isNaN(index)) $.events.splice(index, 1);
                    }
                };

                Object.defineProperty(h, "name", {
                    value: handler.name && handler.name !== "" ? handler.name : "func_event_"+name+"_"+$.eventUID
                });

                originEvent = name+(sel ? ":"+sel:"")+(ns ? ":"+ns:"");

                el.addEventListener(name, h, !isEmptyObject(options) ? options : false);

                index = $.setEventHandler({
                    el: el,
                    event: name,
                    handler: h,
                    selector: sel,
                    ns: ns,
                    id: $.eventUID,
                    options: !isEmptyObject(options) ? options : false
                });
                $(el).origin('event-'+originEvent, index);
            });
        });
    },

    one: function(events, sel, handler, options){
        if (!isPlainObject(options)) {
            options = {};
        }

        options.once = true;

        return this.on.apply(this, [events, sel, handler, options]);
    },

    off: function(eventsList, sel, options){

        if (isPlainObject(sel)) {
            options = sel;
            sel = null;
        }

        if (!isPlainObject(options)) {
            options = {};
        }

        if (not(eventsList) || eventsList.toLowerCase() === 'all') {
            return this.each(function(){
                var el = this;
                $.each($.events, function(){
                    var e = this;
                    if (e.element === el) {
                        el.removeEventListener(e.event, e.handler, e.options);
                        e.handler = null;
                        $(el).origin("event-"+name+(e.selector ? ":"+e.selector:"")+(e.ns ? ":"+e.ns:""), null);
                    }
                });
            });
        }

        return this.each(function(){
            var el = this;
            $.each(str2arr(eventsList), function(){
                var evMap = this.split("."),
                    name = normName(evMap[0]),
                    ns = options.ns ? options.ns : evMap[1],
                    originEvent, index;

                originEvent = "event-"+name+(sel ? ":"+sel:"")+(ns ? ":"+ns:"");
                index = $(el).origin(originEvent);

                if (index !== undefined && $.events[index].handler) {
                    el.removeEventListener(name, $.events[index].handler, $.events[index].options);
                    $.events[index].handler = null;
                }

                $(el).origin(originEvent, null);
            });
        });
    },

    trigger: function(name, data){
        return this.fire(name, data);
    },

    fire: function(name, data){
        var _name, e;

        if (this.length === 0) {
            return ;
        }

        _name = normName(name);

        if (['focus', 'blur'].indexOf(_name) > -1) {
            this[0][_name]();
            return this;
        }

        if (typeof CustomEvent !== "undefined") {
            e = new CustomEvent(_name, {
                bubbles: true,
                cancelable: true,
                detail: data
            });
        } else {
            e = document.createEvent('Events');
            e.detail = data;
            e.initEvent(_name, true, true);
        }

        return this.each(function(){
            this.dispatchEvent(e);
        });
    }
});

( "blur focus resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu touchstart touchend touchmove touchcancel" )
    .split( " " )
    .forEach(
    function( name ) {
        $.fn[ name ] = function( sel, fn, opt ) {
            return arguments.length > 0 ?
                this.on( name, sel, fn, opt ) :
                this.fire( name );
        };
});

$.fn.extend( {
    hover: function( fnOver, fnOut ) {
        return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
    }
});

$.ready = function(fn, options){
    document.addEventListener('DOMContentLoaded', fn, (options || false));
};

$.load = function(fn){
    return $(window).on("load", fn);
};

$.unload = function(fn){
    return $(window).on("unload", fn);
};

$.fn.extend({
    unload: function(fn){
        return (this.length === 0 || this[0].self !== window) ? undefined : $.unload(fn);
    }
});

$.beforeunload = function(fn){
    if (typeof fn === "string") {
        return $(window).on("beforeunload", function(e){
            e.returnValue = fn;
            return fn;
        });
    } else {
        return $(window).on("beforeunload", fn);
    }
};

$.fn.extend({
    beforeunload: function(fn){
        return (this.length === 0 || this[0].self !== window) ? undefined : $.beforeunload(fn);
    }
});

$.fn.extend({
    ready: function(fn){
        if (this.length && this[0] === document && typeof fn === 'function') {
            return $.ready(fn);
        }
    }
});

// Source: src/ajax.js

/* global $, Promise, not, isSimple, isPlainObject, isEmptyObject, camelCase */

$.ajax = function(p){
    return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest(), data;
        var method = (p.method || "GET").toUpperCase();
        var headers = [];
        var async = not(p.async) ? true : p.async;
        var url = p.url;

        var exec = function(fn, params){
            if (typeof fn === "function") {
                fn.apply(null, params);
            }
        };

        var isGet = function(method){
            return ["GET", "JSON"].indexOf(method) !== -1;
        };

        var plainObjectToData = function(obj){
            var _data = [];
            $.each(obj, function(k, v){
                var _v = isSimple(v) ? v : JSON.stringify(v);
                _data.push(k+"=" + _v);
            });
            return _data.join("&");
        };

        if (p.data instanceof HTMLFormElement) {
            var _action = p.data.getAttribute("action");
            var _method = p.data.getAttribute("method");

            if (not(url) && _action && _action.trim() !== "") {url = _action;}
            if (_method && _method.trim() !== "") {method = _method.toUpperCase();}
        }


        if (p.timeout) {
            xhr.timeout = p.timeout;
        }

        if (p.withCredentials) {
            xhr.withCredentials = p.withCredentials;
        }

        if (p.data instanceof HTMLFormElement) {
            data = $.serialize(p.data);
        } else if (p.data instanceof HTMLElement && p.data.getAttribute("type") && p.data.getAttribute("type").toLowerCase() === "file") {
            var _name = p.data.getAttribute("name");
            data = new FormData();
            for (var i = 0; i < p.data.files.length; i++) {
                data.append(_name, p.data.files[i]);
            }
        } else if (isPlainObject(p.data)) {
            data = plainObjectToData(p.data);
        } else if (p.data instanceof FormData) {
            data = p.data;
        } else if (typeof p.data === "string") {
            data = p.data;
        } else {
            data = new FormData();
            data.append("_data", JSON.stringify(p.data));
        }

        if (isGet(method)) {
            url += (typeof data === "string" ? "?"+data : isEmptyObject(data) ? "" : "?"+JSON.stringify(data));
        }

        xhr.open(method, url, async, p.user, p.password);
        if (p.headers) {
            $.each(p.headers, function(k, v){
                xhr.setRequestHeader(k, v);
                headers.push(k);
            });
        }
        if (!isGet(method)) {
            if (headers.indexOf("Content-type") === -1 && p.contentType !== false) {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
        }
        xhr.send(data);

        xhr.addEventListener("load", function(e){
            if (xhr.readyState === 4 && xhr.status < 300) {
                var _return = p.returnValue && p.returnValue === 'xhr' ? xhr : xhr.response;
                if (p.parseJson) {
                    try {
                        _return = JSON.parse(_return);
                    } catch (ex) {
                        _return = {};
                    }
                }
                exec(resolve, [_return]);
                exec(p.onSuccess, [e, xhr]);
            } else {
                exec(reject, [xhr]);
                exec(p.onFail, [e, xhr]);
            }
            exec(p.onLoad, [e, xhr]);
        });

        $.each(["readystatechange", "error", "timeout", "progress", "loadstart", "loadend", "abort"], function(){
            var ev = camelCase("on-"+(this === 'readystatechange' ? 'state' : this));
            xhr.addEventListener(ev, function(e){
                exec(p[ev], [e, xhr]);
            });
        });
    });
};

['get', 'post', 'put', 'patch', 'delete', 'json'].forEach(function(method){
    $[method] = function(url, data, options){
        var _method = method.toUpperCase();
        var _options = {
            method: _method === 'JSON' ? 'GET' : _method,
            url: url,
            data: data,
            parseJson: _method === 'JSON'
        };
        return $.ajax($.extend({}, _options, options));
    };
});

$.fn.extend({
    load: function(url, data, options){
        var that = this;

        if (this.length && this[0].self === window ) {
            return $.load(url);
        }

        return $.get(url, data, options).then(function(data){
            that.each(function(){
                this.innerHTML = data;
            });
        });
    }
});

// Source: src/css.js

/* global $, not, setStyleProp */

$.fn.extend({

    style: function(name, pseudo){
        var el;

        function _getStyle(el, prop, pseudo){
            return ["scrollLeft", "scrollTop"].indexOf(prop) > -1 ? $(el)[prop]() : getComputedStyle(el, pseudo)[prop];
        }

        if (typeof name === 'string' && this.length === 0) {
            return undefined;
        }

        if (this.length === 0) {
            return this;
        }

        el = this[0];

        if (not(name) || name === "all") {
            return getComputedStyle(el, pseudo);
        } else {
            var result = {}, names = name.split(", ").map(function(el){
                return (""+el).trim();
            });
            if (names.length === 1)  {
                return _getStyle(el, names[0], pseudo);
            } else {
                $.each(names, function () {
                    var prop = this;
                    result[this] = _getStyle(el, prop, pseudo);
                });
                return result;
            }
        }
    },

    removeStyleProperty: function(name){
        if (not(name) || this.length === 0) return this;
        var names = name.split(", ").map(function(el){
            return (""+el).trim();
        });

        return this.each(function(){
            var el = this;
            $.each(names, function(){
                el.style.removeProperty(this);
            });
        });
    },

    css: function(key, val){
        key = key || 'all';

        if (typeof key === "string" && not(val)) {
            return  this.style(key);
        }

        return this.each(function(){
            var el = this;
            if (typeof key === "object") {
                $.each(key, function(key, val){
                    setStyleProp(el, key, val);
                });
            } else if (typeof key === "string") {
                setStyleProp(el, key, val);
            }
        });
    },

    scrollTop: function(val){
        if (not(val)) {
            return this.length === 0 ? undefined : this[0] === window ? pageYOffset : this[0].scrollTop;
        }
        return this.each(function(){
            this.scrollTop = val;
        });
    },

    scrollLeft: function(val){
        if (not(val)) {
            return this.length === 0 ? undefined : this[0] === window ? pageXOffset : this[0].scrollLeft;
        }
        return this.each(function(){
            this.scrollLeft = val;
        });
    }
});



// Source: src/classes.js

/* global $, not */

$.fn.extend({
    addClass: function(){},
    removeClass: function(){},
    toggleClass: function(){},

    containsClass: function(cls){
        return this.hasClass(cls);
    },

    hasClass: function(cls){
        var result = false;
        var classes = cls.split(" ").filter(function(v){
            return (""+v).trim() !== "";
        });

        if (not(cls)) {
            return false;
        }

        this.each(function(){
            var el = this;

            $.each(classes, function(){
                if (!result && el.classList && el.classList.contains(this)) {
                    result = true;
                }
            });
        });

        return result;
    },

    clearClasses: function(){
        return this.each(function(){
            this.className = "";
        });
    },

    cls: function(array){
        return this.length === 0 ? undefined : array ? this[0].className.split(" ") : this[0].className;
    },

    removeClassBy: function(mask){
        return this.each(function(){
            var el = $(this);
            var classes = el.cls(true);
            $.each(classes, function(){
                var elClass = this;
                if (elClass.indexOf(mask) > -1) {
                    el.removeClass(elClass);
                }
            });
        });
    }
});

['add', 'remove', 'toggle'].forEach(function (method) {
    $.fn[method + "Class"] = function(cls){
        if (not(cls) || (""+cls).trim() === "") return this;
        return this.each(function(){
            var el = this;
            var hasClassList = typeof el.classList !== "undefined";
            $.each(cls.split(" ").filter(function(v){
                return (""+v).trim() !== "";
            }), function(){
                if (hasClassList) el.classList[method](this);
            });
        });
    };
});


// Source: src/parser.js

/* global $ */

$.parseHTML = function(data){
    var base, singleTag, result = [], ctx, _context;
    var regexpSingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i; // eslint-disable-line

    if (typeof data !== "string") {
        return [];
    }

    data = data.trim();

    ctx = document.implementation.createHTMLDocument("");
    base = ctx.createElement( "base" );
    base.href = document.location.href;
    ctx.head.appendChild( base );
    _context = ctx.body;

    singleTag = regexpSingleTag.exec(data);

    if (singleTag) {
        result.push(document.createElement(singleTag[1]));
    } else {
        _context.innerHTML = data;
        for(var i = 0; i < _context.childNodes.length; i++) {
            result.push(_context.childNodes[i]);
        }
    }

    return result;
};


// Source: src/size.js

/* global $, not */

$.fn.extend({
    _size: function(prop, val){
        if (this.length === 0) return ;

        if (not(val)) {

            var el = this[0];

            if (prop === 'height') {
                return el === window ? window.innerHeight : el === document ? el.body.clientHeight : parseInt(getComputedStyle(el).height);
            }
            if (prop === 'width') {
                return el === window ? window.innerWidth : el === document ? el.body.clientWidth : parseInt(getComputedStyle(el).width);
            }
        }

        return this.each(function(){
            var el = this;
            if (el === window || el === document) {return ;}
            el.style[prop] = isNaN(val) ? val : val + 'px';
        });
    },

    height: function(val){
        return this._size('height', val);
    },

    width: function(val){
        return this._size('width', val);
    },

    _sizeOut: function(prop, val){
        var el, size, style, result;

        if (this.length === 0) {
            return ;
        }

        if (!not(val) && typeof val !== "boolean") {
            return this.each(function(){
                var el = this;
                if (el === window || el === document) {return ;}
                var h, style = getComputedStyle(el),
                    bs = prop === 'width' ? parseInt(style['border-left-width']) + parseInt(style['border-right-width']) : parseInt(style['border-top-width']) + parseInt(style['border-bottom-width']),
                    pa = prop === 'width' ? parseInt(style['padding-left']) + parseInt(style['padding-right']) : parseInt(style['padding-top']) + parseInt(style['padding-bottom']);

                h = $(this)[prop](val)[prop]() - bs - pa;
                el.style[prop] = h + 'px';
            });
        }

        el = this[0];
        size = el[prop === 'width' ? 'offsetWidth' : 'offsetHeight'];
        style = getComputedStyle(el);
        result = size + parseInt(style[prop === 'width' ? 'margin-left' : 'margin-top']) + parseInt(style[prop === 'width' ? 'margin-right' : 'margin-bottom']);
        return val === true ? result : size;
    },

    outerWidth: function(val){
        return this._sizeOut('width', val);
    },

    outerHeight: function(val){
        return this._sizeOut('height', val);
    },

    padding: function(p){
        if (this.length === 0) return;
        var s = getComputedStyle(this[0], p);

        return {
            top: parseInt(s["padding-top"]),
            right: parseInt(s["padding-right"]),
            bottom: parseInt(s["padding-bottom"]),
            left: parseInt(s["padding-left"])
        };
    },

    margin: function(p){
        if (this.length === 0) return;
        var s = getComputedStyle(this[0], p);

        return {
            top: parseInt(s["margin-top"]),
            right: parseInt(s["margin-right"]),
            bottom: parseInt(s["margin-bottom"]),
            left: parseInt(s["margin-left"])
        };
    },

    border: function(p){
        if (this.length === 0) return;
        var s = getComputedStyle(this[0], p);

        return {
            top: parseInt(s["border-top-width"]),
            right: parseInt(s["border-right-width"]),
            bottom: parseInt(s["border-bottom-width"]),
            left: parseInt(s["border-left-width"])
        };
    }
});

// Source: src/position.js

/* global $, not */

$.fn.extend({
    offset: function(val){
        var rect;

        if (not(val)) {
            if (this.length === 0) return undefined;
            rect = this[0].getBoundingClientRect();
            return {
                top: rect.top + pageYOffset,
                left: rect.left + pageXOffset
            };
        }

        return this.each(function(){ //?
            var el = $(this),
                top = val.top,
                left = val.left,
                position = getComputedStyle(this).position,
                offset = el.offset();

            if (position === "static") {
                el.css("position", "relative");
            }

            if (["absolute", "fixed"].indexOf(position) === -1) {
                top = top - offset.top;
                left = left - offset.left;
            }

            el.css({
                top: top,
                left: left
            });
        });
    },

    position: function(margin){
        var ml = 0, mt = 0, el, style;

        if (not(margin) || typeof margin !== "boolean") {
            margin = false;
        }

        if (this.length === 0) {
            return undefined;
        }

        el = this[0];
        style = getComputedStyle(el);

        if (margin) {
            ml = parseInt(style['margin-left']);
            mt = parseInt(style['margin-top']);
        }

        return {
            left: el.offsetLeft - ml,
            top: el.offsetTop - mt
        };
    },

    left: function(val, margin){
        if (this.length === 0) return ;
        if (not(val)) {
            return this.position(margin).left;
        }
        if (typeof val === "boolean") {
            margin = val;
            return this.position(margin).left;
        }
        return this.each(function(){
            $(this).css({
                left: val
            });
        });
    },

    top: function(val, margin){
        if (this.length === 0) return ;
        if (not(val)) {
            return this.position(margin).top;
        }
        if (typeof val === "boolean") {
            margin = val;
            return this.position(margin).top;
        }
        return this.each(function(){
            $(this).css({
                top: val
            });
        });
    },

    coord: function(){
        return this.length === 0 ? undefined : this[0].getBoundingClientRect();
    },

    pos: function(){
        if (this.length === 0) return ;
        return {
            top: parseInt($(this[0]).style("top")),
            left: parseInt($(this[0]).style("left"))
        };
    }
});

// Source: src/attr.js

/* global $, not, isPlainObject */

$.fn.extend({
    attr: function(name, val){
        var attributes = {};

        if (this.length === 0 && arguments.length === 0) {
            return undefined;
        }

        if (this.length && arguments.length === 0) {
            $.each(this[0].attributes, function(){
                attributes[this.nodeName] = this.nodeValue;
            });
            return attributes;
        }

        if (arguments.length === 1 && typeof name === "string") {
            return this.length && this[0].nodeType === 1 && this[0].hasAttribute(name) ? this[0].getAttribute(name) : undefined;
        }

        return this.each(function(){
            var el = this;
            if (isPlainObject(name)) {
                $.each(name, function(k, v){
                    el.setAttribute(k, v);
                });
            } else {
                el.setAttribute(name, val);
                // console.log(name, val);
            }
        });
    },

    removeAttr: function(name){
        var attributes;

        if (not(name)) {
            return this.each(function(){
                var el = this;
                $.each(this.attributes, function(){
                    el.removeAttribute(this);
                });
            });
        }

        attributes = typeof name === "string" ? name.split(",").map(function(el){
            return el.trim();
        }) : name;

        return this.each(function(){
            var el = this;
            $.each(attributes, function(){
                if (el.hasAttribute(this)) el.removeAttribute(this);
            });
        });
    },

    toggleAttr: function(name, val){
        return this.each(function(){
            var el = this;

            if (not(val)) {
                el.removeAttribute(name);
            } else {
                el.setAttribute(name, val);
            }

        });
    },

    id: function(val){
        return this.length ? $(this[0]).attr("id", val) : undefined;
    }
});

$.extend({
    meta: function(name){
        return not(name) ? $("meta") : $("meta[name='$name']".replace("$name", name));
    },

    metaBy: function(name){
        return not(name) ? $("meta") : $("meta[$name]".replace("$name", name));
    },

    doctype: function(){
        return $("doctype");
    },

    html: function(){
        return $("html");
    },

    head: function(){
        return $("html").find("head");
    },

    body: function(){
        return $("body");
    },

    document: function(){
        return $(document);
    },

    window: function(){
        return $(window);
    },

    charset: function(val){
        var meta = $("meta[charset]");
        if (val) {
            meta.attr("charset", val);
        }
        return meta.attr("charset");
    }
});

// Source: src/proxy.js

/* global $ */

$.extend({
    proxy: function(fn, ctx){
        return typeof fn !== "function" ? undefined : fn.bind(ctx);
    },

    bind: function(fn, ctx){
        return this.proxy(fn, ctx);
    }
});


// Source: src/manipulation.js

/* global $, isArrayLike, not, matches, hasProp */

(function (arr) {
    arr.forEach(function (item) {
        ['append', 'prepend'].forEach(function(where){
            if (hasProp(item, where)) {
                return;
            }

            Object.defineProperty(item, where, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function () {
                    var argArr = Array.prototype.slice.call(arguments),
                        docFrag = document.createDocumentFragment();

                    argArr.forEach(function (argItem) {
                        var isNode = argItem instanceof Node;
                        docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
                    });

                    if (where === 'prepend')
                        this.insertBefore(docFrag, this.firstChild);
                    else
                        this.appendChild(docFrag);
                }
            });
        });
    });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

var normalizeElements = function(s){
    var result;

    if (typeof s === "string") result = $.isSelector(s) ? $(s) : $.parseHTML(s);
    else if (s instanceof HTMLElement) result = [s];
    else if (isArrayLike(s)) result = s;
    return result;
};

$.fn.extend({

    appendText: function(text){
        return this.each(function(elIndex, el){
            el.innerHTML += text;
        });
    },

    prependText: function(text){
        return this.each(function(elIndex, el){
            el.innerHTML = text + el.innerHTML;
        });
    },

    append: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(elIndex, el){
            $.each(_elements, function(){
                if (el === this) return ;
                var child = elIndex === 0 ? this : this.cloneNode(true);
                $.script(child);
                if (child.tagName && child.tagName !== "SCRIPT") el.append(child);
            });
        });
    },

    appendTo: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(){
            var el = this;
            $.each(_elements, function(parIndex, parent){
                if (el === this) return ;
                parent.append(parIndex === 0 ? el : el.cloneNode(true));
            });
        });
    },

    prepend: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function (elIndex, el) {
            $.each(_elements, function(){
                if (el === this) return ;
                var child = elIndex === 0 ? this : this.cloneNode(true);
                $.script(child);
                if (child.tagName && child.tagName !== "SCRIPT") el.prepend(child);
            });
        });
    },

    prependTo: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(){
            var el = this;
            $.each(_elements, function(parIndex, parent){
                if (el === this) return ;
                $(parent).prepend(parIndex === 0 ? el : el.cloneNode(true));
            });
        });
    },

    insertBefore: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(){
            var el = this;
            $.each(_elements, function(elIndex){
                if (el === this) return ;
                var parent = this.parentNode;
                if (parent) {
                    parent.insertBefore(elIndex === 0 ? el : el.cloneNode(true), this);
                }
            });
        });
    },

    insertAfter: function(elements){
        var _elements = normalizeElements(elements);

        return this.each(function(){
            var el = this;
            $.each(_elements, function(elIndex, element){
                if (el === this) return ;
                var parent = this.parentNode;
                if (parent) {
                    parent.insertBefore(elIndex === 0 ? el : el.cloneNode(true), element.nextSibling);
                }
            });
        });
    },

    after: function(html){
        return this.each(function(){
            var el = this;
            if (typeof html === "string") {
                el.insertAdjacentHTML('afterend', html);
            } else {
                $(html).insertAfter(el);
            }
        });
    },

    before: function(html){
        return this.each(function(){
            var el = this;
            if (typeof html === "string") {
                el.insertAdjacentHTML('beforebegin', html);
            } else {
                $(html).insertBefore(el);
            }
        });
    },

    clone: function(deep, withData){
        var res = [];
        if (not(deep)) {
            deep = false;
        }
        if (not(withData)) {
            withData = false;
        }
        this.each(function(){
            var el = this.cloneNode(deep);
            var $el = $(el);
            var data;
            if (withData && $.hasData(this)) {
                data = $(this).data();
                $.each(data, function(k, v){
                    $el.data(k, v);
                });
            }
            res.push(el);
        });
        return $.merge($(), res);
    },

    import: function(deep){
        var res = [];
        if (not(deep)) {
            deep = false;
        }
        this.each(function(){
            res.push(document.importNode(this, deep));
        });
        return $.merge($(), res);
    },

    adopt: function(){
        var res = [];
        this.each(function(){
            res.push(document.adoptNode(this));
        });
        return $.merge($(), res);
    },

    remove: function(selector){
        var i = 0, node, out, res = [];

        if (this.length === 0) {
            return ;
        }

        out = selector ? this.filter(function(el){
            return matches.call(el, selector);
        }) : this.items();

        for ( ; ( node = out[ i ] ) != null; i++ ) {
            if (node.parentNode) {
                res.push(node.parentNode.removeChild(node));
                $.removeData(node);
            }
        }

        return $.merge($(), res);
    },

    wrap: function( el ){
        if (this.length === 0) {
            return ;
        }

        var wrapper = $(normalizeElements(el));

        if (!wrapper.length) {
            return ;
        }

        var res = [];

        this.each(function(){
            var _target, _wrapper;

            _wrapper = wrapper.clone(true, true);
            _wrapper.insertBefore(this);

            _target = _wrapper;
            while (_target.children().length) {
                _target = _target.children().eq(0);
            }
            _target.append(this);

            res.push(_wrapper);
        });

        return $(res);
    },

    wrapAll: function( el ){
        var wrapper, _wrapper, _target;

        if (this.length === 0) {
            return ;
        }

        wrapper = $(normalizeElements(el));

        if (!wrapper.length) {
            return ;
        }

        _wrapper = wrapper.clone(true, true);
        _wrapper.insertBefore(this[0]);

        _target = _wrapper;
        while (_target.children().length) {
            _target = _target.children().eq(0);
        }

        this.each(function(){
            _target.append(this);
        })

        return _wrapper;
    },

    wrapInner: function( el ){
        if (this.length === 0) {
            return ;
        }

        var wrapper = $(normalizeElements(el));

        if (!wrapper.length) {
            return ;
        }

        var res = [];

        this.each(function(){
            var elem = $(this);
            var html = elem.html();
            var wrp = wrapper.clone(true, true);
            elem.html(wrp.html(html));
            res.push(wrp);
        });

        return $(res);
    }
});

// Source: src/animation.js

/* global $, not, camelCase, parseUnit, Promise, getUnit, matches */

$.extend({
    animation: {
        duration: 1000,
        ease: "linear",
        elements: {}
    }
});

if (typeof window["setupAnimation"] === 'object') {
    $.each(window["setupAnimation"], function(key, val){
        if (typeof $.animation[key] !== "undefined" && !not(val))
            $.animation[key] = val;
    });
}

var transformProps = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY'];
var numberProps = ['opacity', 'zIndex'];
var floatProps = ['opacity', 'volume'];
var scrollProps = ["scrollLeft", "scrollTop"];
var reverseProps = ["opacity", "volume"];

function _validElement(el) {
    return el instanceof HTMLElement || el instanceof SVGElement;
}

/**
 *
 * @param to
 * @param from
 * @returns {*}
 * @private
 */
function _getRelativeValue (to, from) {
    var operator = /^(\*=|\+=|-=)/.exec(to);
    if (!operator) return to;
    var u = getUnit(to) || 0;
    var x = parseFloat(from);
    var y = parseFloat(to.replace(operator[0], ''));
    switch (operator[0][0]) {
        case '+':
            return x + y + u;
        case '-':
            return x - y + u;
        case '*':
            return x * y + u;
        case '/':
            return x / y + u;
    }
}

/**
 *
 * @param el
 * @param prop
 * @param pseudo
 * @returns {*|number|string}
 * @private
 */
function _getStyle (el, prop, pseudo){
    if (typeof el[prop] !== "undefined") {
        if (scrollProps.indexOf(prop) > -1) {
            return prop === "scrollLeft" ? el === window ? pageXOffset : el.scrollLeft : el === window ? pageYOffset : el.scrollTop;
        } else {
            return el[prop] || 0;
        }
    }

    return el.style[prop] || getComputedStyle(el, pseudo)[prop];
}

/**
 *
 * @param el
 * @param key
 * @param val
 * @param unit
 * @param toInt
 * @private
 */
function _setStyle (el, key, val, unit, toInt) {

    if (not(toInt)) {
        toInt = false;
    }

    key = camelCase(key);

    if (toInt) {
        val  = parseInt(val);
    }

    if (_validElement(el)) {
        if (typeof el[key] !== "undefined") {
            el[key] = val;
        } else {
            el.style[key] = key === "transform" || key.toLowerCase().indexOf('color') > -1 ? val : val + unit;
        }
    } else {
        el[key] = val;
    }
}

/**
 *
 * @param el
 * @param mapProps
 * @param p
 * @private
 */
function _applyStyles (el, mapProps, p) {
    $.each(mapProps, function (key, val) {
        _setStyle(el, key, val[0] + (val[2] * p), val[3], val[4]);
    });
}

/**
 *
 * @param el
 * @returns {{}}
 * @private
 */
function _getElementTransforms (el) {
    if (!_validElement(el)) return {};
    var str = el.style.transform || '';
    var reg = /(\w+)\(([^)]*)\)/g;
    var transforms = {};
    var m;

    /* jshint ignore:start */
    // eslint-disable-next-line
    while (m = reg.exec(str))
        transforms[m[1]] = m[2];
    /* jshint ignore:end */

    return transforms;
}

/**
 *
 * @param val
 * @returns {number[]}
 * @private
 */
function _getColorArrayFromHex (val){
    var a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(val ? val : "#000000");
    return a.slice(1).map(function(v) {
            return parseInt(v, 16);
    });
}

/**
 *
 * @param el
 * @param key
 * @returns {number[]}
 * @private
 */
function _getColorArrayFromElement (el, key) {
    return getComputedStyle(el)[key].replace(/[^\d.,]/g, '').split(',').map(function(v) {
        return parseInt(v);
    });
}

/**
 *
 * @param el
 * @param mapProps
 * @param p
 * @private
 */
function _applyTransform (el, mapProps, p) {
    var t = [];
    var elTransforms = _getElementTransforms(el);

    $.each(mapProps, function(key, val) {
        var from = val[0], to = val[1], delta = val[2], unit = val[3];
        key = "" + key;

        if ( key.indexOf("rotate") > -1 || key.indexOf("skew") > -1) {
            if (unit === "") unit = "deg";
        }

        if (key.indexOf('scale') > -1) {
            unit = '';
        }

        if (key.indexOf('translate') > -1 && unit === '') {
            unit = 'px';
        }

        if (unit === "turn") {
            t.push(key+"(" + (to * p) + unit + ")");
        } else {
            t.push(key +"(" + (from + (delta * p)) + unit+")");
        }
    });

    $.each(elTransforms, function(key, val) {
        if (mapProps[key] === undefined) {
            t.push(key+"("+val+")");
        }
    });

    el.style.transform = t.join(" ");
}

/**
 *
 * @param el
 * @param mapProps
 * @param p
 * @private
 */
function _applyColors (el, mapProps, p) {
    $.each(mapProps, function (key, val) {
        var i, result = [0, 0, 0], v;
        for (i = 0; i < 3; i++) {
            result[i] = Math.floor(val[0][i] + (val[2][i] * p));
        }
        v = "rgb("+(result.join(","))+")";
        el.style[key] = v;
    });
}

/**
 *
 * @param val
 * @returns {string|*}
 * @private
 */
function _expandColorValue (val) {
    var regExp = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    if (val[0] === "#" && val.length === 4) {
        return "#" + val.replace(regExp, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
    }
    return val[0] === "#" ? val : "#"+val;
}

/**
 *
 * @param el
 * @param map
 * @param p
 */
function applyProps (el, map, p) {
    _applyStyles(el, map.props, p);
    _applyTransform(el, map.transform, p);
    _applyColors(el, map.color, p);
}

/**
 *
 * @param el
 * @param draw
 * @param dir
 * @returns {{transform: {}, color: {}, props: {}}}
 */
function createAnimationMap (el, draw, dir) {
    var map = {
        props: {},
        transform: {},
        color: {}
    };
    var i, from, to, delta, unit, temp;
    var elTransforms = _getElementTransforms(el);

    if (not(dir)) {
        dir = "normal";
    }

    $.each(draw, function(key, val) {

        var isTransformProp = transformProps.indexOf(""+key) > -1;
        var isNumProp = numberProps.indexOf(""+key) > -1;
        var isColorProp = (""+key).toLowerCase().indexOf("color") > -1;

        if (Array.isArray(val) && val.length === 1) {
            val = val[0];
        }

        if (!Array.isArray(val)) {
            if (isTransformProp) {
                from = elTransforms[key] || 0;
            } else if (isColorProp) {
                from = _getColorArrayFromElement(el, key);
            } else {
                from = _getStyle(el, key);
            }
            from = !isColorProp ? parseUnit(from) : from;
            to = !isColorProp ? parseUnit(_getRelativeValue(val, Array.isArray(from) ? from[0] : from)) : _getColorArrayFromHex(val);
        } else {
            from = !isColorProp ? parseUnit(val[0]) : _getColorArrayFromHex(_expandColorValue(val[0]));
            to = !isColorProp ? parseUnit(val[1]) : _getColorArrayFromHex(_expandColorValue(val[1]));
        }

        if (reverseProps.indexOf(""+key) > -1 && from[0] === to[0]) {
            from[0] = to[0] > 0 ? 0 : 1;
        }

        if (dir === "reverse") {
            temp = from;
            from = to;
            to = temp;
        }

        unit = el instanceof HTMLElement && to[1] === '' && !isNumProp && !isTransformProp ? 'px' : to[1];

        if (isColorProp) {
            delta = [0, 0, 0];
            for (i = 0; i < 3; i++) {
                delta[i] = to[i] - from[i];
            }
        } else {
            delta = to[0] - from[0];
        }

        if (isTransformProp) {
            map.transform[key] = [from[0], to[0], delta, unit];
        } else if (isColorProp) {
            map.color[key] = [from, to, delta, unit];
        } else {
            map.props[key] = [from[0], to[0], delta, unit, floatProps.indexOf(""+key) === -1];
        }
    });

    return map;
}

function minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

var Easing = {
    linear: function(){return function(t) {return t;};}
};

Easing.default = Easing.linear;

var eases = {
    Sine: function(){
        return function(t){
            return 1 - Math.cos(t * Math.PI / 2);
        };
    },
    Circ: function(){
        return function(t){
            return 1 - Math.sqrt(1 - t * t);
        };
    },
    Back: function(){
        return function(t){
            return t * t * (3 * t - 2);
        };
    },
    Bounce: function(){
        return function(t){
            var pow2, b = 4;
            // eslint-disable-next-line
            while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
            return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2);
        };
    },
    Elastic: function(amplitude, period){
        if (not(amplitude)) {
            amplitude = 1;
        }

        if (not(period)) {
            period = 0.5;
        }
        var a = minMax(amplitude, 1, 10);
        var p = minMax(period, 0.1, 2);
        return function(t){
            return (t === 0 || t === 1) ? t :
                -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        };
    }
};

['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'].forEach(function(name, i) {
    eases[name] = function(){
        return function(t){
            return Math.pow(t, i + 2);
        };
    };
});

Object.keys(eases).forEach(function(name) {
    var easeIn = eases[name];
    Easing['easeIn' + name] = easeIn;
    Easing['easeOut' + name] = function(a, b){
        return function(t){
            return 1 - easeIn(a, b)(1 - t);
        };
    };
    Easing['easeInOut' + name] = function(a, b){
        return function(t){
            return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
        };
    };
});

var defaultAnimationProps = {
    id: null,
    el: null,
    draw: {},
    dur: $.animation.duration,
    ease: $.animation.ease,
    loop: 0,
    pause: 0,
    dir: "normal",
    defer: 0,
    onStart: function(){},
    onStop: function(){},
    onStopAll: function(){},
    onPause: function(){},
    onPauseAll: function(){},
    onResume: function(){},
    onResumeAll: function(){},
    onFrame: function(){},
    onDone: function(){}
};

function animate(args){
    return new Promise(function(resolve){
        var that = this;
        var props = $.assign({}, defaultAnimationProps, {dur: $.animation.duration, ease: $.animation.ease}, args);
        var id = props.id, el = props.el, draw = props.draw, dur = props.dur, ease = props.ease, loop = props.loop,
            onStart = props.onStart, onFrame = props.onFrame, onDone = props.onDone,
            pauseStart = props.pause, dir = props.dir, defer = props.defer;
        var map = {};
        var easeName = "linear", easeArgs = [], easeFn = Easing.linear, matchArgs;
        var direction = dir === "alternate" ? "normal" : dir;
        var replay = false;
        var animationID = id ? id : +(performance.now() * Math.pow(10, 14));

        if (not(el)) {
            throw new Error("Unknown element!");
        }

        if (typeof el === "string") {
            el = document.querySelector(el);
        }

        if (typeof draw !== "function" && typeof draw !== "object") {
            throw new Error("Unknown draw object. Must be a function or object!");
        }

        if (dur === 0) {
            dur = 1;
        }

        if (dir === "alternate" && typeof loop === "number") {
            loop *= 2;
        }

        if (typeof ease === "string") {
            matchArgs = /\(([^)]+)\)/.exec(ease);
            easeName = ease.split("(")[0];
            easeArgs = matchArgs ? matchArgs[1].split(',').map(function(p){return parseFloat(p);}) : [];
            easeFn = Easing[easeName] || Easing.linear;
        } else if (typeof ease === "function") {
            easeFn = ease;
        } else {
            easeFn = Easing.linear;
        }

        $.animation.elements[animationID] = {
            element: el,
            id: null,
            stop: 0,
            pause: 0,
            loop: 0,
            t: -1,
            started: 0,
            paused: 0
        };

        var play = function() {
            if (typeof draw === "object") {
                map = createAnimationMap(el, draw, direction);
            }

            if (typeof onStart === "function") {
                onStart.apply(el);
            }

            // start = performance.now();
            $.animation.elements[animationID].loop += 1;
            $.animation.elements[animationID].started = performance.now();
            $.animation.elements[animationID].duration = dur;
            $.animation.elements[animationID].id = requestAnimationFrame(animate);
        };

        var done = function() {
            cancelAnimationFrame($.animation.elements[animationID].id);
            delete $.animation.elements[id];

            if (typeof onDone === "function") {
                onDone.apply(el);
            }

            resolve(that);
        };

        var animate = function(time) {
            var p, t;
            var stop = $.animation.elements[animationID].stop;
            var pause = $.animation.elements[animationID].pause;
            var start = $.animation.elements[animationID].started;

            if ($.animation.elements[animationID].paused) {
                start = time - $.animation.elements[animationID].t * dur;
                $.animation.elements[animationID].started = start;
            }

            t = ((time - start) / dur).toFixed(4);

            if (t > 1) t = 1;
            if (t < 0) t = 0;

            p = easeFn.apply(null, easeArgs)(t);

            $.animation.elements[animationID].t = t;
            $.animation.elements[animationID].p = p;

            if (pause) {
                $.animation.elements[animationID].id = requestAnimationFrame(animate);
                // $.animation.elements[animationID].started = performance.now();
                return;
            }

            if ( stop > 0) {
                if (stop === 2) {
                    if (typeof draw === "function") {
                        draw.bind(el)(1, 1);
                    } else {
                        applyProps(el, map, 1);
                    }
                }
                done();
                return;
            }

            if (typeof draw === "function") {
                draw.bind(el)(t, p);
            } else {
                applyProps(el, map, p);
            }

            if (typeof onFrame === 'function') {
                onFrame.apply(el, [t, p]);
            }

            if (t < 1) {
                $.animation.elements[animationID].id = requestAnimationFrame(animate);
            }

            if (parseInt(t) === 1) {
                if (loop) {
                    if (dir === "alternate") {
                        direction = direction === "normal" ? "reverse" : "normal";
                    }

                    if (typeof loop === "boolean") {
                        setTimeout(function () {
                            play();
                        }, pauseStart);
                    } else {
                        if (loop > $.animation.elements[animationID].loop) {
                            setTimeout(function () {
                                play();
                            }, pauseStart);
                        } else {
                            done();
                        }
                    }
                } else {
                    if (dir === "alternate" && !replay) {
                        direction = direction === "normal" ? "reverse" : "normal";
                        replay = true;
                        play();
                    } else {
                        done();
                    }
                }
            }
        };
        if (defer > 0) {
            setTimeout(function() {
                play();
            }, defer);
        } else {
            play();
        }
    });
}

// Stop animation
function stopAnimation(id, done){
    var an = $.animation.elements[id];

    if (typeof an === "undefined") {
        return ;
    }

    if (not(done)) {
        done = true;
    }

    an.stop = done === true ? 2 : 1;

    if (typeof an.onStop === "function") {
        an.onStop.apply(an.element);
    }
}

function stopAnimationAll(done, filter){
    $.each($.animation.elements, function(k, v){
        if (filter) {
            if (typeof filter === "string") {
                if (matches.call(v.element, filter)) stopAnimation(k, done);
            } else if (filter.length) {
                $.each(filter, function(){
                    if (v.element === this) stopAnimation(k, done);
                });
            } else if (filter instanceof Element) {
                if (v.element === filter) stopAnimation(k, done);
            }
        } else {
            stopAnimation(k, done);
        }
    });
}
// end of stop

// Pause and resume animation
function pauseAnimation(id){
    var an = $.animation.elements[id];

    if (typeof an === "undefined") {
        return ;
    }

    an.pause = 1;
    an.paused = performance.now();

    if (typeof an.onPause === "function") {
        an.onPause.apply(an.element);
    }
}

function pauseAnimationAll(filter){
    $.each($.animation.elements, function(k, v){
        if (filter) {
            if (typeof filter === "string") {
                if (matches.call(v.element, filter)) pauseAnimation(k);
            } else if (filter.length) {
                $.each(filter, function(){
                    if (v.element === this) pauseAnimation(k);
                });
            } else if (filter instanceof Element) {
                if (v.element === filter) pauseAnimation(k);
            }
        } else {
            pauseAnimation(k);
        }
    });
}
// end of pause

function resumeAnimation(id){
    var an = $.animation.elements[id];

    if (typeof an === "undefined") {
        return ;
    }

    an.pause = 0;
    an.paused = 0;

    if (typeof an.onResume === "function") {
        an.onResume.apply(an.element);
    }
}

function resumeAnimationAll(filter){
    $.each($.animation.elements, function(k, v){
        if (filter) {
            if (typeof filter === "string") {
                if (matches.call(v.element, filter)) resumeAnimation(k);
            } else if (filter.length) {
                $.each(filter, function(){
                    if (v.element === this) resumeAnimation(k);
                });
            } else if (filter instanceof Element) {
                if (v.element === filter) resumeAnimation(k);
            }
        } else {
            resumeAnimation(k);
        }
    });
}

/* eslint-enable */

var defaultChainOptions = {
    loop: false,
    onChainItem: null,
    onChainItemComplete: null,
    onChainComplete: null
}

function chain(arr, opt){
    var o = $.extend({}, defaultChainOptions, opt);

    if (typeof o.loop !== "boolean") {
        o.loop--;
    }

    if (!Array.isArray(arr)) {
        console.warn("Chain array is not defined!");
        return false;
    }

    var reducer = function(acc, item){
        return acc.then(function(){
            if (typeof o["onChainItem"] === "function") {
                o["onChainItem"](item);
            }
            return animate(item).then(function(){
                if (typeof o["onChainItemComplete"] === "function") {
                    o["onChainItemComplete"](item);
                }
            });
        });
    };

    arr.reduce(reducer, Promise.resolve()).then(function(){
        if (typeof o["onChainComplete"] === "function") {
            o["onChainComplete"]();
        }

        if (o.loop) {
            chain(arr, o);
        }
    });
}

$.easing = {};

$.extend($.easing, Easing);

$.extend({
    animate: function(args){
        var el, draw, dur, ease, cb;

        if (arguments.length > 1) {
            el = $(arguments[0])[0];
            draw = arguments[1];
            dur = arguments[2] || $.animation.duration;
            ease = arguments[3] || $.animation.ease;
            cb = arguments[4];

            if (typeof dur === 'function') {
                cb = dur;
                ease = $.animation.ease;
                dur = $.animation.duration;
            }

            if (typeof ease === 'function') {
                cb = ease;
                ease = $.animation.ease;
            }

            return animate({
                el: el,
                draw: draw,
                dur: dur,
                ease: ease,
                onDone: cb
            });
        }

        return animate(args);
    },
    chain: chain,
    stop: stopAnimation,
    stopAll: stopAnimationAll,
    resume: resumeAnimation,
    resumeAll: resumeAnimationAll,
    pause: pauseAnimation,
    pauseAll: pauseAnimationAll
});

$.fn.extend({
    /**
     *

     args = {
         draw: {} | function,
         dur: 1000,
         ease: "linear",
         loop: 0,
         pause: 0,
         dir: "normal",
         defer: 0,
         onFrame: function,
         onDone: function
     }

     * @returns {this}
     */
    animate: function(args){
        var that = this;
        var draw, dur, easing, cb;
        var a = args;
        var compatibilityMode;

        compatibilityMode = !Array.isArray(args) && (arguments.length > 1 || (arguments.length === 1 && typeof arguments[0].draw === 'undefined'));

        if ( compatibilityMode ) {
            draw = arguments[0];
            dur = arguments[1] || $.animation.duration;
            easing = arguments[2] || $.animation.ease;
            cb = arguments[3];

            if (typeof dur === 'function') {
                cb = dur;
                dur = $.animation.duration;
                easing = $.animation.ease;
            }

            if (typeof easing === 'function') {
                cb = easing;
                easing = $.animation.ease;
            }

            return this.each(function(){
                return $.animate({
                    el: this,
                    draw: draw,
                    dur: dur,
                    ease: easing,
                    onDone: cb
                });
            });
        }

        if (Array.isArray(args)) {
            $.each(args, function(){
                var a = this;
                that.each(function(){
                    a.el = this;
                    $.animate(a);
                });
            });
            return this;
        }

        return this.each(function(){
            a.el = this;
            $.animate(a);
        });
    },

    chain: function(arr, loop){
        return this.each(function(){
            var el = this;
            $.each(arr, function(){
                this.el = el;
            });
            $.chain(arr, loop);
        });
    },

    /**
     *
     * @param done
     * @returns {this}
     */
    stop: function(done){
        return this.each(function(){
            var el = this;
            $.each($.animation.elements, function(k, o){
                if (o.element === el) {
                    stopAnimation(k, done);
                }
            });
        });
    },

    pause: function(){
        return this.each(function(){
            var el = this;
            $.each($.animation.elements, function(k, o){
                if (o.element === el) {
                    pauseAnimation(k);
                }
            });
        });
    },

    resume: function(){
        return this.each(function(){
            var el = this;
            $.each($.animation.elements, function(k, o){
                if (o.element === el) {
                    resumeAnimation(k);
                }
            });
        });
    }
});


// Source: src/visibility.js

/* global $ */

$.extend({
    hidden: function(el, val, cb){
        el = $(el)[0];

        if (typeof val === "string") {
            val = val.toLowerCase() === "true";
        }

        if (typeof val === "function") {
            cb = val;
            val = !el.hidden;
        }

        el.hidden = val;

        if (typeof cb === "function") {
            $.bind(cb, el);
            cb.call(el, arguments);
        }

        return this;
    },

    hide: function(el, cb){
        var $el = $(el);

        $el.origin('display', (el.style.display ? el.style.display : getComputedStyle(el, null).display));
        el.style.display = 'none';

        if (typeof cb === "function") {
            $.bind(cb, el);
            cb.call(el, arguments);
        }

        return this;
    },

    show: function(el, cb){
        var display = $(el).origin('display', undefined, "block");
        el.style.display = display ? display === 'none' ? 'block' : display : '';
        if (parseInt(el.style.opacity) === 0) {
            el.style.opacity = "1";
        }
        if (typeof cb === "function") {
            $.bind(cb, el);
            cb.call(el, arguments);
        }
        return this;
    },

    visible: function(el, mode, cb){
        if (mode === undefined) {
            mode = true;
        }
        el.style.visibility = mode ? 'visible' : 'hidden';
        if (typeof cb === "function") {
            $.bind(cb, el);
            cb.call(el, arguments);
        }
        return this;
    },

    toggle: function(el, cb){
        var func = getComputedStyle(el, null).display !== 'none' ? 'hide' : 'show';
        return $[func](el, cb);
    }
});

$.fn.extend({
    hide: function(){
        var callback;

        $.each(arguments, function(){
            if (typeof this === 'function') {
                callback = this;
            }
        });

        return this.each(function(){
            $.hide(this, callback);
        });
    },

    show: function(){
        var callback;

        $.each(arguments, function(){
            if (typeof this === 'function') {
                callback = this;
            }
        });

        return this.each(function(){
            $.show(this, callback);
        });
    },

    visible: function(mode, cb){
        return this.each(function(){
            $.visible(this, mode, cb);
        });
    },

    toggle: function(cb){
        return this.each(function(){
            $.toggle(this, cb);
        });
    },

    hidden: function(val, cb){
        return this.each(function(){
            $.hidden(this, val, cb);
        });
    }
});



// Source: src/effects.js

/* global $, not, isVisible */

$.extend({
    fx: {
        off: false
    }
});

$.fn.extend({
    fadeIn: function(dur, easing, cb){
        return this.each(function(){
            var el = this;
            var $el = $(el);
            var visible = !(!isVisible(el) || (isVisible(el) && +($el.style('opacity')) === 0));

            if (visible) {
                return this;
            }

            if (not(dur) && not(easing) && not(cb)) {
                cb = null;
                dur = $.animation.duration;
            } else if (typeof dur === "function") {
                cb = dur;
                dur = $.animation.duration;
            }

            if (typeof easing === "function") {
                cb = easing;
                easing = $.animation.ease;
            }

            if ($.fx.off) {
                dur = 0;
            }

            var originDisplay = $el.origin("display", undefined, 'block');

            el.style.opacity = "0";
            el.style.display = originDisplay;

            return $.animate({
                el: el,
                draw: {
                    opacity: 1
                },
                dur: dur,
                ease: easing,
                onDone: function(){
                    if (typeof cb === 'function') {
                        $.proxy(cb, this)();
                    }
                }
            });
        });
    },

    fadeOut: function(dur, easing, cb){
        return this.each(function(){
            var el = this;
            var $el = $(el);

            if ( !isVisible(el) ) return ;

            if (not(dur) && not(easing) && not(cb)) {
                cb = null;
                dur = $.animation.duration;
            } else
            if (typeof dur === "function") {
                cb = dur;
                dur = $.animation.duration;
            }
            if (typeof easing === "function") {
                cb = easing;
                easing = $.animation.ease;
            }

            $el.origin("display", $el.style('display'));

            return $.animate({
                el: el,
                draw: {
                    opacity: 0
                },
                dur: dur,
                ease: easing,
                onDone: function(){
                    this.style.display = 'none';

                    if (typeof cb === 'function') {
                        $.proxy(cb, this)();
                    }
                }
            });
        });
    },

    slideUp: function(dur, easing, cb){
        return this.each(function(){
            var el = this;
            var $el = $(el);
            var currHeight;

            if ($el.height() === 0) return ;

            if (not(dur) && not(easing) && not(cb)) {
                cb = null;
                dur = $.animation.duration;
            } else
            if (typeof dur === "function") {
                cb = dur;
                dur = $.animation.duration;
            }
            if (typeof easing === "function") {
                cb = easing;
                easing = $.animation.ease;
            }

            currHeight = $el.height();
            $el.origin("height", currHeight);
            $el.origin("display", $(el).style('display'));

            $el.css({
                overflow: "hidden"
            });

            return $.animate({
                el: el,
                draw: {
                    height: 0
                },
                dur: dur,
                ease: easing,
                onDone: function(){
                    $el.hide().removeStyleProperty("overflow, height");
                    if (typeof cb === 'function') {
                        $.proxy(cb, this)();
                    }
                }
            });
        });
    },

    slideDown: function(dur, easing, cb){
        return this.each(function(){
            var el = this;
            var $el = $(el);
            var targetHeight, originDisplay;

            if (not(dur) && not(easing) && not(cb)) {
                cb = null;
                dur = $.animation.duration;
            } else
            if (typeof dur === "function") {
                cb = dur;
                dur = $.animation.duration;
            }
            if (typeof easing === "function") {
                cb = easing;
                easing = $.animation.ease;
            }

            $el.show().visible(false);
            targetHeight = +$el.origin("height", undefined, $el.height());
            if (parseInt(targetHeight) === 0) {
                targetHeight = el.scrollHeight;
            }
            originDisplay = $el.origin("display", $el.style('display'), "block");
            $el.height(0).visible(true);

            $el.css({
                overflow: "hidden",
                display: originDisplay === "none" ? "block" : originDisplay
            });

            return $.animate({
                el: el,
                draw: {
                    height: targetHeight
                },
                dur: dur,
                ease: easing,
                onDone: function(){
                    $(el).removeStyleProperty("overflow, height, visibility");
                    if (typeof cb === 'function') {
                        $.proxy(cb, this)();
                    }
                }
            });
        });
    },

    moveTo: function(x, y, dur, easing, cb){
        var draw = {
            top: y,
            left: x
        };

        if (typeof dur === "function") {
            cb = dur;
            dur = $.animation.duration;
            easing = $.animation.ease;
        }

        if (typeof easing === "function") {
            cb = easing;
            easing = $.animation.ease;
        }

        return this.each(function(){
            $.animate({
                el: this,
                draw: draw,
                dur: dur,
                ease: easing,
                onDone: cb
            });
        });
    },

    centerTo: function(x, y, dur, easing, cb){
        if (typeof dur === "function") {
            cb = dur;
            dur = $.animation.duration;
            easing = $.animation.ease;
        }

        if (typeof easing === "function") {
            cb = easing;
            easing = $.animation.ease;
        }

        return this.each(function(){
            var draw = {
                left: x - this.clientWidth / 2,
                top: y - this.clientHeight / 2
            };
            $.animate({
                el: this,
                draw: draw,
                dur: dur,
                ease: easing,
                onDone: cb
            });
        });
    },

    colorTo: function(color, dur, easing, cb){
        var draw = {
            color: color
        };

        if (typeof dur === "function") {
            cb = dur;
            dur = $.animation.duration;
            easing = $.animation.ease;
        }

        if (typeof easing === "function") {
            cb = easing;
            easing = $.animation.ease;
        }

        return this.each(function(){
            $.animate({
                el: this,
                draw: draw,
                dur: dur,
                ease: easing,
                onDone: cb
            });
        });
    },

    backgroundTo: function(color, dur, easing, cb){
        var draw = {
            backgroundColor: color
        };

        if (typeof dur === "function") {
            cb = dur;
            dur = $.animation.duration;
            easing = $.animation.ease;
        }

        if (typeof easing === "function") {
            cb = easing;
            easing = $.animation.ease;
        }

        return this.each(function(){
            $.animate({
                el: this,
                draw: draw,
                dur: dur,
                ease: easing,
                onDone: cb
            });
        });
    }
});

// Source: src/init.js

/* global $, isArrayLike, isPlainObject, hasProp, str2arr */

$.init = function(sel, ctx){
    var parsed;
    var that = this;

    if (typeof sel === "string") {
        sel = sel.trim();
    }

    this.uid = $.uniqueId();

    if (!sel) {
        return this;
    }

    if (typeof sel === "function") {
        return $.ready(sel);
    }

    if (sel instanceof Element) {
        this.push(sel);
        return this;
    }

    if (sel instanceof $) {
        $.each(sel, function(){
            that.push(this);
        });
        return this;
    }

    if (sel === "window") sel = window;
    if (sel === "document") sel = document;
    if (sel === "body") sel = document.body;
    if (sel === "html") sel = document.documentElement;
    if (sel === "doctype") sel = document.doctype;
    if (sel && (sel.nodeType || sel.self === window)) {
        this.push(sel);
        return this;
    }

    if (isArrayLike(sel)) {
        $.each(sel, function(){
            $(this).each(function(){
                that.push(this);
            });
        });
        return this;
    }

    if (typeof sel !== "string" && (sel.self && sel.self !== window)) {
        return this;
    }

    if (sel === "#" || sel === ".") {
        console.error("Selector can't be # or .") ;
        return this;
    }

    if (sel[0] === "@") {

        $("[data-role]").each(function(){
            var roles = str2arr($(this).attr("data-role"), ",");
            if (roles.indexOf(sel.slice(1)) > -1) {
                that.push(this);
            }
        });

    } else {

        parsed = $.parseHTML(sel);

        if (parsed.length === 1 && parsed[0].nodeType === 3) { // Must be a text node -> css sel
            try {
                [].push.apply(this, document.querySelectorAll(sel));
            } catch (e) {
                //console.error(sel + " is not a valid selector");
            }
        } else {
            $.merge(this, parsed);
        }
    }

    if (ctx !== undefined) {
        if (ctx instanceof $) {
            this.each(function () {
                $(ctx).append(that);
            });
        } else if (ctx instanceof HTMLElement) {
            $(ctx).append(that);
        } else {
            if (isPlainObject(ctx)) {
                $.each(this,function(){
                    for(var name in ctx) {
                        if (hasProp(ctx, name))
                            this.setAttribute(name, ctx[name]);
                    }
                });
            }
        }
    }

    return this;
};

$.init.prototype = $.fn;


// Source: src/populate.js

/* global Promise, $ */

var _$ = window.$;

$.Promise = Promise;

window.m4q = $;

if (typeof window.$ === "undefined") {
    window.$ = $;
}

$.global = function(){
    _$ = window.$;
    window.$ = $;
};

$.noConflict = function() {
    if ( window.$ === $ ) {
        window.$ = _$;
    }

    return $;
};

}(window));



(function($) {
    'use strict';

    var meta_init = $.meta('metro4:init').attr("content");
    var meta_locale = $.meta('metro4:locale').attr("content");
    var meta_week_start = $.meta('metro4:week_start').attr("content");
    var meta_date_format = $.meta('metro4:date_format').attr("content");
    var meta_date_format_input = $.meta('metro4:date_format_input').attr("content");
    var meta_animation_duration = $.meta('metro4:animation_duration').attr("content");
    var meta_callback_timeout = $.meta('metro4:callback_timeout').attr("content");
    var meta_timeout = $.meta('metro4:timeout').attr("content");
    var meta_scroll_multiple = $.meta('metro4:scroll_multiple').attr("content");
    var meta_cloak = $.meta('metro4:cloak').attr("content");
    var meta_cloak_duration = $.meta('metro4:cloak_duration').attr("content");
    var meta_global_common = $.meta('metro4:global_common').attr("content");
    var meta_blur_image = $.meta('metro4:blur_image').attr("content");

    if (window.METRO_BLUR_IMAGE === undefined) {
        window.METRO_BLUR_IMAGE = meta_blur_image !== undefined ? JSON.parse(meta_global_common) : false;
    }

    if (window.METRO_GLOBAL_COMMON === undefined) {
        window.METRO_GLOBAL_COMMON = meta_global_common !== undefined ? JSON.parse(meta_global_common) : false;
    }

    var meta_jquery = $.meta('metro4:jquery').attr("content"); //undefined
    window.jquery_present = typeof jQuery !== "undefined";
    if (window.METRO_JQUERY === undefined) {
        window.METRO_JQUERY = meta_jquery !== undefined ? JSON.parse(meta_jquery) : true;
    }
    window.useJQuery = window.jquery_present && window.METRO_JQUERY;


    /* Added by Ken Kitay https://github.com/kens-code*/
    var meta_about = $.meta('metro4:about').attr("content");
    if (window.METRO_SHOW_ABOUT === undefined) {
        window.METRO_SHOW_ABOUT = meta_about !== undefined ? JSON.parse(meta_about) : true;
    }
    /* --- end ---*/

    var meta_compile = $.meta('metro4:compile').attr("content");
    if (window.METRO_SHOW_COMPILE_TIME === undefined) {
        window.METRO_SHOW_COMPILE_TIME = meta_compile !== undefined ? JSON.parse(meta_compile) : true;
    }

    if (window.METRO_INIT === undefined) {
        window.METRO_INIT = meta_init !== undefined ? JSON.parse(meta_init) : true;
    }

    if (window.METRO_DEBUG === undefined) {window.METRO_DEBUG = true;}

    if (window.METRO_WEEK_START === undefined) {
        window.METRO_WEEK_START = meta_week_start !== undefined ? parseInt(meta_week_start) : 0;
    }
    if (window.METRO_DATE_FORMAT === undefined) {
        window.METRO_DATE_FORMAT = meta_date_format !== undefined ? meta_date_format : "%Y-%m-%d";
    }
    if (window.METRO_DATE_FORMAT_INPUT === undefined) {
        window.METRO_DATE_FORMAT_INPUT = meta_date_format_input !== undefined ? meta_date_format_input : "%Y-%m-%d";
    }
    if (window.METRO_LOCALE === undefined) {
        window.METRO_LOCALE = meta_locale !== undefined ? meta_locale : 'en-US';
    }
    if (window.METRO_ANIMATION_DURATION === undefined) {
        window.METRO_ANIMATION_DURATION = meta_animation_duration !== undefined ? parseInt(meta_animation_duration) : 100;
    }
    if (window.METRO_CALLBACK_TIMEOUT === undefined) {
        window.METRO_CALLBACK_TIMEOUT = meta_callback_timeout !== undefined ? parseInt(meta_callback_timeout) : 500;
    }
    if (window.METRO_TIMEOUT === undefined) {
        window.METRO_TIMEOUT = meta_timeout !== undefined ? parseInt(meta_timeout) : 2000;
    }
    if (window.METRO_SCROLL_MULTIPLE === undefined) {
        window.METRO_SCROLL_MULTIPLE = meta_scroll_multiple !== undefined ? parseInt(meta_scroll_multiple) : 20;
    }
    if (window.METRO_CLOAK_REMOVE === undefined) {
        window.METRO_CLOAK_REMOVE = meta_cloak !== undefined ? (""+meta_cloak).toLowerCase() : "fade";
    }
    if (window.METRO_CLOAK_DURATION === undefined) {
        window.METRO_CLOAK_DURATION = meta_cloak_duration !== undefined ? parseInt(meta_cloak_duration) : 300;
    }

    if (window.METRO_HOTKEYS_FILTER_CONTENT_EDITABLE === undefined) {window.METRO_HOTKEYS_FILTER_CONTENT_EDITABLE = true;}
    if (window.METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS === undefined) {window.METRO_HOTKEYS_FILTER_INPUT_ACCEPTING_ELEMENTS = true;}
    if (window.METRO_HOTKEYS_FILTER_TEXT_INPUTS === undefined) {window.METRO_HOTKEYS_FILTER_TEXT_INPUTS = true;}
    if (window.METRO_HOTKEYS_BUBBLE_UP === undefined) {window.METRO_HOTKEYS_BUBBLE_UP = false;}
    if (window.METRO_THROWS === undefined) {window.METRO_THROWS = true;}

    window.METRO_MEDIA = [];

}(m4q));


/* global jQuery, define */
/* Metro 4 Core */
(function( factory ) {
    if ( typeof define === 'function' && define.amd ) {
        define('metro4', factory );
    } else {
        factory( );
    }
}(function( ) {
    'use strict';

    var $ = m4q; // eslint-disable-line

    if (typeof m4q === 'undefined') {
        throw new Error('Metro 4 requires m4q helper!');
    }

    if (!('MutationObserver' in window)) {
        throw new Error('Metro 4 requires MutationObserver!');
    }

    var isTouch = (('ontouchstart' in window) || (navigator["MaxTouchPoints"] > 0) || (navigator["msMaxTouchPoints"] > 0));

    var normalizeComponentName = function(name){
        return typeof name !== "string" ? undefined : name.replace(/-/g, "").toLowerCase();
    };

    var Metro = {

        version: "4.4.3",
        compileTime: "11/11/2022 17:11:38",
        buildNumber: "",
        isTouchable: isTouch,
        fullScreenEnabled: document.fullscreenEnabled,
        sheet: null,


        controlsPosition: {
            INSIDE: "inside",
            OUTSIDE: "outside"
        },

        groupMode: {
            ONE: "one",
            MULTI: "multi"
        },

        aspectRatio: {
            HD: "hd",
            SD: "sd",
            CINEMA: "cinema"
        },

        fullScreenMode: {
            WINDOW: "window",
            DESKTOP: "desktop"
        },

        position: {
            TOP: "top",
            BOTTOM: "bottom",
            LEFT: "left",
            RIGHT: "right",
            TOP_RIGHT: "top-right",
            TOP_LEFT: "top-left",
            BOTTOM_LEFT: "bottom-left",
            BOTTOM_RIGHT: "bottom-right",
            LEFT_BOTTOM: "left-bottom",
            LEFT_TOP: "left-top",
            RIGHT_TOP: "right-top",
            RIGHT_BOTTOM: "right-bottom"
        },

        popoverEvents: {
            CLICK: "click",
            HOVER: "hover",
            FOCUS: "focus"
        },

        stepperView: {
            SQUARE: "square",
            CYCLE: "cycle",
            DIAMOND: "diamond"
        },

        listView: {
            LIST: "list",
            CONTENT: "content",
            ICONS: "icons",
            ICONS_MEDIUM: "icons-medium",
            ICONS_LARGE: "icons-large",
            TILES: "tiles",
            TABLE: "table"
        },

        events: {
            click: 'click',
            start: isTouch ? 'touchstart' : 'mousedown',
            stop: isTouch ? 'touchend' : 'mouseup',
            move: isTouch ? 'touchmove' : 'mousemove',
            enter: isTouch ? 'touchstart' : 'mouseenter',

            startAll: 'mousedown touchstart',
            stopAll: 'mouseup touchend',
            moveAll: 'mousemove touchmove',

            leave: 'mouseleave',
            focus: 'focus',
            blur: 'blur',
            resize: 'resize',
            keyup: 'keyup',
            keydown: 'keydown',
            keypress: 'keypress',
            dblclick: 'dblclick',
            input: 'input',
            change: 'change',
            cut: 'cut',
            paste: 'paste',
            scroll: 'scroll',
            mousewheel: 'mousewheel',
            inputchange: "change input propertychange cut paste copy drop",
            dragstart: "dragstart",
            dragend: "dragend",
            dragenter: "dragenter",
            dragover: "dragover",
            dragleave: "dragleave",
            drop: 'drop',
            drag: 'drag'
        },

        keyCode: {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            BREAK: 19,
            CAPS: 20,
            ESCAPE: 27,
            SPACE: 32,
            PAGEUP: 33,
            PAGEDOWN: 34,
            END: 35,
            HOME: 36,
            LEFT_ARROW: 37,
            UP_ARROW: 38,
            RIGHT_ARROW: 39,
            DOWN_ARROW: 40,
            COMMA: 188
        },

        media_queries: {
            FS: "(min-width: 0px)",
            XS: "(min-width: 360px)",
            SM: "(min-width: 576px)",
            MD: "(min-width: 768px)",
            LG: "(min-width: 992px)",
            XL: "(min-width: 1200px)",
            XXL: "(min-width: 1452px)"
        },

        media_sizes: {
            FS: 0,
            XS: 360,
            SM: 576,
            LD: 640,
            MD: 768,
            LG: 992,
            XL: 1200,
            XXL: 1452
        },

        media_mode: {
            FS: "fs",
            XS: "xs",
            SM: "sm",
            MD: "md",
            LG: "lg",
            XL: "xl",
            XXL: "xxl"
        },

        media_modes: ["fs","xs","sm","md","lg","xl","xxl"],

        actions: {
            REMOVE: 1,
            HIDE: 2
        },

        hotkeys: {},
        locales: {},
        utils: {},
        colors: {},
        dialog: null,
        pagination: null,
        md5: null,
        storage: null,
        export: null,
        animations: null,
        cookie: null,
        template: null,
        defaults: {},

        about: function(){
            var content =
                "<h3>About</h3>" +
                "<hr>" +
                "<div><b>Metro 4</b> - v" + Metro.version +". "+ Metro.showCompileTime() + "</div>" +
                "<div><b>M4Q</b> - " + m4q.version + "</div>";
            Metro.infobox.create(content)
        },

        info: function(){
            console.info("Metro 4 - v" + Metro.version +". "+ Metro.showCompileTime());
            console.info("m4q - " + m4q.version);
        },

        showCompileTime: function(){
            return "Built at: " + Metro.compileTime;
        },

        aboutDlg: function(){
            alert("Metro 4 - v" + Metro.version +". "+ Metro.showCompileTime());
        },

        ver: function(){
            return Metro.version;
        },

        build: function(){
            return Metro.build;
        },

        compile: function(){
            return Metro.compileTime;
        },

        observe: function(){
            var observer, observerCallback;
            var observerConfig = {
                childList: true,
                attributes: true,
                subtree: true
            };
            observerCallback = function(mutations){
                mutations.map(function(mutation){
                    if (mutation.type === 'attributes' && mutation.attributeName !== "data-role") {
                        if (mutation.attributeName === 'data-hotkey') {
                            Metro.initHotkeys([mutation.target], true);
                        } else {
                            var element = $(mutation.target);
                            var mc = element.data('metroComponent');
                            var attr = mutation.attributeName, newValue = element.attr(attr), oldValue = mutation.oldValue;

                            if (mc !== undefined) {
                                element.fire("attr-change", {
                                    attr: attr,
                                    newValue: newValue,
                                    oldValue: oldValue,
                                    __this: element[0]
                                });

                                $.each(mc, function(){
                                    var plug = Metro.getPlugin(element, this);
                                    if (plug && typeof plug.changeAttribute === "function") {
                                        plug.changeAttribute(attr, newValue, oldValue);
                                    }
                                });
                            }
                        }
                    } else

                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        var i, widgets = [];
                        var $node, node, nodes = mutation.addedNodes;

                        if (nodes.length) {
                            for(i = 0; i < nodes.length; i++) {
                                node = nodes[i];
                                $node = $(node);

                                if ($node.attr("data-role") !== undefined) {
                                    widgets.push(node);
                                }

                                $.each($node.find("[data-role]"), function(){
                                    var o = this;
                                    if (widgets.indexOf(o) !== -1) {
                                        return;
                                    }
                                    widgets.push(o);
                                });
                            }

                            if (widgets.length) Metro.initWidgets(widgets, "observe");
                        }

                    } else  {
                        //console.log(mutation);
                    }
                });
            };
            observer = new MutationObserver(observerCallback);
            observer.observe($("html")[0], observerConfig);
        },

        init: function(){
            var widgets = $("[data-role]");
            var hotkeys = $("[data-hotkey]");
            var html = $("html");
            var that = this;

            if (window.METRO_BLUR_IMAGE) {
                html.addClass("use-blur-image");
            }

            if (window.METRO_SHOW_ABOUT) Metro.info(true);

            if (isTouch === true) {
                html.addClass("metro-touch-device");
            } else {
                html.addClass("metro-no-touch-device");
            }

            Metro.sheet = this.utils.newCssSheet();

            this.utils.addCssRule(Metro.sheet, "*, *::before, *::after", "box-sizing: border-box;");

            window.METRO_MEDIA = [];
            $.each(Metro.media_queries, function(key, query){
                if (that.utils.media(query)) {
                    window.METRO_MEDIA.push(Metro.media_mode[key]);
                }
            });

            Metro.observe();

            Metro.initHotkeys(hotkeys);
            Metro.initWidgets(widgets, "init");

            if (window.METRO_CLOAK_REMOVE !== "fade") {
                $(".m4-cloak").removeClass("m4-cloak");
                $(window).fire("metro-initiated");
            } else {
                $(".m4-cloak").animate({
                    draw: {
                        opacity: 1
                    },
                    dur: 300,
                    onDone: function(){
                        $(".m4-cloak").removeClass("m4-cloak");
                        $(window).fire("metro-initiated");
                    }
                });
            }
        },

        initHotkeys: function(hotkeys, redefine){
            $.each(hotkeys, function(){
                var element = $(this);
                var hotkey = element.attr('data-hotkey') ? element.attr('data-hotkey').toLowerCase() : false;
                var fn = element.attr('data-hotkey-func') ? element.attr('data-hotkey-func') : false;

                if (hotkey === false) {
                    return;
                }

                if (element.data('hotKeyBonded') === true && redefine !== true) {
                    return;
                }

                Metro.hotkeys[hotkey] = [this, fn];
                element.data('hotKeyBonded', true);
                element.fire("hot-key-bonded", {
                    __this: element[0],
                    hotkey: hotkey,
                    fn: fn
                });
            });
        },

        initWidgets: function(widgets) {
            var that = this;

            $.each(widgets, function () {
                var $this = $(this), roles;

                if (!this.hasAttribute("data-role")) {
                    return ;
                }

                roles = $this.attr('data-role').split(/\s*,\s*/);

                roles.map(function (func) {

                    var $$ = that.utils.$();
                    var _func = normalizeComponentName(func);

                    if ($$.fn[_func] !== undefined && $this.attr("data-role-"+_func) === undefined) {
                        try {
                            $$.fn[_func].call($this);
                            $this.attr("data-role-"+_func, true);

                            var mc = $this.data('metroComponent');

                            if (mc === undefined) {
                                mc = [_func];
                            } else {
                                mc.push(_func);
                            }
                            $this.data('metroComponent', mc);

                            $this.fire("create", {
                                __this: $this[0],
                                name: _func
                            });
                            $(document).fire("component-create", {
                                element: $this[0],
                                name: _func
                            });
                        } catch (e) {
                            console.error("Error creating component " + func + " for ", $this[0]);
                            throw e;
                        }
                    }
                });
            });
        },

        plugin: function(name, object){
            var _name = normalizeComponentName(name);

            var register = function($){
                $.fn[_name] = function( options ) {
                    return this.each(function() {
                        $.data( this, _name, Object.create(object).init(options, this ));
                    });
                };
            }

            register(m4q);

            if (window.useJQuery) {
                register(jQuery);
            }
        },

        pluginExists: function(name){
            var $ = window.useJQuery ? jQuery : m4q;
            return typeof $.fn[normalizeComponentName(name)] === "function";
        },

        destroyPlugin: function(element, name){
            var p, mc;
            var el = $(element);
            var _name = normalizeComponentName(name);

            p = Metro.getPlugin(el, _name);

            if (typeof p === 'undefined') {
                console.warn("Component "+name+" can not be destroyed: the element is not a Metro 4 component.");
                return ;
            }

            if (typeof p['destroy'] !== 'function') {
                console.warn("Component "+name+" can not be destroyed: method destroy not found.");
                return ;
            }

            p['destroy']();
            mc = el.data("metroComponent");
            this.utils.arrayDelete(mc, _name);
            el.data("metroComponent", mc);
            $.removeData(el[0], _name);
            el.removeAttr("data-role-"+_name);
        },

        destroyPluginAll: function(element){
            var el = $(element);
            var mc = el.data("metroComponent");

            if (mc !== undefined && mc.length > 0) $.each(mc, function(){
                Metro.destroyPlugin(el[0], this);
            });
        },

        noop: function(){},
        noop_true: function(){return true;},
        noop_false: function(){return false;},

        requestFullScreen: function(element){
            if (element["mozRequestFullScreen"]) {
                element["mozRequestFullScreen"]();
            } else if (element["webkitRequestFullScreen"]) {
                element["webkitRequestFullScreen"]();
            } else if (element["msRequestFullscreen"]) {
                element["msRequestFullscreen"]();
            } else {
                element.requestFullscreen().catch( function(err){
                    console.warn("Error attempting to enable full-screen mode: "+err.message+" "+err.name);
                });
            }
        },

        exitFullScreen: function(){
            if (document["mozCancelFullScreen"]) {
                document["mozCancelFullScreen"]();
            }
            else if (document["webkitCancelFullScreen"]) {
                document["webkitCancelFullScreen"]();
            }
            else if (document["msExitFullscreen"]) {
                document["msExitFullscreen"]();
            } else {
                document.exitFullscreen().catch( function(err){
                    console.warn("Error attempting to disable full-screen mode: "+err.message+" "+err.name);
                });
            }
        },

        inFullScreen: function(){
            var fsm = (document.fullscreenElement || document["webkitFullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"]);
            return fsm !== undefined;
        },

        $: function(){
            return window.useJQuery ? jQuery : m4q;
        },

        get$el: function(el){
            return Metro.$()($(el)[0]);
        },

        get$elements: function(el){
            return Metro.$()($(el));
        },

        getPlugin: function(el, name){
            var _name = normalizeComponentName(name);
            var $el = Metro.get$el(el);
            return $el.length ? $el.data(_name) : undefined;
        },

        makePlugin: function(el, name, options){
            var _name = normalizeComponentName(name);
            var $el = Metro.get$elements(el);
            return $el.length && typeof $el[_name] === "function" ? $el[_name](options) : undefined;
        },

        Component: function(nameName, compObj){
            var name = normalizeComponentName(nameName);
            var Utils = Metro.utils;
            var component = $.extend({name: name}, {
                _super: function(el, options, defaults, setup){
                    var self = this;

                    this.elem = el;
                    this.element = $(el);
                    this.options = $.extend( {}, defaults, options );
                    this.component = this.elem;

                    this._setOptionsFromDOM();
                    this._runtime();

                    if (setup && typeof setup === 'object') {
                        $.each(setup, function(key, val){
                            self[key] = val;
                        })
                    }

                    this._createExec();
                },

                _setOptionsFromDOM: function(){
                    var element = this.element, o = this.options;

                    $.each(element.data(), function(key, value){
                        if (key in o) {
                            try {
                                o[key] = JSON.parse(value);
                            } catch (e) {
                                o[key] = value;
                            }
                        }
                    });
                },

                _runtime: function(){
                    var element = this.element, mc;
                    var roles = (element.attr("data-role") || "").toArray(",").map(function(v){
                        return normalizeComponentName(v);
                    }).filter(function(v){
                        return v.trim() !== "";
                    });

                    if (!element.attr('data-role-'+this.name)) {
                        element.attr("data-role-"+this.name, true);
                        if (roles.indexOf(this.name) === -1) {
                            roles.push(this.name);
                            element.attr("data-role", roles.join(","));
                        }

                        mc = element.data('metroComponent');
                        if (mc === undefined) {
                            mc = [this.name];
                        } else {
                            mc.push(this.name);
                        }
                        element.data('metroComponent', mc);
                    }
                },

                _createExec: function(){
                    var that = this, timeout = this.options[this.name+'Deferred'];

                    if (timeout) {
                        setTimeout(function(){
                            that._create();
                        }, timeout)
                    } else {
                        that._create();
                    }
                },

                _fireEvent: function(eventName, data, log, noFire){
                    var element = this.element, o = this.options;
                    var _data;
                    var event = eventName.camelCase().capitalize();

                    data = $.extend({}, data, {__this: element[0]});

                    _data = data ? Object.values(data) : {};

                    if (log) {
                        console.warn(log);
                        console.warn("Event: " + "on"+eventName.camelCase().capitalize());
                        console.warn("Data: ", data);
                        console.warn("Element: ", element[0]);
                    }

                    if (noFire !== true)
                        element.fire(event.toLowerCase(), data);

                    return Utils.exec(o["on"+event], _data, element[0]);
                },

                _fireEvents: function(events, data, log, noFire){
                    var that = this, _events;

                    if (arguments.length === 0) {
                        return ;
                    }

                    if (arguments.length === 1) {

                        $.each(events, function () {
                            var ev = this;
                            that._fireEvent(ev.name, ev.data, ev.log, ev.noFire);
                        });

                        return Utils.objectLength(events);
                    }

                    if (!Array.isArray(events) && typeof events !== "string") {
                        return ;
                    }

                    _events = Array.isArray(events) ? events : events.toArray(",");

                    $.each(_events, function(){
                        that._fireEvent(this, data, log, noFire);
                    });
                },

                getComponent: function(){
                    return this.component;
                },

                getComponentName: function(){
                    return this.name;
                }
            }, compObj);

            Metro.plugin(name, component);

            return component;
        }
    };

    $(window).on(Metro.events.resize, function(){
        window.METRO_MEDIA = [];
        $.each(Metro.media_queries, function(key, query){
            if (Metro.utils.media(query)) {
                window.METRO_MEDIA.push(Metro.media_mode[key]);
            }
        });
    });

    window.Metro = Metro;

    if (window.METRO_INIT ===  true) {
        $(function(){
            Metro.init()
        });
    }

    return Metro;

}));



(function() {
    'use strict';

    if (typeof Array.shuffle !== "function") {
        Array.prototype.shuffle = function () {
            var currentIndex = this.length, temporaryValue, randomIndex;

            while (0 !== currentIndex) {

                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                temporaryValue = this[currentIndex];
                this[currentIndex] = this[randomIndex];
                this[randomIndex] = temporaryValue;
            }

            return this;
        };
    }

    if (typeof Array.clone !== "function") {
        Array.prototype.clone = function () {
            return this.slice(0);
        };
    }

    if (typeof Array.unique !== "function") {
        Array.prototype.unique = function () {
            var a = this.concat();
            for (var i = 0; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i] === a[j])
                        a.splice(j--, 1);
                }
            }

            return a;
        };
    }

    if (typeof Array.from !== "function") {
        Array.prototype.from = function(val) {
            var i, a = [];

            if (val.length === undefined && typeof val === "object") {
                return Object.values(val);
            }

            if (val.length !== undefined) {
                for(i = 0; i < val.length; i++) {
                    a.push(val[i]);
                }
                return a;
            }

            throw new Error("Value can not be converted to array");
        };
    }

    if (typeof Array.contains !== "function") {
        Array.prototype.contains = function(val, from){
            return this.indexOf(val, from) > -1;
        }
    }

    if (typeof Array.includes !== "function") {
        Array.prototype.includes = function(val, from){
            return this.indexOf(val, from) > -1;
        }
    }
}());


/* global Metro, METRO_WEEK_START */
(function(Metro) {
    'use strict';
    Date.prototype.getWeek = function (dowOffset) {
        var nYear, nday, newYear, day, daynum, weeknum;

        dowOffset = typeof dowOffset === "undefined" || isNaN(dowOffset) ? METRO_WEEK_START : typeof dowOffset === 'number' ? parseInt(dowOffset) : 0;
        newYear = new Date(this.getFullYear(),0,1);
        day = newYear.getDay() - dowOffset;
        day = (day >= 0 ? day : day + 7);
        daynum = Math.floor((this.getTime() - newYear.getTime() -
            (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;

        if(day < 4) {
            weeknum = Math.floor((daynum+day-1)/7) + 1;
            if(weeknum > 52) {
                nYear = new Date(this.getFullYear() + 1,0,1);
                nday = nYear.getDay() - dowOffset;
                nday = nday >= 0 ? nday : nday + 7;
                weeknum = nday < 4 ? 1 : 53;
            }
        }
        else {
            weeknum = Math.floor((daynum+day-1)/7);
        }
        return weeknum;
    };

    Date.prototype.getYear = function(){
        return this.getFullYear().toString().substr(-2);
    };

    Date.prototype.format = function(format, locale){

        if (locale === undefined) {
            locale = "en-US";
        }

        var cal = (Metro.locales !== undefined && Metro.locales[locale] !== undefined ? Metro.locales[locale] : Metro.locales["en-US"])['calendar'];

        var date = this;
        var nDay = date.getDay(),
            nDate = date.getDate(),
            nMonth = date.getMonth(),
            nYear = date.getFullYear(),
            nHour = date.getHours(),
            aDays = cal['days'],
            aMonths = cal['months'],
            aDayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
            isLeapYear = function() {
                return (nYear%4===0 && nYear%100!==0) || nYear%400===0;
            },
            getThursday = function() {
                var target = new Date(date);
                target.setDate(nDate - ((nDay+6)%7) + 3);
                return target;
            },
            zeroPad = function(nNum, nPad) {
                return ('' + (Math.pow(10, nPad) + nNum)).slice(1);
            };
        return format.replace(/(%[a-z])/gi, function(sMatch) {
            return {
                '%a': aDays[nDay].slice(0,3),
                '%A': aDays[nDay],
                '%b': aMonths[nMonth].slice(0,3),
                '%B': aMonths[nMonth],
                '%c': date.toUTCString(),
                '%C': Math.floor(nYear/100),
                '%d': zeroPad(nDate, 2),
                'dd': zeroPad(nDate, 2),
                '%e': nDate,
                '%F': date.toISOString().slice(0,10),
                '%G': getThursday().getFullYear(),
                '%g': ('' + getThursday().getFullYear()).slice(2),
                '%H': zeroPad(nHour, 2),
                // 'HH': zeroPad(nHour, 2),
                '%I': zeroPad((nHour+11)%12 + 1, 2),
                '%j': zeroPad(aDayCount[nMonth] + nDate + ((nMonth>1 && isLeapYear()) ? 1 : 0), 3),
                '%k': '' + nHour,
                '%l': (nHour+11)%12 + 1,
                '%m': zeroPad(nMonth + 1, 2),
                // 'mm': zeroPad(nMonth + 1, 2),
                '%M': zeroPad(date.getMinutes(), 2),
                // 'MM': zeroPad(date.getMinutes(), 2),
                '%p': (nHour<12) ? 'AM' : 'PM',
                '%P': (nHour<12) ? 'am' : 'pm',
                '%s': Math.round(date.getTime()/1000),
                // 'ss': Math.round(date.getTime()/1000),
                '%S': zeroPad(date.getSeconds(), 2),
                // 'SS': zeroPad(date.getSeconds(), 2),
                '%u': nDay || 7,
                '%V': (function() {
                    var target = getThursday(),
                        n1stThu = target.valueOf();
                    target.setMonth(0, 1);
                    var nJan1 = target.getDay();
                    if (nJan1!==4) target.setMonth(0, 1 + ((4-nJan1)+7)%7);
                    return zeroPad(1 + Math.ceil((n1stThu-target)/604800000), 2);
                })(),
                '%w': '' + nDay,
                '%x': date.toLocaleDateString(),
                '%X': date.toLocaleTimeString(),
                '%y': ('' + nYear).slice(2),
                // 'yy': ('' + nYear).slice(2),
                '%Y': nYear,
                // 'YYYY': nYear,
                '%z': date.toTimeString().replace(/.+GMT([+-]\d+).+/, '$1'),
                '%Z': date.toTimeString().replace(/.+\((.+?)\)$/, '$1')
            }[sMatch] || sMatch;
        });
    };

    Date.prototype.addHours = function(n) {
        this.setTime(this.getTime() + (n*60*60*1000));
        return this;
    };

    Date.prototype.addDays = function(n) {
        this.setDate(this.getDate() + (n));
        return this;
    };

    Date.prototype.addMonths = function(n) {
        this.setMonth(this.getMonth() + (n));
        return this;
    };

    Date.prototype.addYears = function(n) {
        this.setFullYear(this.getFullYear() + (n));
        return this;
    };
}(Metro));


(function() {
    'use strict';

    /**
     * Number.prototype.format(n, x, s, c)
     *
     * @param  n: length of decimal
     * @param  x: length of whole part
     * @param  s: sections delimiter
     * @param  c: decimal delimiter
     */
    Number.prototype.format = function(n, x, s, c) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = this.toFixed(Math.max(0, ~~n));

        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };
}());


(function() {
    'use strict';

    if ( typeof Object.create !== 'function' ) {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    if (typeof Object.values !== 'function') {
        Object.values = function(obj) {
            return Object.keys(obj).map(function(e) {
                return obj[e]
            });
        }
    }
}());


/* global Metro */
(function(Metro, $) {
    'use strict';

    String.prototype.camelCase = function(){
        return $.camelCase(this);
    };

    String.prototype.dashedName = function(){
        return $.dashedName(this);
    };

    String.prototype.shuffle = function(){
        var _shuffle = function (a) {
            var currentIndex = a.length, temporaryValue, randomIndex;

            while (0 !== currentIndex) {

                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                temporaryValue = a[currentIndex];
                a[currentIndex] = a[randomIndex];
                a[randomIndex] = temporaryValue;
            }

            return a;
        };

        return _shuffle(this.split("")).join("");
    }

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    String.prototype.contains = function() {
        return !!~String.prototype.indexOf.apply(this, arguments);
    };

    if (typeof String.includes !== "function") {
        String.prototype.includes = function(){
            return !!~String.prototype.indexOf.apply(this, arguments);
        }
    }

    String.prototype.toDate = function(format, locale) {
        var result;
        var normalized, normalizedFormat, formatItems, dateItems, checkValue;
        var monthIndex, dayIndex, yearIndex, hourIndex, minutesIndex, secondsIndex;
        var year, month, day, hour, minute, second;
        var parsedMonth;

        locale = locale || "en-US";

        var monthNameToNumber = function(month){
            var d, months, index, i;
            var Locales = Metro.locales;

            if (typeof month === "undefined" || month === null) {
                return -1;
            }

            month = month.substr(0, 3);

            if (
                locale !== undefined
                && locale !== "en-US"
                && Locales !== undefined
                && Locales[locale] !== undefined
                && Locales[locale]['calendar'] !== undefined
                && Locales[locale]['calendar']['months'] !== undefined
            ) {
                months = Locales[locale]['calendar']['months'];
                for(i = 12; i < months.length; i++) {
                    if (months[i].toLowerCase() === month.toLowerCase()) {
                        index = i - 12;
                        break;
                    }
                }
                month = Locales["en-US"]['calendar']['months'][index];
            }

            d = Date.parse(month + " 1, 1972");
            if(!isNaN(d)){
                return new Date(d).getMonth() + 1;
            }
            return -1;
        };

        if (format === undefined || format === null || format === "") {
            return new Date(this);
        }

        /* eslint-disable-next-line */
        normalized      = this.replace(/[\/,.:\s]/g, '-');
        /* eslint-disable-next-line */
        normalizedFormat= format.toLowerCase().replace(/[^a-zA-Z0-9%]/g, '-');
        formatItems     = normalizedFormat.split('-');
        dateItems       = normalized.split('-');
        checkValue      = normalized.replace(/-/g,"");

        if (checkValue.trim() === "") {
            return "Invalid Date";
        }

        monthIndex  = formatItems.indexOf("mm") > -1 ? formatItems.indexOf("mm") : formatItems.indexOf("%m");
        dayIndex    = formatItems.indexOf("dd") > -1 ? formatItems.indexOf("dd") : formatItems.indexOf("%d");
        yearIndex   = formatItems.indexOf("yyyy") > -1 ? formatItems.indexOf("yyyy") : formatItems.indexOf("yy") > -1 ? formatItems.indexOf("yy") : formatItems.indexOf("%y");
        hourIndex     = formatItems.indexOf("hh") > -1 ? formatItems.indexOf("hh") : formatItems.indexOf("%h");
        minutesIndex  = formatItems.indexOf("ii") > -1 ? formatItems.indexOf("ii") : formatItems.indexOf("mi") > -1 ? formatItems.indexOf("mi") : formatItems.indexOf("%i");
        secondsIndex  = formatItems.indexOf("ss") > -1 ? formatItems.indexOf("ss") : formatItems.indexOf("%s");

        if (monthIndex > -1 && dateItems[monthIndex] !== "") {
            if (isNaN(parseInt(dateItems[monthIndex]))) {
                dateItems[monthIndex] = monthNameToNumber(dateItems[monthIndex]);
                if (dateItems[monthIndex] === -1) {
                    return "Invalid Date";
                }
            } else {
                parsedMonth = parseInt(dateItems[monthIndex]);
                if (parsedMonth < 1 || parsedMonth > 12) {
                    return "Invalid Date";
                }
            }
        } else {
            return "Invalid Date";
        }

        year  = yearIndex >-1 && dateItems[yearIndex] !== "" ? dateItems[yearIndex] : null;
        month = monthIndex >-1 && dateItems[monthIndex] !== "" ? dateItems[monthIndex] : null;
        day   = dayIndex >-1 && dateItems[dayIndex] !== "" ? dateItems[dayIndex] : null;

        hour    = hourIndex >-1 && dateItems[hourIndex] !== "" ? dateItems[hourIndex] : null;
        minute  = minutesIndex>-1 && dateItems[minutesIndex] !== "" ? dateItems[minutesIndex] : null;
        second  = secondsIndex>-1 && dateItems[secondsIndex] !== "" ? dateItems[secondsIndex] : null;

        result = new Date(year,month-1,day,hour,minute,second);

        return result;
    };

    String.prototype.toArray = function(delimiter, type, format){
        var str = this;
        var a;

        type = type || "string";
        delimiter = delimiter || ",";
        format = format === undefined || format === null ? false : format;

        a = (""+str).split(delimiter);

        return a.map(function(s){
            var result;

            switch (type) {
                case "int":
                case "integer": result = isNaN(s) ? s.trim() : parseInt(s); break;
                case "number":
                case "float": result = isNaN(s) ? s : parseFloat(s); break;
                case "date": result = !format ? new Date(s) : s.toDate(format); break;
                default: result = s.trim();
            }

            return result;
        });
    };
}(Metro, m4q));


/* global jQuery, Metro */
(function(Metro, $) {
    'use strict';
    Metro.utils = {
        isVisible: function(element){
            var el = $(element)[0];
            return this.getStyleOne(el, "display") !== "none"
                && this.getStyleOne(el, "visibility") !== "hidden"
                && el.offsetParent !== null;
        },

        isUrl: function (val) {
            /* eslint-disable-next-line */
            return /^(\.\/|\.\.\/|ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-\/]))?/.test(val);
        },

        isTag: function(val){
            /* eslint-disable-next-line */
            return /^<\/?[\w\s="/.':;#-\/\?]+>/gi.test(val);
        },

        isEmbedObject: function(val){
            var embed = ["iframe", "object", "embed", "video"];
            var result = false;
            $.each(embed, function(){
                if (typeof val === "string" && val.toLowerCase() === this) {
                    result = true;
                } else if (val.nodeType !== undefined && val.tagName.toLowerCase() === this) {
                    result = true;
                }
            });
            return result;
        },

        isVideoUrl: function(val){
            return /youtu\.be|youtube|twitch|vimeo/gi.test(val);
        },

        isDate: function(val, format){
            var result;

            if (this.isDateObject(val)) {
                return true;
            }

            if (this.isValue(format)) {
                result = String(val).toDate(format);
            } else {
                result = String(new Date(val));
            }

            return result !== "Invalid Date";
        },

        isDateObject: function(v){
            return typeof v === 'object' && v.getMonth !== undefined;
        },

        isInt: function(n){
            return !isNaN(n) && +n % 1 === 0;
        },

        isFloat: function(n){
            return (!isNaN(n) && +n % 1 !== 0) || /^\d*\.\d+$/.test(n);
        },

        isFunc: function(f){
            return this.isType(f, 'function');
        },

        isObject: function(o){
            return this.isType(o, 'object');
        },

        isType: function(o, t){
            if (!this.isValue(o)) {
                return false;
            }

            if (typeof o === t) {
                return o;
            }

            if ((""+t).toLowerCase() === 'tag' && this.isTag(o)) {
                return o;
            }

            if ((""+t).toLowerCase() === 'url' && this.isUrl(o)) {
                return o;
            }

            if ((""+t).toLowerCase() === 'array' && Array.isArray(o)) {
                return o;
            }

            if (this.isTag(o) || this.isUrl(o)) {
                return false;
            }

            if (typeof window[o] === t) {
                return window[o];
            }

            if (typeof o === 'string' && o.indexOf(".") === -1) {
                return false;
            }

            if (typeof o === 'string' && /[/\s([]+/gm.test(o)) {
                return false;
            }

            if (typeof o === "number" && t.toLowerCase() !== "number") {
                return false;
            }

            var ns = o.split(".");
            var i, context = window;

            for(i = 0; i < ns.length; i++) {
                context = context[ns[i]];
            }

            return typeof context === t ? context : false;
        },

        $: function(){
            return window.useJQuery ? jQuery : m4q;
        },

        isMetroObject: function(el, type){
            var $el = $(el), el_obj = Metro.getPlugin(el, type);

            if ($el.length === 0) {
                console.warn(type + ' ' + el + ' not found!');
                return false;
            }

            if (el_obj === undefined) {
                console.warn('Element not contain role '+ type +'! Please add attribute data-role="'+type+'" to element ' + el);
                return false;
            }

            return true;
        },

        isJQuery: function(el){
            return (typeof jQuery !== "undefined" && el instanceof jQuery);
        },

        isM4Q: function(el){
            return (typeof m4q !== "undefined" && el instanceof m4q);
        },

        isQ: function(el){
            return this.isJQuery(el) || this.isM4Q(el);
        },

        isIE11: function(){
            return !!window.MSInputMethodContext && !!document["documentMode"];
        },

        embedUrl: function(val){
            if (val.indexOf("youtu.be") !== -1) {
                val = "https://www.youtube.com/embed/" + val.split("/").pop();
            }
            return "<div class='embed-container'><iframe src='"+val+"'></iframe></div>";
        },

        elementId: function(prefix){
            return prefix+"-"+(new Date()).getTime()+$.random(1, 1000);
        },

        secondsToTime: function(secs) {
            var hours = Math.floor(secs / (60 * 60));

            var divisor_for_minutes = secs % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);

            var divisor_for_seconds = divisor_for_minutes % 60;
            var seconds = Math.ceil(divisor_for_seconds);

            return {
                "h": hours,
                "m": minutes,
                "s": seconds
            };
        },

        secondsToFormattedString: function(time){
            var sec_num = parseInt(time, 10);
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}

            return [hours, minutes, seconds].join(":");
        },

        func: function(f){
            /* jshint -W054 */
            return new Function("a", f);
        },

        exec: function(f, args, context){
            var result;
            if (f === undefined || f === null) {return false;}
            var func = this.isFunc(f);

            if (func === false) {
                func = this.func(f);
            }

            try {
                result = func.apply(context, args);
            } catch (err) {
                result = null;
                if (window.METRO_THROWS === true) {
                    throw err;
                }
            }
            return result;
        },

        isOutsider: function(element) {
            var el = $(element);
            var inViewport;
            var clone = el.clone();

            clone.removeAttr("data-role").css({
                visibility: "hidden",
                position: "absolute",
                display: "block"
            });
            el.parent().append(clone);

            inViewport = this.inViewport(clone[0]);

            clone.remove();

            return !inViewport;
        },

        inViewport: function(el){
            var rect = this.rect(el);

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        rect: function(el){
            return el.getBoundingClientRect();
        },

        getCursorPosition: function(el, e){
            var a = this.rect(el);
            return {
                x: this.pageXY(e).x - a.left - window.pageXOffset,
                y: this.pageXY(e).y - a.top - window.pageYOffset
            };
        },

        getCursorPositionX: function(el, e){
            return this.getCursorPosition(el, e).x;
        },

        getCursorPositionY: function(el, e){
            return this.getCursorPosition(el, e).y;
        },

        objectLength: function(obj){
            return Object.keys(obj).length;
        },

        percent: function(total, part, round_value){
            if (total === 0) {
                return 0;
            }
            var result = part * 100 / total;
            return round_value === true ? Math.round(result) : Math.round(result * 100) / 100;
        },

        objectShift: function(obj){
            var min = 0;
            $.each(obj, function(i){
                if (min === 0) {
                    min = i;
                } else {
                    if (min > i) {
                        min = i;
                    }
                }
            });
            delete obj[min];

            return obj;
        },

        objectDelete: function(obj, key){
            if (obj[key] !== undefined) delete obj[key];
        },

        arrayDeleteByMultipleKeys: function(arr, keys){
            keys.forEach(function(ind){
                delete arr[ind];
            });
            return arr.filter(function(item){
                return item !== undefined;
            });
        },

        arrayDelete: function(arr, val){
            if (arr.indexOf(val) > -1) arr.splice(arr.indexOf(val), 1);
        },

        arrayDeleteByKey: function(arr, key){
            arr.splice(key, 1);
        },

        nvl: function(data, other){
            return data === undefined || data === null ? other : data;
        },

        objectClone: function(obj){
            var copy = {};
            for(var key in obj) {
                if ($.hasProp(obj, key)) {
                    copy[key] = obj[key];
                }
            }
            return copy;
        },

        github: function(repo, callback){
            var that = this;
            $.json('https://api.github.com/repos/' + repo).then(function(data){
                that.exec(callback, [data]);
            });
        },

        detectIE: function() {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        },

        detectChrome: function(){
            return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        },

        encodeURI: function(str){
            return encodeURI(str).replace(/%5B/g, '[').replace(/%5D/g, ']');
        },

        pageHeight: function(){
            var body = document.body,
                html = document.documentElement;

            return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
        },

        cleanPreCode: function(selector){
            var els = Array.prototype.slice.call(document.querySelectorAll(selector), 0);

            els.forEach(function(el){
                var txt = el.textContent
                    .replace(/^[\r\n]+/, "")	// strip leading newline
                    .replace(/\s+$/g, "");

                if (/^\S/gm.test(txt)) {
                    el.textContent = txt;
                    return;
                }

                var mat, str, re = /^[\t ]+/gm, len, min = 1e3;

                /* jshint -W084 */
                /* eslint-disable-next-line */
                while (mat = re.exec(txt)) {
                    len = mat[0].length;

                    if (len < min) {
                        min = len;
                        str = mat[0];
                    }
                }

                if (min === 1e3)
                    return;

                el.textContent = txt.replace(new RegExp("^" + str, 'gm'), "").trim();
            });
        },

        coords: function(element){
            var el = $(element)[0];
            var box = el.getBoundingClientRect();

            return {
                top: box.top + window.pageYOffset,
                left: box.left + window.pageXOffset
            };
        },

        positionXY: function(e, t){
            switch (t) {
                case 'client': return this.clientXY(e);
                case 'screen': return this.screenXY(e);
                case 'page': return this.pageXY(e);
                default: return {x: 0, y: 0};
            }
        },

        /**
         *
         * @param {TouchEvent|Event|MouseEvent} e
         * @returns {{x: (*), y: (*)}}
         */
        clientXY: function(e){
            return {
                x: e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
                y: e.changedTouches ? e.changedTouches[0].clientY : e.clientY
            };
        },

        /**
         *
         * @param {TouchEvent|Event|MouseEvent} e
         * @returns {{x: (*), y: (*)}}
         */
        screenXY: function(e){
            return {
                x: e.changedTouches ? e.changedTouches[0].screenX : e.screenX,
                y: e.changedTouches ? e.changedTouches[0].screenY : e.screenY
            };
        },

        /**
         *
         * @param {TouchEvent|Event|MouseEvent} e
         * @returns {{x: (*), y: (*)}}
         */
        pageXY: function(e){
            return {
                x: e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
                y: e.changedTouches ? e.changedTouches[0].pageY : e.pageY
            };
        },

        isRightMouse: function(e){
            return "which" in e ? e.which === 3 : "button" in e ? e.button === 2 : undefined;
        },

        hiddenElementSize: function(el, includeMargin){
            var width, height, clone = $(el).clone(true);

            clone.removeAttr("data-role").css({
                visibility: "hidden",
                position: "absolute",
                display: "block"
            });
            $("body").append(clone);

            if (!this.isValue(includeMargin)) {
                includeMargin = false;
            }

            width = clone.outerWidth(includeMargin);
            height = clone.outerHeight(includeMargin);
            clone.remove();
            return {
                width: width,
                height: height
            };
        },

        getStyle: function(element, pseudo){
            var el = $(element)[0];
            return window.getComputedStyle(el, pseudo);
        },

        getStyleOne: function(el, property){
            return this.getStyle(el).getPropertyValue(property);
        },

        getInlineStyles: function(element){
            var i, l, styles = {}, el = $(element)[0];
            for (i = 0, l = el.style.length; i < l; i++) {
                var s = el.style[i];
                styles[s] = el.style[s];
            }

            return styles;
        },

        updateURIParameter: function(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            }
            else {
                return uri + separator + key + "=" + value;
            }
        },

        getURIParameter: function(url, name){
            if (!url) url = window.location.href;
            /* eslint-disable-next-line */
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },

        getLocales: function(){
            return Object.keys(Metro.locales);
        },

        addLocale: function(locale){
            Metro.locales = $.extend( {}, Metro.locales, locale );
        },

        aspectRatioH: function(width, a){
            if (a === "16/9") return width * 9 / 16;
            if (a === "21/9") return width * 9 / 21;
            if (a === "4/3") return width * 3 / 4;
        },

        aspectRatioW: function(height, a){
            if (a === "16/9") return height * 16 / 9;
            if (a === "21/9") return height * 21 / 9;
            if (a === "4/3") return height * 4 / 3;
        },

        valueInObject: function(obj, value){
            return Object.values(obj).indexOf(value) > -1;
        },

        keyInObject: function(obj, key){
            return Object.keys(obj).indexOf(key) > -1;
        },

        inObject: function(obj, key, val){
            return obj[key] !== undefined && obj[key] === val;
        },

        newCssSheet: function(media){
            var style = document.createElement("style");

            if (media !== undefined) {
                style.setAttribute("media", media);
            }

            style.appendChild(document.createTextNode(""));

            document.head.appendChild(style);

            return style.sheet;
        },

        addCssRule: function(sheet, selector, rules, index){
            if("insertRule" in sheet) {
                sheet.insertRule(selector + "{" + rules + "}", index);
            }
            else if("addRule" in sheet) {
                sheet.addRule(selector, rules, index);
            }
        },

        media: function(query){
            return window.matchMedia(query).matches;
        },

        mediaModes: function(){
            return window.METRO_MEDIA;
        },

        mediaExist: function(media){
            return window.METRO_MEDIA.indexOf(media) > -1;
        },

        inMedia: function(media){
            return window.METRO_MEDIA.indexOf(media) > -1 && window.METRO_MEDIA.indexOf(media) === window.METRO_MEDIA.length - 1;
        },

        isValue: function(val){
            return val !== undefined && val !== null && val !== "";
        },

        isNull: function(val){
            return val === undefined || val === null;
        },

        isNegative: function(val){
            return parseFloat(val) < 0;
        },

        isPositive: function(val){
            return parseFloat(val) > 0;
        },

        isZero: function(val){
            return (parseFloat(val.toFixed(2))) === 0.00;
        },

        between: function(val, bottom, top, equals){
            return equals === true ? val >= bottom && val <= top : val > bottom && val < top;
        },

        parseMoney: function(val){
            return Number(parseFloat(val.replace(/[^0-9-.]/g, '')));
        },

        parseCard: function(val){
            return val.replace(/[^0-9]/g, '');
        },

        parsePhone: function(val){
            return this.parseCard(val);
        },

        parseNumber: function(val, thousand, decimal){
            return val.replace(new RegExp('\\'+thousand, "g"), "").replace(new RegExp('\\'+decimal, 'g'), ".");
        },

        nearest: function(val, precision, down){
            val /= precision;
            val = Math[down === true ? 'floor' : 'ceil'](val) * precision;
            return val;
        },

        bool: function(value){
            switch(value){
                case true:
                case "true":
                case 1:
                case "1":
                case "on":
                case "yes":
                    return true;
                default:
                    return false;
            }
        },

        copy: function(element){
            var body = document.body, range, sel;
            var el = $(element)[0];

            if (document.createRange && window.getSelection) {
                range = document.createRange();
                sel = window.getSelection();
                sel.removeAllRanges();
                try {
                    range.selectNodeContents(el);
                    sel.addRange(range);
                } catch (e) {
                    range.selectNode(el);
                    sel.addRange(range);
                }
            } else if (body["createTextRange"]) {
                range = body["createTextRange"]();
                range["moveToElementText"](el);
                range.select();
            }

            document.execCommand("Copy");

            if (window.getSelection) {
                if (window.getSelection().empty) {  // Chrome
                    window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) {  // Firefox
                    window.getSelection().removeAllRanges();
                }
            } else if (document["selection"]) {  // IE?
                document["selection"].empty();
            }
        },

        decCount: function(v){
            return v % 1 === 0 ? 0 : v.toString().split(".")[1].length;
        },

        /**
         * Add symbols to string on the left side
         * @param str Where
         * @param pad what
         * @param length to length
         */
        lpad: function(str, pad, length){
            var _str = ""+str;
            if (length && _str.length >= length) {
                return _str;
            }
            return Array((length + 1) - _str.length).join(pad) + _str;
        },

        rpad: function(str, pad, length){
            var _str = ""+str;
            if (length && _str.length >= length) {
                return _str;
            }
            return _str + Array((length + 1) - _str.length).join(pad);
        }
    };

    if (window.METRO_GLOBAL_COMMON === true) {
        window.Utils = Metro.utils;
    }
}(Metro, m4q));


/* global Metro */
(function(Metro, $) {
    $.extend(Metro.locales, {
        'en-US': {
            "calendar": {
                "months": [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ],
                "days": [
                    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
                    "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa",
                    "Sun", "Mon", "Tus", "Wen", "Thu", "Fri", "Sat"
                ],
                "time": {
                    "days": "DAYS",
                    "hours": "HOURS",
                    "minutes": "MINS",
                    "seconds": "SECS",
                    "month": "MON",
                    "day": "DAY",
                    "year": "YEAR"
                }
            },
            "buttons": {
                "ok": "OK",
                "cancel": "Cancel",
                "done": "Done",
                "today": "Today",
                "now": "Now",
                "clear": "Clear",
                "help": "Help",
                "yes": "Yes",
                "no": "No",
                "random": "Random",
                "save": "Save",
                "reset": "Reset"
            },
            "table": {
                "rowsCount": "Show entries:",
                "search": "Search:",
                "info": "Showing $1 to $2 of $3 entries",
                "prev": "Prev",
                "next": "Next",
                "all": "All",
                "inspector": "Inspector",
                "skip": "Goto page",
                "empty": "Nothing to show"
            },
            "colorSelector": {
                addUserColorButton: "ADD TO SWATCHES",
                userColorsTitle: "USER COLORS"
            }
        }
    });
}(Metro, m4q));


/* global Metro */
(function(Metro, $) {
    'use strict';

    var Utils = Metro.utils;
    var ValidatorFuncs = {
        required: function(val){
            if (Array.isArray(val)) {
                return val.length > 0 ? val : false;
            } else {
                return Utils.isValue(val) ? val.trim() : false;
            }
        },
        length: function(val, len){
            if (Array.isArray(val)) {return val.length === parseInt(len);}
            if (!Utils.isValue(len) || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length === parseInt(len);
        },
        minlength: function(val, len){
            if (Array.isArray(val)) {return val.length >= parseInt(len);}
            if (!Utils.isValue(len) || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length >= parseInt(len);
        },
        maxlength: function(val, len){
            if (Array.isArray(val)) {return val.length <= parseInt(len);}
            if (!Utils.isValue(len) || isNaN(len) || len <= 0) {
                return false;
            }
            return val.trim().length <= parseInt(len);
        },
        min: function(val, min_value){
            if (!Utils.isValue(min_value) || isNaN(min_value)) {
                return false;
            }
            if (!this.number(val)) {
                return false;
            }
            if (isNaN(val)) {
                return false;
            }
            return Number(val) >= Number(min_value);
        },
        max: function(val, max_value){
            if (!Utils.isValue(max_value) || isNaN(max_value)) {
                return false;
            }
            if (!this.number(val)) {
                return false;
            }
            if (isNaN(val)) {
                return false;
            }
            return Number(val) <= Number(max_value);
        },
        email: function(val){
            /* eslint-disable-next-line */
            return /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(val);
        },
        domain: function(val){
            /* eslint-disable-next-line */
            return /^((xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(val);
        },
        url: function(val){
            /* eslint-disable-next-line */
            var regexp    = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
            return regexp.test(val);
        },
        date: function(val, format, locale){
            if (Utils.isNull(format)) {
                return String(new Date(val)).toLowerCase() !== "invalid date";
            } else {
                return String(val.toDate(format, locale)).toLowerCase() !== "invalid date";
            }
        },
        number: function(val){
            return !isNaN(val);
        },
        integer: function(val){
            return Utils.isInt(val);
        },
        float: function(val){
            return Utils.isFloat(val);
        },
        digits: function(val){
            return /^\d+$/.test(val);
        },
        hexcolor: function(val){
            /* eslint-disable-next-line */
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(val);
        },
        color: function(val){
            if (!Utils.isValue(val)) return false;
            return Metro.colors.color(val, Metro.colors.PALETTES.STANDARD) !== false || Metro.colors.isColor(Metro.colors.parse(val));
        },
        pattern: function(val, pat){
            if (!Utils.isValue(val)) return false;
            if (!Utils.isValue(pat)) return false;
            var reg = new RegExp(pat);
            return reg.test(val);
        },
        compare: function(val, val2){
            return val === val2;
        },
        not: function(val, not_this){
            return val !== not_this;
        },
        notequals: function(val, val2){
            if (Utils.isNull(val)) return false;
            if (Utils.isNull(val2)) return false;
            return val.trim() !== val2.trim();
        },
        equals: function(val, val2){
            if (Utils.isNull(val)) return false;
            if (Utils.isNull(val2)) return false;
            return val.trim() === val2.trim();
        },
        custom: function(val, func){
            if (Utils.isFunc(func) === false) {
                return false;
            }
            return Utils.exec(func, [val]);
        },

        is_control: function(el){
            return el.parent().hasClass("input")
                || el.parent().hasClass("select")
                || el.parent().hasClass("textarea")
                || el.parent().hasClass("checkbox")
                || el.parent().hasClass("switch")
                || el.parent().hasClass("radio")
                || el.parent().hasClass("spinner")
                ;
        },

        reset_state: function(el){
            var input = $(el);
            var is_control = ValidatorFuncs.is_control(input);

            if (is_control) {
                input.parent().removeClass("invalid valid");
            } else {
                input.removeClass("invalid valid");
            }
        },

        set_valid_state: function(el){
            var input = $(el);
            var is_control = ValidatorFuncs.is_control(input);

            if (is_control) {
                input.parent().addClass("valid");
            } else {
                input.addClass("valid");
            }
        },

        set_invalid_state: function(el){
            var input = $(el);
            var is_control = ValidatorFuncs.is_control(input);

            if (is_control) {
                input.parent().addClass("invalid");
            } else {
                input.addClass("invalid");
            }
        },

        reset: function(form){
            var that = this;
            $.each($(form).find("[data-validate]"), function(){
                that.reset_state(this);
            });

            return this;
        },

        validate: function(el, result, cb_ok, cb_error, required_mode){
            var this_result = true;
            var input = $(el);
            var funcs = input.data('validate') !== undefined ? String(input.data('validate')).split(" ").map(function(s){return s.trim();}) : [];
            var errors = [];
            var hasForm = input.closest('form').length > 0;
            var attr_name, radio_checked;

            if (funcs.length === 0) {
                return true;
            }

            this.reset_state(input);

            if (input.attr('type') && input.attr('type').toLowerCase() === "checkbox") {
                if (funcs.indexOf('required') === -1) {
                    this_result = true;
                } else {
                    this_result = input.is(":checked");
                }

                if (this_result === false) {
                    errors.push('required');
                }

                if (result !== undefined) {
                    result.val += this_result ? 0 : 1;
                }
            } else if (input.attr('type') && input.attr('type').toLowerCase() === "radio") {
                attr_name = input.attr('name');
                if (typeof attr_name  === undefined) {
                    this_result = true;
                } else {
                    /*
                    * Fix with escaped name by nlared https://github.com/nlared
                    * */
                    radio_checked = $("input[name=" + attr_name.replace("[", "\\\[").replace("]", "\\\]") + "]:checked"); // eslint-disable-line
                    this_result = radio_checked.length > 0;
                }
                if (result !== undefined) {
                    result.val += this_result ? 0 : 1;
                }
            } else {
                $.each(funcs, function(){
                    if (this_result === false) return;
                    var rule = this.split("=");
                    var f, a, b;

                    f = rule[0]; rule.shift();
                    a = rule.join("=");

                    if (['compare', 'equals', 'notequals'].indexOf(f) > -1) {
                        a = hasForm ? input[0].form.elements[a].value : $("[name="+a+"]").val();
                    }

                    if (f === 'date') {
                        a = input.attr("data-value-format");
                        b = input.attr("data-value-locale");
                    }

                    if (Utils.isFunc(ValidatorFuncs[f]) === false)  {
                        this_result = true;
                    } else {
                        if (required_mode === true || f === "required") {
                            this_result = ValidatorFuncs[f](input.val(), a, b);
                        } else {
                            if (input.val().trim() !== "") {
                                this_result = ValidatorFuncs[f](input.val(), a, b);
                            } else {
                                this_result = true;
                            }
                        }
                    }

                    if (this_result === false) {
                        errors.push(f);
                    }

                    if (result !== undefined) {
                        result.val += this_result ? 0 : 1;
                    }
                });
            }

            if (this_result === false) {
                this.set_invalid_state(input);

                if (result !== undefined) {
                    result.log.push({
                        input: input[0],
                        name: input.attr("name"),
                        value: input.val(),
                        funcs: funcs,
                        errors: errors
                    });
                }

                if (cb_error !== undefined) Utils.exec(cb_error, [input, input.val()], input[0]);

            } else {
                this.set_valid_state(input);

                if (cb_ok !== undefined) Utils.exec(cb_ok, [input, input.val()], input[0]);
            }

            return this_result;
        }
    };

    Metro['validator'] = ValidatorFuncs;

    var ValidatorDefaultConfig = {
        validatorDeferred: 0,
        submitTimeout: 200,
        interactiveCheck: false,
        clearInvalid: 0,
        requiredMode: true,
        useRequiredClass: true,
        onBeforeSubmit: Metro.noop_true,
        onSubmit: Metro.noop,
        onError: Metro.noop,
        onValidate: Metro.noop,
        onErrorForm: Metro.noop,
        onValidateForm: Metro.noop,
        onValidatorCreate: Metro.noop
    };

    Metro.validatorSetup = function (options) {
        ValidatorDefaultConfig = $.extend({}, ValidatorDefaultConfig, options);
    };

    if (typeof window["metroValidatorSetup"] !== undefined) {
        Metro.validatorSetup(window["metroValidatorSetup"]);
    }

    Metro.Component('validator', {
        name: "Validator",

        init: function( options, elem ) {
            this._super(elem, options, ValidatorDefaultConfig, {
                _onsubmit: null,
                _onreset: null,
                result: []
            });

            return this;
        },

        _create: function(){
            var that = this, element = this.element, o = this.options;
            var inputs = element.find("[data-validate]");

            element
                .attr("novalidate", 'novalidate');

            $.each(inputs, function(){
                var input = $(this);
                var funcs = input.data("validate");
                var required = funcs.indexOf("required") > -1;
                if (required && o.useRequiredClass === true) {
                    if (ValidatorFuncs.is_control(input)) {
                        input.parent().addClass("required");
                    } else {
                        input.addClass("required");
                    }
                }
                if (o.interactiveCheck === true) {
                    input.on(Metro.events.inputchange, function () {
                        ValidatorFuncs.validate(this, undefined, undefined, undefined, o.requiredMode);
                    });
                }
            });

            this._onsubmit = null;
            this._onreset = null;

            if (element[0].onsubmit !== null) {
                this._onsubmit = element[0].onsubmit;
                element[0].onsubmit = null;
            }

            if (element[0].onreset !== null) {
                this._onreset = element[0].onreset;
                element[0].onreset = null;
            }

            element[0].onsubmit = function(){
                return that._submit();
            };

            element[0].onreset = function(){
                return that._reset();
            };

            this._fireEvent("validator-create", {
                element: element
            });
        },

        _reset: function(){
            ValidatorFuncs.reset(this.element);
            if (this._onsubmit !==  null) Utils.exec(this._onsubmit, null, this.element[0]);
        },

        _submit: function(){
            var that = this, element = this.element, o = this.options;
            var form = this.elem;
            var inputs = element.find("[data-validate]");
            var submit = element.find("input[type=submit], button[type=submit]");
            var result = {
                val: 0,
                log: []
            };
            var formData = $.serializeToArray(element);

            if (submit.length > 0) {
                submit.attr('disabled', 'disabled').addClass('disabled');
            }

            $.each(inputs, function(){
                ValidatorFuncs.validate(this, result, o.onValidate, o.onError, o.requiredMode);
            });

            submit.removeAttr("disabled").removeClass("disabled");

            result.val += Utils.exec(o.onBeforeSubmit, [formData], this.elem) === false ? 1 : 0;

            if (result.val === 0) {

                this._fireEvent("validate-form", {
                    data: formData
                });

                setTimeout(function(){
                    // TODO need fix event name to equivalent
                    Utils.exec(o.onSubmit, [formData], form);
                    element.fire("formsubmit", {
                        data: formData
                    });
                    if (that._onsubmit !==  null) Utils.exec(that._onsubmit, null, form);
                }, o.submitTimeout);
            } else {

                this._fireEvent("error-form", {
                    log: result.log,
                    data: formData
                });

                if (o.clearInvalid > 0) {
                    setTimeout(function(){
                        $.each(inputs, function(){
                            var inp  = $(this);
                            if (ValidatorFuncs.is_control(inp)) {
                                inp.parent().removeClass("invalid");
                            } else {
                                inp.removeClass("invalid");
                            }
                        })
                    }, o.clearInvalid);
                }
            }

            return result.val === 0;
        },

        changeAttribute: function(){
        }
    });
}(Metro, m4q));


/* global Metro */
(function(Metro, $) {
    'use strict';
    var Utils = Metro.utils;
    var MaterialTabsDefaultConfig = {
        materialtabsDeferred: 0,
        deep: false,
        fixedTabs: false,
        duration: 300,
        appBar: false,

        clsComponent: "",
        clsTabs: "",
        clsTab: "",
        clsTabActive: "",
        clsMarker: "",

        onBeforeTabOpen: Metro.noop_true,
        onTabOpen: Metro.noop,
        onTabsScroll: Metro.noop,
        onTabsCreate: Metro.noop
    };

    Metro.materialTabsSetup = function (options) {
        MaterialTabsDefaultConfig = $.extend({}, MaterialTabsDefaultConfig, options);
    };

    if (typeof window["metroMaterialTabsSetup"] !== undefined) {
        Metro.materialTabsSetup(window["metroMaterialTabsSetup"]);
    }

    Metro.Component('material-tabs', {
        init: function( options, elem ) {
            this._super(elem, options, MaterialTabsDefaultConfig, {
                marker: null,
                scroll: 0,
                scrollDir: "left"
            });

            return this;
        },

        _create: function(){
            var element = this.element;

            this._createStructure();
            this._createEvents();

            this._fireEvent("tabs-create", {
                element: element
            });
        },

        _createStructure: function(){
            var element = this.element, o = this.options;
            var tabs = element.find("li"), active_tab = element.find("li.active");
            var wrapper = $("<div>").addClass("tabs-material-wrapper").addClass(o.clsComponent).insertBefore(element);

            if (o.appBar === true) {
                wrapper.addClass("app-bar-present");
            }
            if (o.appBar === "more") {
                wrapper.addClass("app-bar-present-more");
            }

            element.appendTo(wrapper);
            element.addClass("tabs-material").addClass(o.clsTabs);
            tabs.addClass(o.clsTab);

            if (o.deep === true) {
                element.addClass("deep");
            }

            if (o.fixedTabs === true) {
                element.addClass("fixed-tabs");
            }

            this.marker = element.find(".tab-marker");

            if (this.marker.length === 0) {
                this.marker = $("<span>").addClass("tab-marker").addClass(o.clsMarker).appendTo(element);
            }

            this.openTab(active_tab.length === 0 ? tabs[0] : active_tab[0]);
        },

        _createEvents: function(){
            var that = this, element = this.element, o = this.options;

            element.on(Metro.events.click, "li", function(e){
                var tab = $(this);
                var active_tab = element.find("li.active");
                var tab_next = tab.index() > active_tab.index();
                var target = tab.children("a").attr("href");

                if (Utils.isValue(target) && target[0] === "#") {
                    if (tab.hasClass("active")) return;
                    if (tab.hasClass("disabled")) return;
                    if (Utils.exec(o.onBeforeTabOpen, [tab, target, tab_next], this) === false) return;
                    that.openTab(tab, tab_next);
                    e.preventDefault();
                }
            });

            element.on(Metro.events.scroll, function(){
                var oldScroll = that.scroll;

                that.scrollDir = that.scroll < element[0].scrollLeft ? "left" : "right";
                that.scroll = element[0].scrollLeft;

                that._fireEvent("tabs-scroll", {
                    scrollLeft: element[0].scrollLeft,
                    oldScroll: oldScroll,
                    scrollDir: that.scrollDir
                });

            });
        },

        openTab: function(tab, tab_next){
            var element = this.element, o = this.options;
            var tabs = element.find("li");
            var magic = 52, shift, width, tab_width, target, tab_left, scroll, scrollLeft;

            tab = $(tab);

            $.each(tabs, function(){
                var target = $(this).find("a").attr("href");
                if (!Utils.isValue(target)) return;
                if (target[0] === "#" && target.length > 1) {
                    $(target).hide();
                }
            });

            width = element.width();
            scroll = element.scrollLeft();
            tab_left = tab.position().left;
            tab_width = tab.width();
            shift = tab_left + tab_width;

            tabs.removeClass("active").removeClass(o.clsTabActive);
            tab.addClass("active").addClass(o.clsTabActive);

            if (shift + magic > width + scroll) {
                scrollLeft = scroll + (magic * 2);
            } else if (tab_left < scroll) {
                scrollLeft = tab_left - magic * 2;
            } else {
                scrollLeft = scroll;
            }

            element.animate({
                draw: {
                    scrollLeft: scrollLeft
                },
                dur: o.duration
            });

            this.marker.animate({
                draw: {
                    left: tab_left,
                    width: tab_width
                },
                dur: o.duration
            });

            target = tab.find("a").attr("href");
            if (Utils.isValue(target)) {
                if (target[0] === "#" && target.length > 1) {
                    $(target).show();
                }
            }

            this._fireEvent("tab-open", {
                tab: tab[0],
                target: target,
                tab_next: tab_next
            });
        },

        open: function(tab_num){
            var element = this.element;
            var tabs = element.find("li");
            var active_tab = element.find("li.active");
            var tab = tabs.eq(tab_num - 1);
            var tab_next = tabs.index(tab) > tabs.index(active_tab);
            this.openTab(tab, tab_next);
        },

        changeAttribute: function(){
        },

        destroy: function(){
            var element = this.element;

            element.off(Metro.events.click, "li");
            element.off(Metro.events.scroll);

            return element;
        }
    });
}(Metro, m4q));


/* global Metro */
(function(Metro, $) {
    'use strict';
    var Utils = Metro.utils;
    var MaterialInputDefaultConfig = {
        materialinputDeferred: 0,
        label: "",
        informer: "",
        icon: "",

        permanentLabel: false,

        clsComponent: "",
        clsInput: "",
        clsLabel: "",
        clsInformer: "",
        clsIcon: "",
        clsLine: "",

        onInputCreate: Metro.noop
    };

    Metro.materialInputSetup = function (options) {
        MaterialInputDefaultConfig = $.extend({}, MaterialInputDefaultConfig, options);
    };

    if (typeof window["metroMaterialInputSetup"] !== undefined) {
        Metro.materialInputSetup(window["metroMaterialInputSetup"]);
    }

    Metro.Component('material-input', {
        init: function( options, elem ) {
            this._super(elem, options, MaterialInputDefaultConfig, {
                history: [],
                historyIndex: -1
            });

            return this;
        },

        _create: function(){
            var element = this.element;

            this._createStructure();
            this._createEvents();

            this._fireEvent("input-create", {
                element: element
            });
        },

        _createStructure: function(){
            var element = this.element, o = this.options;
            var container = $("<div>").addClass("input-material " + element[0].className);

            element[0].className = "";
            element.attr("autocomplete", "nope");

            if (element.attr("type") === undefined) {
                element.attr("type", "text");
            }

            container.insertBefore(element);
            element.appendTo(container);

            if (Utils.isValue(o.label)) {
                $("<span>").html(o.label).addClass("label").addClass(o.clsLabel).insertAfter(element);
            }
            if (Utils.isValue(o.informer)) {
                $("<span>").html(o.informer).addClass("informer").addClass(o.clsInformer).insertAfter(element);
            }
            if (Utils.isValue(o.icon)) {
                container.addClass("with-icon");
                $("<span>").html(o.icon).addClass("icon").addClass(o.clsIcon).insertAfter(element);
            }

            container.append($("<hr>").addClass(o.clsLine));

            if (o.permanentLabel === true) {
                container.addClass("permanent-label");
            }

            container.addClass(o.clsComponent);
            element.addClass(o.clsInput);

            if (element.is(":disabled")) {
                this.disable();
            } else {
                this.enable();
            }
        },

        _createEvents: function(){

        },

        clear: function(){
            this.element.val('');
        },

        disable: function(){
            this.element.data("disabled", true);
            this.element.parent().addClass("disabled");
        },

        enable: function(){
            this.element.data("disabled", false);
            this.element.parent().removeClass("disabled");
        },

        toggleState: function(){
            if (this.elem.disabled) {
                this.disable();
            } else {
                this.enable();
            }
        },

        changeAttribute: function(attributeName){
            if (attributeName === 'disabled') {
                this.toggleState();
            }
        },

        destroy: function(){
            return this.element;
        }
    });
}(Metro, m4q));


/* global Metro */
(function(Metro, $) {
    'use strict';
    var Types = {
        HEX: "hex",
        HEXA: "hexa",
        RGB: "rgb",
        RGBA: "rgba",
        HSV: "hsv",
        HSL: "hsl",
        HSLA: "hsla",
        CMYK: "cmyk",
        UNKNOWN: "unknown"
    };

    Metro.colorsSetup = function (options) {
        ColorsDefaultConfig = $.extend({}, ColorsDefaultConfig, options);
    };

    if (typeof window["metroColorsSetup"] !== undefined) {
        Metro.colorsSetup(window["metroColorsSetup"]);
    }

    var ColorsDefaultConfig = {
        angle: 30,
        resultType: 'hex',
        results: 6,
        baseLight: "#ffffff",
        baseDark: "self"
    };

    // function HEX(r, g, b) {
    //     this.r = r || "00";
    //     this.g = g || "00";
    //     this.b = b || "00";
    // }
    //
    // HEX.prototype.toString = function(){
    //     return "#" + [this.r, this.g, this.b].join("");
    // }

    // function dec2hex(d){
    //     return Math.round(parseFloat(d) * 255).toString(16);
    // }
    //
    // function hex2dec(h){
    //     return (parseInt(h, 16) / 255);
    // }

    function shift(h, angle){
        h += angle;
        while (h >= 360.0) h -= 360.0;
        while (h < 0.0) h += 360.0;
        return h;
    }

    function clamp(val){
        return Math.min(1, Math.max(0, val));
    }

    function RGB(r, g, b){
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
    }

    RGB.prototype.toString = function(){
        return "rgb(" + [this.r, this.g, this.b].join(", ") + ")";
    }

    function RGBA(r, g, b, a){
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
        this.a = a === 0 ? 0 : a || 1;
    }

    RGBA.prototype.toString = function(){
        return "rgba(" + [this.r, this.g, this.b, parseFloat(this.a).toFixed(2)].join(", ") + ")";
    }

    function HSV(h, s, v){
        this.h = h || 0;
        this.s = s || 0;
        this.v = v || 0;
    }

    HSV.prototype.toString2 = function(){
        return "hsv(" + [this.h, this.s, this.v].join(", ") + ")";
    }

    HSV.prototype.toString = function(){
        return "hsv(" + [Math.round(this.h), Math.round(this.s*100)+"%", Math.round(this.v*100)+"%"].join(", ") + ")";
    }

    function HSL(h, s, l){
        this.h = h || 0;
        this.s = s || 0;
        this.l = l || 0;
    }

    HSL.prototype.toString2 = function(){
        return "hsl(" + [this.h, this.s, this.l].join(", ") + ")";
    }

    HSL.prototype.toString = function(){
        return "hsl(" + [Math.round(this.h), Math.round(this.s*100)+"%", Math.round(this.l*100)+"%"].join(", ") + ")";
    }

    function HSLA(h, s, l, a){
        this.h = h || 0;
        this.s = s || 0;
        this.l = l || 0;
        this.a = a === 0 ? 0 : a || 1;
    }

    HSLA.prototype.toString2 = function(){
        return "hsla(" + [this.h, this.s, this.l, this.a].join(", ") + ")";
    }

    HSLA.prototype.toString = function(){
        return "hsla(" + [Math.round(this.h), Math.round(this.s*100)+"%", Math.round(this.l*100)+"%", parseFloat(this.a).toFixed(2)].join(", ") + ")";
    }

    function CMYK(c, m, y, k){
        this.c = c || 0;
        this.m = m || 0;
        this.y = y || 0;
        this.k = k || 0;
    }

    CMYK.prototype.toString = function(){
        return "cmyk(" + [this.c, this.m, this.y, this.k].join(", ") + ")";
    }

    var Colors = {

        PALETTES: {
            ALL: "all",
            METRO: "metro",
            STANDARD: "standard"
        },

        metro: {
            lime: '#a4c400',
            green: '#60a917',
            emerald: '#008a00',
            blue: '#00AFF0',
            teal: '#00aba9',
            cyan: '#1ba1e2',
            cobalt: '#0050ef',
            indigo: '#6a00ff',
            violet: '#aa00ff',
            pink: '#dc4fad',
            magenta: '#d80073',
            crimson: '#a20025',
            red: '#CE352C',
            orange: '#fa6800',
            amber: '#f0a30a',
            yellow: '#fff000',
            brown: '#825a2c',
            olive: '#6d8764',
            steel: '#647687',
            mauve: '#76608a',
            taupe: '#87794e'
        },

        standard: {
            aliceblue: "#f0f8ff",
            antiquewhite: "#faebd7",
            aqua: "#00ffff",
            aquamarine: "#7fffd4",
            azure: "#f0ffff",
            beige: "#f5f5dc",
            bisque: "#ffe4c4",
            black: "#000000",
            blanchedalmond: "#ffebcd",
            blue: "#0000ff",
            blueviolet: "#8a2be2",
            brown: "#a52a2a",
            burlywood: "#deb887",
            cadetblue: "#5f9ea0",
            chartreuse: "#7fff00",
            chocolate: "#d2691e",
            coral: "#ff7f50",
            cornflowerblue: "#6495ed",
            cornsilk: "#fff8dc",
            crimson: "#dc143c",
            cyan: "#00ffff",
            darkblue: "#00008b",
            darkcyan: "#008b8b",
            darkgoldenrod: "#b8860b",
            darkgray: "#a9a9a9",
            darkgreen: "#006400",
            darkkhaki: "#bdb76b",
            darkmagenta: "#8b008b",
            darkolivegreen: "#556b2f",
            darkorange: "#ff8c00",
            darkorchid: "#9932cc",
            darkred: "#8b0000",
            darksalmon: "#e9967a",
            darkseagreen: "#8fbc8f",
            darkslateblue: "#483d8b",
            darkslategray: "#2f4f4f",
            darkturquoise: "#00ced1",
            darkviolet: "#9400d3",
            deeppink: "#ff1493",
            deepskyblue: "#00bfff",
            dimgray: "#696969",
            dodgerblue: "#1e90ff",
            firebrick: "#b22222",
            floralwhite: "#fffaf0",
            forestgreen: "#228b22",
            fuchsia: "#ff00ff",
            gainsboro: "#DCDCDC",
            ghostwhite: "#F8F8FF",
            gold: "#ffd700",
            goldenrod: "#daa520",
            gray: "#808080",
            green: "#008000",
            greenyellow: "#adff2f",
            honeydew: "#f0fff0",
            hotpink: "#ff69b4",
            indianred: "#cd5c5c",
            indigo: "#4b0082",
            ivory: "#fffff0",
            khaki: "#f0e68c",
            lavender: "#e6e6fa",
            lavenderblush: "#fff0f5",
            lawngreen: "#7cfc00",
            lemonchiffon: "#fffacd",
            lightblue: "#add8e6",
            lightcoral: "#f08080",
            lightcyan: "#e0ffff",
            lightgoldenrodyellow: "#fafad2",
            lightgray: "#d3d3d3",
            lightgreen: "#90ee90",
            lightpink: "#ffb6c1",
            lightsalmon: "#ffa07a",
            lightseagreen: "#20b2aa",
            lightskyblue: "#87cefa",
            lightslategray: "#778899",
            lightsteelblue: "#b0c4de",
            lightyellow: "#ffffe0",
            lime: "#00ff00",
            limegreen: "#32dc32",
            linen: "#faf0e6",
            magenta: "#ff00ff",
            maroon: "#800000",
            mediumaquamarine: "#66cdaa",
            mediumblue: "#0000cd",
            mediumorchid: "#ba55d3",
            mediumpurple: "#9370db",
            mediumseagreen: "#3cb371",
            mediumslateblue: "#7b68ee",
            mediumspringgreen: "#00fa9a",
            mediumturquoise: "#48d1cc",
            mediumvioletred: "#c71585",
            midnightblue: "#191970",
            mintcream: "#f5fffa",
            mistyrose: "#ffe4e1",
            moccasin: "#ffe4b5",
            navajowhite: "#ffdead",
            navy: "#000080",
            oldlace: "#fdd5e6",
            olive: "#808000",
            olivedrab: "#6b8e23",
            orange: "#ffa500",
            orangered: "#ff4500",
            orchid: "#da70d6",
            palegoldenrod: "#eee8aa",
            palegreen: "#98fb98",
            paleturquoise: "#afeeee",
            palevioletred: "#db7093",
            papayawhip: "#ffefd5",
            peachpuff: "#ffdab9",
            peru: "#cd853f",
            pink: "#ffc0cb",
            plum: "#dda0dd",
            powderblue: "#b0e0e6",
            purple: "#800080",
            rebeccapurple: "#663399",
            red: "#ff0000",
            rosybrown: "#bc8f8f",
            royalblue: "#4169e1",
            saddlebrown: "#8b4513",
            salmon: "#fa8072",
            sandybrown: "#f4a460",
            seagreen: "#2e8b57",
            seashell: "#fff5ee",
            sienna: "#a0522d",
            silver: "#c0c0c0",
            slyblue: "#87ceeb",
            slateblue: "#6a5acd",
            slategray: "#708090",
            snow: "#fffafa",
            springgreen: "#00ff7f",
            steelblue: "#4682b4",
            tan: "#d2b48c",
            teal: "#008080",
            thistle: "#d8bfd8",
            tomato: "#ff6347",
            turquoise: "#40e0d0",
            violet: "#ee82ee",
            wheat: "#f5deb3",
            white: "#ffffff",
            whitesmoke: "#f5f5f5",
            yellow: "#ffff00",
            yellowgreen: "#9acd32"
        },

        all: {},

        init: function(){
            this.all = $.extend( {}, this.standard, this.metro );
            return this;
        },

        color: function(name, palette){
            palette = palette || this.PALETTES.ALL;
            return this[palette][name] !== undefined ? this[palette][name] : false;
        },

        palette: function(palette){
            palette = palette || this.PALETTES.ALL;
            return Object.keys(this[palette]);
        },

        expandHexColor: function(hex){
            if (typeof hex !== "string") {
                throw new Error("Value is not a string!");
            }
            if (hex[0] === "#" && hex.length === 4) {
                var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                return (
                    "#" +
                    hex.replace(shorthandRegex, function(m, r, g, b) {
                        return r + r + g + g + b + b;
                    })
                );
            }
            return hex[0] === "#" ? hex : "#" + hex;
        },

        colors: function(palette){
            palette = palette || this.PALETTES.ALL;
            return Object.values(this[palette]);
        },

        random: function(colorType, alpha){
            colorType = colorType || Types.HEX;
            alpha = typeof alpha !== "undefined" ? alpha : 1;

            var hex, r, g, b;

            r = $.random(0, 255);
            g = $.random(0, 255);
            b = $.random(0, 255);

            hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

            return colorType === "hex" ? hex : this.toColor(hex, colorType, alpha);
        },

        parse: function(color){
            var _color = color.toLowerCase().trim();

            var a = _color
                .replace(/[^%\d.,]/g, "")
                .split(",")
                .map(function(v) {
                    if (v.indexOf('%') > -1) {
                        v = ""+parseInt(v)/100;
                    }
                    return v.indexOf(".") > -1 ? parseFloat(v) : parseInt(v);
                });

            if (this.metro[_color]) {
                return this.expandHexColor(this.metro[_color]);
            }

            if (this.standard[_color]) {
                return this.expandHexColor(this.standard[_color]);
            }

            if (_color[0] === "#") {
                return this.expandHexColor(_color);
            }

            if (_color.indexOf("rgba") === 0 && a.length === 4) {
                return new RGBA(a[0], a[1], a[2], a[3]);
            }
            if (_color.indexOf("rgb") === 0 && a.length === 3) {
                return new RGB(a[0], a[1], a[2]);
            }
            if (_color.indexOf("cmyk") === 0 && a.length === 4) {
                return new CMYK(a[0], a[1], a[2], a[3]);
            }
            if (_color.indexOf("hsv") === 0 && a.length === 3) {
                return new HSV(a[0], a[1], a[2]);
            }
            if (_color.indexOf("hsla") === 0 && a.length === 4) {
                return new HSLA(a[0], a[1], a[2], a[3]);
            }
            if (_color.indexOf("hsl")  === 0 && a.length === 3) {
                return new HSL(a[0], a[1], a[2]);
            }
            return undefined;
        },

        createColor: function(colorType, from){
            colorType = colorType || "hex";
            from = from || "#000000";

            var baseColor;

            if (typeof from === "string") {
                baseColor = this.parse(from);
            }

            if (!this.isColor(baseColor)) {
                baseColor = "#000000";
            }

            return this.toColor(baseColor, colorType.toLowerCase());
        },

        isDark: function(color){
            if (!this.isColor(color)) return;
            var rgb = this.toRGB(color);
            var YIQ = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            return YIQ < 128;
        },

        isLight: function(color){
            return !this.isDark(color);
        },

        isHSV: function(color){
            return color instanceof HSV;
        },

        isHSL: function(color){
            return color instanceof HSL;
        },

        isHSLA: function(color){
            return color instanceof HSLA;
        },

        isRGB: function(color){
            return color instanceof RGB;
        },

        isRGBA: function(color){
            return color instanceof RGBA;
        },

        isCMYK: function(color){
            return color instanceof CMYK;
        },

        isHEX: function(color){
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
        },

        isColor: function(val){
            var color = typeof val === "string" ? this.parse(val) : val;

            return !color
                ? false
                : this.isHEX(color) ||
                  this.isRGB(color) ||
                  this.isRGBA(color) ||
                  this.isHSV(color) ||
                  this.isHSL(color) ||
                  this.isHSLA(color) ||
                  this.isCMYK(color);
        },

        check: function(color, type){
            var that = this, checkFor = typeof type === "string" ? [type] : type;
            var result = false;

            $.each(checkFor, function(){
                if (that["is"+this.toUpperCase()](color)) {
                    result = true;
                }
            });

            if (!result) {
                throw new Error("Value is not a " + type + " color type!");
            }
        },

        colorType: function(color){
            if (this.isHEX(color)) return Types.HEX;
            if (this.isRGB(color)) return Types.RGB;
            if (this.isRGBA(color)) return Types.RGBA;
            if (this.isHSV(color)) return Types.HSV;
            if (this.isHSL(color)) return Types.HSL;
            if (this.isHSLA(color)) return Types.HSLA;
            if (this.isCMYK(color)) return Types.CMYK;

            return Types.UNKNOWN;
        },

        equal: function(color1, color2){
            if (!this.isColor(color1) || !this.isColor(color2)) {
                return false;
            }

            return this.toHEX(color1) === this.toHEX(color2);
        },

        colorToString: function(color){
            return color.toString();
        },

        hex2rgb: function(color){
            if (typeof color !== "string") {
                throw new Error("Value is not a string!")
            }
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                this.expandHexColor(color)
            );
            var rgb = [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ];
            return result ? new RGB(rgb[0], rgb[1], rgb[2]) : null;
        },

        rgb2hex: function(color){
            this.check(color, "rgb");
            return (
                "#" +
                ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1)
            );
        },

        rgb2hsv: function(color){
            this.check(color, "rgb");
            var hsv = new HSV();
            var h, s, v;
            var r = color.r / 255,
                g = color.g / 255,
                b = color.b / 255;

            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var delta = max - min;

            v = max;

            if (max === 0) {
                s = 0;
            } else {
                s = 1 - min / max;
            }

            if (max === min) {
                h = 0;
            } else if (max === r && g >= b) {
                h = 60 * ((g - b) / delta);
            } else if (max === r && g < b) {
                h = 60 * ((g - b) / delta) + 360;
            } else if (max === g) {
                h = 60 * ((b - r) / delta) + 120;
            } else if (max === b) {
                h = 60 * ((r - g) / delta) + 240;
            } else {
                h = 0;
            }

            hsv.h = h;
            hsv.s = s;
            hsv.v = v;

            return hsv;
        },

        hsv2rgb: function(color){
            this.check(color, "hsv");
            var r, g, b;
            var h = color.h,
                s = color.s * 100,
                v = color.v * 100;
            var Hi = Math.floor(h / 60);
            var Vmin = ((100 - s) * v) / 100;
            var alpha = (v - Vmin) * ((h % 60) / 60);
            var Vinc = Vmin + alpha;
            var Vdec = v - alpha;

            switch (Hi) {
                case 0:
                    r = v;
                    g = Vinc;
                    b = Vmin;
                    break;
                case 1:
                    r = Vdec;
                    g = v;
                    b = Vmin;
                    break;
                case 2:
                    r = Vmin;
                    g = v;
                    b = Vinc;
                    break;
                case 3:
                    r = Vmin;
                    g = Vdec;
                    b = v;
                    break;
                case 4:
                    r = Vinc;
                    g = Vmin;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = Vmin;
                    b = Vdec;
                    break;
            }

            return new RGB(
                Math.round((r * 255) / 100),
                Math.round((g * 255) / 100),
                Math.round((b * 255) / 100)
            );
        },

        hsv2hex: function(color){
            this.check(color, "hsv");
            return this.rgb2hex(this.hsv2rgb(color));
        },

        hex2hsv: function(color){
            this.check(color, "hex");
            return this.rgb2hsv(this.hex2rgb(color));
        },

        rgb2cmyk: function(color){
            this.check(color, "rgb");
            var cmyk = new CMYK();

            var r = color.r / 255;
            var g = color.g / 255;
            var b = color.b / 255;

            cmyk.k = Math.min(1 - r, 1 - g, 1 - b);

            cmyk.c = 1 - cmyk.k === 0 ? 0 : (1 - r - cmyk.k) / (1 - cmyk.k);
            cmyk.m = 1 - cmyk.k === 0 ? 0 : (1 - g - cmyk.k) / (1 - cmyk.k);
            cmyk.y = 1 - cmyk.k === 0 ? 0 : (1 - b - cmyk.k) / (1 - cmyk.k);

            cmyk.c = Math.round(cmyk.c * 100);
            cmyk.m = Math.round(cmyk.m * 100);
            cmyk.y = Math.round(cmyk.y * 100);
            cmyk.k = Math.round(cmyk.k * 100);

            return cmyk;
        },

        cmyk2rgb: function(color){
            this.check(color, "cmyk");
            var r = Math.floor(255 * (1 - color.c / 100) * (1 - color.k / 100));
            var g = Math.ceil(255 * (1 - color.m / 100) * (1 - color.k / 100));
            var b = Math.ceil(255 * (1 - color.y / 100) * (1 - color.k / 100));

            return new RGB(r, g, b);
        },

        hsv2hsl: function(color){
            this.check(color, "hsv");
            var h, s, l, d;
            h = color.h;
            l = (2 - color.s) * color.v;
            s = color.s * color.v;
            if (l === 0) {
                s = 0;
            } else {
                d = l <= 1 ? l : 2 - l;
                if (d === 0) {
                    s = 0;
                } else {
                    s /= d;
                }
            }
            l /= 2;
            return new HSL(h, s, l);
        },

        hsl2hsv: function(color){
            this.check(color, ["hsl", "hsla"]);
            var h, s, v, l;
            h = color.h;
            l = color.l * 2;
            s = color.s * (l <= 1 ? l : 2 - l);

            v = (l + s) / 2;

            if (l + s === 0) {
                s = 0;
            } else {
                s = (2 * s) / (l + s);
            }

            return new HSV(h, s, v);
        },

        rgb2websafe: function(color){
            this.check(color, "rgb");
            return new RGB(
                Math.round(color.r / 51) * 51,
                Math.round(color.g / 51) * 51,
                Math.round(color.b / 51) * 51
            );
        },

        rgba2websafe: function(color){
            this.check(color, "rgba");
            var rgbWebSafe = this.rgb2websafe(color);
            return new RGBA(rgbWebSafe.r, rgbWebSafe.g, rgbWebSafe.b, color.a);
        },

        hex2websafe: function(color){
            this.check(color, "hex");
            return this.rgb2hex(this.rgb2websafe(this.hex2rgb(color)));
        },

        hsv2websafe: function(color){
            this.check(color, "hsv");
            return this.rgb2hsv(this.rgb2websafe(this.toRGB(color)));
        },

        hsl2websafe: function(color){
           this.check(color, "hsl");
            return this.hsv2hsl(this.rgb2hsv(this.rgb2websafe(this.toRGB(color))));
        },

        cmyk2websafe: function(color){
            this.check(color, "cmyk");
            return this.rgb2cmyk(this.rgb2websafe(this.cmyk2rgb(color)));
        },

        websafe: function(color){
            if (this.isHEX(color)) return this.hex2websafe(color);
            if (this.isRGB(color)) return this.rgb2websafe(color);
            if (this.isRGBA(color)) return this.rgba2websafe(color);
            if (this.isHSV(color)) return this.hsv2websafe(color);
            if (this.isHSL(color)) return this.hsl2websafe(color);
            if (this.isCMYK(color)) return this.cmyk2websafe(color);

            return color;
        },

        toColor: function(color, type, alpha){
            var result;
            switch (type.toLowerCase()) {
                case "hex":
                    result = this.toHEX(color);
                    break;
                case "rgb":
                    result = this.toRGB(color);
                    break;
                case "rgba":
                    result = this.toRGBA(color, alpha);
                    break;
                case "hsl":
                    result = this.toHSL(color);
                    break;
                case "hsla":
                    result = this.toHSLA(color, alpha);
                    break;
                case "hsv":
                    result = this.toHSV(color);
                    break;
                case "cmyk":
                    result = this.toCMYK(color);
                    break;
                default:
                    result = color;
            }
            return result;
        },

        toHEX: function(val){
            var color = typeof val === "string" ? this.parse(val) : val;

            if (!color) {
                throw new Error("Unknown color format!");
            }

            return typeof color === "string"
                ? color
                : this.rgb2hex(this.toRGB(color));
        },

        toRGB: function(val){
            var color = typeof val === "string" ? this.parse(val) : val;

            if (this.isRGB(color)) return color;
            if (this.isRGBA(color)) return new RGB(color.r, color.g, color.b);
            if (this.isHSV(color)) return this.hsv2rgb(color);
            if (this.isHSL(color)) return this.hsv2rgb(this.hsl2hsv(color));
            if (this.isHSLA(color)) return this.hsv2rgb(this.hsl2hsv(color));
            if (this.isHEX(color)) return this.hex2rgb(color);
            if (this.isCMYK(color)) return this.cmyk2rgb(color);

            throw new Error("Unknown color format!");
        },

        toRGBA: function(color, alpha){
            if (this.isRGBA(color)) {
                if (alpha) {
                    color.a = alpha;
                }
                return color;
            }
            var rgb = this.toRGB(color);
            return new RGBA(rgb.r, rgb.g, rgb.b, alpha);
        },

        toHSV: function(color){
            return this.rgb2hsv(this.toRGB(color));
        },

        toHSL: function(color){
            return this.hsv2hsl(this.rgb2hsv(this.toRGB(color)));
        },

        toHSLA: function(color, alpha){
            if (this.isHSLA(color)) {
                if (alpha) {
                    color.a = alpha;
                }
                return color;
            }
            var hsla = this.hsv2hsl(this.rgb2hsv(this.toRGB(color)));
            hsla.a = alpha;
            return new HSLA(hsla.h, hsla.s, hsla.l, hsla.a);
        },

        toCMYK: function(color){
            return this.rgb2cmyk(this.toRGB(color));
        },

        grayscale: function(color){
            return this.desaturate(color, 100);
        },

        lighten: function(color, amount){
            var hsl, type, alpha;

            if (!this.isColor(color)) {
                throw new Error(color + " is not a valid color value!");
            }

            amount = (amount === 0) ? 0 : (amount || 10);
            hsl = this.toHSL(color);
            hsl.l += amount / 100;
            hsl.l = clamp(hsl.l);

            type = this.colorType(color).toLowerCase();

            if (type === Types.RGBA || type === Types.HSLA) {
                alpha = color.a;
            }

            return this.toColor(hsl, type, alpha);
        },

        darken: function(color, amount){
            return this.lighten(color, -amount);
        },

        spin: function(color, amount){
            var hsl, type, alpha, hue;

            if (!this.isColor(color)) {
                throw new Error(color + " is not a valid color value!");
            }

            hsl = this.toHSL(color);
            hue = (hsl.h + amount) % 360;
            hsl.h = hue < 0 ? 360 + hue : hue;

            type = this.colorType(color).toLowerCase();

            if (type === Types.RGBA || type === Types.HSLA) {
                alpha = color.a;
            }

            return this.toColor(hsl, type, alpha);
        },

        brighten: function(color, amount){
            var rgb, type, alpha;

            if (!this.isColor(color)) {
                throw new Error(color + " is not a valid color value!");
            }

            rgb = this.toRGB(color);
            rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * - (amount / 100))));
            rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * - (amount / 100))));
            rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * - (amount / 100))));

            type = this.colorType(color).toLowerCase();

            if (type === Types.RGBA || type === Types.HSLA) {
                alpha = color.a;
            }

            return this.toColor(rgb, type, alpha);
        },

        saturate: function(color, amount){
            var hsl, type, alpha;

            if (!this.isColor(color)) {
                throw new Error(color + " is not a valid color value!");
            }

            hsl = this.toHSL(color);
            hsl.s += amount / 100;
            hsl.s = clamp(hsl.s);

            type = this.colorType(color).toLowerCase();

            if (type === Types.RGBA || type === Types.HSLA) {
                alpha = color.a;
            }

            return this.toColor(hsl, type, alpha);
        },

        desaturate: function(color, amount){
            var hsl, type, alpha;

            if (!this.isColor(color)) {
                throw new Error(color + " is not a valid color value!");
            }

            hsl = this.toHSL(color);
            hsl.s -= amount / 100;
            hsl.s = clamp(hsl.s);

            type = this.colorType(color).toLowerCase();

            if (type === Types.RGBA || type === Types.HSLA) {
                alpha = color.a;
            }

            return this.toColor(hsl, type, alpha);
        },

        hueShift: function(color, hue, saturation, value){
            var hsv = this.toHSV(color);
            var type = this.colorType(color).toLowerCase();
            var h = hsv.h;
            var alpha;
            var _h = hue || 0;
            var _s = saturation || 0;
            var _v = value || 0;

            h += _h;
            while (h >= 360.0) h -= 360.0;
            while (h < 0.0) h += 360.0;
            hsv.h = h;

            hsv.s += _s;
            if (hsv.s > 1) {hsv.s = 1;}
            if (hsv.s < 0) {hsv.s = 0;}

            hsv.v += _v;
            if (hsv.v > 1) {hsv.v = 1;}
            if (hsv.v < 0) {hsv.v = 0;}

            if (type === Types.RGBA || type === Types.HSLA) {
                alpha = color.a;
            }

            return this.toColor(hsv, type, alpha);
        },

        shade: function(color, amount){
            if (!this.isColor(color)) {
                throw new Error(color + " is not a valid color value!");
            }

            amount /= 100;

            var type = this.colorType(color).toLowerCase();
            var rgb = this.toRGB(color);
            var t = amount < 0 ? 0 : 255;
            var p = amount < 0 ? amount * -1 : amount;
            var r, g, b, a;

            r = (Math.round((t - rgb.r) * p) + rgb.r);
            g = (Math.round((t - rgb.g) * p) + rgb.g);
            b = (Math.round((t - rgb.b) * p) + rgb.b);

            if (type === Types.RGBA || type === Types.HSLA) {
                a = color.a;
            }

            return this.toColor(new RGB(r, g, b), type, a);
        },

        mix: function(color1, color2, amount){

            amount = (amount === 0) ? 0 : (amount || 50);

            var rgb = new RGB(0,0,0);
            var rgb1 = this.toRGB(color1);
            var rgb2 = this.toRGB(color2);

            var p = amount / 100;

            rgb.r = Math.round(((rgb2.r - rgb1.r) * p) + rgb1.r);
            rgb.g = Math.round(((rgb2.g - rgb1.g) * p) + rgb1.g);
            rgb.b = Math.round(((rgb2.b - rgb1.b) * p) + rgb1.b);

            return this.toHEX(rgb);
        },

        multiply: function(color1, color2){
            var rgb1 = this.toRGB(color1);
            var rgb2 = this.toRGB(color2);
            var rgb = new RGB();

            rgb1.b = Math.floor(rgb1.b * rgb2.b / 255);
            rgb1.g = Math.floor(rgb1.g * rgb2.g / 255);
            rgb1.r = Math.floor(rgb1.r * rgb2.r / 255);

            return this.toHEX(rgb);
        },

        materialPalette: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var baseLight = opt.baseLight;
            var baseDark = opt.baseDark === "self" || !opt.baseDark ? this.multiply(color, color) : opt.baseDark;

            return {
                "50": this.mix(baseLight, color, 10),
                "100": this.mix(baseLight, color, 30),
                "200": this.mix(baseLight, color, 50),
                "300": this.mix(baseLight, color, 70),
                "400": this.mix(baseLight, color, 85),
                "500": this.mix(baseLight, color, 100),
                "600": this.mix(baseDark, color, 92),
                "700": this.mix(baseDark, color, 83),
                "800": this.mix(baseDark, color, 74),
                "900": this.mix(baseDark, color, 65),

                "A100": this.lighten(this.saturate(this.mix(baseDark, color, 15), 80), 65),
                "A200": this.lighten(this.saturate(this.mix(baseDark, color, 15), 80), 55),
                "A400": this.lighten(this.saturate(this.mix(baseLight, color, 100), 55), 10),
                "A700": this.lighten(this.saturate(this.mix(baseDark, color, 83), 65), 10)
            };
        },

        monochromatic: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var returnAs = opt.resultType;
            var results = opt.results;
            var hsv = this.toHSV(color);
            var h = hsv.h,
                s = hsv.s,
                v = hsv.v;
            var result = [];
            var mod = 1 / results;
            var self = this;

            while (results--) {
                result.push(new HSV(h, s, v));
                v = (v + mod) % 1;
            }

            return result.map(function(el){
                return self["to"+returnAs.toUpperCase()](el);
            });
        },

        complementary: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var hsl = this.toHSL(color);
            var result;
            var self = this;

            var returnAs = opt.resultType;

            result = [
                hsl,
                new HSL(shift(hsl.h, 180), hsl.s, hsl.l)
            ];

            return result.map(function(el){
                return self["to"+returnAs.toUpperCase()](el);
            });
        },

        splitComplementary: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var hsl = this.toHSL(color);
            var h = hsl.h;
            var result, self = this;

            var returnAs = opt.resultType;
            var angle = opt.angle;

            result = [
                hsl,
                new HSL(shift(h, 180 - angle), hsl.s, hsl.l ),
                new HSL(shift(h, 180 + angle), hsl.s, hsl.l )
            ];

            return result.map(function(el){
                return self["to"+returnAs.toUpperCase()](el);
            });
        },

        doubleComplementary: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var returnAs = opt.resultType;
            var angle = opt.angle;
            var hsl = this.toHSL(color);
            var h = hsl.h;
            var result, self = this;

            result = [
                hsl,
                new HSL(shift(h, 180), hsl.s, hsl.l ),
                new HSL(shift(h, angle), hsl.s, hsl.l ),
                new HSL(shift(h, 180 + angle), hsl.s, hsl.l )
            ];

            return result.map(function(el){
                return self["to"+returnAs.toUpperCase()](el);
            });
        },

        square: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var returnAs = opt.resultType;
            var result = [], i;
            var hsl = this.toHSL(color);
            var h = hsl.h , self = this;

            result.push(hsl);

            for (i = 1; i < 4; i++) {
                h = shift(h, 90.0);
                result.push(new HSL(h, hsl.s, hsl.l));
            }

            return result.map(function(el){
                return self["to"+returnAs.toUpperCase()](el);
            });
        },

        tetradic: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var returnAs = opt.resultType;
            var angle = opt.angle;
            var result;
            var hsl = this.toHSL(color);
            var h = hsl.h;
            var self = this;

            result = [
                hsl,
                new HSL(shift(h, 180), hsl.s, hsl.l),
                new HSL(shift(h, 180 - angle), hsl.s, hsl.l),
                new HSL(shift(h, -angle), hsl.s, hsl.l)
            ];

            return result.map(function(el){
                return self["to"+returnAs.toUpperCase()](el);
            });
        },

        triadic: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var returnAs = opt.resultType;
            var result;
            var hsl = this.toHSL(color);
            var h = hsl.h;
            var self = this;

            result = [
                hsl,
                new HSL(shift(h,120), hsl.s, hsl.l),
                new HSL(shift(h,240), hsl.s, hsl.l)
            ];

            return result.map(function(el){
                return self["to"+returnAs.toUpperCase()](el);
            });
        },

        analogous: function(color, options){
            var opt = $.extend({}, ColorsDefaultConfig, options);
            var returnAs = opt.resultType;
            var angle = opt.angle;

            var hsl = this.toHSL(color);
            var result, self = this;

            result = [
                hsl,
                new HSL(shift(hsl.h, -angle), hsl.s, hsl.l),
                new HSL(shift(hsl.h, +angle), hsl.s, hsl.l)
            ];

            return result.map(function(el){
                return self["to"+returnAs.toUpperCase()](el);
            });
        },

        createScheme: function(color, name, options){
            switch (name.toLowerCase()) {
                case "analogous":
                case "analog": return this.analogous(color, options);

                case "triadic":
                case "triad": return this.triadic(color, options);

                case "tetradic":
                case "tetra": return this.tetradic(color, options);

                case "monochromatic":
                case "mono": return this.monochromatic(color, options);

                case "complementary":
                case "complement":
                case "comp": return this.complementary(color, options);

                case "double-complementary":
                case "double-complement":
                case "double": return this.doubleComplementary(color, options);

                case "split-complementary":
                case "split-complement":
                case "split": return this.splitComplementary(color, options);

                case "square": return this.square(color, options);
                case "material": return this.materialPalette(color, options);
            }
        },

        getScheme: function(){
            return this.createScheme.apply(this, arguments)
        },

        add: function(val1, val2, returnAs){
            var color1 = typeof val1 === "string" ? this.parse(val1) : val1;
            var color2 = typeof val2 === "string" ? this.parse(val2) : val2;
            var c1 = this.toRGBA(color1);
            var c2 = this.toRGBA(color2);
            var result = new RGBA();
            var to = (""+returnAs).toLowerCase() || "hex";

            result.r = Math.round((c1.r + c2.r) / 2);
            result.g = Math.round((c1.g + c2.g) / 2);
            result.b = Math.round((c1.b + c2.b) / 2);
            result.a = Math.round((c1.a + c2.a) / 2);

            return this["to"+to.toUpperCase()](result);
        }
    };

    var Color = function(color, options){
        this._setValue(color);
        this._setOptions(options);
    }

    Color.prototype = {
        _setValue: function(color){
            var _color;

            if (typeof color === "string") {
                _color = Colors.parse(color);
            } else {
                _color = color;
            }

            if (!Colors.isColor(_color)) {
                _color = "#000000";
            }

            this._value = _color;
            this._type = Colors.colorType(this._value);
        },

        _setOptions: function(options){
            options = typeof options === "object" ? options : {};
            this._options = $.extend({}, ColorsDefaultConfig, options);
        },

        getOptions: function(){
            return this._options;
        },

        setOptions: function(options){
            this._setOptions(options);
        },

        setValue: function(color){
            this._setValue(color);
        },

        getValue: function(){
            return this._value;
        },

        channel: function(ch, val){
            var currentType = this._type.toUpperCase();

            if (["red", "green", "blue"].indexOf(ch) > -1) {
                this.toRGB();
                this._value[ch[0]] = val;
                this["to"+currentType]();
            }
            if (ch === "alpha" && this._value.a) {
                this._value.a = val;
            }
            if (["hue", "saturation", "value"].indexOf(ch) > -1) {
                this.toHSV();
                this._value[ch[0]] = val;
                this["to"+currentType]();
            }
            if (["lightness"].indexOf(ch) > -1) {
                this.toHSL();
                this._value[ch[0]] = val;
                this["to"+currentType]();
            }
            if (["cyan", "magenta", "yellow", "black"].indexOf(ch) > -1) {
                this.toCMYK();
                this._value[ch[0]] = val;
                this["to"+currentType]();
            }

            return this;
        },

        channels: function(obj){
            var that = this;

            $.each(obj, function(key, val){
                that.channel(key, val);
            });

            return this;
        },

        toRGB: function() {
            this._value = Colors.toRGB(this._value);
            this._type = Types.RGB;
            return this;
        },

        rgb: function(){
            return this._value ? new Color(Colors.toRGB(this._value)) : undefined;
        },

        toRGBA: function(alpha) {
            if (Colors.isRGBA(this._value)) {
                if (alpha) {
                    this._value = Colors.toRGBA(this._value, alpha);
                }
            } else {
                this._value = Colors.toRGBA(this._value, alpha);
            }
            this._type = Types.RGBA;
            return this;
        },

        rgba: function(alpha) {
            return this._value ? new Color(Colors.toRGBA(this._value, alpha)) : undefined;
        },

        toHEX: function() {
            this._value = Colors.toHEX(this._value);
            this._type = Types.HEX;
            return this;
        },

        hex: function() {
            return this._value ? new Color(Colors.toHEX(this._value)) : undefined;
        },

        toHSV: function() {
            this._value = Colors.toHSV(this._value);
            this._type = Types.HSV;
            return this;
        },

        hsv: function() {
            return this._value ? new Color(Colors.toHSV(this._value)) : undefined;
        },

        toHSL: function() {
            this._value = Colors.toHSL(this._value);
            this._type = Types.HSL;
            return this;
        },

        hsl: function() {
            return this._value ? new Color(Colors.toHSL(this._value)) : undefined;
        },

        toHSLA: function(alpha) {
            if (Colors.isHSLA(this._value)) {
                if (alpha) {
                    this._value = Colors.toHSLA(this._value, alpha);
                }
            } else {
                this._value = Colors.toHSLA(this._value, alpha);
            }
            this._type = Types.HSLA;
            return this;
        },

        hsla: function(alpha) {
            return this._value ? new Color(Colors.toHSLA(this._value, alpha)) : undefined;
        },

        toCMYK: function() {
            this._value = Colors.toCMYK(this._value);
            this._type = Types.CMYK;
            return this;
        },

        cmyk: function() {
            return this._value ? new Color(Colors.toCMYK(this._value)) : undefined;
        },

        toWebsafe: function() {
            this._value = Colors.websafe(this._value);
            this._type = Colors.colorType(this._value);
            return this;
        },

        websafe: function() {
            return this._value ? new Color(Colors.websafe(this._value)) : undefined;
        },

        toString: function() {
            return this._value ? Colors.colorToString(this._value) : "undefined";
        },

        toDarken: function(amount) {
            this._value = Colors.darken(this._value, amount);
            return this;
        },

        darken: function(amount){
            return new Color(Colors.darken(this._value, amount));
        },

        toLighten: function(amount) {
            this._value = Colors.lighten(this._value, amount);
            return this;
        },

        lighten: function(amount){
            return new Color(Colors.lighten(this._value, amount))
        },

        isDark: function() {
            return this._value ? Colors.isDark(this._value) : undefined;
        },

        isLight: function() {
            return this._value ? Colors.isLight(this._value) : undefined;
        },

        toHueShift: function(hue, saturation, value) {
            this._value = Colors.hueShift(this._value, hue, saturation, value);
            return this;
        },

        hueShift: function (hue, saturation, value) {
            return new Color(Colors.hueShift(this._value, hue, saturation, value));
        },

        toGrayscale: function() {
            this._value = Colors.grayscale(this._value, this._type);
            return this;
        },

        grayscale: function(){
            return new Color(Colors.grayscale(this._value, this._type));
        },

        type: function() {
            return Colors.colorType(this._value);
        },

        createScheme: function(name, format, options) {
            return this._value
                ? Colors.createScheme(this._value, name, format, options)
                : undefined;
        },

        getScheme: function(){
            return this.createScheme.apply(this, arguments);
        },

        equal: function(color) {
            return Colors.equal(this._value, color);
        },

        toAdd: function(color){
            this._value = Colors.add(this._value, color, this._type);
            return this;
        },

        add: function(color){
            return new Color(Colors.add(this._value, color, this._type));
        }
    }

    Metro.colors = Colors.init();
    window.Color = Metro.Color = Color;
    window.ColorPrimitive = Metro.colorPrimitive = {
        RGB: RGB,
        RGBA: RGBA,
        HSV: HSV,
        HSL: HSL,
        HSLA: HSLA,
        CMYK: CMYK
    };

    if (window.METRO_GLOBAL_COMMON === true) {
        window.Colors = Metro.colors;
    }

}(Metro, m4q));

