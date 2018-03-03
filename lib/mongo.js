const mongoose = require('mongoose');
const winston = require('winston');
const Q = require('q');
const mongooseConnect = require('mongoose-nconf-connect');

const models = require('../models/index');

let mongoConnection;
const pendingConnections = [];

function resolveConnections() {
  pendingConnections.forEach((deferred) => {
    deferred.resolve(mongoConnection);
  });
}

function init(nconf) {
  if (!nconf.get('mongo:authmaker')) {
    throw new Error('NConf entry for authmaker:mongo: requried to run this application');
  }

  return mongooseConnect.connectCommonMongo(nconf, mongoose, {
    configPrefix: 'mongo:authmaker:',
    logger: winston,
  }).then((connection) => {
    mongoConnection = connection;

    models.loadAllModels();
    resolveConnections();
  });
}

function getConnection() {
  if (mongoConnection) {
    return Q(mongoConnection);
  }

  const deferred = Q.defer();

  pendingConnections.push(deferred);

  return deferred.promise;
}

module.exports = {
  init,
  getConnection,
};
