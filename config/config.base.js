/* jshint node: true */
'use strict';
var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Overwrite options as needed
config.server.port = 8080;
//config.mongo.uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cnn-creator';

// Authentication
config.authentication.enable = true;
config.authentication.allowGuests = true;
//config.authentication.logOutUrl = '/login';

// Executors
config.executor.enable = true;

config.core.enableCustomConstraints = true;

// Plugins
config.plugin.allowServerExecution = true;
//config.plugin.allowBrowserExecution = false;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.basePaths = ["./src/seeds"]

config.requirejsPaths.rosmod = "./src/common/"
config.requirejsPaths.cytoscape = "./node_modules/cytoscape/dist"
config.requirejsPaths.plottable = "./node_modules/plottable/"
config.requirejsPaths.handlebars = "./node_modules/handlebars/"
config.requirejsPaths['cytoscape-cose-bilkent'] = "./node_modules/cytoscape-cose-bilkent/"
config.requirejsPaths['webgme-to-json'] = "./node_modules/webgme-to-json/"
config.requirejsPaths['remote-utils'] = "./node_modules/remote-utils/"
config.requirejsPaths['plotly-js'] = "./node_modules/plotly.js/dist/"

config.client.log.level = 'info';

var path = require('path');
config.visualization.svgDirs = [path.join(__dirname, '..', "./src/svgs")];

validateConfig(config);
module.exports = config;
