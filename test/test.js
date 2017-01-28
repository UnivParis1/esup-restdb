"use strict";

var restdb_url = "http://localhost:8080/alerts/msgs_info/$user";
var msgs = [
    { id: 1, title: "First message" },
    { id: 2, title: "Second message" },
];

function loadScript(url, params) {
    var elt = document.createElement("script");
    elt.setAttribute("type", "text/javascript");
    elt.setAttribute("src", url + (params && params.length ? "?" + params.join('&') : ''));
    elt.setAttribute("async", "async");
    elt.setAttribute("charset", "utf-8"); // workaround IE ignoring Content-Type
    document.head.appendChild(elt);
}

// !! use once at a time
function jsonp(url, callback) {
    window.restdb_callback = callback;
    loadScript(url, [ "callback=window.restdb_callback"]);
}

function blind_json_xhr(method, url, json) {
    var req = new XMLHttpRequest();
    if (!req) return;
    req.open(method, url, true);
    req.responseType = 'json';
    req.withCredentials = true;
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(json));
}

function destroyElt(elt) {
    elt.parentNode.removeChild(elt);
}

function toggle(id, event) {
    var method = event.target.className === "read" ? "DELETE" : "PUT";
    blind_json_xhr(method, restdb_url + "/" + id, { hide: true });
    event.target.className = method === "PUT" ? "read" : '';
}

jsonp(restdb_url, function (msgs_info) {
    var list = msgs.map(function (msg) {
        var className = msgs_info[msg.id] ? "read" : '';
        return "<li class='" + className + "' onclick='toggle(" + msg.id + ", event)'>" + msg.title + "</li>";
    }).join("\n");

    document.getElementById("main").innerHTML = "<ul>" + list + "</ul>";
});
