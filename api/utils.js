"use strict";

//exports.removePrefixOrNull = (s, prefix) => {
//    let len = prefix.length;
//    return s.substr(0, len) === prefix ? s.substr(len) : null;
//};

exports.isJsonp = (req) => req.method === 'GET' && req.query.callback
