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
config.seedProjects.basePaths = ["./src/seeds"];

// Merging config
config.storage.autoMerge.enable = true;

// RequireJS paths
config.requirejsPaths.rosmod = "./src/common/";
config.requirejsPaths.cytoscape = "./node_modules/cytoscape/dist";
config.requirejsPaths.plottable = "./node_modules/plottable/";
config.requirejsPaths.handlebars = "./node_modules/handlebars/";
config.requirejsPaths['cytoscape-cose-bilkent'] = "./node_modules/cytoscape-cose-bilkent/";
config.requirejsPaths['webgme-to-json'] = "./node_modules/webgme-to-json/";
config.requirejsPaths['remote-utils'] = "./node_modules/remote-utils/";
config.requirejsPaths['plotly-js'] = "./node_modules/plotly.js/dist/";
config.requirejsPaths['showdown'] = "./node_modules/showdown/";
config.requirejsPaths['blob-util'] = "./node_modules/blob-util/";

config.requirejsPaths['hfsm'] = './node_modules/webgme-hfsm/src/common/';
config.requirejsPaths['hfsm-library'] = './node_modules/webgme-hfsm/';

config.requirejsPaths['bower'] = "./node_modules/webgme-hfsm/bower_components/";
config.requirejsPaths['cytoscape-edgehandles'] = "./node_modules/webgme-hfsm/bower_components/cytoscape-edgehandles/cytoscape-edgehandles";
config.requirejsPaths['cytoscape-context-menus'] = "./node_modules/webgme-hfsm/bower_components/cytoscape-context-menus/cytoscape-context-menus";
config.requirejsPaths['cytoscape-panzoom'] = "./node_modules/webgme-hfsm/bower_components/cytoscape-panzoom/cytoscape-panzoom";

config.client.log.level = 'info';

var path = require('path');
config.visualization.svgDirs.push(path.join(__dirname, '..', "./src/svgs"));
config.visualization.svgDirs.push(path.join(__dirname, '..', "./node_modules/webgme-hfsm/src/svgs"));

validateConfig(config);
module.exports = config;
