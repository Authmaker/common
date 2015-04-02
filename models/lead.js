var mongoose = require('mongoose');
var modelName = 'Lead';

var leadSchema = new mongoose.Schema({
    data: mongoose.Schema.Types.Mixed
});

//protect against re-defining
if (mongoose.modelNames().indexOf(modelName) !== -1) {
    module.exports.modelObject = mongoose.model(modelName);
} else {
    module.exports.modelObject = mongoose.model(modelName, leadSchema);
}
