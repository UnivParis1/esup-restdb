"use strict";
let express = require('express')
let db = require('./db')
let utils = require('./utils');

let router = express.Router();

const respondError = (res, err) => {
    let msg = {error: "" + err};
    if (err.stack) msg.stack = err.stack;
    res.status(400).json(msg);
};

const respondJson = (req, res, p) => {
    let logPrefix = req.method + " " + req.path + ":";
    p.then(r => {
        //console.log(logPrefix, r);
        if (utils.isJsonp(req)) {
            res.header('Content-type', 'application/javascript; charset=UTF-8');
            res.send(req.query.callback + '(' + JSON.stringify(r || {}) + ');');  
        } else {
            res.json(r || {});
        }
    }).catch(err => {
        console.error(logPrefix, err + err.stack);
        respondError(res, err);
    });
};

const collection = (req) => (
    db.collection(req.params.db, req.params.collection)
);

const v_addUid = (req, v) => {
    v.uid = req.user.id;
    return v;
};

const v_removeUid = (v) => {
    if (v) { delete v.uid; delete v._id; }
    return v;
};

const array2map = (l) => {
    let m = {};
    l.forEach(v => {
        m[v.id] = v;
        delete v.id;
    });
    return m;
};

const getAll = (req) => collection(req).then(collection => (
    db.find(collection, {}).then(array2map)
));
const get = (req) => collection(req).then(collection => (
    db.get(collection, { id: req.params.id })
));
const delete_ = (req) => collection(req).then(collection => (
    db.delete(collection, { id: req.params.id })
));
const put = (req) => collection(req).then(collection => (
    db.save(collection, { id: req.params.id }, req.body)
));

const getAllWithUid = (req) => collection(req).then(collection => (
    db.find(collection, v_addUid(req, {})).then(l => array2map(l.map(v_removeUid)))
));
const getWithUid = (req) => collection(req).then(collection => (
    db.get(collection, v_addUid(req, { id: req.params.id })).then(v_removeUid)
));
const deleteWithUid = (req) => collection(req).then(collection => (
    db.delete(collection, v_addUid(req, { id: req.params.id }))
));
const putWithUid = (req) => collection(req).then(collection => (
    db.save(collection, v_addUid(req, { id: req.params.id }), req.body)
));

const with_acl = (f) => (req, res) => (
    req.user && req.user.id /* TODO */
        ? respondJson(req, res, f(req))
        : respondError(res, "Unauthorized")
);


router.get("/:db/:collection/\\$user/:id", with_acl(getWithUid));
router.put('/:db/:collection/\\$user/:id', with_acl(putWithUid));
router.delete('/:db/:collection/\\$user/:id', with_acl(deleteWithUid));
router.get('/:db/:collection/\\$user', with_acl(getAllWithUid));
router.get("/:db/:collection/:id", with_acl(get));
router.put("/:db/:collection/:id", with_acl(put));
router.delete("/:db/:collection/:id", with_acl(delete_));
router.get("/:db/:collection", with_acl(getAll));


module.exports = router;
