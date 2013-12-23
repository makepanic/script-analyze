/*
 * script-analyze
 * https://github.com/makepanic/script-analyze
 *
 * Copyright (c) 2013 Christian
 * Licensed under the MIT license.
 */

'use strict';
var provider = require('./provider/csvProvider'),
    analyze = require('./analyze/analyze');

exports.loadList = function(path) {
    return provider(path);
};
exports.analyze = function(data){
    return analyze(data);
};
