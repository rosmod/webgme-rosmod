/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

define([
    'js/RegistryKeys',
    'js/Constants',
    './DocumentEditorDialog',
    'decorators/ModelDecorator/DiagramDesigner/ModelDecorator.DiagramDesignerWidget'
  ], function (
    REGISTRY_KEYS,
    CONSTANTS,
    DocumentEditorDialog,
    ModelDecoratorDiagramDesignerWidget) {

    'use strict';

    var CodeEditorDecorator,
        DECORATOR_ID = 'CodeEditorDecorator',
        EQN_EDIT_BTN_BASE = $('<i class="glyphicon glyphicon-edit text-meta"/>');

    CodeEditorDecorator = function (options) {
        var opts = _.extend({}, options);

        ModelDecoratorDiagramDesignerWidget.apply(this, [opts]);

        this._skinParts = {};
	this.buttonDict = {
	    'Interaction': {
		'Definition':'Definition'
	    },
	    'Component': {
		'Forwards':'Forwards',
		'Members':'Members',
		'Definitions':'Definitions',
		'Initialization':'Initialization',
		'Destruction':'Destruction',
	    },
	    'Port': {
		'Operation':'Operation'
	    }
	};

        this.logger.debug('CodeEditorDecorator ctor');
    };

    CodeEditorDecorator.prototype = Object.create(ModelDecoratorDiagramDesignerWidget.prototype);
    CodeEditorDecorator.prototype.constructor = CodeEditorDecorator;
    CodeEditorDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE ModelDecoratorDiagramDesignerWidget MEMBERS **************************/

    CodeEditorDecorator.prototype.on_addTo = function () {
        var self = this,
            client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //let the parent decorator class do its job first
        ModelDecoratorDiagramDesignerWidget.prototype.on_addTo.apply(this, arguments);

	var baseObject = client.getNode(nodeObj.getBaseId()),
	    baseType = undefined || baseObject.getAttribute('name'),
	    isInteraction = baseType == 'Message' || baseType == 'Service',
	    isComponent = baseType == 'Component',
	    isPort = baseType == 'Subscriber' || baseType == 'Server' || baseType == 'Timer';

	var objType = '';
	if (isInteraction)
	    objType = 'Interaction';
	else if (isComponent)
	    objType = 'Component';
	else if (isPort)
	    objType = 'Port';

	this.$el.append('<div class="row root-viz">');
	for (var code in self.buttonDict[objType]) {
            this._skinParts[code] = EQN_EDIT_BTN_BASE.clone();
	    this.$el.append('<br><body>'+code+'  </body>');
	    this.$el.append(this._skinParts[code]);
	    this.$el.append('</br>');
	    var codeClick = self._on_click.bind(self, code);
	    this._skinParts[code].on('click', codeClick);
	}
	this.$el.append('</div>');
    };

    CodeEditorDecorator.prototype._on_click = function(attr) {
	var self = this,
            client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);
	if (self.hostDesignerItem.canvas.getIsReadOnlyMode() !== true &&
	    nodeObj.getAttribute(attr) !== undefined) {
	    self._showEditorDialog(attr);
	}
	event.stopPropagation();
	event.preventDefault();
    };

    CodeEditorDecorator.prototype._showEditorDialog = function (attrName) {
        var self = this,
            client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
	    nodeName = nodeObj.getAttribute('name'),
            attrText = nodeObj.getAttribute(attrName),
	    editorDialog = new DocumentEditorDialog(),
	    baseObject = client.getNode(nodeObj.getBaseId()),
	    baseType = undefined || baseObject.getAttribute('name'),
	    title = 'Enter ' + baseType + ':' + nodeName + ' ' + attrName;

        // Initialize with Definition attribute and save callback function
        editorDialog.initialize(title, attrText, function (text) {
            try {
                client.setAttributes(self._metaInfo[CONSTANTS.GME_ID], attrName, text);
            } catch (e) {
                self.logger.error('Saving META failed... Either not JSON object or something else went wrong...');
            }
        });

        editorDialog.show();
    };

    CodeEditorDecorator.prototype.destroy = function () {
	for (var btn in this._skinParts) {
            //this._skinParts.$EqnEditorBtn.off('click');
            this._skinParts[btn].off('click');
	}
        ModelDecoratorDiagramDesignerWidget.prototype.destroy.apply(this, arguments);
    };

    CodeEditorDecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            newDoc = '';

        ModelDecoratorDiagramDesignerWidget.prototype.update.apply(this, arguments);

        if (nodeObj) {
            //newDoc = nodeObj.getAttribute('Definition') || nodeObj.getAttribute('Operation') ||'';
        }
    };

    return CodeEditorDecorator;
});
