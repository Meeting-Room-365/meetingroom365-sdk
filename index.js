/***
 * An SDK for interacting with the Meeting Room 365 Platform
 */

/**
 * Object.assign() polyfill
 */
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign !== 'function') {
    Object.defineProperty(Object, 'assign', {
        value: function assign(target, varArgs) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object (Object.assign polyfill, Lilbird.js)');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

function __legacy_generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[x]/g, function (c) {
        var r = Math.floor(Math.random() * 16);
        return r.toString(16);
    });
}

function ___uuidv4() {
    if (!window.crypto || !window.crypto.getRandomValues) {
        return __legacy_generateUUID();
    }

    try {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function (c) {
            return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
        });
    } catch(e) {
        return __legacy_generateUUID();
    }
}

var ___mr365 = {
    configuration: {
        // ADD_TS: true,
        // ADD_SESSION_ID: true,
        // ADD_ANONYMOUS_DEVICE_ID: true,
        // RESPECT_DO_NOT_TRACK: true,
        // DO_NOT_TRACK: !!navigator.doNotTrack
    },
    config: function (conf) {
        this.configuration = Object.assign(this.configuration, conf);
        if (this.configuration.DEBUG) console.log('Meeting Room 365 Configuration (Meetingroom365.js):', this.configuration);
    },
    init: function (conf) {
        this.configuration = Object.assign(this.configuration, conf);
        if (this.configuration.DEBUG) console.log('Meeting Room 365 Configuration (Meetingroom365.js):', this.configuration);


    },
}

try {
    if (window && typeof window === 'object' && window.document) {
        window.Meetingroom365 = window.meetingroom365 = ___mr365;
    }
} catch(e){}

if (typeof module !== 'undefined') {
    module.exports = ___mr365;
}
