

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

	    var modelObjectPaths = Object.keys(self.model.objects);
	    modelObjectPaths.map((modelObjectPath) => {
		self.createObject(modelObjectPath);
	    });
	    return true;
	},
	createObject: function(objectPath) {
	    var self = this;
	    var newNode = null;
	    var object = self.model.objects[objectPath];
            if (object == null) {
                self.logger.error('object is null: ' + objectPath);
            }
            else {
	        var metaNode = self.META[object.type];
                self.logger.error('creating new object: ' + object.name);
                self.logger.error('\tof meta type: ' + object.type + ': '+metaNode);
	        var parentNode = self.createdObjects[object.parentPath];
                // don't want to create the same object multiple times
	        if (self.createdObjects[objectPath] == undefined) {
		    if (self.createdObjects[object.parentPath] == undefined) {
		        // create parent
		        parentNode = self.createObject(object.parentPath);
		    }
                    if (parentNode == null) {
                        parentNode = self.rootNode;
                        self.createdObjects[object.parentPath] = parentNode;
                    }
		    // create object
		    newNode = self.core.createNode({
		        parent: parentNode,
		        base: metaNode
		    });
		    // configure attributes
		    var attributes = Object.keys(object.attributes);
		    attributes.map((attr) => {
		        self.core.setAttribute(newNode, attr, object[attr]);
		    });
		    
		    // add path of object to created objects list
		    self.createdObjects[objectPath] = newNode;
	        }
	        else {
		    newNode = self.createdObjects[objectPath];
	        }
            }
	    return newNode;
	}
    }
});
