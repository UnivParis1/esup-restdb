"use strict";

let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let cors = require('cors');
let utils = require('./utils');
let auth = require('./auth');
let routes = require('./routes');
let conf = require('../conf');

module.exports = function (app) {
    app.set('trust proxy', conf['trust proxy']);
    if (conf['trust proxy']) app.use(utils.trust_proxy_host_port);

    auth(app);

    app.use(cors(Object.assign({ credentials: true }, conf.cors)));
    app.use(bodyParser.json({type: '*/*'})); // do not bother checking, everything we will get is JSON :)
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use('/', routes);
}
