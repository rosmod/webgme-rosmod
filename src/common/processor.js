

define(['underscore'], function(_) {
    'use strict';
    return {
        processModel: function(collection) {
            var self = this;
            self.checkObjects(collection.objects);
            self.makeConvenienceMembers(collection.objects);
        },
        getObjectsByType: function(objects, type) {
            var self = this;
            var objPaths = Object.keys(objects);
            return objPaths.filter((objPath) => {
                var obj = objects[objPath];
                return obj.type == type;
            }).map((objPath) => {
                return objects[objPath];
            });
        },
        makeConvenienceMembers: function(objects) {
            var self = this;
            var orderedTypes = [
                'Message',
                'Service',
                'Action',
                'External Message',
                'External Service',
                'External Action',
                'Advertised Message',
                'Advertised Service',
                'Advertised Action',
                'Link',
                'Development Library',
                'Source Library',
                'System Library',
                'External Definitions',
                'Component',
                'Package',
            ];
            
            var typeToConvMap = {
                'Package': 'makePackageConvenience',
                'Component': 'makeComponentConvenience',
                'Message': 'makeMessageConvenience',
                'Service': 'makeServiceConvenience',
                'Action': 'makeActionConvenience',
                'External Message': 'makeExternalMessageConvenience',
                'External Service': 'makeExternalServiceConvenience',
                'External Action': 'makeExternalActionConvenience',
                'Advertised Message': 'makeAdvertisedMessageConvenience',
                'Advertised Service': 'makeAdvertisedServiceConvenience',
                'Advertised Action': 'makeAdvertisedActionConvenience',
                'External Definitions': 'makeExternalDefinitionsConvenience',
                'Link': 'makeLinkConvenience',
                'Development Library': 'makeDevelopmentLibraryConvenience',
                'Source Library': 'makeSourceLibraryConvenience',
                'System Library': 'makeSystemLibraryConvenience',
            };
            orderedTypes.map((type) => {
                self.getObjectsByType(objects, type).map((obj) => {
                    self[typeToConvMap[type]](obj, objects);
                });
            });
        },
        makePackageConvenience: function(obj, objects) {
            var self = this;
            obj.Packages = [];
            obj.GenerateMessageDependencies = [];
            obj.CMAKE_COMMANDS = [];
            obj.CMAKE_INCLUDES = [];

            if (obj.Component_list) {
                obj.Component_list.map(function(o) {
                    obj.Packages = _.union(obj.Packages, o.Packages);
                    obj.CMAKE_COMMANDS = _.union(obj.CMAKE_COMMANDS, o.CMAKE_COMMANDS);
                    obj.CMAKE_INCLUDES = _.union(obj.CMAKE_INCLUDES, o.CMAKE_INCLUDES);
                });
            }

            if (obj.Message_list) {
                obj.Message_list.map(function(o) {
                    obj.Packages = _.union(obj.Packages, o.Dependencies);
                    obj.GenerateMessageDependencies = _.union(
                        obj.GenerateMessageDependencies, o.Dependencies
                    );
                });
            }

            if (obj.Service_list) {
                obj.Service_list.map(function(o) {
                    obj.Packages = _.union(obj.Packages, o.Dependencies);
                    obj.GenerateMessageDependencies = _.union(
                        obj.GenerateMessageDependencies, o.Dependencies
                    );
                });
            }

            if (obj.Action_list) {
                var actionReq = ['actionlib', 'actionlib_msgs'];
                obj.Action_list.map(function(o) {
                    obj.Packages = _.union(obj.Packages, actionReq.concat(o.Dependencies));
                    obj.GenerateMessageDependencies = _.union(
                        obj.GenerateMessageDependencies, ['actionlib_msgs'].concat(o.Dependencies)
                    );
                });
            }       

            obj.BuildDependencies = obj.Packages.filter((p) => { return p != obj.name; });
            obj.RunDependencies = obj.BuildDependencies;
            obj.PackageDependencies = obj.BuildDependencies;
        },
        makeComponentConvenience: function(obj, objects) {
            // make .Package convenience member for rendering code
            var parent = objects[obj.parentPath];
            obj.Package = parent.name;
            // make component have .Packages which are all the package
            // dependencies it has
            obj.Packages = [];
            // make component have .LinkLibraries which provide the
            // shared objects that need to be linked
            obj.LinkLibraries = [];
            obj.CMAKE_COMMANDS = [];
            obj.CMAKE_INCLUDES = [];
            // make components have .Types which provide their
            // messages/services
            obj.Types = [];
            obj.Dependencies = [];

            // types
            function tFunc(t, key) {
                var type = t[key];
                if ( obj.Types.indexOf(type) == -1) {
                    // Add to types
                    obj.Types.push(type);
                    if ( obj.Packages.indexOf(type.Package) == -1 ) {
                        // add to packages
                        obj.Packages.push(type.Package);
                    }
                    if ( type.type.indexOf('External') == -1 &&
                         obj.Dependencies.indexOf(type.Package) == -1) {
                        obj.Dependencies.push(type.Package + '_generate_messages_cpp');
                    }
                }
            };
            if (obj.Publisher_list) {
                obj.Publisher_list.map(function(pub) { tFunc(pub, 'Message'); });
            }
            if (obj.Subscriber_list) {
                obj.Subscriber_list.map(function(sub) { tFunc(sub, 'Message'); });
            }
            if (obj.Client_list) {
                obj.Client_list.map(function(cli) { tFunc(cli, 'Service'); });
            }
            if (obj.Server_list) {
                obj.Server_list.map(function(srv) { tFunc(srv, 'Service'); });
            }
            if (obj['Action Client_list']) {
                obj['Action Client_list'].map(function(cli) { tFunc(cli, 'Action'); });
            }
            if (obj['Action Server_list']) {
                obj['Action Server_list'].map(function(srv) { tFunc(srv, 'Action'); });
            }
            // libraries
            if (obj.Libraries) {
                obj.Libraries.map(function(lib) {
                    if (lib.type == 'Development Library' || lib.type == 'Source Library') {
                        if ( obj.Packages.indexOf(lib.name) == -1 ) {
                            // add to packages
                            obj.Packages.push(lib.name);
                        }
                    }
                    if ( lib.LIBRARIES ) {
                        if ( obj.LinkLibraries.indexOf(lib.LIBRARIES) == -1)
                            // add to dependencies
                            obj.LinkLibraries.push(lib.LIBRARIES);
                    }
                    if ( lib.CMAKE_COMMANDS ) {
                        if ( obj.CMAKE_COMMANDS.indexOf(lib.CMAKE_COMMANDS) == -1) {
                            obj.CMAKE_COMMANDS.push(lib.CMAKE_COMMANDS);
                        }
                    }
                    if ( lib.CMAKE_INCLUDES ) {
                        obj.CMAKE_INCLUDES = _.union(lib.CMAKE_INCLUDES, obj.CMAKE_INCLUDES);
                    }
                });
            }
        },
        makeMessageConvenience: function(obj, objects) {
            var self = this;
            var parent = objects[obj.parentPath];
            // make .Package convenience member for rendering code
            obj.Package = parent.name;
            // make .TypeName convenience member for rendering code
            obj.TypeName = obj.name;
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.Package + '/' + obj.name;
            // get packages that this message is dependent on
            obj.Dependencies = self.getTypeDependencies(obj.Definition);
        },
        makeServiceConvenience: function(obj, objects) {
            var self = this;
            var parent = objects[obj.parentPath];
            // make .Package convenience member for rendering code
            obj.Package = parent.name;
            // make .TypeName convenience member for rendering code
            obj.TypeName = obj.name;
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.Package + '/' + obj.name;
            // get packages that this service is dependent on
            obj.Dependencies = self.getTypeDependencies(obj.Definition);
        },
        makeActionConvenience: function(obj, objects) {
            var self = this;
            var parent = objects[obj.parentPath];
            // make .Package convenience member for rendering code
            obj.Package = parent.name;
            // make .TypeName convenience member for rendering code
            obj.TypeName = obj.name;
            // make .IncludeName convenience member for rendering code
            obj.IncludeName = obj.name + 'Action';
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.Package + '/' + obj.name;
            // get packages that this service is dependent on
            obj.Dependencies = self.getTypeDependencies(obj.Definition);
        },
        makeExternalMessageConvenience: function(obj, objects) {
            // already will have .Package convenience member for rendering code from model
            // make .TypeName convenience member for rendering code
            obj.TypeName = obj.name;
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.Package + '/' + obj.name;
        },
        makeExternalServiceConvenience: function(obj, objects) {
            // already will have .Package convenience member for rendering code from model
            // make .TypeName convenience member for rendering code
            obj.TypeName = obj.name;
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.Package + '/' + obj.name;
        },
        makeExternalActionConvenience: function(obj, objects) {
            // already will have .Package convenience member for rendering code from model
            // make .TypeName convenience member for rendering code
            obj.TypeName = obj.name;
            // make .IncludeName convenience member for rendering code
            obj.IncludeName = obj.name + 'Action';
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.Package + '/' + obj.name;
        },
        makeAdvertisedMessageConvenience: function(obj, objects) {
            var TopicType = objects[obj.pointers['Type']];
            // make .Package convenience member for rendering code
            obj.Package = TopicType.Package;
            // make .TypeName convenience member for rendering code
            obj.TypeName = TopicType.name;
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.name;
        },
        makeAdvertisedServiceConvenience: function(obj, objects) {
            var TopicType = objects[obj.pointers['Type']];
            // make .Package convenience member for rendering code
            obj.Package = TopicType.Package;
            // make .TypeName convenience member for rendering code
            obj.TypeName = TopicType.name;
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.name;
        },
        makeAdvertisedActionConvenience: function(obj, objects) {
            var TopicType = objects[obj.pointers['Type']];
            // make .Package convenience member for rendering code
            obj.Package = TopicType.Package;
            // make .TypeName convenience member for rendering code
            obj.TypeName = TopicType.name;
            // make .IncludeName convenience member for rendering code
            obj.IncludeName = TopicType.name + 'Action';
            // make .AdvertisedName convenience member for rendering code
            obj.AdvertisedName = obj.name;
        },
        makeLinkConvenience: function(obj, objects) {
            // copy the Link's address to the interface to which it's connected
            var intf = obj.src;
            intf.IP = obj.IP;
        },
        makeExternalDefinitionsConvenience: function(obj, objects) {
            // this object is a child of the Software object
            // and contains external message and service
            // definitions, should make them easier to access.
        },
        makeDevelopmentLibraryConvenience: function(obj, objects) {
            if (obj.CompilesToSO) {
                obj.LIBRARY_NAME = "LIB_" + obj.name.toUpperCase();
                obj.CMAKE_COMMANDS = "set (" +
                    obj.LIBRARY_NAME +
                    " ${PROJECT_SOURCE_DIR}/../../devel/lib/lib"+
                    obj.name + ".so)";
                // update it so it can be put in directly to target_link_libraries
                obj.LIBRARIES = '${'+ obj.LIBRARY_NAME + '}';
            }
        },
        makeSourceLibraryConvenience: function(obj, objects) {
            if (obj.CompilesToSO) {
                obj.LIBRARY_NAME = "LIB_" + obj.name.toUpperCase();
                obj.CMAKE_COMMANDS = "set (" +
                    obj.LIBRARY_NAME +
                    " ${PROJECT_SOURCE_DIR}/../../devel/lib/lib"+
                    obj.name + ".so)";
                // update it so it can be put in directly to target_link_libraries
                obj.LIBRARIES = '${'+ obj.LIBRARY_NAME + '}';
            }
        },
        makeSystemLibraryConvenience: function(obj, objects) {
            obj.LIBRARIES = obj['Link Libraries'];
            obj.CMAKE_INCLUDES = obj['Include Directories'].split(/\n|;|\n;|;\n/gim).filter(o => o.length);
        },
        getTypeDependencies: function(definition) {
            var validDeclaration = new RegExp(/^([a-zA-Z_][a-zA-Z0-9_]*)\//gm);
            var matches = [];
            var res = validDeclaration.exec(definition);
            if (res) {
                while (res != null) {
                    matches.push(res[1]);
                    res = validDeclaration.exec(definition);
                }
            }
            return _.uniq(matches);
        },
        checkName: function(o) {
            var validName = new RegExp(/^([a-zA-Z_][a-zA-Z0-9_]*)$/g);
            if (!validName.test( o.name )) {
                throw new String(o.type + ' ' +
                                 o.name + ' has invalid name: '+o.name+
                                 '. Name must be valid c/c++ name, following regex pattern: '+validName.toString());
            }
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
                } else if (obj.type == 'Component') {
                    self.checkName(obj);
                } else if (obj.type == 'Package') {
                    self.checkName(obj);
                } else if (obj.type == 'Publisher') {
                    self.checkName(obj);
                } else if (obj.type == 'Subscriber') {
                    self.checkName(obj);
                } else if (obj.type == 'Client') {
                    self.checkName(obj);
                } else if (obj.type == 'Server') {
                    self.checkName(obj);
                } else if (obj.type == 'Timer') {
                    self.checkName(obj);
                } else if (obj.type == 'Message') {
                    self.checkName(obj);
                    self.checkMessage(obj);
                } else if (obj.type == 'Service') {
                    self.checkName(obj);
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
            if (container.Node_list === undefined &&
                container['External Node_list'] === undefined &&
                container['Script Node_list'] === undefined) {
                throw new String("Error: "+container.name+' has no nodes, make sure to add at least one in the model!');
            }
        },
    }
});
