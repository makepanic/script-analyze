var server,
    dbName,
    collectionName,
    mongodb = require('mongodb'),
    RSVP = require('rsvp'),
    nconf = require('nconf'),
    mongoClient = mongodb.MongoClient;

nconf.file({
    file: 'config.json'
});

server = nconf.get('database:server');
dbName = nconf.get('database:name');
collectionName = nconf.get('database:table');

exports.init = function(){
    return new RSVP.Promise(function(resolve, reject){
        mongoClient.connect('mongodb://' + server + '/' + dbName, function(err, db) {
            var collection;

            if(!err) {
                // no error

                // create collection
                collection = db.collection(collectionName);

                console.log('db ready');

                // call fn
                resolve({
                    db: db,
                    pages: collection
                });
            } else {
                reject(err);
            }
        });
    });
};
exports.store = function(data, collection){
    return new RSVP.Promise(function(resolve){
        collection.insert(data, {
            safe: true
        }, function(err){
            if (err) {
                throw err;
            }

            resolve('insert done');
        });
    });
};