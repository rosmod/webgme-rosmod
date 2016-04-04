/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Wed Mar 02 2016 22:17:40 GMT-0600 (Central Standard Time).
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    'common/util/ejs', // for ejs templates
    'common/util/xmljsonconverter', // used to save model as json
    'plugin/RunExperiment/RunExperiment/Templates/Templates', // 
    'rosmod/meta',
    'rosmod/remote_utils',
    'rosmod/modelLoader',
    'q'
], function (
    PluginConfig,
    PluginBase,
    ejs,
    Converter,
    TEMPLATES,
    MetaTypes,
    utils,
    loader,
    Q) {
    'use strict';

    /**
     * Initializes a new instance of RunExperiment.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin RunExperiment.
     * @constructor
     */
    var RunExperiment = function () {
        // Call base class' constructor.
        PluginBase.call(this);

        this.metaTypes = MetaTypes;
        this.FILES = {
            'node_xml': 'node.xml.ejs'
        };
    };

    // Prototypal inheritance from PluginBase.
    RunExperiment.prototype = Object.create(PluginBase.prototype);
    RunExperiment.prototype.constructor = RunExperiment;

    /**
     * Gets the name of the RunExperiment.
     * @returns {string} The name of the plugin.
     * @public
     */
    RunExperiment.prototype.getName = function () {
        return 'RunExperiment';
    };

    /**
     * Gets the semantic version (semver.org) of the RunExperiment.
     * @returns {string} The version of the plugin.
     * @public
     */
    RunExperiment.prototype.getVersion = function () {
        return '0.1.0';
    };

    /**
     * Gets the configuration structure for the ObservationSelection.
     * The ConfigurationStructure defines the configuration for the plugin
     * and will be used to populate the GUI when invoking the plugin from webGME.
     * @returns {object} The version of the plugin.
     * @public
     */
    RunExperiment.prototype.getConfigStructure = function() {
        return [
	    {
		'name': 'returnZip',
		'displayName': 'Zip and return generated artifacts.',
		'description': 'If true, it enables the client to download a zip of the artifacts.',
		'value': false,
		'valueType': 'boolean',
		'readOnly': false
	    }
        ];
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    RunExperiment.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this;

        // Default fails
        self.result.success = false;

        if (typeof WebGMEGlobal !== 'undefined') {
            callback(new Error('Client-side execution is not supported'), self.result);
            return;
        }

        self.updateMETA(self.metaTypes);

	// What did the user select for our configuration?
	var currentConfig = self.getCurrentConfig();
	self.returnZip = currentConfig.returnZip;
	
	// will be filled out by the plugin
	self.experiment = [];
	self.rosCorePort = Math.floor((Math.random() * (65535-1024) + 1024));
	self.rosCoreIp = '';

	loader.logger = self.logger;
	utils.logger = self.logger;

	// the active node for this plugin is experiment -> experiments -> project
	var projectNode = self.core.getParent(self.core.getParent(self.activeNode));
	var projectName = self.core.getAttribute(projectNode, 'name');

	self.experimentName = self.core.getAttribute(self.activeNode, 'name');
	var path = require('path');
	self.root_dir = path.join(process.cwd(), 
				  'generated', 
				  self.project.projectId, 
				  self.branchName,
				  projectName);
	self.xml_dir = path.join(self.root_dir,
				 'experiments', 
				 self.experimentName,
				 'xml');

	self.logger.info('loading project: ' + projectName);
	loader.loadProjectModel(self.core, self.META, projectNode, self.rootNode)
	    .then(function(projectModel) {
		self.projectModel = projectModel;
		self.logger.info('parsed model!');
		// update the object's selectedExperiment variable
		self.selectedExperiment = self.projectModel.experiments[self.experimentName];
		// check to make sure we have the right experiment
		var expPath = self.core.getPath(self.activeNode);
		if ( expPath != self.selectedExperiment.path ) {
		    throw new String("Experiments exist with the same name, can't properly resolve!");
		}
		return self.mapContainersToHosts();
	    })
	    .then(function() {
		// check for binaries
		self.logger.info('checking for binaries');
		return self.checkBinaries();
	    })
	    .then(function() {
		// generate xml files here
		self.logger.info('generating artifacts');
		return self.generateArtifacts();
	    })
	    .then(function() {
		// send the deployment + binaries off to hosts for execution
		self.logger.info('deploying onto system');
		return self.deployExperiment();
	    })
	    .then(function() {
		// create experiment nodes in the model corresponding to created experiment mapping
		return self.createModelArtifacts();
	    })
	    .then(function() {
		return self.createZip();
	    })
	    .then(function() {
		// This will save the changes. If you don't want to save;
		self.logger.info('saving updates to model');
		return self.save('RunExperiment updated model.');
	    })
	    .then(function (err) {
		if (err.status != 'SYNCED') {
		    callback(err, self.result);
		    return;
		}
		self.result.setSuccess(true);
		callback(null, self.result);
	    })
	    .catch(function(err) {
        	self.logger.error(err);
        	self.createMessage(self.activeNode, err, 'error');
		self.result.setSuccess(false);
		callback(err, self.result);
	    })
		.done();
    };

    RunExperiment.prototype.mapContainersToHosts = function () {
	var self = this;

	self.logger.info('Experiment mapping containers in ' + self.selectedExperiment.deployment.name +
			 ' to hosts in '  + self.selectedExperiment.system.name);

	var containers = self.selectedExperiment.deployment.containers;
	return utils.getAvailableHosts(self.selectedExperiment.system.hosts)
	    .then(function(hosts) {
		var containerLength = Object.keys(containers).length;
		self.logger.info( containerLength + ' mapping to ' + hosts.length);
		if (hosts.length < containerLength) {
		    throw new String('Cannot map ' + containerLength +
				     ' containers to ' + hosts.length +
				     ' available hosts.');
		}
		var containerKeys = Object.keys(containers);
		// figure out which containers have which constraints;
		for (var c in containers) {
		    var container = containers[c];
		    container.constraints = [];
		    for (var n in container.nodes) {
			var node = container.nodes[n];
			for (var ci in node.compInstances) {
			    var comp = node.compInstances[ci].component;
			    for (var co in comp.constraints) {
				var constraint = comp.constraints[co];
				if (container.constraints.indexOf(constraint) == -1) {
				    container.constraints.push(constraint);
				}
			    }
			}
		    }
		}
		/*
		// Sort containers by decreasing number of constraints
		var sortedContainers = [];
		for (var c in containers) {
		    var container = containers[c];
		    var length = container.constraints.length;
		    if (sortedContainers[length]) {
			sortedContainers[length].push(container);
		    }
		    else {
			sortedContainers[length] = [];
			sortedContainers[length].push(container);
		    }
		}
		// Actually perform the mapping
		for (var cList in sortedContainers) {
		    for (var c in sortedContainers[cList]) {
			var container = sortedContainers[cList][c];
			var constraints = container.constraints;
			var foundHost = false;
			for (var j=0; j<hosts.length; j++) {
			    var host = hosts[j];
			    var capabilities = host.host.capabilities;
			    if (self.capabilitiesMeetConstraints(capabilities, constraints)) {
				self.experiment.push([container, host]);
				hosts.splice(j,j);
				foundHost = true;
				break;
			    }
			}
			if (!foundHost) {
			    throw new String('Cannot map ' + container.name + ' to any host; constraints: ' +
					     JSON.stringify(container.constraints,null,2) +
					     ' not met.');
			}
		    }
		}
		*/
		// Actually perform the mapping
		for (var c in containers) {
		    var container = containers[c];
		    var constraints = container.constraints;
		    var foundHost = false;
		    for (var j=0; j<hosts.length; j++) {
			var host = hosts[j];
			var capabilities = host.host.capabilities;
			if (self.capabilitiesMeetConstraints(capabilities, constraints)) {
			    self.experiment.push([container, host]);
			    hosts.splice(j,j);
			    foundHost = true;
			    break;
			}
		    }
		    if (!foundHost) {
			throw new String('Cannot map ' + container.name + ' to any host; constraints: ' +
					 JSON.stringify(container.constraints,null,2) +
					 ' not met.');
		    }
		}
	    });
    };

    RunExperiment.prototype.capabilitiesMeetConstraints = function(capabilities, constraints) {
	var self = this;
	if (constraints != undefined && capabilities == undefined) {
	    return false;
	}
	if (constraints == undefined) {
	    return true;
	}
	var capKeys = Object.keys(capabilities);
	for (var c in constraints) {
	    var constraint = constraints[c];
	    if (capKeys.indexOf(constraint.name) == -1) {
		return false;
	    }
	}
	return true;
    };

    RunExperiment.prototype.checkBinaries = function() {
	var self = this;
	var path = require('path');
	var fs = require('fs');
	var platforms = [];
	self.experiment.map(function (containerToHostMap) {
	    var host = containerToHostMap[1];
	    var devType = utils.getDeviceType(host.host);
	    if (platforms.indexOf(devType) == -1)
		platforms.push(devType);
	});
	var tasks = platforms.map(function (platform) {
	    var platformBinPath = path.join(self.root_dir,
					    'bin',
					    platform);
	    fs.accessSync(platformBinPath);
	});
	return Q.all(tasks);
    };

    RunExperiment.prototype.generateArtifacts = function () {
	var self = this;
	var path = require('path');
	var filendir = require('filendir');
	var filesToAdd = {};
	var prefix = '';

	var projectName = self.projectModel.name;

	self.experiment.map(function (containerToHostMap) {
	    var container = containerToHostMap[0]; // container is [0], host is [1]
	    Object.keys(container.nodes).map(function(ni) {
		var node = container.nodes[ni];
		node.requiredLibs = [];
		for (var ci in node.compInstances) {
		    var comp = node.compInstances[ci].component;
		    for (var l in comp.requiredLibs) {
			var lib = comp.requiredLibs[l];
			if ( lib.type == 'Source Library' && node.requiredLibs.indexOf(lib) == -1 )
			    node.requiredLibs.push(lib);
		    }
		}
		var nodeXMLName = prefix + node.name + '.xml';
		var nodeXMLTemplate = TEMPLATES[self.FILES['node_xml']];
		filesToAdd[nodeXMLName] = ejs.render(nodeXMLTemplate, {nodeInfo: node});
	    });
	});

	var promises = [];

	return (function () {
	    for (var f in filesToAdd) {
		var fname = path.join(self.xml_dir, f),
		data = filesToAdd[f];

		promises.push(new Promise(function(resolve, reject) {
		    filendir.writeFile(fname, data, function(err) {
			if (err) {
			    self.logger.error(err);
			    reject(err);
			}
			else {
			    resolve();
			}
		    });
		}));
	    }
	    return Q.all(promises);
	})()
	    .then(function() {
		self.logger.debug('generated artifacts.');
		self.createMessage(self.activeNode, 'Generated artifacts.');
	    })
    };

    RunExperiment.prototype.copyArtifactsToHosts = function () {
	var self = this;
	var path = require('path');
	var tasks = self.experiment.map(function(link) {
	    var container = link[0];
	    var host = link[1];
	    var ip = host.intf.ip;
	    var user = host.user;
	    var devId = utils.getDeviceType(host.host);
	    var local_exe_dir = path.join(self.root_dir, 'bin', devId)
	    var deployment_dir = path.join(user.directory,
					   'experiments',
					   self.experimentName);
	    return utils.mkdirRemote(deployment_dir, ip, user)
		.then(function() {
		    return utils.copyToHost(local_exe_dir,
					    deployment_dir,
					    ip,
					    user);
		})
		.then(function() {
		    return utils.copyToHost(self.xml_dir,
					    deployment_dir,
					    ip,
					    user);
		});
	});
	return Q.all(tasks);
    };

    RunExperiment.prototype.startRosCore = function() {
	var self = this;
	var path = require('path');
	var link = self.experiment[0];
	var container = link[0];
	var host = link[1];
	var ip = host.intf.ip;
	self.rosCoreIp = ip;
	var user = host.user;
	var host_commands = [
	    'source /opt/ros/indigo/setup.bash',
	    'export ROS_IP='+ip,
	    'export ROS_MASTER_URI=http://'+ip+':'+self.rosCorePort,
	    'roscore --port=' + self.rosCorePort + ' &'
	];
	host_commands.push('sleep 10');
	self.logger.info('Starting ROSCORE at: ' + self.rosCoreIp+':'+self.rosCorePort);
	return utils.executeOnHost(host_commands, ip, user)
	    .then(function() {
		self.logger.info('executed roscore!');
		return [];
	    });
    };

    RunExperiment.prototype.startProcesses = function() {
	var self = this;
	var path = require('path');
	var tasks = self.experiment.map(function(link) {
	    var container = link[0];
	    var host = link[1];
	    var ip = host.intf.ip;
	    var user = host.user;
	    var deployment_dir = path.join(user.directory,
					   'experiments',
					   self.experimentName);
	    var host_commands = [
		'cd ' + deployment_dir,
		'source /opt/ros/indigo/setup.bash',
		'export LD_LIBRARY_PATH=$PWD:$LD_LIBRARY_PATH',
		'export ROS_IP='+ip,
		'export ROS_MASTER_URI=http://'+self.rosCoreIp+':'+self.rosCorePort,
		'export DISPLAY=:0.0'
	    ];
	    for (var n in container.nodes) {
		host_commands.push('DISPLAY=:0.0 ./node_main -config ' +
				   container.nodes[n].name + '.xml ' +
				   container.nodes[n].cmdLine +
				   ' &');
	    }
	    //host_commands.push('sleep 10');
	    self.logger.info('starting binaries.');
	    return utils.executeOnHost(host_commands, ip, user);
	});
	return Q.all(tasks);
    };

    RunExperiment.prototype.deployExperiment = function () {
	var self = this;
	return self.copyArtifactsToHosts()
	    .then(function () {
		self.logger.info('Copied artifacts to hosts.');
		return self.startRosCore();
	    })
	    .then(function () {
		self.logger.info('Started roscore.');
		return self.startProcesses();
	    })
	    .then(function() {
		var msg = 'Successfully started experiment.';
		self.logger.info(msg);
		self.createMessage(self.activeNode, msg);
	    })
    };

    RunExperiment.prototype.createModelArtifacts = function () {
	var self=this;
	var metaNodes = self.core.getAllMetaNodes(self.activeNode);
	var fcoNode = self.core.getBaseRoot(self.activeNode);

	self.experiment.forEach(function(link) {
	    var container = link[0];
	    var host = link[1];
	    // use self.core.createNode(parameters);
	    //    parameters here has the following optional values:
	    //       * parent (node)
	    //       * base   (node) 
	    //       * relid  (string)
	    //       * guid   (GUID)

	    // should probably set the meta type here to be containers/hosts/(links?)
	    var cn = self.core.createNode({parent: self.activeNode, base: fcoNode});
	    var hn = self.core.createNode({parent: self.activeNode, base: fcoNode});
	    var ln = self.core.createNode({parent: self.activeNode, base: fcoNode});

	    //self.logger.info(JSON.stringify(cn, null, 2));
	    //self.logger.info(JSON.stringify(hn, null, 2));
	    //self.logger.info(JSON.stringify(ln, null, 2));

	    // use self.core.setAttribute(node, name, value);
	    //    value here can be any valid JS object (even nested types);
	    self.core.setAttribute(cn, 'name', container.name);
	    self.core.setAttribute(cn, 'type', 'Container');
	    self.core.setAttribute(hn, 'name', host.host.name);
	    self.core.setAttribute(hn, 'type', 'Host');
	    self.core.setAttribute(hn, 'Host', host.host);
	    self.core.setAttribute(hn, 'User', host.user);
	    self.core.setAttribute(hn, 'Interface', host.intf);
	    self.core.setAttribute(ln, 'name', 'MapsTo');
	    self.core.setAttribute(ln, 'type', 'Association');
	    // optionally use self.core.setAttributeMeta(node, name, rule);
	    //    rule here defines the 'type' of the attribute
	    // use self.core.setPointer(node, name, target);
	    self.core.setPointer(ln, 'src', cn);
	    self.core.setPointer(ln, 'dst', hn);
	    // optionally use self.core.setPointerMetaTarget(node, name, targe, min(opt), max(opt));
	});
    };
			      
    RunExperiment.prototype.createZip = function() {
	var self = this;
	
	if (!self.returnZip) {
            self.createMessage(self.activeNode, 'Skipping compression.');
	    return;
	}
	
	return new Promise(function(resolve, reject) {
	    var zlib = require('zlib'),
	    tar = require('tar'),
	    fstream = require('fstream'),
	    input = self.xml_dir;

	    self.logger.info('zipping ' + input);

	    var bufs = [];

	    var packer = tar.Pack()
		.on('error', function(e) { reject(e); });

	    var gzipper = zlib.Gzip()
		.on('error', function(e) { reject(e); })
		.on('data', function(d) { bufs.push(d); })
		.on('end', function() {
		    self.logger.debug('gzip ended.');
		    var buf = Buffer.concat(bufs);
		    self.blobClient.putFile('artifacts.tar.gz',buf)
			.then(function (hash) {
			    self.result.addArtifact(hash);
			    self.logger.info('compression complete');
			    resolve();
			})
			.catch(function(err) {
			    reject(err);
			})
			    .done();
		});

	    var reader = fstream.Reader({ 'path': input, 'type': 'Directory' })
		.on('error', function(e) { reject(e); });

	    reader
		.pipe(packer)
		.pipe(gzipper);
	})
	    .then(function() {
		self.createMessage(self.activeNode, 'Created archive.');
	    });
    };

    return RunExperiment;
});
