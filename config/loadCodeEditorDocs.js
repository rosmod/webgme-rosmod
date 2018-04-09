function loadDocs(components) {
    try{
        var fs = require('fs');

        var project = fs.readFileSync(__dirname + '/../docs/project.md', 'utf8');
        var authors = fs.readFileSync(__dirname + '/../docs/authors.md', 'utf8');
        var bDesc = fs.readFileSync(__dirname + '/../docs/briefDescription.md', 'utf8');
        var dDesc = fs.readFileSync(__dirname + '/../docs/detailedDescription.md', 'utf8');
        var documentation = fs.readFileSync(__dirname + '/../docs/documentationBlock.md', 'utf8');
        var deployments = fs.readFileSync(__dirname + '/../docs/deployments.md', 'utf8');
        var deployment = fs.readFileSync(__dirname + '/../docs/deployment.md', 'utf8');
        var container = fs.readFileSync(__dirname + '/../docs/container.md', 'utf8');
        var node = fs.readFileSync(__dirname + '/../docs/node.md', 'utf8');
        var software = fs.readFileSync(__dirname + '/../docs/software.md', 'utf8');
        var pack = fs.readFileSync(__dirname + '/../docs/package.md', 'utf8');
        var externalDef = fs.readFileSync(__dirname + '/../docs/externalDefinitions.md', 'utf8');
        var externalMsg = fs.readFileSync(__dirname + '/../docs/externalMessage.md', 'utf8');
        var externalSrv = fs.readFileSync(__dirname + '/../docs/externalService.md', 'utf8');
        var component = fs.readFileSync(__dirname + '/../docs/component.md', 'utf8');
        var forwards = fs.readFileSync(__dirname + '/../docs/forwards.md', 'utf8');
        var members = fs.readFileSync(__dirname + '/../docs/members.md', 'utf8');
        var definitions = fs.readFileSync(__dirname + '/../docs/definitions.md', 'utf8');
        var initialization = fs.readFileSync(__dirname + '/../docs/initialization.md', 'utf8');
        var destruction = fs.readFileSync(__dirname + '/../docs/destruction.md', 'utf8');
        var userConfig = fs.readFileSync(__dirname + '/../docs/userConfig.md', 'utf8');
        var userArtifacts = fs.readFileSync(__dirname + '/../docs/userArtifacts.md', 'utf8');
        var message = fs.readFileSync(__dirname + '/../docs/message.md', 'utf8');
        var msgDef = fs.readFileSync(__dirname + '/../docs/msgDef.md', 'utf8');
        var service = fs.readFileSync(__dirname + '/../docs/service.md', 'utf8');
        var serviceDef = fs.readFileSync(__dirname + '/../docs/serviceDef.md', 'utf8');
        var timer = fs.readFileSync(__dirname + '/../docs/timer.md', 'utf8');
        var timerOp = fs.readFileSync(__dirname + '/../docs/timerOp.md', 'utf8');
        var timerABL = fs.readFileSync(__dirname + '/../docs/timerABL.md', 'utf8');
        var client = fs.readFileSync(__dirname + '/../docs/client.md', 'utf8');
        var server = fs.readFileSync(__dirname + '/../docs/server.md', 'utf8');
        var serverOp = fs.readFileSync(__dirname + '/../docs/serverOp.md', 'utf8');
        var serverABL = fs.readFileSync(__dirname + '/../docs/serverABL.md', 'utf8');
        var publisher = fs.readFileSync(__dirname + '/../docs/publisher.md', 'utf8');
        var subscriber = fs.readFileSync(__dirname + '/../docs/subscriber.md', 'utf8');
        var subscriberOp = fs.readFileSync(__dirname + '/../docs/subscriberOp.md', 'utf8');
        var subscriberABL = fs.readFileSync(__dirname + '/../docs/subscriberABL.md', 'utf8');

	// action documentation:
        var action = fs.readFileSync(__dirname + '/../docs/action.md', 'utf8');
        var actionDef = fs.readFileSync(__dirname + '/../docs/actionDef.md', 'utf8');
        var actionServer = fs.readFileSync(__dirname + '/../docs/actionServer.md', 'utf8');
        var actionClient = fs.readFileSync(__dirname + '/../docs/actionClient.md', 'utf8');

        // HFSM Documentation:
        var StateMachineDoc = fs.readFileSync(__dirname + '/../docs/StateMachine.md', 'utf8');
        var StateMachineInclDoc = fs.readFileSync(__dirname + '/../docs/StateMachineIncl.md', 'utf8');
        var StateMachineDefDoc = fs.readFileSync(__dirname + '/../docs/StateMachineDef.md', 'utf8');
        var StateMachineDeclDoc = fs.readFileSync(__dirname + '/../docs/StateMachineDecl.md', 'utf8');
        var StateMachineInitDoc = fs.readFileSync(__dirname + '/../docs/StateMachineInit.md', 'utf8');

        var StateDoc = fs.readFileSync(__dirname + '/../docs/State.md', 'utf8');
        var StateEntryDoc = fs.readFileSync(__dirname + '/../docs/StateEntry.md', 'utf8');
        var StateExitDoc = fs.readFileSync(__dirname + '/../docs/StateExit.md', 'utf8');
        var StateTickDoc = fs.readFileSync(__dirname + '/../docs/StateTick.md', 'utf8');

        var InternalTransitionDoc = fs.readFileSync(__dirname + '/../docs/InternalTransition.md', 'utf8');
        var InternalTransitionGuardDoc = fs.readFileSync(__dirname + '/../docs/InternalTransitionGuard.md', 'utf8');
        var InternalTransitionActionDoc = fs.readFileSync(__dirname + '/../docs/InternalTransitionAction.md', 'utf8');

        components.CodeEditor.attrToInfoMap = {
            "Project": {
                "ancestorDepth": 0,
                "docstring" : [],
                "attributes": {
		    "Authors": [],
		    "Brief Description": [],
		    "Detailed Description": []
                }
	    },
            "Documentation": {
                "ancestorDepth": 0,
                "docstring" : [],
                "attributes" : {
                    "documentation" : []
                }
	    },
            "Deployments" : {
                "ancestorDepth" : 0,
                "docstring" : []
            },
            "Deployment" : {
                "ancestorDepth" : 1,
                "docstring" : []
            },
            "Container" : {
                "ancestorDepth" : 2,
                "docstring" : []
            },
            "Node" : {
                "ancestorDepth" : 3,
                "docstring" : []
            },
            "Software" : {
                "ancestorDepth" : 0,
                "docstring" : []
            },
	    "Package": {
                "ancestorDepth": 0,
                "docstring" : [],
                "attributes": {
                    "Authors": [],
		    "Brief Description": [],
		    "Detailed Description": []
                }
	    },
            "External Definitions" : {
                "ancestorDepth" : 0,
                "docstring" : []
            },
            "External Message" : {
                "ancestorDepth" : 1,
                "docstring" : []
            },
            "External Service" : {
                "ancestorDepth" : 1,
                "docstring" : []
            },
            "Component": {
                "ancestorDepth": 0,
                "docstring" : [],
                "attributes": {
		    "Forwards": [],
		    "Members": [],
		    "Definitions": [],
		    "Initialization": [],
		    "Destruction": [],
		    "User Configuration": [],
		    "User Artifacts": [],
		    "Authors": [],
		    "Brief Description": [],
		    "Detailed Description": []
                }
	    },
	    "Message": {
                "ancestorDepth": 1,
                "docstring" : [],
                "attributes": {
		    "Definition": []
                }
	    },
	    "Service": {
                "ancestorDepth": 1,
                "docstring" : [],
                "attributes": {
		    "Definition": []
                }
	    },
	    "Action": {
                "ancestorDepth": 1,
                "docstring" : [],
                "attributes": {
		    "Definition": []
                }
	    },
	    "Timer": {
                "ancestorDepth": 1,
                "docstring" : [],
                "attributes": {
		    "Operation": [],
		    "Authors": [],
		    "Brief Description": [],
		    "Detailed Description": []
                }
	    },
            "Client": {
                "ancestorDepth": 1,
                "docstring" : []
	    },
	    "Server": {
                "ancestorDepth": 1,
                "docstring" : [],
                "attributes": {
		    "Operation": [],
		    "Authors": [],
		    "Brief Description": [],
		    "Detailed Description": []
                }
	    },
	    "Action Server": {
                "ancestorDepth": 1,
                "docstring" : [],
                "attributes": {
		    "Preempt Callback": [],
		    "Goal Callback": [],
		    "Execute Callback": [],
		    "Authors": [],
		    "Brief Description": [],
		    "Detailed Description": []
                }
	    },
	    "Action Client": {
                "ancestorDepth": 1,
                "docstring" : [],
                "attributes": {
		    "Active Callback": [],
		    "Done Callback": [],
		    "Feedback Callback": [],
		    "Authors": [],
		    "Brief Description": [],
		    "Detailed Description": []
                }
	    },
            "Publisher": {
                "ancestorDepth": 1,
                "docstring" : []
	    },
	    "Subscriber": {
                "ancestorDepth": 1,
                "docstring" : [],
                "attributes": {
		    "Operation": [],
		    "Authors": [],
		    "Brief Description": [],
		    "Detailed Description": []
                }
	    },
            "State Machine": {
                "ancestorDepth": 1,
                "docstring": [],
                "attributes": {
		    "Includes": [],
		    "Initialization": [],
		    "Definitions": [],
		    "Declarations": []
                }
	    },
	    "State": {
                "ancestorDepth": 0,
                "docstring": [],
                "attributes": {
		    "Entry": [],
		    "Exit": [],
		    "Tick": []
                }
	    },
	    "Internal Transition": {
                "ancestorDepth": 1,
                "docstring": [],
                "attributes": {
		    "Guard": [],
		    "Action": []
                }
	    },
	    "External Transition": {
                "ancestorDepth": 1,
                "docstring": [],
                "attributes": {
		    "Guard": [],
		    "Action": []
                }
	    }
	};


        components.CodeEditor.attrToInfoMap.Project["docstring"] = project;
        components.CodeEditor.attrToInfoMap.Project.attributes["Authors"] = authors;
        components.CodeEditor.attrToInfoMap.Project.attributes["Brief Description"] = bDesc;
        components.CodeEditor.attrToInfoMap.Project.attributes["Detailed Description"] = dDesc;
        components.CodeEditor.attrToInfoMap.Documentation["docstring"] = documentation;
        components.CodeEditor.attrToInfoMap.Deployments["docstring"] = deployments;
        components.CodeEditor.attrToInfoMap.Deployment["docstring"] = deployment;
        components.CodeEditor.attrToInfoMap.Container["docstring"] = container;
        components.CodeEditor.attrToInfoMap.Node["docstring"] = node;
        components.CodeEditor.attrToInfoMap.Software["docstring"] = software;
        components.CodeEditor.attrToInfoMap.Package["docstring"] = pack;
        components.CodeEditor.attrToInfoMap.Package.attributes["Authors"] = authors;
        components.CodeEditor.attrToInfoMap.Package.attributes["Brief Description"] = bDesc;
        components.CodeEditor.attrToInfoMap.Package.attributes["Detailed Description"] = dDesc;
        components.CodeEditor.attrToInfoMap["External Definitions"]["docstring"] = externalDef;
        components.CodeEditor.attrToInfoMap["External Message"]["docstring"] = externalMsg;
        components.CodeEditor.attrToInfoMap["External Service"]["docstring"] = externalSrv;
        components.CodeEditor.attrToInfoMap.Component["docstring"] = component;
        components.CodeEditor.attrToInfoMap.Component.attributes["Forwards"] = forwards;
        components.CodeEditor.attrToInfoMap.Component.attributes["Members"] = members;
        components.CodeEditor.attrToInfoMap.Component.attributes["Definitions"] = definitions;
        components.CodeEditor.attrToInfoMap.Component.attributes["Initialization"] = initialization;
        components.CodeEditor.attrToInfoMap.Component.attributes["Destruction"] = destruction;
        components.CodeEditor.attrToInfoMap.Component.attributes["User Configuration"] = userConfig;
        components.CodeEditor.attrToInfoMap.Component.attributes["User Artifacts"] = userArtifacts;
        components.CodeEditor.attrToInfoMap.Component.attributes["Authors"] = authors;
        components.CodeEditor.attrToInfoMap.Component.attributes["Brief Description"] = bDesc;
        components.CodeEditor.attrToInfoMap.Component.attributes["Detailed Description"] = dDesc;
        components.CodeEditor.attrToInfoMap.Message["docstring"] = message;
        components.CodeEditor.attrToInfoMap.Message.attributes["Definition"] = msgDef;
        components.CodeEditor.attrToInfoMap.Service["docstring"] = service;
        components.CodeEditor.attrToInfoMap.Service.attributes["Definition"] = serviceDef;
        components.CodeEditor.attrToInfoMap.Action["docstring"] = action;
        components.CodeEditor.attrToInfoMap.Action.attributes["Definition"] = actionDef;
        components.CodeEditor.attrToInfoMap.Timer["docstring"] = timer;
        components.CodeEditor.attrToInfoMap.Timer.attributes["Operation"] = timerOp;
        components.CodeEditor.attrToInfoMap.Timer.attributes["AbstractBusinessLogic"] = timerABL;
        components.CodeEditor.attrToInfoMap.Timer.attributes["Authors"] = authors;
        components.CodeEditor.attrToInfoMap.Timer.attributes["Brief Description"] = bDesc;
        components.CodeEditor.attrToInfoMap.Timer.attributes["Detailed Description"] = dDesc;
        components.CodeEditor.attrToInfoMap.Client["docstring"] = client;
        components.CodeEditor.attrToInfoMap.Server["docstring"] = server;
        components.CodeEditor.attrToInfoMap['Action Server']["docstring"] = actionServer;
        components.CodeEditor.attrToInfoMap['Action Client']["docstring"] = actionClient;
        components.CodeEditor.attrToInfoMap.Server.attributes["Operation"] = serverOp;
        components.CodeEditor.attrToInfoMap.Server.attributes["AbstractBusinessLogic"] = serverABL;
        components.CodeEditor.attrToInfoMap.Server.attributes["Authors"] = authors;
        components.CodeEditor.attrToInfoMap.Server.attributes["Brief Description"] = bDesc;
        components.CodeEditor.attrToInfoMap.Server.attributes["Detailed Description"] = dDesc;
        components.CodeEditor.attrToInfoMap.Publisher["docstring"] = publisher;
        components.CodeEditor.attrToInfoMap.Subscriber["docstring"] = subscriber;
        components.CodeEditor.attrToInfoMap.Subscriber.attributes["Operation"] = subscriberOp;
        components.CodeEditor.attrToInfoMap.Subscriber.attributes["AbstractBusinessLogic"] = subscriberABL;
        components.CodeEditor.attrToInfoMap.Subscriber.attributes["Authors"] = authors;
        components.CodeEditor.attrToInfoMap.Subscriber.attributes["Brief Description"] = bDesc;
        components.CodeEditor.attrToInfoMap.Subscriber.attributes["Detailed Description"] = dDesc;

        // HFSM docs
        components.CodeEditor.attrToInfoMap['State Machine']['docstring'] = StateMachineDoc;
        components.CodeEditor.attrToInfoMap['State Machine'].attributes["Includes"] = StateMachineInclDoc;
        components.CodeEditor.attrToInfoMap['State Machine'].attributes["Definitions"] = StateMachineDefDoc;
        components.CodeEditor.attrToInfoMap['State Machine'].attributes["Declarations"] = StateMachineDeclDoc;
        components.CodeEditor.attrToInfoMap['State Machine'].attributes["Initialization"] = StateMachineInitDoc;

        components.CodeEditor.attrToInfoMap.State['docstring'] = StateDoc;
        components.CodeEditor.attrToInfoMap.State.attributes["Entry"] = StateEntryDoc;
        components.CodeEditor.attrToInfoMap.State.attributes["Exit"] = StateExitDoc;
        components.CodeEditor.attrToInfoMap.State.attributes["Tick"] = StateTickDoc;

        components.CodeEditor.attrToInfoMap['Internal Transition']['docstring'] = InternalTransitionDoc;
        components.CodeEditor.attrToInfoMap['Internal Transition'].attributes["Guard"] = InternalTransitionGuardDoc;
        components.CodeEditor.attrToInfoMap['Internal Transition'].attributes["Action"] = InternalTransitionActionDoc;

        components.CodeEditor.attrToInfoMap['External Transition']['docstring'] = InternalTransitionDoc;
        components.CodeEditor.attrToInfoMap['External Transition'].attributes["Guard"] = InternalTransitionGuardDoc;
        components.CodeEditor.attrToInfoMap['External Transition'].attributes["Action"] = InternalTransitionActionDoc;
    }
    catch(e){
        console.log(e)
    }

}

module.exports = loadDocs;
