var _ = require('lodash');
var mongoose = require('mongoose');
var Q = require('q');

var modelName = 'User';

var schema = new mongoose.Schema({

    /**
     * Unique key
     */
    username: String, //unique (per clientId) - required (was email in mysql)
    clientId: String, //clientId that was used to create the user

    /**
     * User Supplied fields
     */
    displayName: String, //not unique - optional => composed when not supplied (was username in mysql)
    email: String,
    password: String,
    termsAccepted: Boolean,

    //Install details - temporary during first install for an account
    websiteUrl: String,
    offlineEmail: String,

    /**
     * Automatically generated
     */
    status: String,
    createdAt: Date,
    lastLogin: Date,
    updatedAt: Date,
    activated: Boolean,
    isAuthmakerAdmin: Boolean,

    // 'Snapshot-able' data that can change regularly, is updated to
    // reflect latest state when chats are started
    lastKnownInformation: {
        timezone: String,
        localTime: String,
        browser: String,
        device: String,
        location: String,
        os: String
    },
    loggedIn: Boolean,
    avatarUrl: String,
    passwordResetHash: String,
    activationHash: String,

    preferences: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: new mongoose.Types.ObjectId()
        },
        tabNotify: {
            type: Boolean,
            default: false
        },
        soundNotify: {
            type: Boolean,
            default: true
        },
        chromeNotify: {
            type: Boolean,
            default: false
        }
    },

    sentEmails: [{
        timestamp: Date,
        to: String,
        subject: String,
        message: String,
        reference: String
    }],

    metaData: mongoose.Schema.Types.Mixed,

    externalIdentities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExternalIdentity' }]

}, {
    collection: 'users'
});

schema.index({
    username: 1
});

schema.index({
    username: 1,
    clientId: 1
}, {
    unique: true
});

schema.methods.getAccounts = function() {
    //return a (promise for) list of accounts that this user is a part of
    return this.model('Account').find({
        users: this._id
    }).populate('plan').exec().then(function(accounts){
        var promises = accounts.map(function(account){
            if(!account.plan) return Q(account);

            return account.plan.populate('scopes').execPopulate().then(function(){
                return account;
            });
        });

        return Q.all(promises).then(function(accounts){
            return _.compact(accounts);
        });
    });
};

schema.methods.getActiveScopes = function() {
    return this.getAccounts().then(function(accounts) {
        return _(accounts)
            .chain()
            .filter(function(plan) {
                return plan.planExpiryDate > new Date();
            })
            .pluck('plan')
            .pluck('scopes')
            .flatten()
            .pluck('scope')
            .uniq()
            .value();
    });
};

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
