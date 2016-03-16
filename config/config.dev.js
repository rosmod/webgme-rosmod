/* jshint node: true */
// This is the config used for development on the cnn creator
'use strict';
var config = require('./config.base.js'),
    validateConfig = require('webgme/config/validator');

validateConfig(config);
module.exports = config;
