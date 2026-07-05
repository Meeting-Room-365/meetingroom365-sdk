var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
if (typeof Object.assign !== "function") {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      "use strict";
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object (Object.assign polyfill, Meetingroom365.js)");
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
var ___mr365 = function() {
  function __legacy_generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[x]/g, function(c) {
      var r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }
  function ___uuidv4() {
    if (!window.crypto || !window.crypto.getRandomValues) {
      return __legacy_generateUUID();
    }
    try {
      return ("10000000-1000-4000-8000" + -1e11).replace(/[018]/g, function(c) {
        return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
      });
    } catch (e) {
      return __legacy_generateUUID();
    }
  }
  function post(url, body) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : null
    });
  }
  var Awty = function Awty2() {
    var _debug = 0, _polling = 1, _key = null, __interval, __timr, _defaultAction, __actions = {}, _server = "https://hwm.meetingroom365.com";
    if (window._debug) _debug = 1;
    function rint(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }
    function setKey(k) {
      if (window._debug) console.log("ws setKey", k);
      _key = k;
    }
    function addAction(key, fn) {
      __actions[key] = fn;
    }
    function debugState() {
      console.log({ __interval, _server, _debug, _key, _polling });
    }
    function sendCommand(k, cmd, v) {
      return __async(this, null, function* () {
        var url = _server + "/cmd/" + k + "/" + encodeURIComponent(cmd) + "?_=" + rint(999999999);
        if (v) url += "&v=" + encodeURIComponent(v);
        yield fetch(url);
      });
    }
    function _poll(newConf) {
      return __async(this, null, function* () {
        if (typeof newConf === "string") _key = newConf;
        if (!newConf || typeof newConf != "object") newConf = {};
        if (newConf.defaultAction) _defaultAction = newConf.defaultAction;
        if (newConf.server) _server = newConf.server;
        if (newConf.debug) _debug = newConf.debug;
        if (newConf.key) _key = newConf.key;
        var _st = (/* @__PURE__ */ new Date()).getTime();
        if (window._debug) console.log("ws _poll _key is:", _key, newConf);
        if (!_key) return console.warn("Cannot init without assigning a key.");
        if (window.__lastPingTs > +/* @__PURE__ */ new Date() - 3e4) {
          clearTimeout(__timr);
          return __timr = setTimeout(_poll, 15e3);
        } else {
          _polling = 1;
          if (!window.__wsErrorCount || window.__wsErrorCount < 10) {
            var u = _server.replace("http", "ws") + "/ws/" + _key;
            if (window._debug) console.log("ws key", _key);
            if (window._debug) console.log("ws url", u);
            window.__ws = new WebSocket(u);
            window.__ws.onopen = function() {
              if (_debug) console.log("ws opened", arguments);
              window.__lastPingTs = +/* @__PURE__ */ new Date();
            };
            window.__ws.onclose = function() {
              window.__wsErrorCount = window.__wsErrorCount ? ++window.__wsErrorCount : 1;
              if (_debug) console.log("ws closed");
              window.__lastPingTs = 0;
            };
            window.__ws.onmessage = function(cmd) {
              if (_debug) console.log("ws cmd", cmd.data);
              window.__lastPingTs = +/* @__PURE__ */ new Date();
              if (cmd.data === "hb") return;
              var cmds2 = cmd.data ? cmd.data.split(",") : [];
              cmds2.forEach(function(command) {
                var ts = +/* @__PURE__ */ new Date(), v = null;
                command = decodeURIComponent(command);
                if (command.indexOf("||") !== -1) {
                  var parts = command.split("||");
                  command = parts[0];
                  v = parts[1];
                }
                if (__actions[command] && typeof __actions[command] == "function") __actions[command](ts, v);
              });
              if (_defaultAction && typeof _defaultAction == "function") _defaultAction(cmd);
            };
            _polling = 0;
          }
        }
        try {
          let r = yield fetch(_server + "/s/" + _key + "?_=" + rint(999999999));
          if (r.ok) {
            let cmd = yield r.text();
            var ms = (/* @__PURE__ */ new Date()).getTime() - _st;
            var cmds = cmd.split(",");
            cmds.forEach(function(command) {
              var ts = +/* @__PURE__ */ new Date(), v = null;
              command = decodeURIComponent(command);
              if (command.indexOf("||") !== -1) {
                var parts = command.split("||");
                command = parts[0];
                v = parts[1];
              }
              if (__actions[command] && typeof __actions[command] == "function") __actions[command](ts, v);
            });
            __interval = Math.max(Math.min(ms * 12, 3e4), 4800);
            if (_defaultAction && typeof _defaultAction == "function") _defaultAction(cmd);
            if (_debug) console.log(ms, "ms", "-", cmd, "-", __interval);
            clearTimeout(__timr);
            __timr = setTimeout(_poll, __interval);
          } else {
            clearTimeout(__timr);
            __timr = setTimeout(_poll, 7500);
          }
        } catch (e) {
          clearTimeout(__timr);
          __timr = setTimeout(_poll, 7500);
        }
      });
    }
    if (_key) _poll();
    return function() {
      return {
        sendCommand,
        debugState,
        addAction,
        setKey,
        init: _poll
      };
    };
  }();
  function setLocalStorage(key, value) {
    if (!key || !value) return false;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (window._debug) console.log(e);
      return false;
    }
    return true;
  }
  function getLocalStorage(key) {
    var result = "";
    try {
      result = localStorage.getItem(key);
    } catch (e) {
      if (window._debug) console.log(e);
      return result;
    }
    return result;
  }
  function getSearchParam(key) {
    var val;
    if (location.search.indexOf(key) !== -1) val = location.search.split(key + "=")[1];
    if (val && val.indexOf("&") !== -1) val = val.split("&")[0];
    return val;
  }
  var _secret = "";
  function setSecret(s) {
    _secret = s || "";
  }
  function returnBestSecret(displayKey) {
    if (_secret) return _secret;
    try {
      var s = getSearchParam("secret");
      if (s) return s;
    } catch (e) {
    }
    try {
      if (displayKey) {
        var v = localStorage.getItem("__secret_" + displayKey);
        if (v) return v;
      }
      var g = localStorage.getItem("__secret");
      if (g) return g;
    } catch (e) {
    }
    return "";
  }
  function displayConfigByKeyUrl(key) {
    var url = "https://api.meetingroom365.com/api/display/config/" + key + "?ts=" + Date.now();
    var secret = returnBestSecret(key);
    if (secret) url += "&secret=" + encodeURIComponent(secret);
    return url;
  }
  function coerceBoolean(ins) {
    if (typeof ins === "boolean") return ins;
    if (String(ins) == 1) return true;
    if (String(ins) == 0) return false;
    if (typeof ins === "number" && String(ins) === "NaN") return false;
    if (typeof ins === "number") return true;
    if (typeof ins === "string" && ins.toLowerCase() !== "false") return true;
    return String(ins).toLowerCase() == "true";
  }
  function fixObjectValueTypes(o) {
    for (var k in o) {
      var v = o[k];
      if (v === "undefined") o[k] = void 0;
      if (v === "false") o[k] = false;
      if (v === "null") o[k] = null;
      if (v === "true") o[k] = true;
      if (v === "NaN") o[k] = NaN;
      if (+v == v && v !== "") o[k] = +v;
    }
    return o;
  }
  function fixDisplayConfig(displayConfig2) {
    try {
      if (displayConfig2.updated) displayConfig2.updated = parseInt(displayConfig2.updated);
      if (displayConfig2.hidden) displayConfig2.hidden = coerceBoolean(displayConfig2.hidden);
    } catch (e) {
    }
    try {
      displayConfig2 = fixObjectValueTypes(displayConfig2);
    } catch (e) {
    }
    return displayConfig2;
  }
  function getJson(url) {
    return __async(this, null, function* () {
      let r = yield fetch(url);
      if (r.ok) {
        let data = yield r.json();
        return data;
      }
    });
  }
  function domReady(fn) {
    document.addEventListener("DOMContentLoaded", fn);
    if (document.readyState === "interactive" || document.readyState === "complete") {
      fn();
    }
  }
  var awty;
  var ___mr3652 = {
    _srvr: "https://hwm.meetingroom365.com",
    _APIURL: "https://states.meetingroom365.com",
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
      id: null
    },
    displayKey: null,
    configuration: {
      // Library configuration settings
      STATUS_UPDATE_INTERVAL: 15 * 60 * 1e3,
      UPDATEDEVICESTATUS: false,
      LOCATION: true,
      onUpdate: null
    },
    config: function(conf) {
      this.configuration = Object.assign(this.configuration, conf);
      if (this.configuration.DEBUG || window._debug) console.log("Meeting Room 365 Configuration (Meetingroom365.js):", this.configuration);
    },
    init: function(conf, cb) {
      return __async(this, null, function* () {
        this.configuration = Object.assign(this.configuration, conf);
        if (this.configuration.DEBUG || window._debug) console.log("Meeting Room 365 Configuration (Meetingroom365.js):", this.configuration);
        let key = getSearchParam("key");
        if (key && key !== "false" && key !== "undefined") this.displayKey = key;
        if (this.configuration.key && typeof this.configuration.key === "string" && this.configuration.key !== "false" && this.configuration.key !== "undefined") {
          this.displayKey = this.configuration.key;
        }
        if (!this.displayKey || this.displayKey === "false" || this.displayKey === "undefined") return console.warn("Display key not found. A key must be passed explicitly to init({ key }) or implicitly via query parameter ?key=displayKey");
        if (this.configuration.LOCATION) this.getLocation();
        if (this.configuration.STATUS_UPDATE_INTERVAL) {
          window.__statusUpdateInterval = setInterval(() => this.updateStatus(), this.configuration.STATUS_UPDATE_INTERVAL);
          setTimeout(() => this.updateStatus(), 1e4);
        }
        this.initialize(() => {
          awty.init({ key: this.displayKey, server: this._srvr }, () => {
            if (window._debug) console.log("WS Initialized");
          });
          window._awty = awty;
        });
        this.initialized = true;
        try {
          if (location.protocol === "https:") {
            window.addEventListener("message", function(event) {
              if (event.origin !== "capacitor://localhost") return;
              let { action, content } = event.data;
              try {
                content = JSON.parse(event.data.content);
              } catch (e) {
              }
              if (action === "deviceInfo") window.__deviceInfo = content;
            }, false);
            window.parent.postMessage(
              { action: "register", content: `${location.protocol}//${location.host}` },
              "capacitor://localhost"
            );
          }
        } catch (e) {
          console.log("Could not register postMessage listener");
        }
        let displayConfig2 = yield this.getDisplayConfigByKey(key);
        try {
          this.checkLicense();
        } catch (e) {
        }
        try {
          this.startOnlinePings();
        } catch (e) {
        }
        try {
          this.startDisplayIsOnlinePings();
        } catch (e) {
        }
        if (cb && typeof cb === "function") cb(displayConfig2);
        else return displayConfig2;
      });
    },
    displayIsOnline: function() {
      if (window.demo || window.isPreview || window.isConfiguring) return;
      if (location.hostname.indexOf("localhost") > -1) return;
      var dc = this.displayConfig || {};
      var key = dc.originalKey || dc.key || this.displayKey;
      if (!key || !this._APIURL) return;
      try {
        fetch(this._APIURL + "/displayIsOnline/" + encodeURIComponent(key));
      } catch (e) {
      }
    },
    startDisplayIsOnlinePings: function() {
      if (window.__mr365DisplayIsOnlineTimer) return;
      var self = this;
      self.displayIsOnline();
      window.__mr365DisplayIsOnlineTimer = setInterval(function() {
        self.displayIsOnline();
      }, 8 * 60 * 60 * 1e3);
    },
    offlineNotificationPing: function() {
      var dc = this.displayConfig || {};
      if (!dc.offlineNotificationEmail) return;
      if (window.demo || window.isPreview || window.isConfiguring) return;
      if (location.hash === "#demo") return;
      if (location.hostname.indexOf("localhost") > -1) return;
      var key = dc.originalKey || dc.key || this.displayKey;
      if (!key) return;
      try {
        fetch("https://online.meetingroom365.com/online/" + encodeURIComponent(key));
      } catch (e) {
      }
    },
    startOnlinePings: function() {
      if (window.__mr365OnlinePingTimer) return;
      var self = this;
      setTimeout(function() {
        self.offlineNotificationPing();
      }, 20 * 1e3);
      window.__mr365OnlinePingTimer = setInterval(function() {
        self.offlineNotificationPing();
      }, 7 * 60 * 1e3);
    },
    renderPaymentDue: function(isDue, isSoftWarning) {
      try {
        var prev = document.querySelector(".paymentdue");
        if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
        var prevSoft = document.querySelector(".paymentdue-soft");
        if (prevSoft && prevSoft.parentNode) prevSoft.parentNode.removeChild(prevSoft);
      } catch (e) {
      }
      if (window.demo || window.isPreview || window.isConfiguring) return;
      if (isDue) {
        var h = document.createElement("h1");
        h.className = "paymentdue";
        h.setAttribute("style", "width: 90vw; text-align: center; z-index: 99999999999999999; position: fixed; top: 20vh; left: 5vw; right: 5vw; background: rgba(0,0,0,0.5); padding: 50px 30px; color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif;");
        h.textContent = "There was an issue validating your display license (Payment Due). Please contact support.";
        document.body.appendChild(h);
        if (window.Analytics) window.Analytics.track("app__payment_due");
      } else if (isSoftWarning) {
        var d = document.createElement("div");
        d.className = "paymentdue-soft";
        d.setAttribute("style", "position: fixed; bottom: 8px; left: 10px; z-index: 99999999999999999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.35); padding: 3px 8px; border-radius: 3px; pointer-events: none; letter-spacing: 0.5px;");
        d.textContent = "Unlicensed";
        document.body.appendChild(d);
        if (window.Analytics) window.Analytics.track("app__payment_soft_warning");
      }
    },
    checkLicense: function() {
      return __async(this, null, function* () {
        if (window.demo || window.isPreview || window.isConfiguring) return;
        if (location.hostname.indexOf("localhost") > -1) return;
        var dc = this.displayConfig || {};
        var key = dc.originalKey || dc.key || this.displayKey;
        if (!key) return;
        try {
          var url = "https://licenses.meetingroom365.com/license?key=" + encodeURIComponent(key);
          if (dc.tenant_lc) url += "&tenant=" + encodeURIComponent(dc.tenant_lc);
          var data = yield getJson(url);
          if (data) this.renderPaymentDue(data.warning, data.softWarning);
        } catch (e) {
        }
      });
    },
    initialized: false,
    hardwareStatus: function(cb) {
      return __async(this, null, function* () {
        var battery;
        try {
          if (navigator.getBattery) {
            navigator.getBattery().then(function(data) {
              battery = {
                charging: data.charging,
                chargingTime: data.chargingTime,
                dischargingTime: data.dischargingTime,
                level: data.level
              };
            });
          }
        } catch (e) {
        }
        var status = {
          name: this.displayConfig.name,
          email: this.displayConfig.email,
          tenant: this.displayConfig.tenant,
          displayTs: Date.now(),
          height: window.innerHeight,
          width: window.innerWidth,
          userAgent: navigator.userAgent
        };
        if (battery) status.battery = window.battery;
        if (this._loc) status = Object.assign(status, this._loc);
        if (window.UAParser) {
          const parser = new UAParser(navigator.userAgent);
          const device = parser.getDevice();
          const os = parser.getOS();
          status.manufacturer = device.vendor;
          status.deviceType = device.type;
          status.model = device.model;
          status.platform = os.name;
          status.version = os.version;
        }
        if (cb && typeof cb === "function") cb(status);
        else return status;
      });
    },
    getLocation: function() {
      return __async(this, null, function* () {
        try {
          let r = yield fetch("https://api.meetingroom365.com/location");
          if (r.ok) {
            let loc = yield r.json();
            if (loc.eu) loc.eu = parseInt(loc.eu);
            this._loc = loc;
          }
        } catch (e) {
        }
      });
    },
    updateStatus: function(obj, cb) {
      return __async(this, null, function* () {
        if (!this.displayKey) return;
        let key = this.displayKey;
        if (key.indexOf("-")) key = key.split("-")[0];
        try {
          obj = JSON.parse(obj);
        } catch (e) {
        }
        if (!obj || typeof obj !== "object") obj = {};
        if (!obj.displayKey) obj.displayKey = key;
        if (!obj.key) obj.key = key;
        obj.site = location.hostname;
        if (!this._basicDataSent) {
          let hwStatus = yield this.hardwareStatus();
          obj = Object.assign(obj, hwStatus);
        }
        try {
          obj = JSON.parse(obj.toString().trim());
        } catch (e) {
        }
        if (!window.fetch || !this._APIURL) return;
        if (this.configuration.STATUS_UPDATE_INTERVAL && obj && obj.key) {
          let stateResult = yield post(this._APIURL + "/displaystate", obj);
          if (window._debug) console.log("Display hardware status updated", obj);
          this._basicDataSent = true;
        }
        if (this.configuration.UPDATEDEVICESTATUS && obj && obj.email) {
          let statusResult = yield post(this._APIURL + "/displayStatus", obj);
          if (window._debug) console.log("Display status-state updated", obj);
        }
        if (cb && typeof cb === "function") cb();
      });
    },
    getDisplayConfigByKey: function(key, cb) {
      return __async(this, null, function* () {
        if (!key || typeof key !== "string" || key === "undefined" || key === "false") return;
        let r = yield fetch(displayConfigByKeyUrl(key));
        if (r.ok) {
          let data = yield r.json();
          if (data) data = fixDisplayConfig(data);
          if (this.displayConfig && typeof displayConfig === "object") this.displayConfig = Object.assign(this.displayConfig, data);
          else this.displayConfig = data;
          if (window._debug) console.log("Fetched display configuration", data);
          if (cb && typeof cb === "function") cb(data);
          else return data;
        }
      });
    },
    getConfiguration: function(cb) {
      return __async(this, null, function* () {
        if (!this.displayKey) return;
        let key = this.displayKey;
        if (key.indexOf("-")) key = key.split("-")[0];
        let displayConfig2 = yield this.getDisplayConfigByKey(key);
        if (cb && typeof cb === "function") cb(displayConfig2);
        else return displayConfig2;
      });
    },
    initialize: function(cb) {
      if (awty) {
        if (cb && typeof cb === "function") return cb();
        else return;
      }
      awty = new Awty();
      this.addAction("restart", () => this.handleRestart());
      this.addAction("update", () => this.handleUpdate());
      if (cb && typeof cb === "function") cb();
    },
    restartApp: function() {
      if (performance.now() < 6e4) return;
      if (window._debug) console.log("Restarting..");
      try {
        top.location.reload();
      } catch (e) {
      }
      try {
        parent.location.reload();
      } catch (e) {
      }
      try {
        location.reload();
      } catch (e) {
      }
    },
    handleUpdate: function(msg) {
      return __async(this, null, function* () {
        let displayConfig2 = yield this.getConfiguration();
        if (this.configuration.onUpdate && typeof this.configuration.onUpdate === "function") {
          this.configuration.onUpdate(displayConfig2);
        }
        if (window._debug) console.log("handleUpdate", msg);
      });
    },
    handleRestart: function() {
      if (this.restartApp && typeof this.restartApp === "function")
        this.restartApp();
    },
    addAction: function(key, fn) {
      if (!awty) return console.warn("Uninstantiated instance of DisplayJoy (Meeting Room 365) cannot listen for events.");
      awty.addAction(key, fn);
    },
    on: function(key, fn) {
      if (!awty) return console.warn("Uninstantiated instance of DisplayJoy (Meeting Room 365) cannot listen for events.");
      awty.addAction(key, fn);
    },
    onRestart: function() {
    },
    onUpdate: function() {
    },
    setSecret: function(s) {
      setSecret(s);
    },
    ready: domReady
  };
  try {
    if (window && typeof window === "object" && window.document) {
      window.Meetingroom365 = window.meetingroom365 = ___mr3652;
    }
  } catch (e) {
  }
  try {
    if (typeof window !== "undefined" && window.addEventListener && window.location) {
      var search = window.location.search || "";
      var inPreview = search.indexOf("preview=1") !== -1 || search.indexOf("&preview=") !== -1;
      if (inPreview) {
        var ALLOWED = [
          "https://admin.meetingroom365.com",
          "https://admin-staging.meetingroom365.com",
          "https://next.meetingroom365.com",
          "http://localhost:5173",
          "http://localhost:8080",
          "http://localhost:3000",
          "http://127.0.0.1:5173"
        ];
        var originAllowed = function(origin) {
          if (!origin) return false;
          if (ALLOWED.indexOf(origin) !== -1) return true;
          return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        };
        var ack = function(id, source) {
          if (id == null || !source || typeof source.postMessage !== "function") return;
          try {
            source.postMessage({ type: "mr365.config.ack", id }, "*");
          } catch (e) {
          }
        };
        var broadcast = function() {
          try {
            window.displayConfig = ___mr3652.displayConfig;
          } catch (e) {
          }
          try {
            if (typeof ___mr3652.configuration.onUpdate === "function") {
              ___mr3652.configuration.onUpdate(___mr3652.displayConfig);
            }
          } catch (e) {
          }
          try {
            window.dispatchEvent(new CustomEvent("mr365:config-changed", {
              detail: { config: ___mr3652.displayConfig }
            }));
          } catch (e) {
          }
        };
        window.addEventListener("message", function(e) {
          if (!e || !e.data || typeof e.data !== "object") return;
          if (!originAllowed(e.origin)) return;
          var data = e.data;
          if (data.type === "mr365.config.ping") {
            ack(data.id, e.source);
            return;
          }
          if (data.type === "mr365.config.patch" && data.patch && typeof data.patch === "object") {
            ___mr3652.displayConfig = Object.assign({}, ___mr3652.displayConfig || {}, data.patch);
            broadcast();
            ack(data.id, e.source);
            return;
          }
          if (data.type === "mr365.config.replace" && data.config && typeof data.config === "object") {
            ___mr3652.displayConfig = data.config;
            broadcast();
            ack(data.id, e.source);
            return;
          }
        });
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "mr365.preview.ready" }, "*");
          }
        } catch (e) {
        }
      }
    }
  } catch (e) {
  }
  return ___mr3652;
}();
if (typeof module !== "undefined") {
  module.exports = ___mr365;
}
(function() {
  try {
    if (typeof window === "undefined" || !window.addEventListener) return;
    if (window.__mr365HeartbeatBound) return;
    window.__mr365HeartbeatBound = true;
    window.addEventListener("message", function(event) {
      var data = event && event.data;
      if (!data || data.action !== "ping") return;
      var target = event.source || window.parent;
      if (!target) return;
      try {
        target.postMessage(
          { action: "pong", content: data.content },
          event.origin || "*"
        );
      } catch (e) {
      }
    });
  } catch (e) {
  }
})();
