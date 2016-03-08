// jshint node: true
'use strict';

var gmeConfig = require('./config'),
    webgme = require('webgme'),
    myServer;


webgme.addToRequireJsPaths(gmeConfig);

gmeConfig.server.port = 80
myServer = new webgme.standaloneServer(gmeConfig);
myServer.start(function () {
    //console.log('server up');
});
