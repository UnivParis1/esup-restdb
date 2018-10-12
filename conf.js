'use strict';

const ldap_base = "dc=univ,dc=fr";

let conf = {
    mongodb: { 
        url: "mongodb://localhost:27017/restdb-", // the database name will be used as a prefix for restdb database names
    },
    ldap: {
        uri: 'ldap://ldap',
        // empty for anonymous bind:
        dn: 'cn=comptex,ou=admin,' + ldap_base,
        password: 'xxx',
        base: ldap_base,
        admin_filter: (user, db) => `(&(uid=${user.id})(memberOf=cn=applications.restdb.${db},ou=groups,${ldap_base}))`,
        disconnectWhenIdle_duration: 1 * 60 * 1000, // in milliseconds
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

    triggers: {
    },
};

module.exports = conf;
