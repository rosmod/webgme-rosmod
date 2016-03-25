/* jshint node: true */
'use strict';
var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Overwrite options as needed
config.server.port = 80;
//config.mongo.uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cnn-creator';

// Authentication
config.authentication.enable = true;
//config.authentication.allowGuests = false;

// Executors
config.executor.enable = true;

config.core.enableCustomConstraints = true;

// Plugins
config.plugin.allowServerExecution = true;
config.plugin.allowBrowserExecution = false;

// Seeds
config.seedProjects.enable = true;
config.seedProjects.basePaths = ["./src/seeds"]
config.seedProjects.defaultProject = "ROSMOD"

config.requirejsPaths.rosmod = "./src/common/"

// Default Project
//config.client.defaultProject = { name: 'guest+ROSMOD' };

config.client.log.level = 'info';

config.visualization.svgDirs = ["./src/svgs"]  

validateConfig(config);
module.exports = config;
