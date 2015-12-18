var mongoose = require('mongoose');

var modelName = 'Plan';

var schema = new mongoose.Schema({
    name: String,
    stripePlan: String,
    scopes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scope'
    }],
    newSubscriptions: Boolean,
    lowValue: Boolean
});

//protect against re-defining
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
