'use strict';

const ldap_base = "dc=univ,dc=fr";

const readonly_trusted_ips = {
    //"xxx": { "192.168.1.11": true },
}

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
        disconnectWhenIdle_duration: 1 * 60 * 1000, // in milliseconds
    },
    acls: {
        // for "admin_xxx" and non /$user accesses
        read: (_user, db, req) => (readonly_trusted_ips[db] || {})[req.ip],
        write: (user, db, _req) => user && { ldap_filter: `(&(uid=${user.id})(memberOf=cn=applications.restdb.${db},ou=groups,${ldap_base}))` },
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
