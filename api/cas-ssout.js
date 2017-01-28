// inspired from connect-cas/lib/ssout.js, but is a true filter:
// only handle CAS SLO request, not any POST on a specific URL

module.exports = function(req,res,next) {
        if (!req.sessionStore) throw new Error('no session store configured');

        req.ssoff = true;
        if (req.method === 'POST' && /<samlp:SessionIndex>(.*)<\/samlp:SessionIndex>/.exec(req.body)) {
            var st = RegExp.$1;

            req.sessionStore.get(st, function(err, result){
                if (result && result.sid) req.sessionStore.destroy(result.sid);
                req.sessionStore.destroy(st);
            })
            res.send(204);
        } else {
            next();
        }
}
