var mongoose = require('mongoose');
var winston = require('winston');

var buildConnectionString = require('./buildConnectionString');

module.exports = function init(nconf) {
    buildConnectionString(nconf, 'mongo:authmaker:').then(function(connectionString) {

        if (!mongoose.connection.readyState) {
            mongoose.connect(connectionString);
        }

        mongoose.connection.on('connecting', function() {
            winston.info("Mongoose connecting");
        });

        mongoose.connection.on('connected', function() {
            winston.info("Mongoose connected", {
                connectionString: connectionString
            });
        });

        mongoose.connection.on('error', function(err) {
            winston.error("Error connecting to mongoose", {
                error: err.message,
                stack: err.stack
            });
        });
    });
};
