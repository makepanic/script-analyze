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

    console.log('inserting', data.length, 'items');

    collection.insert(data, {
        safe: true
    }, function(err, docs){
        if (err) {
            throw err;
        }
        console.log('inserted', docs.length, 'documents');
    });

};