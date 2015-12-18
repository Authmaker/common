var mongoose = require('mongoose');

var modelName = 'OAuthSession';

var schema = mongoose.Schema({
    access_token: String,
    client_id: String,
    code: String,
    redirect_uri: String,
    state: String,
    type: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scopes: [String],
    expiryDate: Date
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
