var expect = require('chai').expect;

var fixture = rootRequire('./test/fixtures/user');

describe("user model test", function() {

    beforeEach(function() {
        return fixture.init();
    });

    afterEach(function() {
        return fixture.reset();
    });

    it("should return no accounts for user with no account", function() {
        return fixture.models.user.findOne({_id: fixture.data.usersToCreate[0]._id}).exec().then(function(user){
            return user.getAccounts();
        }).then(function(accounts){
            expect(accounts).to.have.length(0);
        });
    });

    it("should return 1 accounts for user with an account", function() {
        return fixture.models.user.findOne({_id: fixture.data.usersToCreate[1]._id}).exec().then(function(user){
            return user.getAccounts();
        }).then(function(accounts){
            expect(accounts).to.have.length(1);
        });
    });

    it("should return 1 accounts for user with an account who is the admin", function() {
        return fixture.models.user.findOne({_id: fixture.data.usersToCreate[2]._id}).exec().then(function(user){
            return user.getAccounts();
        }).then(function(accounts){
            expect(accounts).to.have.length(1);
        });
    });

    it("should return 1 accounts for user with an account who is the admin and that account should have a plan", function() {
        return fixture.models.user.findOne({_id: fixture.data.usersToCreate[3]._id}).exec().then(function(user){
            return user.getAccounts();
        }).then(function(accounts){
            expect(accounts).to.have.length(1);
            expect(accounts[0]).to.have.property('plan').that.is.an('object');
        });
    });
});
