var RSVP = require('rsvp'),
    analyzeBody = require('./body'),
    request = require('request'),
    chunkSize = 5,

    analyze = function(urls, analyzedOne){
        var promises = [];

        urls.forEach(function(obj){
            var position = obj[0],
                url = 'http://' + obj[1];

            promises.push(new RSVP.Promise(function(resolve){
                console.log('requesting', url);
                request({
                    jar: false,
                    url: url,
                    timeout: 10000,
                    headers: {
                        // spoof useragent with firefox string
                        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:29.0) Gecko/20100101 Firefox/29.0'
                    }
                }, function(err, resp, body){
                    if (err) {
                        console.error(url, err);
                    }
                    resolve({
                        url: url,
                        _id: position,
                        body: analyzeBody(body)
                    });
                });
            }));
        });

        return RSVP.all(promises);
    };




module.exports = function(data){
    var i = 0,
        urls = [],
        rounds = Math.ceil(data.length / chunkSize);

    // here no RSVP.all because "Maximum call stack size exceeded"
    function analyzeChunk(data, allPages, doneCallback){
        urls = data.splice(0, chunkSize);
        console.log('analyzing chunk', chunkSize, 'urls left', data.length);
        analyze(urls).then(function(pages){
            allPages = allPages.concat(pages);

            i++;
            if (i < rounds) {
                analyzeChunk(data, allPages, doneCallback);
            } else {
                // done
                console.log('analyze done, calling doneCallback');
                doneCallback(allPages);
            }
        });
    }

    return new RSVP.Promise(function(resolve){
        analyzeChunk(data, [], function(allPages){
            resolve(allPages);
        });
    });
};
