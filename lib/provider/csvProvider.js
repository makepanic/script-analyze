var csv = require('fast-csv'),
    RSVP = require('rsvp');

module.exports = function(path){
    var start = Date.now(),
        resultData = [];

    return new RSVP.Promise(function(resolve){
        csv(path)
            .transform(function(data){
                data[0] = parseInt(data[0], 10);
                return data;
            })
            .on('data', function(data){
                resultData.push(data);
            })
            .on('end', function(){
                console.log('duration', Date.now() - start, 'ms');
                resolve(resultData);
            })
            .parse();
    });
};