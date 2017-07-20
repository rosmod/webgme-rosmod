

define([], function() {
    'use strict';
    return {
	processModel: function(collection) {
	    var self = this;
	    self.checkObjects(collection.objects);
	    self.makeConvenienceMembers(collection.objects);
	},
	makeConvenienceMembers: function(objects) {
	    var self = this;
	    var objPaths = Object.keys(objects);
	    objPaths.map(function(objPath) {
		var obj = objects[objPath];
		if (obj.type == 'Component') {
		    // make components have 'Types' which provide their messages/services
		    obj.Types = []; 
		    if (obj.Publisher_list) {
			obj.Publisher_list.map(function(pub) {
			    if ( obj.Types.indexOf(pub.Message) == -1)
				obj.Types.push(pub.Message);
			});
		    }
		    if (obj.Subscriber_list) {
			obj.Subscriber_list.map(function(sub) {
			    if ( obj.Types.indexOf(sub.Message) == -1)
				obj.Types.push(sub.Message);
			});
		    }
		    if (obj.Client_list) {
			obj.Client_list.map(function(cli) {
			    if ( obj.Types.indexOf(cli.Service) == -1)
				obj.Types.push(cli.Service);
			});
		    }
		    if (obj.Server_list) {
			obj.Server_list.map(function(srv) {
			    if ( obj.Types.indexOf(srv.Service) == -1)
				obj.Types.push(srv.Service);
			});
		    }
		} else if (obj.type == 'Link') {
		    // copy the Link's address to the interface to which it's connected
		    var intf = obj.src;
		    intf.IP = obj.IP;
		}
	    });
	},
	checkObjects: function(objects) {
	    var self = this;

	    self.checkPointers(objects);

	    // check objects by type
	    var objPaths = Object.keys(objects);
	    objPaths.map(function(objPath) {
		var obj = objects[objPath];
		var parent = objects[ obj.parentPath ];
		if (obj.type == 'Host' && parent && parent.type == 'System') {
		    self.checkHost(obj);
		} else if (obj.type == 'Message') {
		    self.checkMessage(obj);
		} else if (obj.type == 'Service') {
		    self.checkService(obj);
		} else if (obj.type == 'Node') {
		    self.checkNode(obj);
		} else if (obj.type == 'Container' && parent && parent.type == 'Deployment') {
		    self.checkContainer(obj);
		}
	    });
	},
	checkPointers: function(objects) {
	    // checks all objects' pointers to ensure no pointers are null and all pointers are to loaded objects
	    var objPaths = Object.keys(objects);
	    objPaths.map(function(objPath) {
		var obj = objects[objPath];
		for (var pointer in obj.pointers) {
		    var path = obj.pointers[pointer];
		    if (path) {
			var dst = objects[path];
			if (dst) {
			}
			else if (pointer != 'base') {
			    throw new String(obj.type + ' ' + obj.name + ' has pointer ' + pointer + ' to object outside of the project!');
			}
		    }
		    else {
			throw new String(obj.type + ' ' + obj.name + ' has null pointer ' + pointer + '!');
		    }
		}
	    });
	},
	checkHost: function(host) {
	    // checks host to ensure that it has at least one user and network interface
	    if (host.Interface_list === undefined) {
		throw new String("Error: " + host.name + ' has no defined network interfaces, make sure to add at least one in the model and connect it to a network!');
	    } else if (host.sets['Users'].length == 0) {
		throw new String("Error: " + host.name + " has no defined users, make sure to add one through the host's SetEditor visualizer!");
	    }
	},
	checkMessage: function(message) {
	    // checks message definition to ensure it has no ';'
	    if (message.Definition.indexOf(';') != -1) {
		throw new String("Error: " + message.name + " contains invalid symbol ';', ROS message definitions don't have ';' at the end of their lines!");
	    }
	},
	checkService: function(service) {
	    // checks message definition to ensure it has no ';' and that it has '---' to delineate input/output
	    if (service.Definition.indexOf(';') != -1) {
		throw new String("Error: " + service.name + " contains invalid symbol ';', ROS service definitions don't have ';' at the end of their lines!");
	    } else if (service.Definition.indexOf('---') == -1) {
		throw new String("Error: " + service.name + " does not contain '---', which must be on its own line separating the input (above) from the output (below)!");
	    }
	},
	checkNode: function(node) {
	    // checks node to ensure that there is at least one component
	    if (node.Component_list === undefined) {
		throw new String("Error: " + node.name + ' contains no component instances, make sure to add at least one in the model!');
	    }
	},
	checkContainer: function(container) {
	    // checks container to ensure that there is at least one node
	    if (container.Node_list === undefined) {
		throw new String("Error: "+container.name+' has no nodes, make sure to add at least one in the model!');
	    }
	},
    }
});
