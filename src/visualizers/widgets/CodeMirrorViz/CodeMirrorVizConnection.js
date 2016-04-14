
define([
    'js/Widgets/DiagramDesigner/Connection',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Draggable',
    './CodeMirrorVizWidget.Constants',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants'
], function (
    Connection,
    DiagramDesignerWidgetDraggable,
    CodeMirrorVizWidgetConstants,
    DiagramDesignerWidgetConstants) {

    "use strict";

    var CodeMirrorVizConnection,
        TEXT_OFFSET = 15,
        TEXT_ID_PREFIX = "t_",
        CONNECTION_NO_END = DiagramDesignerWidgetConstants.LINE_ARROWS.NONE;

    CodeMirrorVizConnection = function (objId) {
        Connection.call(this, objId);
    };

    _.extend(CodeMirrorVizConnection.prototype, Connection.prototype);

    CodeMirrorVizConnection.prototype.setConnectionRenderData = function (segPoints) {
        var self = this,
            srcPos = segPoints[0],
            dstPos = segPoints[segPoints.length - 1],
            _removeExistingConnection, // fn
            _removeExistingLabels; // fn

        _removeExistingConnection = function () {
            Connection.prototype.destroy.call(self);
            self.pathDef = null;
        };

        _removeExistingLabels = function () {
            var connID = self.id,
                srcID = self.srcSubCompId || self.srcObjId,
                dstID = self.dstSubCompId || self.dstObjId,
                pathID,
                srcNetlist = self.diagramDesigner.skinParts.$itemsContainer.find('[obj-id^="' + srcID + '"]')[0],
                dstNetlist = self.diagramDesigner.skinParts.$itemsContainer.find('[obj-id^="' + dstID + '"]')[0],
                nbrOfConns,
                text;

            if (srcNetlist) {
                self.srcLabelDetached = $(srcNetlist).find('[connid^="' + connID + '"]').detach();
                if (srcNetlist.childElementCount === 1) {
                    $(srcNetlist).remove();
                    pathID = DiagramDesignerWidgetConstants.PATH_SHADOW_ID_PREFIX + srcID;
                    self.diagramDesigner.skinParts.$itemsContainer.find('[id^="' + pathID + '"]').remove();
                } else {
                    nbrOfConns = $(srcNetlist).find('.' + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS).length;
                    text = nbrOfConns === 1 ? (nbrOfConns + ' connection') : (nbrOfConns + ' connections');

                    $(srcNetlist).find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE)[0].textContent = text;
                }
            }

            if (dstNetlist) {
                self.dstLabelDetached = $(dstNetlist).find('[connid^="' + connID + '"]').detach();
                if (dstNetlist.childElementCount === 1) {
                    $(dstNetlist).remove();
                    pathID = DiagramDesignerWidgetConstants.PATH_SHADOW_ID_PREFIX + dstID;
                    self.diagramDesigner.skinParts.$itemsContainer.find('[id^="' + pathID + '"]').remove();
                } else {
                    nbrOfConns = $(dstNetlist).find('.' + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS).length;
                    text = nbrOfConns === 1 ? (nbrOfConns + ' connection') : (nbrOfConns + ' connections');

                    $(dstNetlist).find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE)[0].textContent = text;
                }
            }
        };

        // setting end connectors positions
        self.sourceCoordinates = { "x": srcPos.x,
            "y": srcPos.y};

        self.endCoordinates = { "x": dstPos.x,
            "y": dstPos.y};

        self._segPoints = segPoints.slice(0);
        self._pathPoints = segPoints;

        if (self.showAsLabel) {

            _removeExistingConnection();

            self.setNetRenderData(segPoints);
        } else {
            _removeExistingLabels();
            Connection.prototype.setConnectionRenderData.call(this, segPoints);
        }

        self.hideEndReconnectors();
        self._renderEndReconnectors();
        if (self.selected) {
            self.showEndReconnectors();
            self.highlight();
        }
    };

    CodeMirrorVizConnection.prototype.setNetRenderData = function (segPoints) {
        var srcID = this.srcSubCompId || this.srcObjId,
            dstID = this.dstSubCompId || this.dstObjId,
            srcPathDef = [],
            dstPathDef = [],
            p,
            lastP,
            validPath = segPoints && segPoints.length > 1,
            srcPortLabelList,
            dstPortLabelList;

        if (validPath) {
            // SRC DATA
            srcPortLabelList = this._createSrcNet(srcID, dstID);
            p = segPoints[0]; // src-start
            lastP = segPoints[1]; // src-end
            srcPathDef = this._getPathDef(p, lastP);

            // DST DATA
            dstPortLabelList = this._createDstNet(srcID, dstID);
            p  = segPoints[segPoints.length - 1]; // dst-start
            lastP = segPoints[segPoints.length - 2]; // dst-end
            dstPathDef = this._getPathDef(p, lastP);

            this._renderSrcNet(srcPortLabelList, srcPathDef);
            this._renderDstNet(dstPortLabelList, dstPathDef);

        } else {
            this._removePath();
        }
    };

    CodeMirrorVizConnection.prototype._netLabelListBase = $('<div class="netlist"><div class="title-container"><div class="add-conn">+</div><div class="title"></div></div></div>');
    CodeMirrorVizConnection.prototype._netLabelBase = $('<div class="netLabel"></div>');
    CodeMirrorVizConnection.prototype._netlistContainer = $('<div class="netlist-container"></div>');

    /** CREATE SRC NET LIST **/
    CodeMirrorVizConnection.prototype._createSrcNet = function (srcID, dstID) {
        var self = this,
            START_ARROW = '&rarr;',
            srcPortLabelList = self.diagramDesigner.skinParts.$itemsContainer.find('[obj-id^="' + srcID + '"]')[0],
            srcPortLabel = self._netLabelBase.clone(),
            dstText = self._getDstText(),
            existingLabel,
            newText,
            _createNetlist, // fn
            _createLabel, // fn
            _updateText; // fn

        _createNetlist = function () {
            // create a label list for the src object or src port
            if (!srcPortLabelList) {
                srcPortLabelList = self._netLabelListBase.clone()[0];
                srcPortLabelList.setAttribute("obj-id", srcID); // used to highlight actual object
                $(srcPortLabelList).find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE).text('connections'); // todo: this can go in peace
                $(srcPortLabelList).find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE).attr(CodeMirrorVizWidgetConstants.NETLIST_ID, srcID);
            }
        };

        _createLabel = function () {
            var text;

            srcPortLabel.attr(CodeMirrorVizWidgetConstants.NETLIST_ID, dstID);
            srcPortLabel.attr(CodeMirrorVizWidgetConstants.CONNECTION_ID, self.id);
            if (!self.selected) {
                srcPortLabel.css('display', 'none');
            }
            // if show as label and connection name is different than default name, set netlabel name to new name
            if (self.name !== self.defaultName) {
                text = self.name;
            } else {
                text = dstText;
            }
            if ((self.designerAttributes.arrowEnd && self.designerAttributes.arrowEnd !== CONNECTION_NO_END) ||
                (self.designerAttributes.arrowStart && self.designerAttributes.arrowStart !== CONNECTION_NO_END)) {
                text += '  ' + START_ARROW;
            }
            srcPortLabel.html(text).text();
        };

        _updateText = function () {
            var title,
                nbrOfConns = $(srcPortLabelList).find('.' + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS).length;
            title = $(srcPortLabelList).find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE);
            if (nbrOfConns === 1) {
                title.text(nbrOfConns + " connection");
            } else {
                title.text(nbrOfConns + " connections");
            }
        };


        _createNetlist();

        // appending label
        if (self.srcLabelDetached && self.srcLabelDetached[0]) {
            $(srcPortLabelList).append(self.srcLabelDetached[0]);
            _updateText();

        } else {
            existingLabel = $(srcPortLabelList).find('[connid^="' + self.id + '"]')[0];
            // if dst of the current connection hasn't been added & not collapsed, add it to the list of src object & make it visible
            // if show as label and connection name is different than default name, set netlabel name to new name
            if (!existingLabel) {
                _createLabel();
                $(srcPortLabelList).append(srcPortLabel);
                _updateText();

            } else {
                if (self.name !== self.defaultName) {
                    existingLabel.textContent = self.name;
                } else if (existingLabel.textContent !== dstText) {
                    // handling the name update case
                    existingLabel.textContent = dstText;
                }

                if ((self.designerAttributes.arrowEnd && self.designerAttributes.arrowEnd !== 'none') ||
                    (self.designerAttributes.arrowStart && self.designerAttributes.arrowStart !== 'none')) {
                    if (existingLabel.textContent.indexOf(START_ARROW) === -1) {
                        newText = existingLabel.textContent + '  ' + START_ARROW;
                        $(existingLabel).html(newText).text();
                    }
                } else {
                    existingLabel.textContent.replace(START_ARROW, '').trim();
                }
            }
        }

        self.skinParts.srcCodeMirrorViz = $(srcPortLabelList).find('[connid^="' + self.id + '"]')[0];

        return srcPortLabelList;
    };

    CodeMirrorVizConnection.prototype._getSrcText = function () {
        var self = this,
            srcText,
            srcName = self.srcObj.getAttribute('name'),
            srcParentName = self.srcParentObj.getAttribute('name');

        srcText = self.srcSubCompId ? srcParentName + "." + srcName : srcName;

        return srcText;
    };


    CodeMirrorVizConnection.prototype._renderSrcNet = function (srcPortLabelList, pathDef) {
        var objID = srcPortLabelList.attributes['obj-id'].value,
            id = TEXT_ID_PREFIX + objID,
            pathID = DiagramDesignerWidgetConstants.PATH_SHADOW_ID_PREFIX + objID,
            pathCenter = {},
            newPathDef;

        pathCenter.x = (pathDef.x1 + pathDef.x2) / 2;
        pathCenter.y = (pathDef.y1 + pathDef.y2) / 2;

        this.skinParts.textContainer1 = this.diagramDesigner.skinParts.$itemsContainer.find('[id^="' + id + '"]');

        if (!this.skinParts.textContainer1[0]) {
            this.skinParts.textContainer1 = this._netlistContainer.clone();
        }
        this.skinParts.textContainer1.css({ 'top': pathCenter.y - TEXT_OFFSET,
            'left': pathCenter.x});
        this.skinParts.textContainer1.attr(CodeMirrorVizWidgetConstants.NETLIST_ID, id);
        this.skinParts.textContainer1.append(srcPortLabelList);
        this.diagramDesigner.skinParts.$itemsContainer.append(this.skinParts.textContainer1);

        // remove previous lines drawn for this component/sub-component
        this._removeExistingPath(pathID);
        //construct the SVG path definition from pathDef
        newPathDef = this._getPathDefFromPointObject(pathDef);
        /*CREATE PATH*/
        this.skinParts.srcPath = this.paper.path(newPathDef);

        $(this.skinParts.srcPath.node).attr({"id": pathID,
            "class": CodeMirrorVizWidgetConstants.NETLIST});

    };

    /** CREATE DST NET LIST **/
    CodeMirrorVizConnection.prototype._createDstNet = function (srcID, dstID) {
        var self = this,
            END_ARROW = '&rarr;',
            dstPortLabelList = self.diagramDesigner.skinParts.$itemsContainer.find('[obj-id^="' + dstID + '"]')[0],
            dstPortLabel = self._netLabelBase.clone(),
            srcText = self._getSrcText(),
            existingLabel,
            newText,
            _createNetlist, // fn
            _createLabel, // fn
            _updateText; // fn


        _createNetlist = function () {
            // create a label list for the dst object or dst port
            if (!dstPortLabelList) {
                dstPortLabelList = self._netLabelListBase.clone()[0];
                dstPortLabelList.setAttribute("obj-id", dstID);
                $(dstPortLabelList).find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE).text('connections');
                $(dstPortLabelList).find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE).attr(CodeMirrorVizWidgetConstants.NETLIST_ID, dstID);
                if (self.diagramDesigner.items[dstID] && self.diagramDesigner.items[dstID]._decoratorInstance.$sourceConnectors[0]);
                else {
                    $(dstPortLabelList).find('.' + CodeMirrorVizWidgetConstants.ADD_CONNECTION).remove();
                }
            }
        };

        _createLabel = function () {
            var text;
            // making the dstPortLabel
            dstPortLabel.attr(CodeMirrorVizWidgetConstants.NETLIST_ID, srcID);
            dstPortLabel.attr(CodeMirrorVizWidgetConstants.CONNECTION_ID, self.id);
            if (!self.selected) {
                dstPortLabel.css('display', 'none');
            }
            // if show as label and connection name is different than default name, set netlabel name to new name
            if (self.name !== self.defaultName) {
                text = self.name;
            } else {
                text = srcText;
            }
            if ((self.designerAttributes.arrowEnd && self.designerAttributes.arrowEnd !== 'none') ||
                (self.designerAttributes.arrowStart && self.designerAttributes.arrowStart !== 'none')) {
                text = END_ARROW + '  ' + text;
            }
            dstPortLabel.html(text).text();
        };

        _updateText = function () {
            var title,
                nbrOfConns = $(dstPortLabelList).find('.' + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS).length;
            title = $(dstPortLabelList).find('.' + CodeMirrorVizWidgetConstants.NETLIST_TITLE);
            if (nbrOfConns === 1) {
                title.text(nbrOfConns + " connection");
            } else {
                title.text(nbrOfConns + " connections");
            }
        };

        _createNetlist();

        if (self.dstLabelDetached && self.dstLabelDetached[0]) {

            $(dstPortLabelList).append(self.dstLabelDetached[0]);
            _updateText();
        } else {
            existingLabel = $(dstPortLabelList).find('[connid^="' + self.id + '"]')[0];
            // if src of the current connection hasn't been added, add it to the list of dst object
            if (!existingLabel) {
                _createLabel();
                $(dstPortLabelList).append(dstPortLabel);
                _updateText();

            } else {
                if (self.name !== self.defaultName) {
                    existingLabel.textContent = self.name;
                }
                else if (existingLabel.textContent !== srcText) {
                    // handling the name update case
                    existingLabel.textContent = srcText;
                }

                if ((self.designerAttributes.arrowEnd && self.designerAttributes.arrowEnd !== 'none') ||
                    (self.designerAttributes.arrowStart && self.designerAttributes.arrowStart !== 'none')) {
                    if (existingLabel.textContent.indexOf(END_ARROW) === -1) {
                        newText = END_ARROW + '  ' + existingLabel.textContent;
                        $(existingLabel).html(newText).text();
                    }
                } else {
                    existingLabel.textContent.replace(END_ARROW, '').trim();
                }
            }
        }

        self.skinParts.dstCodeMirrorViz = $(dstPortLabelList).find('[connid^="' + self.id + '"]')[0];

        return dstPortLabelList;
    };

    CodeMirrorVizConnection.prototype._getDstText = function () {
        var self = this,
            dstText,
            dstName = self.dstObj.getAttribute('name'),
            dstParentName = self.dstParentObj.getAttribute('name');

        dstText = self.dstSubCompId ? dstParentName + "." + dstName : dstName;

        return dstText;
    };

    CodeMirrorVizConnection.prototype._renderDstNet = function (dstPortLabelList, pathDef) {
        var pathCenter = {},
            objID = dstPortLabelList.attributes['obj-id'].value,
            id = TEXT_ID_PREFIX + objID,
            pathID = DiagramDesignerWidgetConstants.PATH_SHADOW_ID_PREFIX + objID,
            newPathDef;

        pathCenter.x = (pathDef.x1 + pathDef.x2) / 2;
        pathCenter.y = (pathDef.y1 + pathDef.y2) / 2;


        this.skinParts.textContainer2 = this.diagramDesigner.skinParts.$itemsContainer.find('[id^="' + id + '"]');
        if (!this.skinParts.textContainer2[0]) {
            this.skinParts.textContainer2 = this._netlistContainer.clone();
        }
        this.skinParts.textContainer2.css({ 'top': pathCenter.y - TEXT_OFFSET,
            'left': pathCenter.x});
        this.skinParts.textContainer2.attr(CodeMirrorVizWidgetConstants.NETLIST_ID, id);
        this.skinParts.textContainer2.append(dstPortLabelList);
        this.diagramDesigner.skinParts.$itemsContainer.append(this.skinParts.textContainer2);

        newPathDef = this._getPathDefFromPointObject(pathDef);
        this._removeExistingPath(pathID);
        this.logger.debug("Creating connection with ID: '" + id + "'");
        /*CREATE PATH*/
        this.skinParts.srcPath = this.paper.path(newPathDef);

        $(this.skinParts.srcPath.node).attr({"id": pathID,
            "class": CodeMirrorVizWidgetConstants.NETLIST});
    };

    CodeMirrorVizConnection.prototype._renderEndReconnectors = function () {
        //editor handle at src
        this.skinParts.srcDragPoint = this.skinParts.srcDragPoint || $('<div/>', {
            "data-end": CodeMirrorVizWidgetConstants.CONNECTION_END_SRC,
            "data-id": this.id,
            "class": CodeMirrorVizWidgetConstants.CONNECTION_DRAGGABLE_END_CLASS + " " + CodeMirrorVizWidgetConstants.CONNECTION_END_SRC +
                " " + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS
        });

        //editor handle at dst
        this.skinParts.dstDragPoint = this.skinParts.dstDragPoint || $('<div/>', {
            "data-end": CodeMirrorVizWidgetConstants.CONNECTION_END_DST,
            "data-id": this.id,
            "class": CodeMirrorVizWidgetConstants.CONNECTION_DRAGGABLE_END_CLASS + " " + CodeMirrorVizWidgetConstants.CONNECTION_END_DST +
                " " + CodeMirrorVizWidgetConstants.DESIGNER_NETLABEL_CLASS
        });
    };

    CodeMirrorVizConnection.prototype.destroy = function () {
        this._destroying = true;
        if (this.diagramDesigner) {

            this.diagramDesigner.skinParts.$itemsContainer.find('.' + CodeMirrorVizWidgetConstants.NETLIST).remove();
            this._hideTexts();
            this.logger.debug("Destroyed");

            this._removePath();
            this._removePathShadow();
        }
    };

    CodeMirrorVizConnection.prototype._initialize = function (objDescriptor) {

        this.defaultName = objDescriptor.defaultName;

        this.srcObjId = objDescriptor.srcObjId;
        this.dstObjId = objDescriptor.dstObjId;

        /*MODELEDITORCONNECTION CONSTANTS***/
        this.diagramDesigner = objDescriptor.designerCanvas;

        this.skinParts = {};
        this.paper = this.diagramDesigner.skinParts.SVGPaper;

        this.reconnectable = false;

        this.selected = false;
        this.selectedInMultiSelection = false;

        this.designerAttributes = {};

        this.designerAttributes.arrowStart = objDescriptor[DiagramDesignerWidgetConstants.LINE_START_ARROW] || CONNECTION_NO_END;
        this.designerAttributes.arrowEnd = objDescriptor[DiagramDesignerWidgetConstants.LINE_END_ARROW] || CONNECTION_NO_END;

        this._editMode = false;
        this._readOnly = false;

        //get segnment points
        this.segmentPoints = [];

        this._segmentPointMarkers = [];
        this._connectionEditSegments = [];

        this._pathPointsBBox = {'x': 0,
            'y': 0,
            'x2': 0,
            'y2': 0,
            'w': 0,
            'h': 0};

        if (objDescriptor.showAsLabel) {
            this._initializeConnectionProps(objDescriptor);
        } else {
            Connection.prototype._initializeConnectionProps.call(this, objDescriptor);
        }
    };

    CodeMirrorVizConnection.prototype._initializeConnectionProps = function (objDescriptor) {

        this.showAsLabel = objDescriptor.showAsLabel;

        if (this.showAsLabel) {

            this.name = objDescriptor.name;

            this.reconnectable = objDescriptor.reconnectable === true;
            this.editable = !!objDescriptor.editable;
            this.nameEdit = objDescriptor.nameEdit || false;

            this.srcTextEdit = objDescriptor.srcTextEdit || false;
            this.dstTextEdit = objDescriptor.dstTextEdit || false;

            // getting relevant src & dst IDs
            this.srcObjId = objDescriptor.srcObjId; // designer item ID (etc 'I_')
            this.srcSubCompId = objDescriptor.srcSubCompId; // port ID, undefined if port nonexistent
            this.dstObjId = objDescriptor.dstObjId;
            this.dstSubCompId = objDescriptor.dstSubCompId;

            this.srcObj = objDescriptor.srcObj;
            this.dstObj = objDescriptor.dstObj;
            this.srcParentObj = objDescriptor.srcParentObj;
            this.dstParentObj = objDescriptor.dstParentObj;
        } else {
            Connection.prototype._initializeConnectionProps.call(this, objDescriptor);
        }
    };

    CodeMirrorVizConnection.prototype.getBoundingBox = function () {
        var bBox;

        if (this.showAsLabel) {
            bBox = { "x": NaN,
                "y": NaN,
                "x2": 0,
                "y2": 0,
                "width": 0,
                "height": 0 };
            return bBox;
        } else {
            bBox = Connection.prototype.getBoundingBox.call(this);
        }
        return bBox;
    };

    CodeMirrorVizConnection.prototype.onSelect = function (multiSelection) {

        var self = this,
            parentNode,
            children,
            i,
            _showLabels; // fn

        _showLabels = function () {
            if (self.skinParts.srcCodeMirrorViz.style.display === "none") {
                parentNode = self.skinParts.srcCodeMirrorViz.parentNode;
                children = parentNode.childNodes;

                for (i = 1; i < children.length; i += 1) {
                    $(children[i]).show();
                    $(children[i]).addClass(CodeMirrorVizWidgetConstants.SHOW_MODE);
                }
            }

            if (self.skinParts.dstCodeMirrorViz.style.display === "none") {
                parentNode = self.skinParts.dstCodeMirrorViz.parentNode;
                children = parentNode.childNodes;

                for (i = 1; i < children.length; i += 1) {
                    $(children[i]).show();
                    $(children[i]).addClass(CodeMirrorVizWidgetConstants.SHOW_MODE);
                }
            }
        };

        this.selected = true;
        this.selectedInMultiSelection = multiSelection;

        if (this.showAsLabel) {
            _showLabels();
            //in edit mode and when not participating in a multiple selection,
            //show endpoint connectors
            if (this.selectedInMultiSelection === true) {
                this._setEditMode(false);
            } else {
                //in edit mode and when not participating in a multiple selection,
                //show connectors
                if (this.diagramDesigner.mode === this.diagramDesigner.OPERATING_MODES.DESIGN) {
                    this._setEditMode(false); // todo: set it to false for debugging purpose
                }
            }
        } else {
            Connection.prototype.onSelect.call(this);
        }

        this.showEndReconnectors();

        this.highlight();

    };

    CodeMirrorVizConnection.prototype.onDeselect = function () {

        this.selected = false;
        this.selectedInMultiSelection = false;

        if (!this.showAsLabel) {
            Connection.prototype.onDeselect.call(this);
        }

        this.unHighlight();
        this.hideEndReconnectors();
        this._setEditMode(false);
    };

    /**
     * Show src & dst end connectors of given connection
     * @param id - if undefined, one connection is selected; otherwise, a netlist is hovered over to show all other-end connectors
     */
    CodeMirrorVizConnection.prototype.showEndReconnectors = function () {
        var self = this,
            scale = Math.max(1, this.designerAttributes.width / 10),
            _showSrcEndReconnector, // fn
            _showDstEndReconnector; // fn

        _showSrcEndReconnector = function (text) {

            self.skinParts.srcDragPoint.css({"position": "absolute",
                "top": self.sourceCoordinates.y,
                "left": self.sourceCoordinates.x});

            self.diagramDesigner.skinParts.$itemsContainer.append(self.skinParts.srcDragPoint);
            //resize connectors to connection width
            self.skinParts.srcDragPoint.css('transform', "scale(" + scale + "," + scale + ")");
            if (text) {

                self.skinParts.srcDragPoint.text(text);
                self.skinParts.srcDragPoint.css('background-color', 'white');
            } else {
                $(self.skinParts.srcDragPoint).addClass(CodeMirrorVizWidgetConstants.HIGHLIGHT_CLASS);
            }
        };

        _showDstEndReconnector = function (text) {

            self.skinParts.dstDragPoint.css({"position": "absolute",
                "top": self.endCoordinates.y,
                "left": self.endCoordinates.x});

            self.diagramDesigner.skinParts.$itemsContainer.append(self.skinParts.dstDragPoint);
            //resize connectors to connection width
            self.skinParts.dstDragPoint.css('transform', "scale(" + scale + "," + scale + ")");
            if (text) {

                self.skinParts.dstDragPoint.text(text);
                self.skinParts.dstDragPoint.css('background-color', 'white');
            } else {
                $(self.skinParts.dstDragPoint).addClass(CodeMirrorVizWidgetConstants.HIGHLIGHT_CLASS);
            }
        };

        if (self.reconnectable) {

            if (self.showAsLabel) {
                if (self.srcSubCompId) {
                    _showSrcEndReconnector();
                }

                if (self.dstSubCompId) {
                    _showDstEndReconnector();
                }

                } else {
                    _showSrcEndReconnector('S');
                    _showDstEndReconnector('D');
                }

            this._toggleHighlightClass('add');

        } else {
            this.hideEndReconnectors();
        }
    };

    CodeMirrorVizConnection.prototype.hideEndReconnectors = function () {
        if (this.skinParts.srcDragPoint) {
            this.skinParts.srcDragPoint.empty();
            this.skinParts.srcDragPoint.remove();
            this.skinParts.srcDragPoint = null;
        }

        if (this.skinParts.dstDragPoint) {
            this.skinParts.dstDragPoint.empty();
            this.skinParts.dstDragPoint.remove();
            this.skinParts.dstDragPoint = null;
        }

        this._renderEndReconnectors();
        this._toggleHighlightClass('remove');
    };

    /******************** HIGHLIGHT / UNHIGHLIGHT MODE *********************/
    CodeMirrorVizConnection.prototype.highlight = function () {
        this._highlightSrc();
        this._highlightDst();
    };

    CodeMirrorVizConnection.prototype.unHighlight = function () {
        var srcObj,
            dstObj;

        srcObj = this.diagramDesigner.items[this.srcObjId];
        dstObj = this.diagramDesigner.items[this.dstObjId];
        if (srcObj) {
            srcObj.$el.removeClass(CodeMirrorVizWidgetConstants.SRCLABEL_HIGHLIGHT_CLASS);
        }
        if (dstObj) {
            dstObj.$el.removeClass(CodeMirrorVizWidgetConstants.DSTLABEL_HIGHLIGHT_CLASS);
        }
    };

    CodeMirrorVizConnection.prototype.update = function (objDescriptor) {
        this._prevShowLabel = this.showAsLabel;
        this.showAsLabel = objDescriptor.showAsLabel;
        this.srcObjId = objDescriptor.srcObjId;
        this.dstObjId = objDescriptor.dstObjId;
        this.designerAttributes.arrowStart = objDescriptor[DiagramDesignerWidgetConstants.LINE_START_ARROW] || CONNECTION_NO_END;
        this.designerAttributes.arrowEnd = objDescriptor[DiagramDesignerWidgetConstants.LINE_END_ARROW] || CONNECTION_NO_END;

        if (this.showAsLabel) {
            this._initializeConnectionProps(objDescriptor);
        } else {
            Connection.prototype.update.call(this, objDescriptor);
        }
    };

    /** HELPER FUNCTIONS **/
    CodeMirrorVizConnection.prototype._getPathDef = function (p, lastP) {
        var pathDef;

        pathDef = {'x1': p.x,
            'y1': p.y,
            'x2': -1,
            'y2': -1
        };

        // if connector is on top or bottom draw vertical lines
        if (p.x === lastP.x) {
            if (p.y <= lastP.y) {
                pathDef.x2 = p.x;
                pathDef.y2 = p.y + CodeMirrorVizWidgetConstants.MAX_TEXT_WIDTH;
            } else {
                pathDef.x2 = p.x;
                pathDef.y2 = p.y - CodeMirrorVizWidgetConstants.MAX_TEXT_WIDTH;
            }
        } else {
            if (p.x <= lastP.x) {
                pathDef.x2 = p.x + CodeMirrorVizWidgetConstants.MAX_TEXT_WIDTH;
                pathDef.y2 = p.y;
            } else {
                pathDef.x2 = p.x - CodeMirrorVizWidgetConstants.MAX_TEXT_WIDTH;
                pathDef.y2 = p.y;
            }
        }

        return pathDef;
    };

    CodeMirrorVizConnection.prototype._getPathDefFromPointObject = function (pathDef) {
        var newPathDef = [];

        newPathDef.push("M" + pathDef.x1 + "," + pathDef.y1);
        newPathDef.push("L" + pathDef.x2 + "," + pathDef.y2);

        return newPathDef;
    };

    CodeMirrorVizConnection.prototype._removeExistingPath = function (id) {
        var path = this.diagramDesigner.skinParts.$itemsContainer.find('[id^="' + id + '"]');
        if (path) {
            path.remove();
        }
    };

    CodeMirrorVizConnection.prototype._toggleHighlightClass = function (action) {
        if (action === 'add') {
            $(this.skinParts.srcCodeMirrorViz).addClass(CodeMirrorVizWidgetConstants.SRCLABEL_HIGHLIGHT_CLASS);
            $(this.skinParts.dstCodeMirrorViz).addClass(CodeMirrorVizWidgetConstants.DSTLABEL_HIGHLIGHT_CLASS);
        } else if (action === 'remove') {

            $(this.skinParts.srcCodeMirrorViz).removeClass(CodeMirrorVizWidgetConstants.SRCLABEL_HIGHLIGHT_CLASS);
            $(this.skinParts.dstCodeMirrorViz).removeClass(CodeMirrorVizWidgetConstants.DSTLABEL_HIGHLIGHT_CLASS);
        }
    };

    CodeMirrorVizConnection.prototype._highlightSrc = function () {
        var srcObj = this.diagramDesigner.items[this.srcObjId];
        srcObj.$el.addClass(CodeMirrorVizWidgetConstants.SRCLABEL_HIGHLIGHT_CLASS);
    };

    CodeMirrorVizConnection.prototype._highlightDst = function () {
        var dstObj = this.diagramDesigner.items[this.dstObjId];
        dstObj.$el.addClass(CodeMirrorVizWidgetConstants.DSTLABEL_HIGHLIGHT_CLASS);
    };

    CodeMirrorVizConnection.prototype._showEndOfSrc = function (id) {
        var self = this,
            scale = Math.max(1, this.designerAttributes.width / 10),
            _showSrcEndReconnector, // fn
            _showDstEndReconnector; // fn

        _showSrcEndReconnector = function () {

            self.skinParts.srcDragPoint.css({"position": "absolute",
                "top": self.sourceCoordinates.y,
                "left": self.sourceCoordinates.x});

            self.diagramDesigner.skinParts.$itemsContainer.append(self.skinParts.srcDragPoint);
            //resize connectors to connection width
            self.skinParts.srcDragPoint.css('transform', "scale(" + scale + "," + scale + ")");
            $(self.skinParts.srcDragPoint).addClass(CodeMirrorVizWidgetConstants.HIGHLIGHT_CLASS);
        };

        _showDstEndReconnector = function () {

            self.skinParts.dstDragPoint.css({"position": "absolute",
                "top": self.endCoordinates.y,
                "left": self.endCoordinates.x});

            self.diagramDesigner.skinParts.$itemsContainer.append(self.skinParts.dstDragPoint);
            //resize connectors to connection width
            self.skinParts.dstDragPoint.css('transform', "scale(" + scale + "," + scale + ")");
            $(self.skinParts.dstDragPoint).addClass(CodeMirrorVizWidgetConstants.HIGHLIGHT_CLASS);
        };

        // if id is defined, don't do anything to object with given id
        if (id) {
            // if srcObj has given id, then highlight dstObj or show dstSubComp
            if (self.srcObjId === id || self.srcSubCompId === id) {
                if (self.dstSubCompId) {
                    _showDstEndReconnector();
                } else {
                    self._highlightDst();
                }
            } else if (self.dstObjId === id || self.dstSubCompId === id) {
                if (self.srcSubCompId) {
                    _showSrcEndReconnector();
                } else {
                    self._highlightSrc();
                }
            }
        }
        this._toggleHighlightClass('add');
    };

    CodeMirrorVizConnection.prototype._hideEndOfSrc = function (id) {
        var srcObj = this.diagramDesigner.items[this.srcObjId],
            dstObj = this.diagramDesigner.items[this.dstObjId];

        this.hideEndReconnectors();
        if (this.srcObjId !== id) {
            if (srcObj) {
                srcObj.$el.removeClass(CodeMirrorVizWidgetConstants.SRCLABEL_HIGHLIGHT_CLASS);
            }
        }

        if (this.dstObjId !== id) {
            if (dstObj) {
                dstObj.$el.removeClass(CodeMirrorVizWidgetConstants.DSTLABEL_HIGHLIGHT_CLASS);
            }
        }
    };

    return CodeMirrorVizConnection;
});
