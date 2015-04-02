var mongo = require('./mongo');

//Public api & exposing mongo + mysql function
module.exports = {
    addUser: mongo.addUser,
    createCode: mongo.createCode,
    createForceLogin: mongo.createForceLogin,
    createOAuthAuthentication: mongo.createOAuthAuthentication,
    getAuthorization: mongo.getAuthorization,
    getForceLogin: mongo.getForceLogin,
    getOAuthAuthentication: mongo.getOAuthAuthentication,
    getUser: mongo.getUser,
    updateUserResetHash: mongo.updateUserResetHash,
    updateUserPasswordForgot: mongo.updateUserPasswordForgot,
    updateAccessToken: mongo.updateAccessToken,
    checkAccessTokenScope: mongo.checkAccessTokenScope,
    updateUser: mongo.updateUser
};
