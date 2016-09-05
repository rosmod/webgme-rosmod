

define(['./meta','q'], function(metaTypes, Q) {
    'use strict';
    return {
	// create all model nodes and their attributes
	// update all pointers and sets
	importModel: function(core, META, model, rootNode) {
	    var self = this;

	    self.core = core;
	    
	    self.META = META;
	    self.metaPaths = []
	    for (var key in metaTypes) {
		if (metaTypes.hasOwnProperty(key))
		    self.metaPaths.push(core.getPath(metaTypes[key]));
	    }

	    self.model = model;
	    self.rootNode = rootNode;

	    self.createdObjects = {}; // map of path to WebGME Nodes

	    var objectPaths = Object.keys(self.model);
            // create the objects
	    objectPaths.map((objectPath) => {
		self.createObject(objectPath);
	    });
            // resolve references
            objectPaths.map((objectPath) => {
                var object = self.model[objectPath];
                var objNode = self.createdObjects[objectPath];
                if (!objNode)
                    return; // couldn't create this object; can't resolve it's internal data
                // resolve pointers
                var pointerNames = Object.keys(object.pointers);
                pointerNames.map((pointerName) => {
                    var dstPath = object.pointers[pointerName];
                    var dstNode = self.createdObjects[dstPath];
		    if (dstNode) {
                        self.core.setPointer(objNode, pointerName, dstNode);
                    }
		    else if (self.metaPaths.indexOf(dstPath) == -1) {
                        self.notify('error', 'Couldnt recreate reference for pointer: ' + pointerName);
                    }
                });
                // resolve sets
                var setNames = Object.keys(object.sets);
                setNames.map((setName) => {
                    var paths = object.sets[setName];
                    paths.map((path) => {
                        var dstNode = self.createdObjects[path];
                        if (!dstNode) {
                            self.notify('error','Couldnt recreate reference for set: ' + setName);
                        }
                        else {
                            self.core.addMember(objNode, setName, dstNode);
                        }
                    });
                });
            });
	    return true;
	},
	createObject: function(objectPath) {
	    var self = this;
	    var newNode = null;
	    var object = self.model[objectPath];
            if (object == null) {
                self.notify('error','object is null: ' + objectPath);
            }
            else {
	        var metaNode = self.META[object.type];
                //self.logger.info('creating new '+object.type+': ' + object.name);
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
