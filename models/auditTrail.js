var mongoose = require('mongoose');

var modelName = 'AuditTrail';

var schema = mongoose.Schema({
    access_token: String,
    tag: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date
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
