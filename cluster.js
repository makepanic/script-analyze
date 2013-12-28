var numCPUs = require('os').cpus().length,
    cluster = require('cluster'),
    scriptAnalyze = require('./lib/script-analyze'),
    db,
    dbInstance,
    collection,
    pages,
    start = Date.now(),
    end,
    numOffset = 6000,
    numPagesFromBeginning = 500;

numCPUs = 4;

if (cluster.isMaster) {
    db = require('./lib/db');
    pages = [];

    db.init().then(function(result){
        dbInstance = result.db;
        collection = result.pages;

        scriptAnalyze.loadList('./res/top-1m.csv').then(function(data){
            data = data.splice(numOffset, numPagesFromBeginning);

            var chunkSize = Math.ceil(data.length / numCPUs),
                chunksReceived = 0;

            console.log('spawning', numCPUs, 'workers with chunksize', chunkSize);

            // Create a worker for each CPU
            for (var i = 0; i < numCPUs; i += 1) {
                var chunkBorder = i * chunkSize;
                var worker = cluster.fork();

                worker.on('message', function(data){
                    if (data.analyzeDone){

                    }

                    if (data.workerDone){
                        chunksReceived++;
                        pages = pages.concat(data.pages);

                        console.log('chunksReceived', chunksReceived, numCPUs);

                        if (chunksReceived === numCPUs){
                            console.log('master ready pages:', pages.length);
                            db.store(pages, collection).then(function(msg){
                                end = Date.now();
                                console.log('insert duration', end - start, 'ms');
                            });
                        }
                    }
                });

                worker.send({
                    start: true,
                    data: data.slice(chunkBorder, chunkBorder + chunkSize)
                });
            }
        });


    });


} else if (cluster.isWorker) {
    process.on('message', function(data) {
        // we only want to intercept messages that have a chat property
        if(data.start){
            scriptAnalyze.analyze(data.data, function(result){
                process.send({
                    analyzeDone: true,
                    result: result
                });
            });

            scriptAnalyze.analyze(data.data).then(function(pages){
                console.log('analyze done, sending process result');
                process.send({
                    workerDone: true,
                    pages: pages
                });
            });
        }
    });
}

