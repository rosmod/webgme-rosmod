/*globals define, _, DEBUG, $*/
/*jshint browser: true*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */


define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'text!../DiagramDesigner/CodeEditorDecorator.DiagramDesignerWidget.html',
    'css!../DiagramDesigner/CodeEditorDecorator.DiagramDesignerWidget.css',
    'css!./CodeEditorDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             CodeEditorDecoratorDiagramDesignerWidgetTemplate) {

    'use strict';

    var CodeEditorDecoratorPartBrowserWidget,
        __parent__ = PartBrowserWidgetDecoratorBase,
        DECORATOR_ID = 'CodeEditorDecoratorPartBrowserWidget';

    CodeEditorDecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.logger.debug('CodeEditorDecoratorPartBrowserWidget ctor');
    };

    _.extend(CodeEditorDecoratorPartBrowserWidget.prototype, __parent__.prototype);
    CodeEditorDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    CodeEditorDecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
        var el = $(CodeEditorDecoratorDiagramDesignerWidgetTemplate);
        //use the same HTML template as the CodeEditorDecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove();
        return el;
    })();

    CodeEditorDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');

        this._renderContent();
    };

    CodeEditorDecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    CodeEditorDecoratorPartBrowserWidget.prototype._renderContent = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //render GME-ID in the DOM, for debugging
        if (DEBUG) {
            this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});
        }

        if (nodeObj) {
            this.skinParts.$name.text(nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '');
        }
    };

    CodeEditorDecoratorPartBrowserWidget.prototype.update = function () {
        this._renderContent();
    };

    return CodeEditorDecoratorPartBrowserWidget;
});