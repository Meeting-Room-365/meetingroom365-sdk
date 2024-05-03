/***
 * An SDK for creating custom displays and interacting with the Meeting Room 365 Platform.
 * See https://www.meetingroom365.com/ for more details.
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
                throw new TypeError('Cannot convert undefined or null to object (Object.assign polyfill, Meetingroom365.js)');
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

var ___mr365 = (function() {

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

    function post(url, body) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : null
        });
    }

    /**
     * Are we there yet?
     */
    var Awty = (function Awty () {
        var _debug = 0, _polling = 1, _key, __interval, __timr, _defaultAction, __actions = {}, _server = 'https://hwm.meetingroom365.com';

        if (window._debug) _debug = 1;

        function rint (max) {
            return Math.floor(Math.random() * Math.floor(max));
        }

        function setKey (k) {
            _key = k;
        }

        function addAction (key, fn) {
            __actions[key] = fn;
        }

        function debugState () {
            console.log({  __interval: __interval, _server: _server, _debug: _debug, _key: _key, _polling: _polling });
        }

        async function sendCommand (k, cmd, v) {
            var url = _server + '/cmd/' + k + '/' + encodeURIComponent(cmd) + '?_=' + rint(999999999);
            if (v) url += '&v=' + encodeURIComponent(v);
            await fetch(url);
        }

        async function _poll (newConf) {
            if (typeof newConf == 'string') _key = newConf;
            if (!newConf || typeof newConf != 'object') newConf = {};
            if (newConf.defaultAction) _defaultAction = newConf.defaultAction;
            if (newConf.server) _server = newConf.server;
            if (newConf.debug) _debug = newConf.debug;
            if (newConf.key) _key = newConf.key;
            var _st = new Date().getTime();

            if (!_key) return console.warn('Cannot init without assigning a key.');

            // Skip request if received WebSocket ping in last 30s
            if (window.__lastPingTs > (+ new Date()) - 30000) {
                clearTimeout(__timr);
                return __timr = setTimeout(_poll, 15000);

            } else {
                _polling = 1;

                /**
                 * Attempt to Init WebSocket connection
                 */
                if (!window.__wsErrorCount || window.__wsErrorCount < 10) {
                    var u = _server.replace('http', 'ws') + '/ws/' + _key;
                    if (window._debug) console.log('ws url', u);
                    window.__ws = new WebSocket(u);

                    window.__ws.onopen = function () {
                        if (_debug) console.log('ws opened', arguments);
                        window.__lastPingTs = + new Date();
                    };

                    window.__ws.onclose = function () {
                        window.__wsErrorCount = window.__wsErrorCount ? ++window.__wsErrorCount : 1;
                        if (_debug) console.log('ws closed');
                        window.__lastPingTs = 0;
                    };

                    window.__ws.onmessage = function (cmd) {
                        if (_debug) console.log('ws cmd', cmd.data);

                        window.__lastPingTs = + new Date();
                        if (cmd.data === 'hb') return;

                        // Process commands
                        var cmds = cmd.data ? cmd.data.split(',') : [];

                        cmds.forEach(function (command) {
                            var ts = + new Date(), v = null;

                            command = decodeURIComponent(command);

                            if (command.indexOf('||') !== -1) {
                                var parts = command.split('||');
                                command = parts[0];
                                v = parts[1];
                            }

                            if (__actions[command] && typeof __actions[command] == 'function') __actions[command](ts, v);
                        });

                        // Default action
                        if (_defaultAction && typeof _defaultAction == 'function') _defaultAction(cmd);
                    };

                    _polling = 0;
                }
            }

            try {
                let r = await fetch(_server + '/s/' + _key + '?_=' + rint(999999999));

                if (r.ok) {
                    let cmd = await r.text();

                    var ms = new Date().getTime() - _st;

                    // Process commands
                    var cmds = cmd.split(',');

                    cmds.forEach(function (command) {
                        var ts = + new Date(), v = null;

                        command = decodeURIComponent(command);

                        if (command.indexOf('||') !== -1) {
                            var parts = command.split('||');
                            command = parts[0];
                            v = parts[1];
                        }

                        if (__actions[command] && typeof __actions[command] == 'function') __actions[command](ts, v);
                    });

                    // Adjust interval for next request
                    __interval = Math.max(Math.min(ms * 12, 30000), 4800);

                    // Default action and debugging
                    if (_defaultAction && typeof _defaultAction == 'function') _defaultAction(cmd);
                    if (_debug) console.log(ms, 'ms', '-', cmd, '-', __interval);

                    // Make next request
                    clearTimeout(__timr);
                    __timr = setTimeout(_poll, __interval);

                } else {
                    clearTimeout(__timr);
                    __timr = setTimeout(_poll, 7500);
                }

            } catch(e) {
                clearTimeout(__timr);
                __timr = setTimeout(_poll, 7500);
            }
        }

        if (_key) _poll();

        return function () {
            return {
                sendCommand: sendCommand,
                debugState: debugState,
                addAction: addAction,
                setKey: setKey,
                init: _poll
            };
        };
    })();

    /**
     * Client Library
     */
    function setLocalStorage (key, value) {
        if (!key || !value) return false;

        try { localStorage.setItem(key, value) } catch (e) {
            if (window._debug) console.log(e);
            return false;
        }

        return true;
    }

    function getLocalStorage (key) {
        var result = '';

        try { result = localStorage.getItem(key) } catch (e) {
            if (window._debug) console.log(e);
            return result;
        }

        return result;
    }

    function getSearchParam (key) {
        var val = false;
        if (location.search.indexOf(key) !== -1) val = location.search.split(key + '=')[1];
        if (val && val.indexOf('&') !== -1) val = val.split('&')[0];
        return val;
    }

    function displayConfigByKeyUrl (key) {
        const CONFBUCKETURL = 'https://userconf.meetingroom365.com';
        return CONFBUCKETURL + '/key-' + key + '.json' + '?ts=' + Date.now();
    }

    // Coerce a boolean or string version of a boolean to a boolean
    function coerceBoolean (ins) {
        if (typeof ins === 'boolean') return ins; // Just pass it back if it's already a BOOLEAN
        if (String(ins) == 1) return true; // 1 -> true (USE DOUBLE EQUALS)
        if (String(ins) == 0) return false; // 0 // -> false (USE DOUBLE EQUALS)
        if (typeof ins === 'number' && String(ins) === 'NaN') return false; // NaN -> false
        if (typeof ins === 'number') return true; // Would have already returned if zero

        if (typeof ins === 'string' && ins.toLowerCase() !== 'false') return true; // Evaluates all strings not like 'false' to true

        return String(ins).toLowerCase() == 'true'; // (USE DOUBLE EQUALS) Evaluates true / false / 'true' / 'false' / 'True' / 'False' / 'TRUE' / etc.
    }

    // Fix Object Value Types for a Flat object
    function fixObjectValueTypes (o) {
        for (var k in o) {
            var v = o[k];

            if (v === 'undefined') o[k] = undefined;
            if (v === 'false') o[k] = false;
            if (v === 'null') o[k] = null;
            if (v === 'true') o[k] = true;
            if (v === 'NaN') o[k] = NaN;

            if ((+v) == v && v !== '') o[k] = (+v);
        }
        return o;
    }

    // Fix a Meeting Room 365 display configuration object (type coercion)
    function fixDisplayConfig (displayConfig) {
        try { // Fix any values we need before rendering
            if (displayConfig.updated) displayConfig.updated = parseInt(displayConfig.updated);
            if (displayConfig.hidden) displayConfig.hidden = coerceBoolean(displayConfig.hidden);
        } catch(e){}

        // Try fixing all of the types no matter what the keys are
        try { displayConfig = fixObjectValueTypes(displayConfig) } catch(e){}

        return displayConfig;
    }

    async function getJson (url) {
        let r = await fetch(url);

        if (r.ok) {
            let data = await r.json();
            return data;
        }
    }

    function domReady(fn) {
        // If we're early to the party
        document.addEventListener("DOMContentLoaded", fn);
        // If late; I mean on time.
        if (document.readyState === "interactive" || document.readyState === "complete" ) {
            fn();
        }
    }

    var awty;

    var ___mr365 = {
        _srvr: "https://hwm.mr365.co",
        _APIURL: "https://states.mr365.co",
        _basicDataSent: false,
        _loc: {},
        displayConfig: {
            originalKey: null,
            displayKey: null,
            redirect: null,
            hidden: false,
            ownerEmail: null,
            ownerEmail_lc: null,
            tenant: null,
            tenant_lc: null,
            type: "custom",
            name: null,
            key: null,
            id: null,
        },
        displayKey: null,
        configuration: {
            // Library configuration settings
            STATUS_UPDATE_INTERVAL: 15 * 60 * 1000,
            LOCATION: true,
            onUpdate: null,
        },
        config: function (conf) {
            this.configuration = Object.assign(this.configuration, conf);
            if (this.configuration.DEBUG) console.log('Meeting Room 365 Configuration (Meetingroom365.js):', this.configuration);
        },
        init: async function (conf, cb) {
            this.configuration = Object.assign(this.configuration, conf);
            if (this.configuration.DEBUG) console.log('Meeting Room 365 Configuration (Meetingroom365.js):', this.configuration);

            let key = getSearchParam('key');

            if (key) this.displayKey = key;
            if (this.configuration.key && typeof this.configuration.key === 'string') this.displayKey = this.configuration.key;

            if (!this.displayKey) return console.warn('Display key not found. A key must be passed explicitly to init({ key }) or implicitly via query parameter ?key=displayKey');

            if (this.configuration.LOCATION) this.getLocation();

            if (this.configuration.STATUS_UPDATE_INTERVAL) {
                window.__statusUpdateInterval = setInterval(() => this.updateStatus(), this.configuration.STATUS_UPDATE_INTERVAL);
                setTimeout(() => this.updateStatus(), 10000);
            }

            this.initialize(() => {
                awty.init({ key: this.displayKey, server: this._srvr }, () => {
                    if (window._debug) console.log('WS Initialized');
                });
                window._awty = awty;
            });

            let displayConfig = await this.getDisplayConfigByKey(key);
            if (cb && typeof cb === 'function') cb(displayConfig);
            else return displayConfig;
        },
        hardwareStatus: async function (cb) {
            // Battery status
            var battery;
            try {
                if (navigator.getBattery) {
                    navigator.getBattery().then(function (data) {
                        battery = {
                            charging: data.charging,
                            chargingTime: data.chargingTime,
                            dischargingTime: data.dischargingTime,
                            level: data.level
                        };
                    });
                }
            } catch (e) {}

            var status = {
                name: this.displayConfig.name,
                email: this.displayConfig.email,
                tenant: this.displayConfig.tenant,
                displayTs: Date.now(),
                height: window.innerHeight,
                width: window.innerWidth,
                userAgent: navigator.userAgent,
            };

            if (battery) status.battery = window.battery;

            if (this._loc) status = Object.assign(status, this._loc);

            if (window.UAParser) {
                const parser = new UAParser(navigator.userAgent);

                // console.log(parser.getBrowser()); // { name : "TikTok", version : "28.3.4", major : "28" }
                // console.log(parser.getEngine()); // { name : "Blink", version : "110.0.5481.153" }

                const device = parser.getDevice();
                // console.log(device); // { type : "mobile", vendor : "Huawei", model : "STK-LX1" }

                const os = parser.getOS()
                // console.log(os); // { name : "Android", version : "10" }

                status.manufacturer = device.vendor;
                status.deviceType = device.type;
                status.model = device.model;
                status.platform = os.name;
                status.version = os.version;
            }

            if (cb && typeof cb === 'function') cb(status);
            else return status;
        },
        getLocation: async function () {
            let r = await fetch('https://api.meetingroom365.com/location');
            if (r.ok) {
                let loc = await r.json();
                this._loc = loc;
            }
        },
        updateStatus: async function (obj, cb) {
            if (!this.displayKey) return;

            try { obj = JSON.parse(obj) } catch (e) {}
            if (!obj || typeof obj !== 'object') obj = {};

            if (!obj.displayKey) obj.displayKey = this.displayKey;
            if (!obj.key) obj.key = this.displayKey;
            obj.site = location.hostname;

            if (!this._basicDataSent) {
                // Mix in hardware status
                let hwStatus = await this.hardwareStatus();
                obj = Object.assign(obj, hwStatus);
            }

            // Attempt to remove invalid characters which may cause a bug
            try { obj = JSON.parse(obj.toString().trim()) } catch (e) {}

            // POST updated state
            if (!window.fetch || !this._APIURL) return;
            let result = await post(this._APIURL + '/displaystate', obj);

            if (window._debug) console.log('Display status updated', obj);
            this._basicDataSent = true;

            if (cb && typeof cb === "function") cb();
        },
        getDisplayConfigByKey: async function (key, cb) {
            let r = await fetch(displayConfigByKeyUrl(key));

            if (r.ok) {
                let data = await r.json();

                if (data) data = fixDisplayConfig(data);

                if (this.displayConfig && typeof displayConfig === 'object') this.displayConfig = Object.assign(this.displayConfig, data);
                else this.displayConfig = data;

                if (window._debug) console.log('Fetched display configuration', data);

                if (cb && typeof cb === 'function') cb(data);
                else return data;
            }
        },
        getConfiguration: async function(cb) {
            let displayConfig = await this.getDisplayConfigByKey(this.displayKey);
            if (cb && typeof cb === 'function') cb(displayConfig);
            else return displayConfig;
        },
        initialize: function(cb) {
            // Do not proceed if we've already initialized
            if (awty) {
                if (cb && typeof cb === "function") return cb();
                else return;
            }

            awty = new Awty();
            this.addAction('restart', () => this.handleRestart());
            this.addAction('update', () => this.handleUpdate());

            if (cb && typeof cb === "function") cb();
        },
        restartApp: function () {
            if (performance.now() < 60000) return;
            if (window._debug) console.log('Restarting..');
            try { top.location.reload() } catch(e){}
            try { parent.location.reload() } catch(e){}
            try { location.reload() } catch(e){}
        },
        handleUpdate: async function(msg) {
            let displayConfig = await this.getConfiguration();

            if (this.configuration.onUpdate && typeof this.configuration.onUpdate === 'function') {
                this.configuration.onUpdate(displayConfig);
            }

            if (window._debug) console.log('handleUpdate', msg);
        },
        handleRestart: function() {
            if (this.restartApp && typeof this.restartApp === 'function')
                this.restartApp();
        },
        addAction: function(key, fn) {
            if (!awty) return console.warn('Uninstantiated instance of DisplayJoy (Meeting Room 365) cannot listen for events.');
            awty.addAction(key, fn);
        },
        on: function(key, fn) {
            if (!awty) return console.warn('Uninstantiated instance of DisplayJoy (Meeting Room 365) cannot listen for events.');
            awty.addAction(key, fn);
        },
        onRestart: function() {},
        onUpdate: function() {},
        ready: domReady,
    }

    try {
        if (window && typeof window === 'object' && window.document) {
            window.Meetingroom365 = window.meetingroom365 = ___mr365;
        }
    } catch(e){}

    return ___mr365;

})();

if (typeof module !== 'undefined') {
    module.exports = ___mr365;
}
