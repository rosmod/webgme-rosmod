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

            var systemNode = self.activeNode;

            // get hosts in the system from pointer
            var hosts, users;
            // this plugin is called from within a system model so hosts are children
            self.getChildrenByType( systemNode, 'Host' )
                .then(function(_hosts) {
                    hosts = _hosts;
                    return self.getChildrenByType( systemNode, 'User' );
                })
                .then(function(_users) {
                    users = _users;

                    // figure out their users
                    var hostUserMap = self.makeHostUserMap( hosts, users );
                    // for each host create selection in meta with options
                    // containing users (defauling to first user) and "Disabled"
                    var hostConfig = self.makeHostConfig( hostUserMap );
                    pluginMetadata.configStructure = hostConfig.concat(pluginMetadata.configStructure);

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

    ConfigWidget.prototype.makeHostUserMap = function(hosts, users) {
        var self = this,
            core = self.core,
            hostUserMap = {};
        
        hosts.map(function(h) {
            var hostPath = self.core.getPath(h);
            var hostName = self.core.getAttribute(h,'name');
            var installPath = self.core.getAttribute(h,'Build Workspace');
            var validUserPaths = self.core.getMemberPaths(h, 'Users');

            var validUsers = users.filter(function(u) {
                var path = self.core.getPath(u);
                return validUserPaths.indexOf(path) > -1;
            }).map(function(u) {
                return self.core.getAttribute(u, 'name');
            });

            hostUserMap[ hostPath ] = {
                name: hostName,
                users: validUsers,
                installPath: installPath
            };
        });

        return hostUserMap;
    };
    
    ConfigWidget.prototype.makeHostConfig = function( hostUserMap ) {
        var self = this,
            config = [];

        var userTmpl = {
            "name": "",
            "displayName": "",
            "description": "Select User for Host deployment or Disabled to exclude host.",
            "value": "",
            "valueType": "string",
            "valueItems": [
            ]
        };

        var installTmpl = {
            "name": "",
            "displayName": "",
            "description": "Select install location for runtime.",
            "value": "",
            "valueType": "string"
        };

        Object.keys(hostUserMap).map(function(hostPath) {
            var map = hostUserMap[hostPath];
            var users = map.users;
            var hostName = map.name;
            var installPath = map.installPath;
            var disabledMessage = 'Excluded from Experiment';

            // make the user config
            var hostTmpl = Object.assign({}, userTmpl);
            hostTmpl.name = 'Host_User_Selection:' + hostPath;
            hostTmpl.displayName = 'User for ' + hostName;
            hostTmpl.value = users[0] || disabledMessage;
            hostTmpl.valueItems = users.concat(disabledMessage);

            config.push(hostTmpl);

            // make the install directory config
            var hostInstallTmpl = Object.assign({}, installTmpl);
            hostInstallTmpl.name = 'Host_Install_Selection:' + hostPath;
            hostInstallTmpl.displayName = 'Install Path for ' + hostName;
            hostInstallTmpl.value = installPath;

            config.push(hostInstallTmpl);
        });

        return config;
    };

    ConfigWidget.prototype.makeRosCoreConfig = function( hosts ) {
        var self = this,
            config = [];
        
        var hostNames = [ 'Any' ];
        hostNames = hostNames.concat(
            hosts.map(function(h) {
                return self.core.getAttribute(h,'name');
            })
        );

        hostNames.push('None');
        
        var tmpl = {
            "name": "rosCoreHost",
            "displayName": "ROS Core Host",
            "description": "Select Host / Any / None to select where and whether to spawn ROS Core / ROS Master.",
            "value": hostNames[0],
            "valueType": "string",
            "valueItems": hostNames
        };

        config.push(tmpl);

        return config;
    };

    return ConfigWidget;
});
