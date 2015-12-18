var mongoose = require('mongoose');

var modelName = 'OAuthClient';

var schema = new mongoose.Schema({
    name: String,
    client_id: String,
    client_secret: String,
    redirect_uri: String,
    status: String,
    auto_approve: Boolean,
    allowedGrantTypes: [String],
    autoCreateUser: Boolean
}, {
    collection: 'oauthClients'
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
