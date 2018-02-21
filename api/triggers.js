let conf = require('../conf');

exports.call_ = (trigger_name, db_name, req) => {
    if (!conf.triggers.includes(db_name)) {
        return Promise.resolve();
    }

    const module = require('./triggers/' + db_name); // will throw exception if missing, that's ok
    const f = module[trigger_name];
    if (!f) {
        // that's ok, this trigger is not handled
        //console.log("no trigger " + trigger_name + " for " + db_name);
        return Promise.resolve();
    }
    return f(req);
}
