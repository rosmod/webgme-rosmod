

define([], function() {
    'use strict';
    return {
	processModel: function(collection) {
	    var self = this;
	    self.makeConvenienceMembers(collection.root);
	    self.checkPointers(collection.objects);
	},
	makeConvenienceMembers: function(root) {
	    var self = this;
	    // THIS FUNCTION HANDLES CREATION OF SOME CONVENIENCE MEMBERS
	    // FOR SELECT OBJECTS IN THE MODEL
	    // handle Component Required Types (convenience)
	    if (root.Software_list !== undefined) {
		var software_folder = root.Software_list[0];
		if (software_folder && software_folder.Package_list) {
		    software_folder.Package_list.map(function(pkgInfo) {
			if (pkgInfo.Component_list) {
			    pkgInfo.Component_list.map(function(compInfo) {
				compInfo.Types = []; 
				if (compInfo.Publisher_list) {
				    compInfo.Publisher_list.map(function(obj) {
					if ( compInfo.Types.indexOf(obj.Message) == -1)
					    compInfo.Types.push(obj.Message);
				    });
				}
				if (compInfo.Subscriber_list) {
				    compInfo.Subscriber_list.map(function(obj) {
					if ( compInfo.Types.indexOf(obj.Message) == -1)
					    compInfo.Types.push(obj.Message);
				    });
				}
				if (compInfo.Client_list) {
				    compInfo.Client_list.map(function(obj) {
					if ( compInfo.Types.indexOf(obj.Service) == -1)
					    compInfo.Types.push(obj.Service);
				    });
				}
				if (compInfo.Server_list) {
				    compInfo.Server_list.map(function(obj) {
					if ( compInfo.Types.indexOf(obj.Service) == -1)
					    compInfo.Types.push(obj.Service);
				    });
				}
			    });
			}
		    });
		}
	    }
	    // handle Interface IP assignment here (until META is updated)
	    if (root.Systems_list !== undefined) {
		var systems_folder = root.Systems_list[0];
		if (systems_folder && systems_folder.System_list) {
		    systems_folder.System_list.map(function(system) {
			if (system.Host_list) {
			    system.Host_list.map(function(host) {
				if (host.Interface_list) {
				    host.Interface_list.map(function(intf) {
					if (system.Link_list) {
					    var link = system.Link_list.filter(function(l) {
						return l.src == intf;
					    })[0];
					    if (link) {
						intf.IP = link.IP;
					    }
					}
				    });
				}
			    });
			}
		    });
		}
	    }
	},
	checkPointers: function(objects) {
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
    }
});
