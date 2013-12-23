var scriptAnalyze = require('./lib/script-analyze');


scriptAnalyze.loadList('./res/top-1m.csv').then(function(data){
    scriptAnalyze.analyze(data.splice(0, 3)).then(function(pages){
        pages.forEach(function(page){
            console.log(page.body);
        });
    });
});