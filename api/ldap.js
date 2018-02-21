const conf = require('../conf');
const _ = require('lodash');
const ldapjs = require('ldapjs');

let _clientP;
function clientP() {
    if (!_clientP) _clientP = new_clientP();
    return _clientP;
}

function new_clientP() {
    console.info("connecting to " + conf.ldap.uri);
    const c = ldapjs.createClient({ url: conf.ldap.uri, reconnect: true, idleTimeout: conf.ldap.disconnectWhenIdle_duration });
    c.on('connectError', console.error);
    c.on('error', console.error);
    c.on('idle', () => {
        //console.log("destroying ldap connection");
        c.destroy();
        _clientP = undefined;
    });

    return new Promise((resolve, reject) => {
        c.on('connect', () => {
            console.log("connected to ldap server");
            c.bind(conf.ldap.dn, conf.ldap.password, err => {
                if (err) console.error(err);
                err ? reject(err) : resolve(c);
            });
        });
    });
}

exports.searchRaw = (base, filter, attributes, options) => {
    if (attributes.length === 0) {
        // workaround asking nothing and getting everything. Bug in ldapjs???
        attributes = ['objectClass'];
    }
    let params = _.merge({ filter, attributes, scope: "sub" }, options);
    return new Promise((resolve, reject) => {
        let l = [];
        clientP().then(c => c.search(base, params, (err, res) => {
            if (err) return reject(err);

            res.on('searchEntry', entry => {
                l.push(entry.raw);
            });
            res.on('searchReference', referral => {
                console.log('referral: ' + referral.uris.join());
            });
            res.on('error', err => {
                if ((err || {}).name === 'SizeLimitExceededError') {
                    // that's ok, return what we got:
                    resolve(l);
                } else {
                    console.log("ldap error:" + err);
                    reject(err);
                }
            });
            res.on('end', result => {
                if (result.status === 0)
                    resolve(l);
                else
                    reject("unknown error");
            });
        }));
    });
}
