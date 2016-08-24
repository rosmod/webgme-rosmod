

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

	    self.createdObjects = []; // list of paths?
	    // how do I handle the paths that I'm loading vs. the
	    // paths that exist in the model already? - don't care?
	    // just store which I've created, not what they've turned
	    // into

	    var modelObjectPaths = Object.keys(self.model.modelObjects);
	    modelObjectPaths.map((modelObjectPath) => {
		self.createObject(modelObjectPath);
	    });
	    return true;
	},
	createObject: function(objectPath) {
	    var self = this;
	    var modelObject = self.model.modelObjects[objectPath];
	    var metaType = modelObject.type;
	    var parentNode = self.rootNode;
	    var newNode = null;
	    if (self.createdObjects.indexOf(objectPath) == -1) {
		if (self.createdObjects.indexOf(modelObject.parentPath) == -1) {
		    // create parent
		    parentNode = self.createObject(modelObject.parentPath);
		}
		// create object
		newNode = self.core.createNode({
		    parent: parentNode,
		    base: self.META[metaType]
		});
		// configure attributes
		var attributes = Object.keys(modelObject.attributes);
		attributes.map((attr) => {
		    self.core.setAttribute(newNode, attr, modelObject[attr]);
		});
		
		// add path of object to created objects list
		self.createdObjects.push(objectPath);
	    }
	    return newNode;
	}
    }
});
