var mongoose = require('mongoose');
var winston = require('winston');
var util = require('util');
var Q = require('q');

module.exports = {
    init: require('./lib/mongo').init,
    getModel: require('./models').getModel,
    getConnection: require('./lib/mongo').getConnection,
};
