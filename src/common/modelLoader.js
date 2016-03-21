

define(['q'], function(Q) {
    'use strict';
    return {
	loadProjectModel: function(core, META, projectNode, rootNode) {
	    var self = this;
	    self.core = core;
	    self.rootNode = rootNode;
	    self.model = {
		name: self.core.getAttribute(projectNode, 'name'),
		software: {
		    packages: {},
		    libraries: {}
		},
		systems: {},
		deployments: {}
	    };
	    return self.core.loadSubTree(projectNode)
		.then(function(nodes) {
		    var messages = [],
		    services = [],
		    libraries = [],
		    users = [],
		    interfaces = [];
		    for (var i=0;i<nodes.length; i+= 1) {
			var node = nodes[i],
			nodeName = self.core.getAttribute(node, 'name'),
			parent = self.core.getParent(node),
			parentName = self.core.getAttribute(parent, 'name');
			// RELATED TO SOFTWARE
			if ( self.core.isTypeOf(node, META.Package) ) {
			    self.model.software.packages[nodeName] = {
				name: nodeName,
				messages: {},
				services: {},
				components: {}
			    };
			}
			else if ( self.core.isTypeOf(node, META.Library) ) {
			    var inclDir = self.core.getAttribute(node, 'Include Directories');
			    if (inclDir == undefined)
				inclDir = '../' + nodeName + '/include';
			    self.model.software.libraries[nodeName] = {
				name: nodeName,
				url: self.core.getAttribute(node, 'URL'),
				linkLibs: self.core.getAttribute(node, 'Link Libraries'),
				includeDirs: inclDir
			    };
			    libraries.push(node);
			}
			else if ( self.core.isTypeOf(node, META.Message) ) {
			    self.model.software.packages[parentName].messages[nodeName] = {
				name: nodeName,
				packageName: parentName,
				definition: self.core.getAttribute(node, 'Definition')
			    };
			    messages.push(node);
			}
			else if ( self.core.isTypeOf(node, META.Service) ) {
			    self.model.software.packages[parentName].services[nodeName] = {
				name: nodeName,
				packageName: parentName,
				definition: self.core.getAttribute(node, 'Definition')
			    };
			    services.push(node);
			}
			else if ( self.core.isTypeOf(node, META.Component) ) {
			    self.model.software.packages[parentName].components[nodeName] = {
				name: nodeName,
				packageName: parentName,
				requiredTypes: [],
				requiredLibs: [],
				timers: {},
				publishers: {},
				subscribers: {},
				clients: {},
				servers: {},
				forwards: self.core.getAttribute(node, 'Forwards'),
				definitions: self.core.getAttribute(node, 'Definitions'),
				initialization: self.core.getAttribute(node, 'Initialization'),
				destruction: self.core.getAttribute(node, 'Destruction'),
				members: self.core.getAttribute(node, 'Members')
			    };
			}
			else if ( self.core.isTypeOf(node, META.Timer) ) {
			    var pkgName = self.core.getAttribute(
				self.core.getParent(parent), 'name');
			    self.model.software.packages[pkgName]
				.components[parentName]
				.timers[nodeName] = {
				    name: nodeName,
				    period: self.core.getAttribute(node, 'Period'),
				    priority: self.core.getAttribute(node, 'Priority'),
				    deadline: self.core.getAttribute(node, 'Deadline'),
				    operation: self.core.getAttribute(node, 'Operation')
				};
			}
			else if ( self.core.isTypeOf(node, META.Publisher) ) {
			    var pkgName = self.core.getAttribute(
				self.core.getParent(parent), 'name');
			    self.model.software.packages[pkgName]
				.components[parentName]
				.publishers[nodeName] = {
				    name: nodeName,
				    topic: {},
				    priority: self.core.getAttribute(node, 'Priority'),
				    networkProfile: self.core.getAttribute(node, 'NetworkProfile')
				};
			}
			else if ( self.core.isTypeOf(node, META.Subscriber) ) {
			    var pkgName = self.core.getAttribute(
				self.core.getParent(parent), 'name');
			    self.model.software.packages[pkgName]
				.components[parentName]
				.subscribers[nodeName] = {
				    name: nodeName,
				    topic: {},
				    priority: self.core.getAttribute(node, 'Priority'),
				    networkProfile: self.core.getAttribute(node, 'NetworkProfile'),
				    deadline: self.core.getAttribute(node, 'Deadline'),
				    operation: self.core.getAttribute(node, 'Operation')
				};
			}
			else if ( self.core.isTypeOf(node, META.Client) ) {
			    var pkgName = self.core.getAttribute(
				self.core.getParent(parent), 'name');
			    self.model.software.packages[pkgName]
				.components[parentName]
				.clients[nodeName] = {
				    name: nodeName,
				    service: {},
				    priority: self.core.getAttribute(node, 'Priority'),
				    networkProfile: self.core.getAttribute(node, 'NetworkProfile')
				};
			}
			else if ( self.core.isTypeOf(node, META.Server) ) {
			    var pkgName = self.core.getAttribute(
				self.core.getParent(parent), 'name');
			    self.model.software.packages[pkgName]
				.components[parentName]
				.servers[nodeName] = {
				    name: nodeName,
				    service: {},
				    priority: self.core.getAttribute(node, 'Priority'),
				    networkProfile: self.core.getAttribute(node, 'NetworkProfile'),
				    deadline: self.core.getAttribute(node, 'Deadline'),
				    operation: self.core.getAttribute(node, 'Operation')
				};
			}
			// RELATED TO SYSTEMS:
			else if ( self.core.isTypeOf(node, META.System) ) {
			    self.model.systems[nodeName] = {
				name: nodeName,
				hosts: {},
				networks: {},
				users: {},
				links: {}
			    };
			}
			else if ( self.core.isTypeOf(node, META.Host) ) {
			    self.model.systems[parentName]
				.hosts[nodeName] = {
				    name: nodeName,
				    os: self.core.getAttribute(node, 'OS'),
				    architecture: self.core.getAttribute(node, 'Architecture'),
				    interfaces: {},
				    users: {}
				};
			}
			else if ( self.core.isTypeOf(node, META.Interface) ) {
			    var systemName = self.core.getAttribute(self.core.getParent(parent), 'name');
			    self.model.systems[systemName]
				.hosts[parentName]
				.interfaces[nodeName] = {
				    name: nodeName,
				    ip: ''
				};
			    interfaces.push(node);
			}
			else if ( self.core.isTypeOf(node, META.Network) ) {
			    self.model.systems[parentName]
				.networks[nodeName] = {
				    name: nodeName,
				    subnet: self.core.getAttribute(node, 'Subnet'),
				    netmask: self.core.getAttribute(node, 'Netmask'),
				    links: []
				};
			}
			else if ( self.core.isTypeOf(node, META.User) ) {
			    self.model.systems[parentName]
				.users[nodeName] = {
				    name: nodeName,
				    directory: self.core.getAttribute(node, 'Directory'),
				    key: self.core.getAttribute(node, 'Key')
				};
			    users.push(node);
			}
			else if ( self.core.isTypeOf(node, META.Link) ) {
			    self.model.systems[parentName]
				.links[nodeName] = {
				    name: nodeName,
				    ip: self.core.getAttribute(node, 'IP')
				};
			}
			// RELATED TO DEPLOYMENTS:
		    }
		    return self.resolvePointers({
			messages: messages,
			services: services,
			libraries: libraries, 
			interfaces: interfaces,
			users: users
		    });
		})
		.then(function() {
		    return self.model;
		});
	},
	resolvePointers: function(pointerDict) {
	    var self = this;
	    
	    return self.gatherReferences(pointerDict)
		.then(function(retData) {
		    for (var i=0; i < retData.length; i++) {
			var subarr = retData[i];
			for (var j=0; j < subarr.length; j++) {
			    var dataRef = subarr[j],
			    test = -1,
			    type = -1;
			    // Relevant for software
			    if (dataRef.srcType == 'Component') {
				self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.src]
				    .requiredLibs.push(
					self.model.software
					    .libraries[dataRef.library]
				    );
			    }
			    else if (dataRef.srcType == 'Publisher') {
				type = self.model
				    .software.packages[dataRef.topicPackage]
				    .messages[dataRef.topic];
				self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .publishers[dataRef.src]
				    .topic = type;
				test = self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .requiredTypes
				    .indexOf(type);
			    }
			    else if (dataRef.srcType == 'Subscriber') {
				type = self.model
				    .software.packages[dataRef.topicPackage]
				    .messages[dataRef.topic];
				self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .subscribers[dataRef.src]
				    .topic = type;
				test = self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .requiredTypes
				    .indexOf(type);
			    }
			    else if (dataRef.srcType == 'Client') {
				type = self.model
				    .software.packages[dataRef.servicePackage]
				    .services[dataRef.service];
				self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .clients[dataRef.src]
				    .service = type;
				test = self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .requiredTypes
				    .indexOf(type);
			    }
			    else if (dataRef.srcType == 'Server') {
				type = self.model
				    .software.packages[dataRef.servicePackage]
				    .services[dataRef.service];
				self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .servers[dataRef.src]
				    .service = type;
				test = self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .requiredTypes
				    .indexOf(type);
			    }
			    // Relevant for Systems
			    else if (dataRef.srcType == 'Host') {
				self.model
				    .systems[dataRef.systemName]
				    .hosts[dataRef.src]
				    .users[dataRef.user] = 
				    self.model
				    .systems[dataRef.systemName]
				    .users[dataRef.user];
			    }
			    else if (dataRef.srcType == 'Link') {
				self.model
				    .systems[dataRef.systemName]
				    .hosts[dataRef.hostName]
				    .interfaces[dataRef.interfaceName].ip = dataRef.ip;
			    }

			    // If the pointer should not be duplicated and has not been:
			    if (test == -1 && type != -1) {
				self.model.software.packages[dataRef.srcPkg]
				    .components[dataRef.srcComp]
				    .requiredTypes.push(type);
			    }
			}
		    }
		});
	},
	gatherReferences: function (pointerDict) {
	    var self = this;
	    var refPromises = [];
	    
	    var messages = pointerDict.messages,
	    services = pointerDict.services,
	    libraries = pointerDict.libraries,
	    interfaces = pointerDict.interfaces,
	    users = pointerDict.users;

	    return self.core.loadCollection(messages[0], 'Message')
		.then(function () {
		    //self.logger.debug('iterating through messages');
		    for (var i=0; i<messages.length; i++) {
			refPromises.push(self.getMessagePointerData(messages[i]));
		    }
		}).then(function () {
		    //self.logger.debug('iterating through services');
		    for (var i=0; i<services.length; i++) {
			refPromises.push(self.getServicePointerData(services[i]));
		    }
		}).then(function () {
		    //self.logger.debug('iterating through libraries');
		    for (var i=0; i<libraries.length; i++) {
			refPromises.push(self.getLibraryPointerData(libraries[i]));
		    }
		}).then(function () {
		    //self.logger.debug('iterating through interfaces');
		    for (var i=0; i<interfaces.length; i++) {
			refPromises.push(self.getInterfacePointerData(interfaces[i]));
		    }
		}).then(function () {
		    //self.logger.debug('iterating through users');
		    for (var i=0; i<users.length; i++) {
			refPromises.push(self.getUserPointerData(users[i]));
		    }
		}).then(function () {
		    return Q.all(refPromises);
		});
	},

	getMessagePointerData: function (msgObj) {
	    var self = this;
	    var msgName = self.core.getAttribute(msgObj, 'name');
	    var msgPkgName = self.core.getAttribute(self.core.getParent(msgObj), 'name');
	    return self.core.loadCollection(msgObj, 'Message')
		.then(function (nodes) {
		    //self.logger.debug('Processing ' + nodes.length + ' nodes for message ' + msgName);
		    var msgDataReferences = [];
		    for (var i=0; i < nodes.length; i++) {
			var nodeName = self.core.getAttribute(nodes[i], 'name');
			var comp = self.core.getParent(nodes[i]);
			var compName = self.core.getAttribute(comp, 'name');
			var pkg = self.core.getParent(comp);
			var pkgName = self.core.getAttribute(pkg, 'name');
			var baseObject = self.core.getBaseType(nodes[i]);
			var baseType = self.core.getAttribute(baseObject, 'name');
			msgDataReferences.push({
			    topic: msgName,
			    topicPackage: msgPkgName,
			    srcType: baseType,
			    src: nodeName,
			    srcComp: compName,
			    srcPkg: pkgName
			});
		    }
		    return msgDataReferences;
		});
	},

	getServicePointerData: function (srvObj) {
	    var self = this;
	    var srvName = self.core.getAttribute(srvObj, 'name');
	    var srvPkgName = self.core.getAttribute(self.core.getParent(srvObj), 'name');
	    return self.core.loadCollection(srvObj, 'Service')
		.then(function (nodes) {
		    //self.logger.debug('Processing ' + nodes.length + ' nodes for service ' + srvName);
		    var srvDataReferences = [];
		    for (var i=0; i < nodes.length; i++) {
			var nodeName = self.core.getAttribute(nodes[i], 'name');
			var comp = self.core.getParent(nodes[i]);
			var compName = self.core.getAttribute(comp, 'name');
			var pkg = self.core.getParent(comp);
			var pkgName = self.core.getAttribute(pkg, 'name');
			var baseObject = self.core.getBaseType(nodes[i]);
			var baseType = self.core.getAttribute(baseObject, 'name');
			srvDataReferences.push({
			    service: srvName,
			    servicePackage: srvPkgName,
			    srcType: baseType,
			    src: nodeName,
			    srcComp: compName,
			    srcPkg: pkgName
			});
		    }
		    return srvDataReferences;
		});
	},

	getLibraryPointerData: function (libObj) {
	    var self = this;
	    var libName = self.core.getAttribute(libObj, 'name');
	    var nodePathDict = self.core.isMemberOf(libObj);
	    //self.logger.debug('Processing '+Object.keys(nodePathDict).length+' nodes for library '+libName);
	    var libDataReferences = [];
	    for (var nodePath in nodePathDict) {
		libDataReferences.push(
		    self.core.loadByPath(self.rootNode, nodePath)
			.then(function (node) {
			    var compName = self.core.getAttribute(node, 'name');
			    var pkg = self.core.getParent(node);
			    var pkgName = self.core.getAttribute(pkg, 'name');
			    var baseObject = self.core.getBaseType(node);
			    var baseType = self.core.getAttribute(baseObject, 'name');
			    return {
				library: libName,
				srcType: baseType,
				src: compName,
				srcPkg: pkgName
			    };
			})
		);
	    }
	    return Q.all(libDataReferences);
	},

	getInterfacePointerData: function (interfaceObj) {
	    var self = this;
	    var interfaceName = self.core.getAttribute(interfaceObj, 'name'),
	    host = self.core.getParent(interfaceObj),
	    hostName = self.core.getAttribute(host, 'name'),
	    system = self.core.getParent(host),
	    systemName = self.core.getAttribute(system, 'name');

	    return self.core.loadCollection(interfaceObj, 'src')
		.then(function (nodes) {
		    //self.logger.debug('Processing ' + nodes.length + ' nodes for interface ' + interfaceName);
		    var interfaceDataReferences = [];
		    for (var i=0; i < nodes.length; i++) {
			var baseObject = self.core.getBaseType(nodes[i]);
			var baseType = self.core.getAttribute(baseObject, 'name');
			interfaceDataReferences.push({
			    ip: self.core.getAttribute(nodes[i], 'IP'),
			    srcType: baseType,
			    interfaceName: interfaceName,
			    hostName: hostName,
			    systemName: systemName
			});
		    }
		    return interfaceDataReferences;
		});
	},

	getUserPointerData: function (userObj) {
	    var self = this;
	    var userName = self.core.getAttribute(userObj, 'name');
	    var nodePathDict = self.core.isMemberOf(userObj);
	    //self.logger.debug('Processing '+Object.keys(nodePathDict).length+' nodes for user '+userName);
	    var userDataReferences = [];
	    for (var nodePath in nodePathDict) {
		userDataReferences.push(
		    self.core.loadByPath(self.rootNode, nodePath)
			.then(function (node) {
			    var hostName = self.core.getAttribute(node, 'name');
			    var system = self.core.getParent(node);
			    var systemName = self.core.getAttribute(system, 'name');
			    var baseObject = self.core.getBaseType(node);
			    var baseType = self.core.getAttribute(baseObject, 'name');
			    return {
				user: userName,
				src: hostName,
				srcType: baseType,
				systemName: systemName
			    };
			})
		);
	    }
	    return Q.all(userDataReferences);
	}
    }
});
