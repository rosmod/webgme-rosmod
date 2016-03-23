/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Wed Mar 02 2016 22:16:42 GMT-0600 (Central Standard Time).
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    'common/util/ejs', // for ejs templates
    'common/util/xmljsonconverter', // used to save model as json
    'plugin/SoftwareGenerator/SoftwareGenerator/Templates/Templates', // 
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
     * Initializes a new instance of SoftwareGenerator.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin SoftwareGenerator.
     * @constructor
     */
    var SoftwareGenerator = function () {
        // Call base class' constructor.
        PluginBase.call(this);
	//this.disableBrowserExecution = true; // why doesn't this work?
        this.metaTypes = MetaTypes;
        this.FILES = {
            'component_cpp': 'component.cpp.ejs',
            'component_hpp': 'component.hpp.ejs',
            'cmakelists': 'CMakeLists.txt.ejs',
            'package_xml': 'package_xml.ejs',
	    'doxygen_config': 'doxygen_config.ejs'
        };
    };

    // Prototypal inheritance from PluginBase.
    SoftwareGenerator.prototype = Object.create(PluginBase.prototype);
    SoftwareGenerator.prototype.constructor = SoftwareGenerator;

    /**
     * Gets the name of the SoftwareGenerator.
     * @returns {string} The name of the plugin.
     * @public
     */
    SoftwareGenerator.prototype.getName = function () {
        return 'SoftwareGenerator';
    };

    /**
     * Gets the semantic version (semver.org) of the SoftwareGenerator.
     * @returns {string} The version of the plugin.
     * @public
     */
    SoftwareGenerator.prototype.getVersion = function () {
        return '0.1.0';
    };

    /**
     * Gets the configuration structure for the ObservationSelection.
     * The ConfigurationStructure defines the configuration for the plugin
     * and will be used to populate the GUI when invoking the plugin from webGME.
     * @returns {object} The version of the plugin.
     * @public
     */
    SoftwareGenerator.prototype.getConfigStructure = function() {
        return [
            {
                'name': 'compile',
                'displayName': 'Compile Code',
                'description': 'Turn off to just generate source files.',
                'value': true,
                'valueType': 'boolean',
                'readOnly': false
            },
	    {
		'name': 'generate_docs',
		'displayName': 'Generate Doxygen Docs',
		'description': 'Turn off to ignorre doc generation.',
		'value': true,
		'valueType': 'boolean',
		'readOnly': false
	    },
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
    SoftwareGenerator.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this;

        // Default fails
        self.result.success = false;

        if (typeof WebGMEGlobal !== 'undefined') {
            callback(new Error('Client-side execution is not supported'), self.result);
            return;
        }
	
	// What did the user select for our configuration?
	var currentConfig = self.getCurrentConfig();
        self.logger.debug('Current configuration ' + JSON.stringify(currentConfig, null, 4));

        self.updateMETA(self.metaTypes);

	var path = require('path');

	// Setting up variables that will be used by various functions of this plugin
	self.gen_dir = path.join(process.cwd(), 'generated', self.project.projectId, self.branchName);
	self.compileCode = currentConfig.compile;
	self.generateDocs = currentConfig.generate_docs;
	self.returnZip = currentConfig.returnZip;
	self.projectModel = {}; // will be filled out by loadProjectModel (and associated functions)
	self.hostsValidForCompilation = {}; // will be filled out by selectCompilationArchitectures

	// the active node for this plugin is software -> project
	var projectNode = self.core.getParent(self.activeNode);

	loader.logger = self.logger;
	utils.logger = self.logger;
      	loader.loadProjectModel(self.core, self.META, projectNode, self.rootNode)
  	    .then(function (projectModel) {
		self.projectModel = projectModel;
        	return self.generateArtifacts();
  	    })
	    .then(function () {
		return self.downloadLibraries();
	    })
	    .then(function () {
		return self.generateCPN();
	    })
	    .then(function () {
		return self.selectCompilationArchitectures();
	    })
	    .then(function (validHostList) {
		validHostList.map(function(obj) {
		    var host = obj.host,
		    intf = obj.intf,
		    user = obj.user;
		    self.hostsValidForCompilation[host.architecture]
			.push({host:host, intf: intf, user: user});
		});
		return self.compileBinaries();
	    })
	    .then(function () {
		return self.generateDocumentation();
	    })
	    .then(function () {
		return self.createZip();
	    })
	    .then(function () {
        	self.result.setSuccess(true);
        	callback(null, self.result);
	    })
	    .catch(function (err) {
        	self.logger.error(err);
        	self.createMessage(self.activeNode, err, 'error');
        	self.result.setSuccess(false);
        	callback(err, self.result);
	    })
		.done();
    };

    SoftwareGenerator.prototype.generateArtifacts = function () {
	var self = this,
	    path = require('path'),
	    filendir = require('filendir'),
	    filesToAdd = {},
	    prefix = 'src/';

	filesToAdd[self.projectModel.name + '.json'] = JSON.stringify(self.projectModel, null, 2);
        filesToAdd[self.projectModel.name + '_metadata.json'] = JSON.stringify({
    	    projectID: self.project.projectId,
            commitHash: self.commitHash,
            branchName: self.branchName,
            timeStamp: (new Date()).toISOString(),
            pluginVersion: self.getVersion()
        }, null, 2);

	var projectName = self.projectModel.name,
	    doxygenConfigName = '/doxygen_config',
	    doxygenTemplate = TEMPLATES[self.FILES['doxygen_config']];
	filesToAdd[doxygenConfigName] = ejs.render(doxygenTemplate, 
						   {'projectName': projectName});

        for (var pkg in self.projectModel.software.packages) {
	    var pkgInfo = self.projectModel.software.packages[pkg],
		cmakeFileName = prefix + pkgInfo.name + '/CMakeLists.txt',
		cmakeTemplate = TEMPLATES[self.FILES['cmakelists']];
	    filesToAdd[cmakeFileName] = ejs.render(cmakeTemplate, {'pkgInfo':pkgInfo});

	    var packageXMLFileName = prefix + pkgInfo.name + '/package.xml',
		packageXMLTemplate = TEMPLATES[self.FILES['package_xml']];
	    filesToAdd[packageXMLFileName] = ejs.render(packageXMLTemplate, {'pkgInfo':pkgInfo});

	    for (var cmp in pkgInfo.components) {
		var compInfo = pkgInfo.components[cmp];
		self.generateComponentFiles(filesToAdd, prefix, pkgInfo, compInfo);
	    }

	    for (var msg in pkgInfo.messages) {
		var msgInfo = pkgInfo.messages[msg],
		    msgFileName = prefix + pkgInfo.name + '/msg/' + msgInfo.name + '.msg';
		filesToAdd[msgFileName] = msgInfo.definition;
	    }

	    for (var srv in pkgInfo.services) {
		var srvInfo = pkgInfo.services[srv],
		    srvFileName = prefix + pkgInfo.name + '/srv/' + srvInfo.name + '.srv';
		filesToAdd[srvFileName] = srvInfo.definition;
	    }
	}

	var promises = [];

	return (function () {
	    for (var f in filesToAdd) {
		var fname = path.join(self.gen_dir, f),
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

    SoftwareGenerator.prototype.generateComponentFiles = function (filesToAdd, prefix, pkgInfo, compInfo) {
	var inclFileName = prefix + pkgInfo.name + '/include/' + pkgInfo.name + '/' + compInfo.name + '.hpp',
	    srcFileName = prefix + pkgInfo.name + '/src/' + pkgInfo.name + '/' + compInfo.name + '.cpp',
	    compCPPTemplate = TEMPLATES[this.FILES['component_cpp']],
	    compHPPTemplate = TEMPLATES[this.FILES['component_hpp']];
	var moment = require('moment');
	filesToAdd[inclFileName] = ejs.render(compHPPTemplate, {'compInfo':compInfo, 'moment':moment});
	filesToAdd[srcFileName] = ejs.render(compCPPTemplate, {'compInfo':compInfo, 'moment':moment});
    };

    SoftwareGenerator.prototype.downloadLibraries = function ()
    {
	var self = this;
	(function() {
	    var path = require('path'),
	    prefix = path.join(self.gen_dir, 'src');
	    var promises = [];

	    // Get the required node executable
	    var file_url = 'https://github.com/rosmod/rosmod-actor/releases/download/v0.3.1-beta/rosmod-node.zip';
	    var dir = prefix;
	    promises.push(utils.wgetAndUnzipLibrary(file_url, dir));

	    // Get all the software libraries
	    for (var lib in self.projectModel.software.libraries) {
		file_url = self.projectModel.software.libraries[lib].url;
		if (file_url !== undefined)
		    promises.push(utils.wgetAndUnzipLibrary(file_url, dir));
	    }
	    return Q.all(promises);
	})()
	.then(function() {
	    self.createMessage(self.activeNode, 'Downloaded libraries.');
	})
    };

    SoftwareGenerator.prototype.generateDocumentation = function () 
    {
	var self = this;
	if (!self.generateDocs) {
            self.createMessage(self.activeNode, 'Skipping documentation generation.');
	    return;
	}
	return new Promise(function(resolve, reject) {
	    var terminal = require('child_process').spawn('bash', [], {cwd:self.gen_dir});

	    terminal.stdout.on('data', function (data) {});

	    terminal.stderr.on('data', function (data) {});

	    terminal.on('exit', function (code) {
		self.logger.debug('child process exited with code ' + code);
		if (code == 0)
		    resolve(code);
		else
		    reject('child process exited with code ' + code);
	    });

	    setTimeout(function() {
		self.logger.debug('Sending stdin to terminal');
		terminal.stdin.write('doxygen doxygen_config\n');
		terminal.stdin.write('make -C ./doc/latex/ pdf\n');
		terminal.stdin.write('cp ./doc/latex/refman.pdf ' + self.projectModel.name  + '.pdf');
		self.logger.debug('Ending terminal session');
		terminal.stdin.end();
	    }, 1000);
	})
	    .then(function() {
		self.createMessage(self.activeNode, 'Generated doxygen documentation.');
	    });
    };

    SoftwareGenerator.prototype.generateCPN = function()
    {
	var self = this;
	(function() {
	    var path = require('path'),
	    prefix = path.join(self.gen_dir);
	    var promises = [];

	    // Get the dummy cpn template
	    var file_url = 'https://github.com/rosmod/rosmod-cpn/releases/download/v1.0.0/cpn.zip';
	    var dir = prefix;
	    promises.push(utils.wgetAndUnzipLibrary(file_url, dir));
	    return Q.all(promises);
	})()
	.then(function() {
	    self.createMessage(self.activeNode, 'Downloaded CPN template');
	});
    };

    SoftwareGenerator.prototype.getValidArchitectures = function() {
	var self = this,
	validArchs = {};
	for (var sys in self.projectModel.systems) {
	    var system = self.projectModel.systems[sys];
	    for (var hst in system.hosts) {
		var host = system.hosts[hst];
		if (validArchs[host.architecture] === undefined) {
		    validArchs[host.architecture] = [];
		    self.hostsValidForCompilation[host.architecture] = [];
		}
		validArchs[host.architecture].push(host);
	    }
	}
	return validArchs;
    };

    SoftwareGenerator.prototype.selectCompilationArchitectures = function() {
	
	var self = this;

	var validArchitectures = self.getValidArchitectures();
	var promises = []

	for (var arch in validArchitectures) {
	    for (var hst in validArchitectures[arch]) {
		var host = validArchitectures[arch][hst];
		promises.push(utils.getAvailability(host));
	    }
	}
	return Q.all(promises)
	    .then(function (nestedArr) {
		var validHosts = [];
		for (var i =0; i<nestedArr.length; i++) {
		    if (nestedArr[i][0])
			validHosts.push(nestedArr[i][0]);
		}
		return validHosts;
	    });
    };

    SoftwareGenerator.prototype.compileOnHost = function (host) {
	var self = this;
	var path = require('path');
	var mkdirp = require('mkdirp');

	var compile_dir = path.join(host.user.directory,'compilation',self.project.projectId, self.branchName);
	var archBinPath = path.join(self.gen_dir, 'bin' , host.host.architecture);

	self.logger.info('compiling into '+host.intf.ip+':'+compile_dir);
	self.logger.info('copying into '+archBinPath);

	var compile_commands = [
	    'cd ' + compile_dir,
	    'rm -rf bin',
	    'source /opt/ros/indigo/setup.bash',
	    'catkin_make -DNAMESPACE=rosmod',
	    'mkdir bin',
	    'cp devel/lib/*.so bin/.',
	    'cp devel/lib/node/node_main bin/.',
	    'rm -rf devel build'
	];

	// make the compile dir
	var t1 = new Promise(function(resolve,reject) {
	    self.logger.info('mkdirRemote: ' + host.intf.ip);
	    utils.mkdirRemote(compile_dir, host.intf.ip, host.user)
		.then(function() {
		    resolve();
		});
	});
	// copy the sources to remote
	var t2 = t1.then(function() {
	    self.logger.info('copyToHost: ' + host.intf.ip);
	    return utils.copyToHost(self.gen_dir, compile_dir, host.intf.ip, host.user);
	});
	// run the compile step
	var t3 = t2.then(function() {
	    self.logger.info('compile: ' + host.intf.ip);
	    return utils.executeOnHost(compile_commands, host.intf.ip, host.user);
	});
	// make the local binary folder for the architecture
	var t4 = t3.then(function() {
	    self.logger.info('mkdir: ' + host.intf.ip);
	    mkdirp.sync(archBinPath);
	    return true;
	});
	// copy the compiled binaries from remote into the local bin folder
	var t5 = t4.then(function() {
	    self.logger.info('copyFromHost: ' + host.intf.ip);
	    return utils.copyFromHost(path.join(compile_dir, 'bin') + '/*', 
				      path.join(self.gen_dir, 'bin', host.host.architecture) + '/.',
				      host.intf.ip,
				      host.user);
	});
	// remove the remote folders
	var t6 = t5.then(function() {
	    self.logger.info('rm: ' + host.intf.ip);
	    return utils.executeOnHost(['rm -rf ' + compile_dir], host.intf.ip, host.user);
	});
	return Q.all([t1,t2,t3,t4,t5,t6])
	    .catch(function(err) {
		self.logger.error(err);
	    });
    };

    SoftwareGenerator.prototype.compileBinaries = function ()
    {
	var self = this;

	if (!self.compileCode) {
	    var msg = 'Skipping compilation.';
	    self.logger.info(msg);
            self.createMessage(self.activeNode, msg);
	    return;
	}

	var selectedHosts = []

	for (var arch in self.hostsValidForCompilation) {
	    var hosts = self.hostsValidForCompilation[arch];
	    if (hosts.length) {
		selectedHosts.push(hosts[0]);
	    }
	    else {
		var msg = 'No hosts could be found for compilation on ' + arch;
		self.logger.info(msg);
		self.createMessage(self.activeNode, msg);
	    }
	}

	var tasks = selectedHosts.map(function (host) {
	    var msg = 'Compiling for ' + host.host.architecture + ' on ' + host.intf.ip;
	    self.logger.info(msg);
	    self.createMessage(self.activeNode, msg);
	    return self.compileOnHost(host);
	});
	
	return Q.all(tasks)
	    .then(function() {
		self.createMessage(self.activeNode, 'Compiled binaries.');
	    });
    };
			      
    SoftwareGenerator.prototype.createZip = function() {
	var self = this;
	
	if (!self.returnZip) {
            self.createMessage(self.activeNode, 'Skipping compression.');
	    return;
	}
	
	return new Promise(function(resolve, reject) {
	    var zlib = require('zlib'),
	    tar = require('tar'),
	    fstream = require('fstream'),
	    input = self.gen_dir;

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

    return SoftwareGenerator;
});
