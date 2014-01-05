/**
 * cmdline params:
 * --threads Number - Number of threads
 * --offset Number - Offset from the first item of the csv file
 * --size Number - How many items to load before inserting into the database
 */

var argv = require('optimist')
        .usage('Usage: $0 --offset [num] --size [num] --threads [num]')
        .alias('t', 'threads')
        .alias('o', 'offset')
        .alias('s', 'size')
        .default('threads', require('os').cpus().length)
        .default('offset', 0)
        .default('size', 10)
        .argv,
    cluster = require('cluster'),
    scriptAnalyze = require('./lib/script-analyze'),
    db,
    dbInstance,
    collection,
    pages,
    start = Date.now(),
    end,
    numCPUs = argv.threads,
    numOffset = argv.offset,
    numPagesFromBeginning = argv.size;

console.log("using threads: ", numCPUs);
console.log("using offset: ", numOffset);
console.log("using size: ", numPagesFromBeginning);

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
                    if (data.workerDone){
                        chunksReceived++;
                        pages = pages.concat(data.pages);

                        console.log('chunksReceived', chunksReceived, numCPUs);

                        if (chunksReceived === numCPUs){
                            console.log('master ready pages:', pages.length);
                            db.store(pages, collection).then(function(msg){
                                end = Date.now();
                                console.log('insert duration', end - start, 'ms');
                                process.exit();
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
            scriptAnalyze.analyze(data.data).then(function(pages){
                console.log('analyze done, sending process result');
                process.send({
                    workerDone: true,
                    pages: pages
                });
                process.exit();
            });
        }
    });
}

