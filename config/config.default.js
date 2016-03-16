/* jshint node: true */
'use strict';
var config = require('./config.base.js'),
    validateConfig = require('webgme/config/validator');

// Customize Visualizers
//config.visualization.visualizerDescriptors = ['./src/visualizers/Visualizers.json'];
//config.visualization.panelPaths.push('./src/visualizers/panels');
//config.visualization.layout.basePaths.push('./src/layouts');

// UI
config.visualization.layout.default = 'NewDefaultLayout';

validateConfig(config);
module.exports = config;
