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

function toggle(id, event) {
    var v = event.target.className === "read" ? null: { hide: true };
    restdb.set(ourDB + "/" + id, v, { allowRedirect: true }, function (err, resp) {
        if (err) return alert(JSON.stringify(err));
        event.target.className = v ? "read" : '';
    });
}

restdb.get(ourDB, { allowRedirect: true }, display);
