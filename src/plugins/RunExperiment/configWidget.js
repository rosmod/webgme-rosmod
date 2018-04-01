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

            var deploymentPointer = self.activeNode.getPointer('Deployment').to;
            var deploymentNode = self._client.getNode( deploymentPointer );

            // get hosts in the system from pointer
            var hosts, users, containers;
            self.getChildrenByType( systemNode, 'Host' )
                .then(function(_hosts) {
                    hosts = _hosts;
                    return self.getChildrenByType( systemNode, 'User' );
                })
                .then(function(_users) {
                    users = _users;
                    return self.getChildrenByType( deploymentNode, 'Container' );
                })
                .then(function(_containers) {
                    containers = _containers;
                    return self.makeContainerNodeMap( containers );
                })
                .then(function(_containerNodeMap) {
                    // for each container create sortable selection of nodes for ordering their starting
                    var containerNodeMap = _containerNodeMap;
                    var containerConfig = self.makeContainerConfig( containerNodeMap );
                    pluginMetadata.configStructure = containerConfig.concat(pluginMetadata.configStructure);

		    // how do we want to do debugging?
		    var debugConfig = self.makeDebugConfig( containerNodeMap );
                    pluginMetadata.configStructure = debugConfig.concat(pluginMetadata.configStructure);

                    // figure out their users
                    var hostUserMap = self.makeHostUserMap( hosts, users );
                    // for each host create selection in meta with options
                    // containing users (defauling to first user) and "Disabled"
                    var hostConfig = self.makeHostConfig( hostUserMap );
                    pluginMetadata.configStructure = hostConfig.concat(pluginMetadata.configStructure);

                    // where do we want to spawn roscore?
                    var rosCoreConfig = self.makeRosCoreConfig( hosts );
                    pluginMetadata.configStructure = rosCoreConfig.concat(pluginMetadata.configStructure);

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

    ConfigWidget.prototype.makeContainerNodeMap = function( containers ) {
        var self = this,
            core = self.core,
            containerNodeMap = {};

        var validTypes = ['Node', 'External Node'];

        var tasks = containers.map(function (container) {
            var containerPath = core.getPath(container);
            var containerName = core.getAttribute(container, 'name');
            containerNodeMap[ containerPath ] = {
                nodes: [],
                name: containerName
            };

            return core.loadChildren(container).then((children) => {
                children.map((child) => {
                    var nodeName = core.getAttribute(child, 'name');
                    var base = core.getMetaType(child);
                    var metaType = core.getAttribute(base, 'name');
                    if (validTypes.indexOf(metaType) > -1) {
                        containerNodeMap[ containerPath ].nodes.push(nodeName);
                    }
                });
            });
        });

        return Q.all(tasks).then(() => {
            return containerNodeMap;
        });
    };

    ConfigWidget.prototype.makeDebugConfig = function( containerNodeMap ) {
        var self = this,
            config = [];

        var tmpl = {
	    "name": "debugging",
	    "displayName": "Debugging Configuration",
	    "description": "Select if and how you would like to debug.",
	    "value": "None",
	    "valueType": "string",
	    "valueItems": [
		"None",
		"Valgrind on all ROSMOD Nodes",
	    ]
        };

        Object.keys(containerNodeMap).map(function(containerPath) {
	    var nodeDebugging = containerNodeMap[ containerPath ].nodes.map(function(node) {
		return `gdb+${node}`;
	    });
	    tmpl.valueItems = tmpl.valueItems.concat(nodeDebugging);
        });

	config.push(tmpl);

        return config;
    };

    ConfigWidget.prototype.makeContainerConfig = function( containerNodeMap ) {
        var self = this,
            config = [];

        var tmpl = {
	    "name": "",
	    "displayName": "",
	    "description": "Sort the nodes in the order you wish to start them, top to bottom.",
	    "value": "",
	    "valueType": "sortable",
	    "valueItems": [
	    ]
        };

        Object.keys(containerNodeMap).map(function(containerPath) {
            var containerTmpl = Object.assign({}, tmpl);
            containerTmpl.name = 'Container:'+containerPath;
            containerTmpl.displayName = containerNodeMap[ containerPath ].name;
            containerTmpl.valueItems = containerNodeMap[ containerPath ].nodes;

            config.push(containerTmpl);
        });

        return config;
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
            var disabledMessage = 'Excluded from Experiment';

            var hostTmpl = Object.assign({}, tmpl);
            hostTmpl.name = 'Host_Selection:' + hostPath;
            hostTmpl.displayName = hostName;
            hostTmpl.value = users[0] || disabledMessage;
            hostTmpl.valueItems = users.concat(disabledMessage);

            config.push(hostTmpl);
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
