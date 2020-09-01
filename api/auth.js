"use strict";

let session = require('express-session');
let FileStore = require('session-file-store')(session);
var url = require('url');
let cas = require('connect-cas');
let utils = require('./utils');
let conf = require('../conf');

const is_urlencoded = (req) => (
    req.header('Content-Type') === 'application/x-www-form-urlencoded' // checking Content-Type is enough: Restdb never used <form> POST urlencoded, it uses JSON
)

const cas_getId = (req) => req.session && req.session.cas && req.session.cas.user;
const external_getId = (req) => req.get('REMOTE_USER');

const wrap_req_user = (getId) => (req, res, next) => {
    let id = getId(req);
    if (id) req.user = { id: id };
    next();
};

// if no session and CAS
// - GET /db/coll/foo => error "Unauthorized"
// - GET /db/coll/foo ? callback = x 
//   => https://cas/login ? gateway & service = https://restdb/db/coll/foo?callback=x&auth_checked
//     => /db/coll/foo ? callback = x & auth_checked => error "Unauthorized"
//     => /db/coll/foo ? callback = x & auth_checked & ticket = zzz => return v
// - GET /.login ? then = https://app
//   => https://cas/login ? service = https://restdb/.login?then=https://app&auth_checked
//     => /.login ? then = https://app & auth_checked & ticket = zzz
//        => https://app
const may_login_cas = (req, res, next) => {
    if (!conf.auth.cas.enabled || req.query.auth && req.query.auth !== 'cas' || req.query.idpId || !utils.isJsonp(req) && !req.query.then) return false;

    req.query.auth_checked = 1;
    let f = req.query.then && req.query.prompt !== 'none' ? cas.authenticate() : cas.gateway();
    f(req, res, next);
    return true;
};

// if no session and shibboleth
// - GET /db/coll/foo => error "Unauthorized"
// - GET /.login ? then = https://app & prompt = none & idpId = yyy
//   => /Shibboleth.sso/Login ? target = /.login?then=https://app&auth_checked & isPassive=true & entityID=yyy
//     => /.login ? then = https://app & auth_checked
//        => https://app or error
// - GET /.login ? then = https://app & idpId = yyy
//   => /Shibboleth.sso/Login ? target = /.login?then=https://app&auth_checked & entityID=yyy
//     => /.login ? then = https://app & auth_checked
//        => https://app
const may_login_shibboleth = (req, res, next) => {
    if (!conf.auth.shibboleth.enabled || req.query.auth && req.query.auth !== 'shibboleth' || !req.query.then) return false;

    let target = url.format({ pathname: '/.login', query: { auth_checked: 1, then: req.query.then }});
    let query = { target: target };
    if (req.query.idpId) query.entityID = req.query.idpId;
    if (req.query.prompt === 'none') query.isPassive = true;
    res.redirect(url.format({ pathname: conf.auth.shibboleth.SessionInitiator, query: query }));
    return true;
};

const may_login = (req, res, next) => {
    if (req.user && req.user.id || req.query.auth_checked) {
        next();
    } else {
        may_login_cas(req, res, next) || may_login_shibboleth(req, res, next) || next();
    }
};

module.exports = function (app) {
    if (conf.auth.cas.enabled) {
        cas.configure(conf.auth.cas);
        app.use(session({store: new FileStore(conf.session.FileStore), secret: conf.session.secret, resave: false, saveUninitialized: false}));
        app.use(cas.ssout(is_urlencoded), cas.serviceValidate(), wrap_req_user(cas_getId));
    }
    if (conf.auth.shibboleth.enabled) {
        app.use(wrap_req_user(external_getId));
    }
    app.use(may_login);
};
