var fs = require('fs');
var path = require('path');
var Q = require('q');

var models = {};

fs.readdirSync(__dirname).forEach(function(fileName) {
    var extension = path.extname(fileName);
    if (extension === '.js' && fileName !== "index.js") {
        var required = require('./' + fileName);

        //add another api to get to these models
        if (required.modelObject) {
            models[fileName.slice(0, -3)] = required.modelObject;
        }
    }
});

function getModel(modelName) {
    return Q.fcall(function(){
        var required = require('./' + modelName);

        if(!required){
            throw new Error("Model " + modelName + " does not exist");
        }

        return required.getModel();
    });
}

function loadAllModels() {
    fs.readdirSync(__dirname).forEach(function(fileName) {
        var extension = path.extname(fileName);
        if (extension === '.js' && fileName !== "index.js") {
            var required = require('./' + fileName);

            //add another api to get to these models
            if (required.getModel) {
                required.getModel(); //load model definition
            }
        }
    });
}

module.exports = models;
module.exports.getModel = getModel;
module.exports.loadAllModels = loadAllModels;
