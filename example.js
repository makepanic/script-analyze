var scriptAnalyze = require('./lib/script-analyze'),
    db = require('./lib/db'),
    dbInstance,
    collection;

db.init().then(function(result){
    dbInstance = result.db;
    collection = result.pages;

    scriptAnalyze.loadList('./res/top-1m.csv').then(function(data){
        scriptAnalyze.analyze(data.splice(0, 3)).then(function(pages){
            db.store(pages, collection)
        });
    });

});
