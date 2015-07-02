var mongoose = require('mongoose');
var winston = require('winston');
var util = require('util');
var Q = require('q');

module.exports = {
    init: require('./lib/init'),
    models: require('./models')
};

if(process.env.NODE_ENV === "test"){
    module.exports.mongoose = mongoose;
}
