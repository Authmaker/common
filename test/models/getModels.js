var Q = require('q');

var fixture = rootRequire('./test/fixtures/user');

describe("Get Model Function", function(){
    it("should work for every model type", function(){
        var promises = ['user', 'scope', 'plan', 'oauthSession', 'oauthClient', 'lead', 'externalIdentity', 'auditTrail', 'account'].map(function(file){
            return fixture.getModel(file).then(null, function(err){
                throw new Error(err.message + " for file " + file);
            });
        })

        return Q.all(promises);
    })
})
