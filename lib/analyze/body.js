var cheerio = require('cheerio');

module.exports = function(body){
    var $ = cheerio.load(body),
        scripts = $('script'),
        result = [];

    scripts.each(function(){
        var $this = $(this),
            src = $this.attr('src');
        if (src && src.length) {
            // is script that uses src
            result.push({
                type: 'SRC',
                content: src
            });
        } else {
            // is inline js
            result.push({
                type: 'INLINE',
                content: $this.text().trim()
            });
        }
    });

    return result;
};