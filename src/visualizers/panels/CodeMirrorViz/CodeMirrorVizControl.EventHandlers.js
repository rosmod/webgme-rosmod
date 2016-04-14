
define([
    'js/Panels/ModelEditor/ModelEditorControl.DiagramDesignerWidgetEventHandlers',
    'js/Constants',
    'js/Utils/GMEConcepts',
    'widgets/CodeMirrorViz/CodeMirrorVizConnection'
], function (
    ModelEditorControlDiagramDesignerWidgetEventHandlers,
    CONSTANTS,
    GMEConcepts) {

    "use strict";

    var CodeMirrorVizControlEventHandlers;

    CodeMirrorVizControlEventHandlers = function () {
        ModelEditorControlDiagramDesignerWidgetEventHandlers.call(this);
    };

    _.extend(CodeMirrorVizControlEventHandlers.prototype, ModelEditorControlDiagramDesignerWidgetEventHandlers.prototype);

    CodeMirrorVizControlEventHandlers.prototype._onSelectionDelete = function (idList) {
        var objIdList = [],
            i = idList.length,
            compID,
            itemDeleting,
            objID;

        while (i--) {
            compID = idList[i];
            objID = this._ComponentID2GmeID[compID];
            //temporary fix to not allow deleting ROOT AND FCO
            if (GMEConcepts.canDeleteNode(objID)) {
                objIdList.pushUnique(objID);
                // if object to be deleted is a connection object
                if (compID.indexOf("C_") === 0) {
                    itemDeleting = this.designerCanvas.items[compID];
                    if (itemDeleting.showAsLabel) {
                        itemDeleting.unHighlight();
                    } else {
                        itemDeleting._removePath();
                        itemDeleting._removePathShadow();
                    }
                    itemDeleting.hideEndReconnectors();
                }
            } else {
                //this.logger.warning('Cannot delete item with ID: ' + objID + '. Possibly it is the ROOT or FCO');
            }
        }

        if (objIdList.length > 0) {
            this._client.delMoreNodes(objIdList);
            this.logger.info('Deleted connections: ' + objIdList);
        }
    };


    CodeMirrorVizControlEventHandlers.prototype._attachUserInteractions = function () {
        var i,
            self = this;

        this._events = {"mouseenter": { "fn": "onMouseEnter",
            "stopPropagation": true,
            "preventDefault": true,
            "enabledInReadOnlyMode": true},
            "mouseleave": { "fn": "onMouseLeave",
                "stopPropagation": true,
                "preventDefault": true,
                "enabledInReadOnlyMode": true},
            "dblclick": { "fn": "onDoubleClick",
                "stopPropagation": true,
                "preventDefault": true,
                "enabledInReadOnlyMode": true}};

        for (i in this._events) {
            if (this._events.hasOwnProperty(i)) {
                this.$el.on( i + '.' + EVENT_POSTFIX, null, null, function (event) {
                    var eventHandlerOpts = self._events[event.type],
                        handled = false,
                        enabled = true;

                    if (self.canvas.mode !== self.canvas.OPERATING_MODES.READ_ONLY &&
                        self.canvas.mode !== self.canvas.OPERATING_MODES.DESIGN) {
                        return;
                    }

                    if (eventHandlerOpts) {
                        if (self.canvas.mode === self.canvas.OPERATING_MODES.READ_ONLY) {
                            enabled = eventHandlerOpts.enabledInReadOnlyMode;
                        }

                        if (enabled) {
                            //call decorators event handler first
                            handled = self._callDecoratorMethod(eventHandlerOpts.fn, event);

                            if (handled !== true) {
                                handled = self[eventHandlerOpts.fn].call(self, event);
                            }

                            //if still not marked as handled
                            if (handled !== true) {
                                //finally marked handled if needed
                                if (eventHandlerOpts.stopPropagation === true) {
                                    event.stopPropagation();
                                }

                                if (eventHandlerOpts.preventDefault === true) {
                                    event.preventDefault();
                                }
                            }
                        }
                    }
                });
            }
        }
    };


    return CodeMirrorVizControlEventHandlers;
});
