"use strict";

//exports.removePrefixOrNull = (s, prefix) => {
//    let len = prefix.length;
//    return s.substr(0, len) === prefix ? s.substr(len) : null;
//};

exports.isJsonp = (req) => req.method === 'GET' && req.query.callback

// workaround X-Forwarded-Port not handled by expressjs "trust proxy"
// useful for cas "authenticate" or "gateway" middleware
exports.trust_proxy_host_port = (req, res, next) => {
    let host = req.hostname;
    let port = req.headers['x-forwarded-port'];
    if (port) {
        if (req.protocol === 'http' && port == '80' ||
            req.protocol === 'https' && port == '443') {
            // no port
        } else {
            host = host + ':' + port;
        }
        req.headers.host = host;
    }
    next();
};

