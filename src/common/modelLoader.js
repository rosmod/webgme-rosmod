

define(['q'], function(Q) {
    'use strict';
    return {
	loadModel: function(core, modelNode) {
	    var self = this;
	    var objects = {};   // used to store the objects for handling pointers

	    var nodeName = core.getAttribute(modelNode, 'name'),
	    nodePath = core.getPath(modelNode),
	    nodeType = core.getAttribute(core.getBaseType(modelNode), 'name'),
	    parentPath = core.getPath(core.getParent(modelNode)),
	    attributes = core.getAttributeNames(modelNode),
	    childPaths = core.getChildrenPaths(modelNode),
	    pointers = core.getPointerNames(modelNode),
	    sets = core.getSetNames(modelNode);

	    self.model = {
		name: nodeName,
		path: nodePath,
		type: nodeType,
		parentPath: parentPath,
		childPaths: childPaths,
		attributes: {},
		pointers: {},
		sets: {}
	    };
	    attributes.map(function(attribute) {
		var val = core.getAttribute(modelNode, attribute);
		self.model.attributes[attribute] = val;
		self.model[attribute] = val;
	    });
	    pointers.map(function(pointer) {
		self.model.pointers[pointer] = core.getPointerPath(modelNode, pointer);
	    });
	    sets.map(function(set) {
		self.model.sets[set] = core.getMemberPaths(modelNode, set);
	    });
	    objects[nodePath] = self.model;
	    return core.loadSubTree(modelNode)
		.then(function(nodes) {
		    nodes.map(function(node) {
			nodeName = core.getAttribute(node, 'name');
			nodePath = core.getPath(node);
			nodeType = core.getAttribute(core.getBaseType(node), 'name');
			parentPath = core.getPath(core.getParent(node));
			attributes = core.getAttributeNames(node);
			childPaths = core.getChildrenPaths(node);
			pointers = core.getPointerNames(node);
			sets = core.getSetNames(node);
			var nodeObj = {
			    name: nodeName,
			    path: nodePath,
			    type: nodeType,
			    parentPath: parentPath,
			    childPaths: childPaths,
			    attributes: {},
			    pointers: {},
			    sets: {}
			};
			attributes.map(function(attribute) {
			    var val = core.getAttribute(node, attribute);
			    nodeObj.attributes[attribute] = val;
			    nodeObj[attribute] = val;
			});
			pointers.map(function(pointer) {
			    nodeObj.pointers[pointer] = core.getPointerPath(node, pointer);
			});
			sets.map(function(set) {
			    nodeObj.sets[set] = core.getMemberPaths(node, set);
			});
			objects[nodePath] = nodeObj;
		    });
		    self.resolvePointers(objects);
		    self.processModel(self.model);
		    return {
			'objects': objects,
			'root': self.model
		    };
		});
	},
	resolvePointers: function(objects) {
            var objPaths = Object.keys(objects);
	    objPaths.map(function(objPath) {
                var obj = objects[objPath];
		// Can't follow parent path: would lead to circular data structure (not stringifiable)
		// follow children paths, these will always have been loaded
		obj.childPaths.map(function(childPath) {
		    var dst = objects[childPath];
		    if (dst) {
			var key = dst.type + '_list';
			if (!obj[key]) {
			    obj[key] = [];
			}
			obj[key].push(dst);
		    }
		});
		// follow pointer paths, these may not always be loaded!
		for (var pointer in obj.pointers) {
		    var path = obj.pointers[pointer];
		    var dst = objects[path];
		    if (dst)
			obj[pointer] = dst;
		}
		// follow set paths, these may not always be loaded!
		for (var set in obj.sets) {
		    var paths = obj.sets[set];
		    var dsts = [];
		    paths.map(function(path) {
                        var dst = objects[path];
			if (dst)
			    dsts.push(dst);
		    });
		    obj[set] = dsts;
		}
	    });
	},
	processModel: function(model) {
	    // THIS FUNCTION HANDLES CREATION OF SOME CONVENIENCE MEMBERS
	    // FOR SELECT OBJECTS IN THE MODEL
	    // handle Component Required Types (convenience)
	    if (model.Software_list != null) {
		var software_folder = model.Software_list[0];
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
	    if (model.Systems_list != null) {
		var systems_folder = model.Systems_list[0];
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
    }
});
