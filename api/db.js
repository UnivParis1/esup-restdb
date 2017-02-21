'use strict';

let mongodb = require('mongodb');
let conf = require('../conf');

let dbPrefix;
let client_cache;
let collections_cache = {};

const get_client_raw = () => {
    return mongodb.MongoClient.connect(conf.mongodb.url).then(client => {
        dbPrefix = client.databaseName;
        client_cache = client;
        return client;
    })
};    
const get_client = () => (
    client_cache
        ? Promise.resolve(client_cache)
        : get_client_raw()
);


const v_export_id = (v) => {
    if (v) {
        if (!("id" in v)) v.id = v._id;
        delete v._id;
    }
    return v;
}

const toObjectID = (id) => (
    id === null || mongodb.ObjectID.isValid(id) ? new mongodb.ObjectID(id) : null 
);

exports.v_id = (id) => { 
    let _id = toObjectID(id);
    return _id ? { _id } : { id };
};

exports.collection = (db_name, collection_name) => (
    get_client().then(client => {
        if (!collections_cache[db_name]) collections_cache[db_name] = {};
        
        let collection = collections_cache[db_name][collection_name];
        if (collection) {
            return Promise.resolve(collection);
        } else {
            collection = collections_cache[db_name][collection_name] = client.db(dbPrefix + db_name).collection(collection_name);
            return collection.createIndex({ id: 1, uid: 1 }).then(_ =>
                collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
            ).then(_ => collection);
        }
    })
);

exports.get = (collection, criteria) => (
    collection.find(criteria).limit(1).next().then(v_export_id)
);

exports.find = (collection, criteria) => (
    collection.find(criteria).toArray().then(l => l.map(v_export_id))
);

exports.delete = (collection, criteria) => (
    collection.deleteOne(criteria).then(result => {
        //console.log("delete", criteria, result);
        return result.deletedCount ? { ok: 1 } : Promise.reject("not found");
    })
);

exports.save = (collection, criteria, v) => {
    Object.assign(v, criteria);
    v.modifyTimestamp = new Date();
    if (v.expireAt) v.expireAt = new Date(v.expireAt);
    console.log("saving in DB:", v);
    return collection.updateOne(criteria, v, {upsert: true}).then(_ => (
        { ok: 1, id: "id" in v ? v.id : v._id }
    ));
};
