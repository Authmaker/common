var mongoose = require('mongoose');

var modelName = 'Scope';

var schema = new mongoose.Schema({
    name: String,
    scope: String,
    paidFor: Boolean,
    description: String,
    plan: String
});

module.exports.getModel = function(){
    return require(__dirname + '/../lib/mongo').getConnection().then(function(connection){
        //protect against re-defining
        if (connection.modelNames().indexOf(modelName) !== -1) {
            return connection.model(modelName);
        } else {
            return connection.model(modelName, schema);
        }
    });
};
