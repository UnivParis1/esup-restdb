"use strict";

let session = require('express-session');
let FileStore = require('session-file-store')(session);
let bodyParser = require('body-parser');
let routes = require('./routes');
let cookieParser = require('cookie-parser');
let cors = require('cors');
let cas = require('connect-cas');
let cas_ssout = require('./cas-ssout');
let utils = require('./utils');
let conf = require('../conf');

cas.configure(conf.cas);

const wrap_req_user = (req, res, next) => {
    if (req.session.cas && req.session.cas.user) {
        req.user = { id: req.session.cas.user };
    }
    next();
};

// workaround X-Forwarded-Port not handled by expressjs "trust proxy"
// useful for cas "authenticate" or "gateway" middleware
const trust_proxy_host_port = (req, res, next) => {
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

const may_try_CAS = (req, res, next) => {
    if (utils.isJsonp(req) && !req.query.auth_checked) {
        req.query.auth_checked = 1;
        cas.gateway()(req, res, next);
    } else {
        next();
    }
};

module.exports = function (app) {
    app.set('trust proxy', conf['trust proxy']);
    app.use(trust_proxy_host_port);
    app.use(cors(Object.assign({ credentials: true }, conf.cors)));
    //app.use("/test", require('express').static(__dirname + '/../test'));
    app.use(bodyParser.json({type: '*/*'})); // do not bother checking, everything we will get is JSON :)
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({store: new FileStore(conf.session.FileStore), secret: conf.session.secret, resave: false, saveUninitialized: false}));
    app.use(cas.serviceValidate(), wrap_req_user, may_try_CAS);
    app.use('/', routes);
}
