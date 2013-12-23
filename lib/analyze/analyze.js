var RSVP = require('rsvp'),
    analyzeBody = require('./body'),
    request = require('request');


module.exports = function(data){
    var promises = [];

    data.forEach(function(obj){
        var position = obj[0],
            url = 'http://' + obj[1];

        console.log('requesting', url);
        promises.push(new RSVP.Promise(function(resolve){
            request(url, function(err, resp, body){
                if (err) {
                    throw err;
                }
                resolve({
                    url: url,
                    rank: position,
                    body: analyzeBody(body)
                });
            });
        }));
    });

    return RSVP.all(promises);
};