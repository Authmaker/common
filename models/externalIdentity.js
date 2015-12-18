var mongoose = require('mongoose');

var modelName = 'ExternalIdentity';

var schema = mongoose.Schema({
    externalId: String,
    username: String,
    displayName: String,
    provider: String,
    rawProfile: mongoose.Schema.Types.Mixed,
    authTokens: mongoose.Schema.Types.Mixed
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
