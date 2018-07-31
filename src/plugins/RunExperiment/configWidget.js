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
                    var containerNodeMap = _containerNodeMap;
		            // how do we want to do debugging?
		            var debugConfig = self.makeDebugConfig( containerNodeMap );
                    pluginMetadata.configStructure = debugConfig.concat(pluginMetadata.configStructure);

                    // for each container create sortable selection of nodes for ordering their starting
                    var containerConfig = self.makeContainerConfig( containerNodeMap );
                    pluginMetadata.configStructure = [containerConfig].concat(pluginMetadata.configStructure);

                    // figure out their users
                    var hostUserMap = self.makeHostUserMap( hosts, users );
                    // for each host create selection in meta with options
                    // containing users (defauling to first user) and "Disabled"
                    var hostConfig = self.makeHostConfig( hostUserMap );
                    pluginMetadata.configStructure = [hostConfig].concat(pluginMetadata.configStructure);

                    // do we want to spawn rosbridge?
                    var rosBridgeConfig = self.makeRosBridgeConfig( );
                    pluginMetadata.configStructure = [rosBridgeConfig].concat(pluginMetadata.configStructure);

                    // where do we want to spawn roscore?
                    var rosCoreConfig = self.makeRosCoreConfig( hosts );
                    pluginMetadata.configStructure = [rosCoreConfig].concat(pluginMetadata.configStructure);

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

        var validTypes = ["Node", "External Node", "Script Node"];

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
        var self = this;

        return Object.keys(containerNodeMap).reduce(function(o, containerPath) {
            var tmpl = {
	            "name": containerPath,
	            "displayName": containerNodeMap[ containerPath ].name,
	            "description": "Sort the nodes in the order you wish to start them, top to bottom.",
	            "value": "",
	            "valueType": "sortable",
	            "valueItems": containerNodeMap[ containerPath ].nodes
            };
            o.configStructure.push(tmpl);
            return o;
        }, {
            "name": "containerConfig",
            "displayName": "Container Configuration",
            "valueType": "header",
            "configStructure": []
        });
    };
    
    ConfigWidget.prototype.makeHostConfig = function( hostUserMap ) {
        var self = this,
            disabledMessage = 'Excluded from Experiment';

        return Object.keys(hostUserMap).reduce(function(o, hostPath) {
            var map = hostUserMap[hostPath];
            var users = map.users;
            var hostName = map.name;

            var tmpl = {
	            "name": hostPath,
	            "displayName": hostName,
	            "description": "Select User for Host deployment or Disabled to exclude host.",
	            "value": users[0] || disabledMessage,
	            "valueType": "string",
	            "valueItems": users.concat(disabledMessage)
	        };
            o.configStructure.push(tmpl);
            return o;
        }, {
            "name": "hostConfig",
            "displayName": "Host Configuration",
            "valueType": "header",
            "configStructure": []
        });
    };

    ConfigWidget.prototype.makeRosBridgeConfig = function () {
        return {
            "name": "rosbridge",
            "displayName": "ROS Bridge Config",
            "valueType": "header",
            "configStructure": [
                {
	                "name": "spawn",
	                "displayName": "Spawn ROSBridge server.",
	                "description": "If true, it will spawn a ROS Bridge server on the ROSMOD server that connects to the system",
	                "value": false,
	                "valueType": "boolean",
	                "readOnly": false
	            },
	            {
	                "name": "port",
	                "displayName": " ROSBridge server port.",
	                "description": "What port number should we give ROSBridge server? Leave blank for a randomly assigned port",
	                "value": 0,
                    "minValue": 0,
                    "maxValue": 65535,
	                "valueType": "integer",
	                "readOnly": false
	            },
	            {
	                "name": "IP",
	                "displayName": " ROSBridge server IP.",
	                "description": "What is the ROS_IP of the rosbridge server - this is the IP that the nodes in the system will use to connect to the rosbridge server.",
	                "value": "127.0.0.1",
	                "valueType": "string",
	                "readOnly": false
	            }
            ]
        };
    };

    ConfigWidget.prototype.makeRosCoreConfig = function( hosts ) {
        var self = this;
        
        var hostNames = [ 'Any' ];
        hostNames = hostNames.concat(
            hosts.map(function(h) {
                return self.core.getAttribute(h,'name');
            })
        );

        hostNames.push('None');

        return {
            "name": "rosCoreConfig",
            "displayName": "ROS Core Config",
            "valueType": "header",
            "configStructure": [
                {
	                "name": "rosCoreHost",
	                "displayName": "ROS Core Host",
	                "description": "Select Host / Any / None to select where and whether to spawn ROS Core / ROS Master.",
	                "value": hostNames[0],
	                "valueType": "string",
	                "valueItems": hostNames
	            },
	            {
	                "name": "rosMasterURI",
	                "displayName": "ROS Master URI.",
	                "description": "Connect to provided ROS MASTER URI if ROS Core Host is set to 'None'. Has the form of 'http://<IP Address>:<Port Number>'",
	                "value": "",
	                "valueType": "string",
	                "readOnly": false
	            },
	            {
	                "name": "rosNamespace",
	                "displayName": "ROS Namespace.",
	                "description": "Sets the ROS_NAMESPACE for the experiment.",
	                "value": "",
	                "valueType": "string",
	                "readOnly": false
	            },	
            ]
        };
    };

    return ConfigWidget;
});
