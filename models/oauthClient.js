var mongoose = require('mongoose');

var modelName = 'OAuthClient';

var oauthClientSchema = new mongoose.Schema({
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

//protect against re-defining
if (mongoose.modelNames().indexOf(modelName) !== -1) {
    module.exports.modelObject = mongoose.model(modelName);
} else {
    module.exports.modelObject = mongoose.model(modelName, oauthClientSchema);
}
