/*globals define, _*/
/*jshint browser: true, camelcase: false*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */

define([
    'js/Decorators/DecoratorBase',
    './DiagramDesigner/CodeEditorDecorator.DiagramDesignerWidget',
    './PartBrowser/CodeEditorDecorator.PartBrowserWidget'
], function (DecoratorBase, CodeEditorDecoratorDiagramDesignerWidget, CodeEditorDecoratorPartBrowserWidget) {

    'use strict';

    var CodeEditorDecorator,
        __parent__ = DecoratorBase,
        __parent_proto__ = DecoratorBase.prototype,
        DECORATOR_ID = 'CodeEditorDecorator';

    CodeEditorDecorator = function (params) {
        var opts = _.extend({loggerName: this.DECORATORID}, params);

        __parent__.apply(this, [opts]);

        this.logger.debug('CodeEditorDecorator ctor');
    };

    _.extend(CodeEditorDecorator.prototype, __parent_proto__);
    CodeEditorDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DecoratorBase MEMBERS **************************/

    CodeEditorDecorator.prototype.initializeSupportedWidgetMap = function () {
        this.supportedWidgetMap = {
            DiagramDesigner: CodeEditorDecoratorDiagramDesignerWidget,
            PartBrowser: CodeEditorDecoratorPartBrowserWidget
        };
    };

    return CodeEditorDecorator;
});
