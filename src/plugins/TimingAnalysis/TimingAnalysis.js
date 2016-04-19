/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Sun Apr 10 2016 20:47:31 GMT-0700 (PDT).
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',    
    'text!./metadata.json',
    'common/util/ejs', // for ejs templates
    'common/util/xmljsonconverter', // used to save model as json
    'plugin/TimingAnalysis/TimingAnalysis/Templates/Templates', // 
    'rosmod/meta',
    'rosmod/remote_utils',
    'rosmod/modelLoader',
    'q'
], function (
    PluginConfig,
    PluginBase,
    pluginMetadata,
    ejs,
    Converter,
    TEMPLATES,
    MetaTypes,
    utils,
    loader,
    Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of TimingAnalysis.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin TimingAnalysis.
     * @constructor
     */
    var TimingAnalysis = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.metaTypes = MetaTypes;
	this.pluginMetadata = pluginMetadata;
        this.FILES = {
	    'cpn': 'cpn.ejs'
        };
    };

    TimingAnalysis.metadata = pluginMetadata;

    // Prototypal inheritance from PluginBase.
    TimingAnalysis.prototype = Object.create(PluginBase.prototype);
    TimingAnalysis.prototype.constructor = TimingAnalysis;

    TimingAnalysis.prototype.notify = function(level, msg) {
	var self = this;
	var prefix = self.projectId + '::' + self.projectName + '::' + level + '::';
	var max_msg_len = 100;
	if (level=='error')
	    self.logger.error(msg);
	else if (level=='debug')
	    self.logger.debug(msg);
	else if (level=='info')
	    self.logger.info(msg);
	else if (level=='warning')
	    self.logger.warn(msg);
	self.createMessage(self.activeNode, msg, level);
	if (msg.length < max_msg_len)
	    self.sendNotification(prefix+msg);
	else {
	    var splitMsgs = utils.chunkString(msg, max_msg_len);
	    splitMsgs.map(function(splitMsg) {
		self.sendNotification(prefix+splitMsg);
	    });
	}
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
    TimingAnalysis.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this;

        // Default fails
        self.result.success = false;

	// What did the user select for our configuration?
	var currentConfig = self.getCurrentConfig();
	self.generateCPNAnalysis = currentConfig.generateCPN;
	self.returnZip = currentConfig.returnZip;
	self.runningOnClient = false;

	self.artifacts = {};
	
        if (typeof WebGMEGlobal !== 'undefined') {
	    self.runningOnClient = true;
        }

	if (!self.runningOnClient) {
	    var path = require('path');
	    // Setting up variables that will be used by various functions of this plugin
	    self.gen_dir = path.join(process.cwd(),
				     'generated',
				     self.project.projectId,
				     self.branchName,
				     self.projectName);
	}
	
        self.updateMETA(self.metaTypes);

	// the active node for this plugin is software -> project
	var projectNode = self.activeNode;
	self.projectName = self.core.getAttribute(projectNode, 'name');

	self.projectModel = {}; // will be filled out by loadProjectModel (and associated functions)

	loader.logger = self.logger;
	utils.logger = self.logger;
      	loader.loadModel(self.core, projectNode)
  	    .then(function (projectModel) {
		self.projectModel = projectModel;
  	    })
	    .then(function () {
		return self.generateArtifacts();
	    })
	    .then(function () {
		return self.saveArtifactsOnServer(); //downloads template and renders files to server
	    })
	    .then(function () {
		return self.returnArtifactsToUser();
	    })
	    .then(function () {
        	self.result.setSuccess(true);
        	callback(null, self.result);
	    })
	    .catch(function (err) {
		self.notify('error', err);
        	self.result.setSuccess(false);
        	callback(err, self.result);
	    })
		.done();
    };

    TimingAnalysis.prototype.generateArtifacts = function() {
	var self = this;
	if ( !self.generateCPNAnalysis ) {
	    return;
	}
	self.notify('info','Generating CPN Model.');

	var deployments_folder = self.projectModel.Deployments_list;
	if (deployments_folder && deployments_folder[0] && deployments_folder[0].Deployment_list) {
	    deployments_folder[0].Deployment_list.map(function(deployment) {
		self.notify('info', 'Parsing Deployment: ' + deployment.name);
		var timer_tokens = '1`[\n';
		var clock_tokens = '1`[\n';
		var interaction_tokens = '1`[\n';
		var component_thread_tokens = '1`[\n';
		var message_queue_tokens = '1`[\n';
		var hardware_num = 1

		var msg_map = {};
		var srv_map = {};
		var component_hardware_map = {};
		if (deployment.Container_list) {
		    // build up the maps
		    deployment.Container_list.map(function(container) {
			if (container.Node_list) {
			    container.Node_list.map(function(node) {
				if (node.Component_list) {
				    node.Component_list.map(function(component) {
					component_hardware_map[component.name] = "CPU_" + hardware_num;
					// possibly refactor the code below to use Array.prototype.filter()
					if (component.Publisher_list) {
					    component.Publisher_list.map(function(publisher) {
						var msg = publisher.Message.name;
						if (!msg_map[msg]) {
						    msg_map[msg] = {
							publishers: [],
							subscribers: []
						    };
						}
						msg_map[msg].publishers.push(publisher);
					    });
					}
					if (component.Subscriber_list) {
					    component.Subscriber_list.map(function(subscriber) {
						var msg = subscriber.Message.name;
						if (!msg_map[msg]) {
						    msg_map[msg] = {
							publishers: [],
							subscribers: []
						    };
						}
						msg_map[msg].subscribers.push(subscriber);
					    });
					}
					if (component.Client_list) {
					    component.Client_list.map(function(client) {
						var srv = client.Service.name;
						if (!srv_map[srv]) {
						    srv_map[srv] = {
							clients: [],
							servers: []
						    };
						}
						srv_map[srv].clients.push(client);
					    });
					}
					if (component.Server_list) {
					    component.Server_list.map(function(server) {
						var srv = server.Service.name;
						if (!srv_map[srv]) {
						    srv_map[srv] = {
							clients: [],
							servers: []
						    };
						}
						srv_map[srv].servers.push(server);
					    });
					}
				    }); // end Component_list.map(component)
				}
				hardware_num += 1; // done with the nodes on this container
			    }); // end Node_list.map(node)
			}
		    }); // end Container_list.map(container)
		    hardware_num = 1;
		    // Now generate the tokens based on the maps
		    deployment.Container_list.map(function(container) {
			// Clock Tokens check
			if (clock_tokens != '1`[\n') {
			    clock_tokens += ',\n';
			}
			clock_tokens += '{node="CPU_' + hardware_num.toString() 
			    + '", value=0, next_tick=4000}';

			// Component Thread Tokens check
			if (component_thread_tokens != '1`[\n') {
			    component_thread_tokens += ',\n';
			}
			component_thread_tokens += '{node="CPU_' + hardware_num.toString() + '", threads=[';

			// Component Message Queue Tokens check
			if (message_queue_tokens != '1`[\n') {
			    message_queue_tokens += ',\n';
			}
			// 1`[{node=&quot;BBB_111&quot;, cmql=[{component=&quot;Component_1&quot;, scheme=PFIFO, queue=[]}]}]
			message_queue_tokens += '{node="CPU_' + hardware_num.toString() + '", cmql=[';
			
			if (container.Node_list) {
			    container.Node_list.map(function(node) {
				var node_priority = node.Priority;
				if (node.Component_list) {
				    node.Component_list.map(function(component) {
					if (component_thread_tokens.slice(-1) != '[')
					    component_thread_tokens += ', ';
					component_thread_tokens += '{node="CPU_' + hardware_num.toString() + 
					    '", component="' + component.name + 
					    '", priority=' + node_priority + ', operation=[]}';

					if (message_queue_tokens.slice(-1) != '[')
					    message_queue_tokens += ', ';
					message_queue_tokens += '{component="' + component.name 
					    + '", scheme=' + component.SchedulingScheme + ', queue=[]}';
					if (component.Timer_list) {
					    component.Timer_list.map(function(timer) {
						// Timer Tokens check
						if (timer_tokens != '1`[\n') {
						    timer_tokens += ',\n';
						}
						timer_tokens += '{node="CPU_' + hardware_num.toString() + 
						    '", period=' + timer.period * 1000000 + ', offset=0, operation=' +
						    '{node="CPU_' + hardware_num.toString() + '", component="' +
						    component.name + '", operation="' + timer.name + '_operation"' + 
						    ', priority=' + timer.priority + ', deadline=' + 
						    timer.deadline * 1000000 + ', enqueue_time=0, steps=[';
						var re = /([A-Z]*)\s([\w\_\.\(\)]+);/g;
						var result = re.exec(timer.abstractBusinessLogic);
						while(result != null) {
						    var port_type = result[1];
						    var wcet = 0;
						    if (port_type == "LOCAL") {
							var wcet = result[2];
							if (timer_tokens.slice(-1) != '[')
							    timer_tokens += ', ';
							timer_tokens += '{kind="LOCAL", port="LOCAL", unblk=[], '+
							    'exec_time=0, duration=' + wcet * 1000000 + '}';
						    }
						    else if (port_type == "RMI") {
							if (timer_tokens.slice(-1) != '[')
							    timer_tokens += ', ';
							timer_tokens += '{kind="CLIENT", port="' + result[2] + 
							    '", unblk=[], exec_time=0, duration=0}';
						    }
						    else if (port_type == "PUBLISH") {
							if (timer_tokens.slice(-1) != '[')
							    timer_tokens += ', ';
							timer_tokens += '{kind="PUBLISHER", port="' + result[2] + 
							    '", unblk=[], exec_time=0, duration=0}';
						    }
						    result = re.exec(timer.abstractBusinessLogic);
						}
						timer_tokens += ']}}';
					    }); // end Timer_list.map(timer)
					}
					if (component.Publisher_list) {
					    component.Publisher_list.map(function(publisher) {
						// publisher tokens
						var topic = publisher.Message.name;
						if (msg_map[topic].subscribers) {
						    msg_map[topic].subscribers.map(function(subscriber) {
							var subCompName= self.projectModel.pathDict[subscriber.parentPath].name;
							if (interaction_tokens != '1`[\n') {
							    interaction_tokens += ',\n';
							}
							interaction_tokens += '{node="CPU_' + hardware_num.toString() + 
							    '", port="' + publisher.name + 
							    '", operation={node="' + component_hardware_map[subCompName] + 
							    '", component="' + subCompName + 
							    '", operation="' + subscriber.name + '_operation", priority=' + 
							    subscriber.Priority + ', deadline=' + 
							    subscriber.Deadline * 1000000 + ', enqueue_time=0, steps=[';
							var re = /([A-Z]*)\s([\w\_\.\(\)]+);/g;
							var result = re.exec(subscriber.AbstractBusinessLogic);
							while(result != null) {
							    var port_type = result[1];
							    var wcet = 0;
							    if (port_type == "LOCAL") {
								var wcet = result[2];
								if (interaction_tokens.slice(-1) != '[')
								    interaction_tokens += ', ';
								interaction_tokens += '{kind="LOCAL", port="LOCAL", unblk=[], '+
								    'exec_time=0, duration=' + wcet * 1000000 + '}';
							    }
							    else if (port_type == "RMI") {
								if (interaction_tokens.slice(-1) != '[')
								    interaction_tokens += ', ';
								interaction_tokens += '{kind="CLIENT", port="' + result[2] + 
								    '", unblk=[], exec_time=0, duration=0}';
							    }
							    else if (port_type == "PUBLISH") {
								if (interaction_tokens.slice(-1) != '[')
								    interaction_tokens += ', ';
								interaction_tokens += '{kind="PUBLISHER", port="' + result[2] + 
								    '", unblk=[], exec_time=0, duration=0}';
							    }
							    result = re.exec(subscriber.AbstractBusinessLogic);
							}
							interaction_tokens += ']}}';
						    }); // end msg_map[topic].subscribers.map(subscriber)
						}
					    }); // end Publisher_list.map(publisher)
					}
					if (component.Client_list) {
					    component.Client_list.map(function(client) {
						// client tokens
						var service = client.Service.name;
						if (srv_map[service].servers) {
						    srv_map[service].servers.map(function(server) {
							var serverCompName = self.projectModel.pathDict[server.parentPath].name;
							if (interaction_tokens != '1`[\n') {
							    interaction_tokens += ',\n';
							}
							interaction_tokens += '{node="CPU_' + hardware_num.toString() + 
							    '", port="' + client.name + 
							    '", operation={node="' + component_hardware_map[serverCompName] + 
							    '", component="' + serverCompName + 
							    '", operation="' + server.name + '_operation", ' +
							    'priority=' + server.Priority + ', deadline=' + 
							    server.Deadline * 1000000 + ', enqueue_time=0, steps=[';
							var re = /([A-Z]*)\s([\w\_\.\(\)]+);/g;
							var result = re.exec(server.AbstractBusinessLogic);
							while(result != null) {
							    var port_type = result[1];
							    var wcet = 0;
							    if (port_type == "LOCAL") {
								var wcet = result[2];
								if (interaction_tokens.slice(-1) != '[')
								    interaction_tokens += ', ';
								interaction_tokens += '{kind="LOCAL", port="LOCAL", unblk=[], '+
								    'exec_time=0, duration=' + wcet * 1000000 + '}';
							    }
							    else if (port_type == "RMI") {
								if (interaction_tokens.slice(-1) != '[')
								    interaction_tokens += ', ';
								interaction_tokens += '{kind="CLIENT", port="' + result[2] + 
								    '", unblk=[], exec_time=0, duration=0}';
							    }
							    else if (port_type == "PUBLISH") {
								if (interaction_tokens.slice(-1) != '[')
								    interaction_tokens += ', ';
								interaction_tokens += '{kind="PUBLISHER", port="' + result[2] + 
								    '", unblk=[], exec_time=0, duration=0}';
							    }					    
							    result = re.exec(server.AbstractBusinessLogic);
							}
							var n = interaction_tokens.lastIndexOf("unblk=[]");
							interaction_tokens = interaction_tokens.slice(0, n) + 
							    interaction_tokens.slice(n).replace(
								"unblk=[]",
								'unblk=[{node="CPU_' + 
								    hardware_num.toString() + '", component="' + 
								    component.name  + '", port="' + client.name  + '"}]'
							    );
							interaction_tokens += ']}}';
						    }); // end srv_map[service].servers.map(server)
						}
					    }); // end component.Client_list.map(client)
					}
				    }); // end Component_list.map(component)				    
				}
			    }); // end Node_list.map(node)
			    component_thread_tokens += ']}';
			    message_queue_tokens += ']}';
			    hardware_num += 1
			}
		    }); // end Container_list.map(container)
		}
		// finish the token sequences for this deployment
		clock_tokens += '\n]';
		timer_tokens += '\n]';
		interaction_tokens += '\n]';
		component_thread_tokens += '\n]';
		message_queue_tokens += '\n]';

		var cpn = deployment.name + '_Analysis_Model.cpn',
		cpnTemplate = TEMPLATES[self.FILES['cpn']];
		self.artifacts[cpn] = ejs.render(cpnTemplate, {'clock_tokens' : clock_tokens, 
							       'timer_tokens' : timer_tokens,
							       'interaction_tokens' : interaction_tokens,
							       'component_thread_tokens' : component_thread_tokens,
							       'message_queue_tokens' : message_queue_tokens});
	    }); // end Deployment_list.map(deployment)
	}
    };

    TimingAnalysis.prototype.saveArtifactsOnServer = function() {
	var self = this;
	if ( self.runningOnClient ) {
	    return;
	}
	var path = require('path');
	var dir = path.join(self.gen_dir,'cpn');
	var child_process = require('child_process');

	// clear out any previous project files
	child_process.execSync('rm -rf ' + utils.sanitizePath(dir));

	// Get the dummy cpn template
	var file_url = 'https://github.com/rosmod/rosmod-cpn/releases/download/v1.0.0/cpn.zip';
	return utils.wgetAndUnzipLibrary(file_url, dir)
	    .then(function() {
		self.notify('info', 'Downloaded CPN template');
		var filendir = require('filendir');
		var fileKeys = Object.keys(self.artifacts);
		var tasks = fileKeys.map(function(key) {
		    var fname = path.join(dir, key),
		    data = self.artifacts[key];

		    return new Promise(function(resolve, reject) {
			filendir.writeFile(fname, data, function(err) {
			    if (err) {
				self.logger.error(err);
				reject(err);
			    }
			    else {
				resolve();
			    }
			});
		    });
		});
		return Q.all(tasks);
	    })
	    .then(function() {
		self.notify('info', 'Generated CPN');
	    });
    };

    TimingAnalysis.prototype.returnArtifactsToUser = function() {
	var self = this;
	if (!self.returnZip) {
	    self.notify('info', 'User did not request the artifacts to be returned.');
	    return;
	}
	
	self.notify('info', 'Returning artifacts to user.');

	if (self.runningOnClient) {
	    // we are running on client; couldn't download template and can't zip
	    var fileNames = Object.keys(self.artifacts);

	    var tasks = fileNames.map(function(fileName) {
		return self.blobClient.putFile(fileName, self.artifacts[fileName])
		    .then(function (hash) {
			self.result.addArtifact(hash);
		    });
	    });

	    return Q.all(tasks);
	}
	else {  // we are running on server, downloaded template and need to zip;
	    return new Promise(function(resolve, reject) {
		var zlib = require('zlib'),
		tar = require('tar'),
		fstream = require('fstream'),
		path = require('path'),
		input = path.join(self.gen_dir,'cpn');

		var bufs = [];
		var packer = tar.Pack()
		    .on('error', function(e) { reject(e); });

		var gzipper = zlib.Gzip()
		    .on('error', function(e) { reject(e); })
		    .on('data', function(d) { bufs.push(d); })
		    .on('end', function() {
			var buf = Buffer.concat(bufs);
			self.blobClient.putFile('artifacts.tar.gz',buf)
			    .then(function (hash) {
				self.result.addArtifact(hash);
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
		    self.notify('info', 'Created archive.');
		});
	}
    };

    return TimingAnalysis;
});
