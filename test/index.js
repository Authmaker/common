var nconf = require('nconf');

//common options
nconf.defaults({
    "mongo": {
        "authmaker": {
            "db": "test-authmaker-common-testing-db",
            "host": "localhost",
            "port": 27017
        }
    },
});

before(function() {
    //create http server
    rootRequire('./').init(nconf);
});
