'use strict';

var mongoose = require('mongoose');
var Q = require('q');

var getModel = rootRequire('./models').getModel;

var usersToCreate = [{
  _id: mongoose.Types.ObjectId(),
  username: 'testuser1@bloo.ie',
  clientId: 'testChatsFixture'
}, {
  _id: mongoose.Types.ObjectId(),
  username: 'testuser2@bloo.ie',
  clientId: 'testChatsFixture'
}, {
  _id: mongoose.Types.ObjectId(),
  username: 'testadmin1@bloo.ie',
  clientId: 'testChatsFixture'
}, {
  _id: mongoose.Types.ObjectId(),
  username: 'testadmin2@bloo.ie',
  clientId: 'testChatsFixture'
}];

var plansToCreate = [{
    _id: mongoose.Types.ObjectId(),
    name: "Test Plan 1"
}];

var accountsToCreate = [{
    _id: mongoose.Types.ObjectId(),
},{
    _id: mongoose.Types.ObjectId(),
    users: [usersToCreate[1]._id]
},{
    _id: mongoose.Types.ObjectId(),
    users: [usersToCreate[2]._id],
    admins: [usersToCreate[2]._id]
},{
    _id: mongoose.Types.ObjectId(),
    users: [usersToCreate[3]._id],
    admins: [usersToCreate[3]._id],
    plan: [plansToCreate[0]._id]
}];



function init() {

    return getModel('user').then(function(user){
        return user.create(usersToCreate);
    })
    .then(function(){
        return getModel('plan').then(function(plan){
            return plan.create(plansToCreate);
        });
    })
    .then(function(){
        return getModel('account').then(function(account){
            return account.create(accountsToCreate);
        });
    });
}

function reset() {
  //only allow this in test
  if (process.env.NODE_ENV === 'test') {
      return rootRequire('./lib/mongo').getConnection().then(function(connection){
          var collections = connection.collections;

          var promises = Object.keys(collections).map(function(collection) {
            return Q.ninvoke(collections[collection], 'remove');
          });

          return Q.all(promises);
      });
  } else {
    var errorMessage = 'Excuse me kind sir, but may I enquire as to why you are currently running reset() in a non test environment? I do propose that it is a beastly thing to do and kindly ask you to refrain from this course of action. Sincerely yours, The Computer.';
    console.log(errorMessage);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

module.exports = {
  init: init,
  reset: reset,
  getModel: getModel,
  data: {
      usersToCreate: usersToCreate,
      accountsToCreate: accountsToCreate,
      plansToCreate: plansToCreate
  }
};
