"use strict";

let session = require('express-session');
let FileStore = require('session-file-store')(session);
let cas = require('connect-cas');
let cas_ssout = require('./cas-ssout');
let utils = require('./utils');
let conf = require('../conf');


const cas_getId = (req) => req.session && req.session.cas && req.session.cas.user;
const external_getId = (req) => req.get('REMOTE_USER');

const wrap_req_user = (getId) => (req, res, next) => {
    let id = getId(req);
    if (id) req.user = { id: id };
    next();
};


const may_try_CAS = (req, res, next) => {
    if (req.user && req.user.id || req.query.auth_checked) {
        next();
    } else if (utils.isJsonp(req) || req.query.target) {
        req.query.auth_checked = 1;
        let f = req.query.target && !req.path.match(/prompt.none/) ? cas.authenticate() : cas.gateway();
        f(req, res, next);
    } else {
        next();
    }
};

module.exports = function (app) {
    if (conf['auth'] === 'cas') {
        cas.configure(conf.cas);
        app.use(session({store: new FileStore(conf.session.FileStore), secret: conf.session.secret, resave: false, saveUninitialized: false}));
        app.use(cas.serviceValidate(), wrap_req_user(cas_getId), may_try_CAS);
    } else if (conf['auth'] === 'external') {
        app.use(wrap_req_user(external_getId));
    }
};