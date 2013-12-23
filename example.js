var scriptAnalyze = require('./lib/script-analyze'),
    db = require('./lib/db'),
    dbInstance,
    collection,

    start = Date.now(),
    end;



db.init().then(function(result){
    dbInstance = result.db;
    collection = result.pages;

    scriptAnalyze.loadList('./res/top-1m.csv').then(function(data){
        scriptAnalyze.analyze(data.splice(0, 1000)).then(function(pages){
            db.store(pages, collection).then(function(msg){
                end = Date.now();
                console.log('duration', end - start, 'ms');
            })
        });
    });

});
