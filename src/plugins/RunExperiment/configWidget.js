/*globals define, WebGMEGlobal*/
/**
 * Example of custom plugin configuration. Typically a dialog would show up here.
 * @author pmeijer / https://github.com/pmeijer
 */

define([
    'q',
    'js/Dialogs/PluginConfig/PluginConfigDialog'
], function (
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

            var systemPointer = self.activeNode.getPointer('System').to;
            var systemNode = self._client.getNode( systemPointer );
            // get hosts in the system from pointer
            var hosts, users;
            self.getHosts( systemNode )
                .then(function(_hosts) {
                    hosts = _hosts;
                    return self.getUsers( systemNode );
                })
                .then(function(_users) {
                    users = _users;
            
                    // figure out their users
                    var hostUserMap = self.makeHostUserMap( hosts, users );
                    // for each host create selection in meta with options
                    // containing users (defauling to first user) and "Disabled"
                    var hostConfig = self.makeHostConfig( hostUserMap );

                    //prevPluginConfig = hostConfig.concat(prevPluginConfig);
                    pluginMetadata.configStructure = hostConfig.concat(pluginMetadata.configStructure);
                    console.log(pluginMetadata);

                    // Need to add:
                    // * host drop-down to sleect where to run ROSCORE
                    // * of the available hosts, which ones we will select for this experiment


                    // Need to make dynamic:
                    // * drag/drop list for ordered starting of containers / processes
                    // * ROSCore location and port number if the user selects to automatically start ROSCore
                    // * Per host - which user to run the experiment as (with the default chosen)

                    var pluginDialog = new PluginConfigDialog({client: self._client});
                    pluginDialog.show(globalConfigStructure, pluginMetadata, prevPluginConfig, callback);

                })
        });
    };

    ConfigWidget.prototype.getChildrenByType = function(node, childType) {
        var self = this;
        var childIds = node.getChildrenIds();
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

    ConfigWidget.prototype.getHosts = function(systemNode) {
        var self = this;
        return self.getChildrenByType(systemNode, 'Host');
    };

    ConfigWidget.prototype.getUsers = function(systemNode) {
        var self = this;
        return self.getChildrenByType(systemNode, 'User');
    };

    ConfigWidget.prototype.makeHostUserMap = function(hosts, users) {
        var self = this,
            core = self.core,
            hostUserMap = {};
        
        hosts.map(function(h) {
            var hostPath = self.core.getPath(h);
            var hostName = self.core.getAttribute(h,'name');
            var validUserPaths = self.core.getMemberPaths(h, 'Users');

            var validUsers = users.filter(function(u) {
                var path = self.core.getPath(u);
                return validUserPaths.indexOf(path) > -1;
            }).map(function(u) {
                return self.core.getAttribute(u, 'name');
            });

            hostUserMap[ hostPath ] = {
                name: hostName,
                users: validUsers
            };
        });

        return hostUserMap;
    };
    
    ConfigWidget.prototype.makeHostConfig = function( hostUserMap ) {
        var self = this,
            config = [];

        var tmpl = {
	    "name": "",
	    "displayName": "",
	    "description": "Select User for Host deployment or Disabled to exclude host.",
	    "value": "",
	    "valueType": "string",
	    "valueItems": [
	    ]
	};

        Object.keys(hostUserMap).map(function(hostPath) {
            var map = hostUserMap[hostPath];
            var users = map.users;
            var hostName = map.name;

            var hostTmpl = Object.assign({}, tmpl);
            hostTmpl.name = 'Host_Selection:' + hostPath;
            hostTmpl.displayName = hostName;
            hostTmpl.value = users[0] || 'Disabled';
            hostTmpl.valueItems = users.concat('Disabled');

            config.push(hostTmpl);
        });

        return config;
    };

    return ConfigWidget;
});
