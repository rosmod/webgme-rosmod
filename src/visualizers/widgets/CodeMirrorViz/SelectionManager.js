define([
    'js/Widgets/DiagramDesigner/SelectionManager'
], function(
    GMESelectionManager
) {
    'use strict';
    var SelectionManager = function(params) {
        params.diagramDesigner = params.widget;
        GMESelectionManager.call(this, params);
    };

    _.extend(SelectionManager.prototype, GMESelectionManager.prototype);

    var VIEWER_BUTTON_BASE = $('<div/>', {
        class: 'code-mirror-viz s-btn inspect',
        command: 'inspect'
    });
    VIEWER_BUTTON_BASE.html('<i class="glyphicon glyphicon-cog"></i>');

    SelectionManager.prototype._renderSelectionActions = function() {
        // Call the base class
        GMESelectionManager.prototype._renderSelectionActions.call(this);

        // Remove the context menu button
        $('div').remove('.s-btn.contextmenu');

        if (this._selectedElements.length === 1) {
            // Add the inspect button
            var inspectBtn = VIEWER_BUTTON_BASE.clone();
            this._diagramDesigner.skinParts.$selectionOutline.append(inspectBtn);
        }
    };

    return SelectionManager;
});

