
define([
    './CodeMirrorVizWidget.Constants',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants'
], function (
    CodeMirrorVizWidgetConstants,
    DiagramDesignerWidgetConstants) {

    "use strict";

    var CodeMirrorVizWidgetMouse,
        EVENT_POSTFIX = 'CodeMirrorVizWidget';

    CodeMirrorVizWidgetMouse = function () {
    };

    CodeMirrorVizWidgetMouse.prototype.initialize = function (el) {
        this.$el = el;

        this._activateMouseListeners();
    };

    CodeMirrorVizWidgetMouse.prototype._activateMouseListeners = function () {
        var self = this,
            logger = this.logger;

        //handle click on designer-items
        this.$el.on('mousedown.' + EVENT_POSTFIX, 'div.' + CodeMirrorVizWidgetConstants.DESIGNER_ITEM_CLASS,  function (event) {
            var itemId = $(this).attr("id"),
                eventDetails = self._processMouseEvent(event, true, true, true, true);

            logger.debug('mousedown.item, ItemID: ' + itemId + ' eventDetails: ' + JSON.stringify(eventDetails));

            if (self.onItemMouseDown) {
                self._clearNetlistSelection();
                self.onItemMouseDown.call(self, itemId, eventDetails);
            } else {
                //logger.warning('onItemMouseDown(itemId, eventDetails) is undefined, ItemID: ' + itemId + ' eventDetails: ' + JSON.stringify(eventDetails));
            }
        });

        //handle click on designer-connections
        this.$el.on('mousedown.' + EVENT_POSTFIX, 'path[class~="' + DiagramDesignerWidgetConstants.DESIGNER_CONNECTION_CLASS + '"]',  function (event) {
            var connId = this.id.replace(DiagramDesignerWidgetConstants.PATH_SHADOW_ARROW_END_ID_PREFIX, "").replace(DiagramDesignerWidgetConstants.PATH_SHADOW_ID_PREFIX, ""),
                eventDetails = self._processMouseEvent(event, true, true, true, true);

            logger.debug('mousedown.connection, connId: ' + connId + ' eventDetails: ' + JSON.stringify(eventDetails));

            if (self.onConnectionMouseDown) {
                self._clearNetlistSelection();
                self.onConnectionMouseDown.call(self, connId, eventDetails);
            } else {
                //logger.warning('onConnectionMouseDown(connId, eventDetails) is undefined, connId: ' + connId + ' eventDetails: ' + JSON.stringify(eventDetails));
            }
        });

        // handle click on netlist title
        this.$el.on('mousedown.' + EVENT_POSTFIX, 'div.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE,  function (event) {
            var connId = this.id,
                eventDetails = self._processMouseEvent(event, true, true, true, true);

            logger.debug('mousedown.connection, connId: ' + connId + ' eventDetails: ' + JSON.stringify(eventDetails));

            if (self.onConnectionMouseDown) {
                self.selectionManager._clearSelection();
                // todo: this should have worked but SelectionManager "if (idList.length > 1)" length > 1 check?
//                self.onConnectionMouseDown.call(self, connId, eventDetails);
                self._onNetlistSelect(this);
            } else {
                //logger.warning('onConnectionMouseDown(connId, eventDetails) is undefined, connId: ' + connId + ' eventDetails: ' + JSON.stringify(eventDetails));
            }
        });

        // handle click on add-conn
        this.$el.on('mousedown.' + EVENT_POSTFIX, 'div.' + CodeMirrorVizWidgetConstants.ADD_CONNECTION,  function (event) {
            var connId = this.id,
                eventDetails = self._processMouseEvent(event, true, true, true, true);

            logger.debug('mousedown.connection, connId: ' + connId + ' eventDetails: ' + JSON.stringify(eventDetails));

            if (self.onConnectionMouseDown) {
                self.selectionManager._clearSelection();
                // todo: this should have worked but SelectionManager "if (idList.length > 1)" length > 1 check?
//                self.onConnectionMouseDown.call(self, connId, eventDetails);
                self._onAddConn(this);
            } else {
                //logger.warning('onConnectionMouseDown(connId, eventDetails) is undefined, connId: ' + connId + ' eventDetails: ' + JSON.stringify(eventDetails));
            }
        });

        //handle click on netLabels
        this.$el.on('mousedown.' + EVENT_POSTFIX, 'div.' + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS,  function (event) {
            var connId = $(this).attr("connId"),
                eventDetails = self._processMouseEvent(event, true, true, true, true),
                rightClick = event.which === 3;

            logger.debug('mousedown.connection, connId: ' + connId + ' eventDetails: ' + JSON.stringify(eventDetails));

            if (self.onConnectionMouseDown) {
                if (!self.items[connId].selected) {
                    self._clearNetlistSelection();
                    self.onConnectionMouseDown.call(self, connId, eventDetails);
                }
            } else {
                //logger.warning('onConnectionMouseDown(connId, eventDetails) is undefined, connId: ' + connId + ' eventDetails: ' + JSON.stringify(eventDetails));
            }
        });

        //handle mouse down on background
        this.$el.on('mousedown.' + EVENT_POSTFIX, function (event) {
            var eventDetails = self._processMouseEvent(event, true, true, true, true);

            logger.debug('mousedown.background, eventDetails: ' + JSON.stringify(eventDetails));

            if (self.onBackgroundMouseDown) {
                self.onBackgroundMouseDown.call(self, eventDetails);
                self._clearNetlistSelection();
            } else {
                //logger.warning('onBackgroundMouseDown(eventDetails) is undefined, eventDetails: ' + JSON.stringify(eventDetails));
            }
        });

        //handle double-click on background
        this.$el.on('dblclick.' + EVENT_POSTFIX, function (event) {
            var eventDetails = self._processMouseEvent(event, true, true, true, true);

            if (self.onBackgroundDblClick) {
                self.onBackgroundDblClick.call(self, eventDetails);
            } else {
                //logger.warning('onBackgroundDblClick(eventDetails) is undefined, eventDetails: ' + JSON.stringify(eventDetails));
            }

            //logger.warning('dblclick.background, eventDetails: ' + JSON.stringify(eventDetails));
        });

        //disable context-menu on right-click
        this.$el.on('contextmenu.' + EVENT_POSTFIX, function (event) {
            //prevent default actions
            event.preventDefault();
            event.stopImmediatePropagation();
        });

        // handle mouse enter on netlist-container title
        this.$el.on('mouseenter.' + EVENT_POSTFIX, 'div.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE,  function (event) {
            logger.debug('Showing all end connectors from object ' + this.id);
            self._onNetlistHover(this);
        });

        // handle mouse leave on netlist-container title
        this.$el.on('mouseleave.' + EVENT_POSTFIX, 'div.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE,  function (event) {
            logger.debug('Hiding all end connectors from object ' + this.id);
            self._onNetlistUnHover(this);
        });
    };

    CodeMirrorVizWidgetMouse.prototype._processMouseEvent = function (event, triggerUIActivity, preventDefault, stopPropagation, stopImmediatePropagation) {
        //trigger that the user switched to this widget
        if (triggerUIActivity === true) {
            this._triggerUIActivity();
        }

        if (preventDefault === true) {
            event.preventDefault();
        }

        if (stopPropagation === true) {
            event.stopPropagation();
        }

        if (stopImmediatePropagation === true) {
            event.stopImmediatePropagation();
        }

        return this._getMouseEventDetails(event);
    };

    CodeMirrorVizWidgetMouse.prototype._getMouseEventDetails = function (event) {
        var mousePos = this.getAdjustedMousePos(event),
            eventDetails = { 'rightClick': event.which === 3,
                'ctrlKey': event.ctrlKey,
                'metaKey': event.metaKey,
                'altKey': event.altKey,
                'shiftKey': event.shiftKey,
                'mouseX': mousePos.mX,
                'mouseY': mousePos.mY };

        return eventDetails;
    };

    CodeMirrorVizWidgetMouse.prototype.trackMouseMoveMouseUp = function (fnMouseMove, fnMouseUp) {
        var self = this;

        $(document).on('mousemove.' + EVENT_POSTFIX, function (event) {
            var mouseDetails = self._processMouseEvent(event, false, true, true, true);

            if (fnMouseMove) {
                fnMouseMove.call(self, mouseDetails);
            }
        });

        $(document).on('mouseup.' + EVENT_POSTFIX, function (event) {
            var mouseDetails = self._processMouseEvent(event, false, true, true, true);

            $(document).off('mousemove.' + EVENT_POSTFIX);
            $(document).off('mouseup.' + EVENT_POSTFIX);

            if (fnMouseUp) {
                fnMouseUp.call(self, mouseDetails);
            }
        });
    };

    /** HELPER FUNCTIONS **/

    CodeMirrorVizWidgetMouse.prototype._onNetlistHover = function (node) {
        $(node).addClass(CodeMirrorVizWidgetConstants.HOVER_CLASS);
        this._showAllEndConnectors(node);
    };

    CodeMirrorVizWidgetMouse.prototype._onNetlistUnHover = function (node) {
        $(node).removeClass(CodeMirrorVizWidgetConstants.HOVER_CLASS);
        this._hideAllEndConnectors(node);
    };

    CodeMirrorVizWidgetMouse.prototype._onNetlistSelect = function (node) {
        this._clearNetlistSelection();
        $(node).addClass(CodeMirrorVizWidgetConstants.HIGHLIGHT_CLASS);
        this._showLabels(node);
    };

    // todo: there has to a better way to do this
    // todo: designer item class might be highlighted as well
    CodeMirrorVizWidgetMouse.prototype._clearNetlistSelection = function () {

        this.skinParts.$itemsContainer.find('.' + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS).removeClass(CodeMirrorVizWidgetConstants.SRCLABEL_HIGHLIGHT_CLASS);
        this.skinParts.$itemsContainer.find('.' + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS).removeClass(CodeMirrorVizWidgetConstants.DSTLABEL_HIGHLIGHT_CLASS);
        this.skinParts.$itemsContainer.find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE).removeClass(CodeMirrorVizWidgetConstants.HIGHLIGHT_CLASS);
        this.skinParts.$itemsContainer.find('.' + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS).hide();
    };

    CodeMirrorVizWidgetMouse.prototype._showLabels = function (node) {
        var parentNode = node.parentNode.parentNode,
            children = parentNode.children,
            i;

        // show all labels for this NetList
        for (i = 1; i < children.length; i += 1) {
            $(children[i]).show();
            $(children[i]).addClass(CodeMirrorVizWidgetConstants.SHOW_MODE);
        }
    };

    CodeMirrorVizWidgetMouse.prototype._showAllEndConnectors = function (node) {
        var self = this,
            children = node.parentNode.parentNode.childNodes,
            childrenCount = children.length,
            i,
            id,
            nodeId = node.id,
            idList = [],
            connObj;

        // first get the connection ids associated with this object
        for (i = 1; i < childrenCount; i += 1) {
            id = children[i].getAttribute(CodeMirrorVizWidgetConstants.CONNECTION_ID);
            // show all end connectors except the current object
            if (id && id !== nodeId) {
                idList.push(children[i].getAttribute(CodeMirrorVizWidgetConstants.CONNECTION_ID));
            }
        }

        // get all the connection objects associated with connid
        for (i = 0; i < idList.length; i += 1) {
            connObj = self.items[idList[i]];
            connObj._showEndOfSrc(nodeId);
        }
    };

    CodeMirrorVizWidgetMouse.prototype._hideAllEndConnectors = function (node) {
        var children = node.parentNode.parentNode.childNodes,
            childrenCount = children.length,
            nodeId = node.id,
            i,
            id,
            idList = [],
            connObj;

        // first get the connection ids associated with this object
        for (i = 1; i < childrenCount; i += 1) {

            id = children[i].getAttribute(CodeMirrorVizWidgetConstants.CONNECTION_ID);
            if (id) {
                idList.push(children[i].getAttribute(CodeMirrorVizWidgetConstants.CONNECTION_ID));
            }
        }

        // get all the connection objects associated with connid
        for (i = 0; i < idList.length; i += 1) {
            connObj = this.items[idList[i]];
            if (!connObj.selected) {
                connObj._hideEndOfSrc(nodeId);
            }
        }
    };

    CodeMirrorVizWidgetMouse.prototype._onAddConn = function (node) {
        var self = this,
            ITEM_PREFIX = 'I_',
            inputCtrl,
            ctrlGroup,
            id = node.parentNode.children[1].id,
            srcID,
            sCompID,
            params,
            validEndObjects,
            _cancel,
            _save,
            _focus,
            _removeFocus,
            _endEdit,
            _getCompID; // fn

        _cancel = function () {
            var itemId,
                i;
            for (i = 0; i < self.itemIds.length; i += 1) {
                itemId = self.itemIds[i];
                self.items[itemId].hideEndConnectors();
            }
            _endEdit();
            self.$el.find('.' + CodeMirrorVizWidgetConstants.AUTOCOMPLETE_FOCUS_CLASS).removeClass(CodeMirrorVizWidgetConstants.AUTOCOMPLETE_FOCUS_CLASS);

        };

        _removeFocus = function () {
            self.$el.find('.' + CodeMirrorVizWidgetConstants.AUTOCOMPLETE_FOCUS_CLASS).removeClass(CodeMirrorVizWidgetConstants.AUTOCOMPLETE_FOCUS_CLASS);
        };

        _save = function (endObj) {
            var endId = endObj.obj.ID,
                sCompId = endObj.obj.sCompID;

            // end connection drop
            self.connectionDrawingManager._connectionInDrawProps = {"src": srcID,
                "sCompId": sCompID,
                "srcEl": undefined,
                "type": "create"};
            self.connectionDrawingManager._connectionEndDrop(endId, sCompId);
            _endEdit();
            self.logger.info("New connection created.");
        };

        _focus = function (endObj) {
            var id = endObj.obj.ID,
                sCompId = endObj.obj.sCompID,
                $endConnectors = self.items[id]._decoratorInstance.$endConnectors,
                i;

            _removeFocus();
            self.items[id].$el.addClass(CodeMirrorVizWidgetConstants.AUTOCOMPLETE_FOCUS_CLASS);
            if (sCompId) {
                for (i = 0; i < $endConnectors.length; i += 1 ) {
                    if ($endConnectors[i].getAttribute(DiagramDesignerWidgetConstants.DATA_SUBCOMPONENT_ID) === sCompId) {
                        $($endConnectors[i]).addClass(CodeMirrorVizWidgetConstants.AUTOCOMPLETE_FOCUS_CLASS);
                        return;
                    }
                }
            }
        };

        _endEdit = function () {
            _removeFocus();
            ctrlGroup.remove();
        };

        _getCompID = function () {
            var key,
                obj,
                i;
            for (key in self._itemSubcomponentsMap) {
                if (self._itemSubcomponentsMap.hasOwnProperty(key)) {

                    obj = self._itemSubcomponentsMap[key];
                    for (i = 0; i < obj.length; i += 1) {
                        if (obj[i] === id) {
                            return key;
                        }
                    }
                }
            }
        };

        // start connection on 'add-icon' click
        srcID = id.indexOf(ITEM_PREFIX) === 0 ? id : _getCompID();
        sCompID = id.indexOf(ITEM_PREFIX) === 0 ? undefined : id;
        params = {'srcId': srcID,
            'srcSubCompId': sCompID};
        self._onStartConnectionCreate(params);

        // get a list of names to use in autocomplete
        validEndObjects = self._getValidEndObjects(self._decoratorPackages);

        ctrlGroup = $("<div/>",
            {"class": "control-group"});

        inputCtrl = $("<input/>", {
            "type": "text",
            "class": "new-conn"});

        inputCtrl.outerWidth(CodeMirrorVizWidgetConstants.MAX_TEXT_WIDTH);
        inputCtrl.css({"box-sizing": "border-box"});

        // enable autocomplete
        inputCtrl.autocomplete({
            minLength: 1,
            source: validEndObjects,
            focus: function( event, ui ) {
                inputCtrl.val( ui.item.value );
                _focus(ui.item);
                return false;
            },
            select: function( event, ui ) {
                inputCtrl.val( ui.item.value );
                _save(ui.item);
                return false;
            }
        });

        ctrlGroup.append(inputCtrl);

        $(node.parentNode.parentNode).append(ctrlGroup);

        //finally put the control in focus
        inputCtrl.focus();

        //hook up event handlers to 'save' and 'cancel'
        inputCtrl.keydown(
            function (event) {
                switch (event.which) {
                    case 27: // [esc]
                        // discard changes on [esc]
                        inputCtrl.val('');
                        event.preventDefault();
                        event.stopPropagation();
                        _cancel();
                        break;
                    case 46:// DEL
                        //don't need to handle it specially but need to prevent propagation
                        event.stopPropagation();
                        break;
                }
            }
        ).blur(function (/*event*/) {
            // a hack to avoid mouse select bug
            setTimeout(function () { _cancel(); }, 50);
        });

        $('.ui-autocomplete').mouseleave(function() {
            _removeFocus();
        });
    };

    return CodeMirrorVizWidgetMouse;
});
