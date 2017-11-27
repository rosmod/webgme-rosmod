/*globals define, WebGMEGlobal*/
/**
 * Example of custom plugin configuration. Typically a dialog would show up here.
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'remote-utils/remote-utils',
    'q',
    'js/Dialogs/PluginConfig/PluginConfigDialog'
], function (
    utils,
    Q,
    PluginConfigDialog) {
    'use strict';

    function ConfigWidget(params) {
        this._client = params.client;
        this._logger = params.logger.fork('ConfigWidget');
    }

    /**
     * Called by the InterpreterManager if pointed to by metadata.configWidget.
     * You can reuse the default config by including it from 'js/Dialogs/PluginConfig/PluginConfigDialog'.
     *
     * @param {object[]} globalConfigStructure - Array of global options descriptions (e.g. runOnServer, namespace)
     * @param {object} pluginMetadata - The metadata.json of the the plugin.
     * @param {object} prevPluginConfig - The config at the previous (could be stored) execution of the plugin.
     * @param {function} callback
     * @param {object|boolean} callback.globalConfig - Set to true to abort execution otherwise resolved global-config.
     * @param {object} callback.pluginConfig - Resolved plugin-config.
     * @param {boolean} callback.storeInUser - If true the pluginConfig will be stored in the user for upcoming execs.
     *
     */
    ConfigWidget.prototype.show = function (globalConfigStructure, pluginMetadata, prevPluginConfig, callback) {
        var pluginConfig = JSON.parse(JSON.stringify(prevPluginConfig)), // Make a copy of the prev config
            globalConfig = {},
            activeNodeId = WebGMEGlobal.State.getActiveObject(),
            activeNode;
        
        var self = this;
        self.activeNode = self._client.getNode(activeNodeId);

        self._client.getCoreInstance(null, function(err, result) {
            self.core = result.core;
            self.root = result.rootNode;

            // get hosts in the system from pointer
            self.core.loadByPath(self.root, activeNodeId)
                .then(function(node) {
                    self.activeNode = node;
                    return self.getArchitectures();
                })
                .then(function(archs) {
                    var archConfig = self.makeArchConfig( archs );
                    pluginMetadata.configStructure = archConfig.concat(pluginMetadata.configStructure);
                    
                    var pluginDialog = new PluginConfigDialog({client: self._client});
                    pluginDialog.show(globalConfigStructure, pluginMetadata, prevPluginConfig, callback);
                })
                .catch(function(err) {
                    console.log(err);
                    callback(err, result);
                });
        });
    };
    
    ConfigWidget.prototype.getChildrenByType = function(node, childType) {
        var self = this;
        var childIds = self.core.getChildrenPaths(node);
        var nodes = childIds.map(function(cid) {
            return self.core.loadByPath(self.root, cid);
        });
        return Q.all(nodes)
            .then(function(nodes) {
                var filtered = nodes.filter(function(c) {
                    var base = self.core.getMetaType(c);
                    return childType == self.core.getAttribute(base, 'name');
                });

                return Q.all(filtered);
            });
    };

    ConfigWidget.prototype.getArchitectures = function() {
        var self = this;
        return self.getChildrenByType(self.activeNode, 'Systems')
            .then(function(systemFolderList) {
                if (systemFolderList) {
                    var systemFolder = systemFolderList[0];
                    return self.getChildrenByType(systemFolder, 'System');
                }
                else {
                    throw new String("No Systems Folder found!");
                }
            })
            .then(function(systemList) {
                var tasks = systemList.map(function(s) {
                    return self.getChildrenByType(s, 'Host');
                });
                return Q.all(tasks);
            })
            .then(function(hostList) {
                var archs = [];
                hostList = _.flatten(hostList);
                hostList.map(function(h) {
                    var host = {
                        'Architecture': self.core.getAttribute(h, 'Architecture'),
                        'Device ID': self.core.getAttribute(h, 'Device ID'),
                    };
                    var arch = utils.getDeviceType( host );
                    if (archs.indexOf(arch) == -1) {
                        archs.push( arch );
                    }
                });
                return archs;
            });
    };

    ConfigWidget.prototype.makeArchConfig = function(architectures) {
        var self = this,
            archConfig = [];

        var templ = {
	    "name": "",
	    "displayName": "",
	    "description": "Enable/Disable compilation for this architecture",
	    "value": true,
	    "valueType": "boolean",
            "readOnly": false
        };

        architectures.map(function(arch) {
            var archTempl = Object.assign({}, templ);
            archTempl.name = arch + '_ARCH_SELECTION';
            archTempl.displayName = 'Compile on ' + arch;
            archConfig.push( archTempl );
        });

        return archConfig;
    };

    return ConfigWidget;
});
