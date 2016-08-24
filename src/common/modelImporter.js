

define(['q'], function(Q) {
    'use strict';
    return {
	// create all model nodes and their attributes
	// update all pointers and sets
	importModel: function(core, META, model, rootNode) {
	    var self = this;
	    self.core = core;
	    self.META = META;
	    self.model = model;
	    self.rootNode = rootNode;

	    self.createdObjects = {}; // map of path to WebGME Nodes

	    var modelObjectPaths = Object.keys(self.model.modelObjects);
	    modelObjectPaths.map((modelObjectPath) => {
		self.createObject(modelObjectPath);
	    });
	    return true;
	},
	createObject: function(objectPath) {
	    var self = this;
	    var modelObject = self.model.modelObjects[objectPath];
	    var metaNode = self.META[modelObject.type];
	    var parentNode = self.rootNode;
	    var newNode = null;
	    if (self.createdObjects[objectPath] == null) {
		if (self.createdObjects[modelObject.parentPath] == null) {
		    // create parent
		    parentNode = self.createObject(modelObject.parentPath);
		}
		// create object
		newNode = self.core.createNode({
		    parent: parentNode,
		    base: metaNode
		});
		// configure attributes
		var attributes = Object.keys(modelObject.attributes);
		attributes.map((attr) => {
		    self.core.setAttribute(newNode, attr, modelObject[attr]);
		});
		
		// add path of object to created objects list
		self.createdObjects[objectPath] = newNode;
	    }
	    else {
		newNode = self.createdObjects[objectPath];
	    }
	    return newNode;
	}
    }
});
