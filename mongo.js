var Q = require('q');
var _ = require('lodash');
var crypto = require('crypto');
var errorHelper = rootRequire('./helpers/error');
var winston = require('winston');

var passwordHelper = rootRequire('./helpers/password');
var models = require('./models');
var User = models.user;
var Authentication = models.authentications;
var OauthSession = models.oauthSession;

//API
module.exports = {
    addUser: addUser,
    checkAccessTokenScope: checkAccessTokenScope,
    createAccessToken: createAccessToken,
    createCode: createCode,
    createForceLogin: createForceLogin,
    createOAuthAuthentication: createOAuthAuthentication,
    getAuthorization: getAuthorization,
    getForceLogin: getForceLogin,
    getOAuthAuthentication: getOAuthAuthentication,
    getUser: getUser,
    updateAccessToken: updateAccessToken,
    updateUser: updateUser,
    updateUserPasswordForgot: updateUserPasswordForgot,
    updateUserResetHash: updateUserResetHash
};

function updateUserPasswordForgot(email, hash, newPassword) {
    return User.findOneAndUpdate({
            email: email,
            passwordResetHash: hash
        }, {
            passwordResetHash: '',
            password: passwordHelper.generate_password(newPassword)
        }).exec()
        .then(function(user) {
            if (!user) {
                throw new Error('Invalid password reset code');
            }
            return user;
        })
        .then(null, function(err) {
            winston.error('', {
                error: err.message,
                stack: err.stack,
                email: email
            });

            throw err;
        });
}

//update user authentication with new accessToken
function updateAccessToken(userId, access_token) {
    return Authentication.findOneAndUpdate({
            _id: userId
        }, {
            access_token: access_token
        }).exec()
        .then(null, function(err) {
            winston.error('Error updating authentication', {
                error: err.message,
                stack: err.stack,
                userId: userId,
                access_token: access_token
            });
            throw err;
        });
}

//update user authentication with new accessToken
function getOAuthAuthentication(query) {
    return Authentication.findOne({
            provider: query.provider,
            uid: query.uid
        }).exec()
        .then(function(auth) {
            if (!auth) {
                winston.warn("Authentication entry doesn't exist for that query", {
                    query: query
                });
                return;
            }
            return auth;
        })
        .then(null, function(err) {
            winston('Error getting OauthAuthenticaion', {
                error: err.message,
                stack: err.stack,
                query: query ? query : null
            });
            throw err;
        });
}

function createOAuthAuthentication(authentication) {
    return Q.ninvoke(new Authentication(authentication), 'save')
        .spread(function(auth) {
            if (!auth) {
                throw new Error('Error saving new authentication to mongo');
            }
            return auth;
        }).then(null, function(err) {
            winston.error('Error creating new authentication', {
                error: err.message,
                stack: err.stack,
                authentication: authentication ? authentication : null
            });
            throw err;
        });
}

function addUser(user) {
    //check the user exists
    return User.findOne({
            username: user.username,
            clientId: user.clientId
        }).exec()
        .then(function(existingUser) {
            if (existingUser) {
                throw new Error('User already Exists');
            }

            return Q.ninvoke(new User(user), 'save')
                .spread(function(user) {
                    if (!user) {
                        throw new Error('Error creating user');
                    }
                    return user;
                });
        })
        .then(null, function(err) {
            switch (err.message) {
                case 'User already Exists':
                    winston.warn('User already exists', {
                        warning: err.message,
                        stack: err.stack,
                        user: JSON.stringify(user)
                    });

                    break;

                default:
                    winston.error('Mongoose Error: Creating new user', {
                        error: err.message,
                        stack: err.stack,
                        user: JSON.stringify(user)
                    });
            }

            throw err;
        });
}

function getUser(query) {
    return User.findOne(query).exec()
        .then(function(user) {
            return user;
        })
        .then(null, function(err) {
            winston.warn('Mongoose Error: Error Retrieving user', {
                error: err.message,
                stack: err.stack,
                query: query
            });
            throw err;
        });
}

