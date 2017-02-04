function restdb_init(conf) {
    "use strict";

    function loadScript(url, params, callback) {
        var elt = document.createElement("script");
        elt.setAttribute("type", "text/javascript");
        elt.setAttribute("src", url + (params && params.length ? "?" + params.join('&') : ''));
        elt.setAttribute("async", "async");
        elt.setAttribute("charset", "utf-8"); // workaround IE ignoring Content-Type
        elt.onerror = callback;
        document.head.appendChild(elt);
    }

    // !! use once at a time
    function jsonp(url, callback) {
        window.restdb_callback = function (v) { callback(null, v); };
        loadScript(url, [ "callback=window.restdb_callback"], function (evt) { callback({ error: "unknown" })});
    }

    function json_xhr(method, url, json, callback) {
        var req = new XMLHttpRequest();
        if (!req) return;
        req.open(method, url, true);
        req.responseType = 'json';
        req.withCredentials = true;
        req.setRequestHeader("Content-Type", "application/json");
        req.onload = function () {
            req.status === 200 ? callback(null, req.response) : callback(req.response);
        };
        req.onerror = function () { callback(req.response); };
        req.send(json !== null ? JSON.stringify(json) : null);
    }

    function redirect_login(opts) {
        document.location.href = conf.url + "/.login" + (opts.prompt_none ? '/prompt_none' : '') + "?target=" + encodeURI(document.location.href);
    }
    function redirect_login_onerror(callback, opts) {
        return function (err, v) {
            if (err) 
                redirect_login(opts);
            else 
                callback(err, v);
        };
    }

    function get(url, opts, callback) {
        var cb = opts.allowRedirect && !(conf.allowJsonp && opts.prompt_none) ? redirect_login_onerror(callback, opts) : callback; 
        if (conf.allowJsonp) 
            jsonp(url, cb);
        else 
            json_xhr('GET', url, null, cb);
    };
    var set = function (url, json, opts, callback) {
        var cb = opts.allowRedirect ? redirect_login_onerror(callback, opts) : callback; 
        json_xhr(json === null ? 'DELETE' : 'PUT', url, json, cb);
    };

    return { get: get, set: set };
}