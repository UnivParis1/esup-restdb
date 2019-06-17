// required: conf.url
// optional: conf.idpId, conf.auth
function restdb_init(conf) {
    "use strict";

    conf.allowJsonp = !conf.auth || conf.auth === "cas";
    
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
        loadScript(url, [ "callback=window.restdb_callback"], function (evt) { callback({ error: "jsonp failed" })});
    }

    function json_xhr(method, url, json, callback) {
        var req = new XMLHttpRequest();
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

    function urlWithQuery(url, params) {
        var firstParam = !url.match(/\?/); 
        for (var name in params) {
            var v = params[name];
            if (v != undefined) {
                url += (firstParam ? '?' : '&') + name + '=' + encodeURIComponent(v); 
                firstParam = false;
            }
        }
        return url;
    }

    function redirect_login(opts) {
        var url = urlWithQuery(conf.url + "/.login", {
            then: document.location.href,
            prompt: opts.prompt,
            idpId: conf.idpId,
            auth: conf.auth,
        });
        document.location.href = url;
    }

    function redirect_login_onerror(callback, opts) {
        return function (err, v) {
            if (err) 
                redirect_login(opts);
            else 
                callback(err, v);
        };
    }

    function get(path, opts, callback) {
        var url = conf.url + path;
        var cb = opts.allowRedirect && !(conf.allowJsonp && opts.prompt === 'none') ? redirect_login_onerror(callback, opts) : callback; 
        if (conf.allowJsonp)
            jsonp(url, cb);
        else 
            json_xhr('GET', url, null, cb);
    }

    function action(method, path, json, opts, callback) {
        var url = conf.url + path;
        var cb = opts.allowRedirect ? redirect_login_onerror(callback, opts) : callback; 
        json_xhr(method, url, json, cb);
    }

    function set(path, json, opts, callback) {
        action(json === null ? 'DELETE' : 'PUT', path, json, opts, callback);
    }

    function add(path, json, opts, callback) {
        action('POST', path, json, opts, callback);
    }
    
    return { get: get, set: set, add: add };
}