function updateUser(query, update) {
    return User.findOneAndUpdate(query, update).exec()
        .then(function(user) {
            if (!user) {
                throw new Error('No user associtated with that query');
            }
            return user;
        })
        .then(null, function(err) {
            winston.error('Error updating user', {
                error: err.message,
                stack: err.stack
            });
            throw err;
        });
}

function updateUserResetHash(email, hash) {
    return User.findOneAndUpdate({
            username: email
        }, {
            passwordResetHash: hash
        }).exec()
        .then(function(user) {
            if (!user) {
                throw new Error('That email is not associated with an account');
            }
            return user;
        }).then(null, function(err) {
            winston.error('Error updating user', {
                error: err.message,
                stack: err.stack,
                email: email,
                hash: hash
            });
            throw err;
        });
}

function getAuthorization(query) {
    return OauthSession.findOne(query)
        .exec()
        .then(function(auth) {
            if (!auth) {
                throw new Error('Invalid query');
            }
            return auth;
        })
        .then(null, function(err) {
            winston.error('Error finding auth for that query', {
                error: err.message,
                stack: err.stack,
                query: query
            });

            throw err;
        });
}

function createCode(data) {

    return OauthSession.findOneAndUpdate({
            userId: data.userId
        }, data, {
            upsert: true,
            new: true
        }).exec()
        .then(function(session) {
            if (!session) {
                throw new Error('No session updated or created');
            }

            return session;
        })
        .then(null, function(err) {
            winston.error('Error creating code', {
                error: err.message,
                stack: err.stack,
                data: data
            });

            throw err;
        });
}

function createAccessToken(data) {
    return Q.nfcall(crypto.randomBytes, 48)
        .then(function(buf) {
            if (!buf) {
                throw new Error('Error generating access_token');
            }
            return buf.toString('hex');
        })
        .then(function(accessToken) {

            return OauthSession.create(_.assign(data, {
                access_token: accessToken
            }));
        });
}

function createForceLogin(userId, callback) {

    var code = crypto.randomBytes(24)
        .toString('hex');

    models.forceLogin.create({
        userId: userId,
        code: code,
        createdAt: new Date()
    }).then(function() {
        callback(null, code);
    }).then(null, function(err) {
        winston.error("Error creating force login", {
            error: err.message,
            stack: err.stack,
            userId: userId
        });
        return errorHelper.databaseError(err, 'Error inserting force_login') && callback(err);
    });
}

function getForceLogin(code, callback) {

    models.forceLogin.findOne({
        code: code
    }).exec().then(function(force_login) {
        if (!force_login) {
            throw new Error('no login found for this code');
        }

        if (force_login.createdAt.getTime() + 10 * 60 * 1000 < new Date().getTime()) {
            throw new Error('login has expired');
        }

        return callback(null, force_login.userId);

    }).then(null, function(err) {
        winston.error("Error getting force login", {
            error: err.message,
            stack: err.stack,
            code: code
        });

        return errorHelper.databaseError(err, 'Error getting force_login') && callback(err);
    });
}

/**
 * callback: function(err:Error, has_scope:boolean, session_expired:boolen)
 */
function checkAccessTokenScope(access_token, scope, callback) {
    OauthSession.findOne({
            access_token: access_token
        }).exec()
        .then(function(session) {
            if (!session) {
                throw new Error('No scope associated with that session'); //doesn't have scope and is expired
            }

            if (!session.expiryDate) {
                //shouldn't happen so considered expired if it doesn't have an expiry date
                throw new Error('No expiryDate set on that oauth session');
            }

            return callback(null, session.scopes.indexOf(scope) > -1, session.expiryDate < new Date());
        }).then(null, function(err) {
            winston.error('Error during checkAccessTokenScope', {
                error: err.message,
                stack: err.stack,
                access_token: access_token,
                scope: scope
            });
            return callback(null, false, true);
        });
}
