'use strict';

let conf = {
    mongodb: { 
        url: "mongodb://localhost:27017/restdb-", // the database name will be used as a prefix for restdb database names
    },
    auth: {
        cas: {
            enabled: true,
            host: 'cas.univ.fr',
        },
        shibboleth: {
            enabled: false,
            SessionInitiator: '/Shibboleth.sso/Login',
        },
    },
    session: {
        'secret': 'XXXrestdbXXX',
        //'FileStore': { path: '/tmp' },
    },
    
    // http://expressjs.com/en/guide/behind-proxies.html
    'trust proxy': true,

    // https://github.com/expressjs/cors#configuration-options
    cors: {
        origin: true /* TODO */,
    },

    triggers: [ ],
};

module.exports = conf;
