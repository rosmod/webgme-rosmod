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

        //render text-editor based META editing UI piece
        this._skinParts.$EqnEditorBtn = EQN_EDIT_BTN_BASE.clone();
        this.$el.append('<br>');
        this.$el.append(this._skinParts.$EqnEditorBtn);

        // onClick listener for the eqn button
        this._skinParts.$EqnEditorBtn.on('click', function () {
            if (self.hostDesignerItem.canvas.getIsReadOnlyMode() !== true &&
                nodeObj.getAttribute('Definition') !== undefined) {
                self._showEditorDialog('Definition');
            }
            event.stopPropagation();
            event.preventDefault();
        });
    };

    CodeEditorDecorator.prototype._showEditorDialog = function (attrName) {
        var self = this,
            client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
	    nodeName = nodeObj.getAttribute('name'),
            attrText = nodeObj.getAttribute(attrName),
	    editorDialog = new DocumentEditorDialog(),
	    metaNodes = client.getAllMetaNodes(),
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
        this._skinParts.$EqnEditorBtn.off('click');
        ModelDecoratorDiagramDesignerWidget.prototype.destroy.apply(this, arguments);
    };

    CodeEditorDecorator.prototype.update = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
            newDoc = '';

        ModelDecoratorDiagramDesignerWidget.prototype.update.apply(this, arguments);

        if (nodeObj) {
            newDoc = nodeObj.getAttribute('Definition') || '';
        }
    };

    return CodeEditorDecorator;
});
