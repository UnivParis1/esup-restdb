"use strict";

var restdb = restdb_init({ url: "" });
var ourDB = "/alerts/msgs_info/$user";

var msgs = [
    { id: 1, title: "First message" },
    { id: 2, title: "Second message" },
];

function display(err, msgs_info) {
    if (err) return alert(JSON.stringify(err));
    var list = msgs.map(function (msg) {
        var className = msgs_info[msg.id] ? "read" : '';
        return "<li class='" + className + "' onclick='toggle(" + msg.id + ", event)'>" + msg.title + "</li>";
    }).join("\n");

    document.getElementById("main").innerHTML = "<ul>" + list + "</ul>";
}

var db_with_cache;

function toggle(id, event) {
    var v = event.target.className === "read" ? null: { hide: true };
    db_with_cache.set(id, v);
}

db_with_cache = restdb_with_cache(restdb, ourDB, { allowRedirect: true }, display);
