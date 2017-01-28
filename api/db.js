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

exports.collection = (db_name, collection_name) => (
    get_client().then(client => {
        if (!collections_cache[db_name]) collections_cache[db_name] = {};
        
        let collection = collections_cache[db_name][collection_name];
        if (collection) {
            return Promise.resolve(collection);
        } else {
            collection = collections_cache[db_name][collection_name] = client.db(dbPrefix + db_name).collection(collection_name);
            return collection.createIndex({ uid: 1 }).then(_ => collection);
        }
    })
);

exports.get = (collection, criteria) => (
    collection.find(criteria).limit(1).next()
);

exports.find = (collection, criteria) => (
    collection.find(criteria).toArray()
);

exports.delete = (collection, criteria) => (
    collection.deleteOne(criteria).then(result => {
        //console.log("delete", criteria, result);
        return result.deletedCount ? true : Promise.reject("not found");
    })
);

exports.save = (collection, criteria, v) => {
    Object.assign(v, criteria);
    v.modifyTimestamp = new Date();
    console.log("saving in DB:", v);
    return collection.updateOne(criteria, v, {upsert: true});
};
