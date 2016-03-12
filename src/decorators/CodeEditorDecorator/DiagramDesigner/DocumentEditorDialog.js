/**
 * @author Qishen Zhang  https://github.com/VictorCoder123
 */

define(['js/util',
	'../Libs/cm/lib/codemirror', '../Libs/cm/mode/clike/clike',
	'../Libs/cm/keymap/emacs', '../Libs/cm/keymap/sublime', '../Libs/cm/keymap/vim',
	'text!./DocumentEditorDialog.html',
	'css!./DocumentEditorDialog.css',
	'css!../Libs/cm/lib/codemirror.css'],
    function(Util,
             CodeMirror,
	     CodeMirrorModeClike,
	     CodeMirrorEmacsKeymap, CodeMirrorSublimeKeymap, CodeMirrorVimKeymap,
             DocumentEditorDialogTemplate){
        'use strict';
	
        var DocumentEditorDialog;

        /**
         * DocumentEditorDialog Constructor
         * Insert dialog modal into body and initialize editor with
         * customized options
         */
        DocumentEditorDialog = function () {
            // Get Modal Template node for Editor Dialog and append it to body
            this._dialog = $(DocumentEditorDialogTemplate);
            this._dialog.appendTo($(document.body));

            // Get element nodes
            this._el = this._dialog.find('.modal-body').first();
            this._btnSave = this._dialog.find('.btn-save').first();

	    this._title = this._dialog.find('.modal-header').first();
	    this._codearea = this._dialog.find('#codearea').first();

	    var CodeMirrorEditorOptions = {
		lineNumbers: true,
		viewPortMargin: Infinity,
		keyMap: "emacs",
		path: 'decorators/DocumentEditorDialog/Libs/cm/lib/',
		mode: {
		    name: 'clike',
		    keywords: {
			int8: 'int8',
			int16: 'int16',
			int32: 'int32',
			int64: 'int64',
			uint8: 'uint8',
			uint16: 'uint16',
			uint32: 'uint32',
			uint64: 'uint64',
			bool: 'bool',
			float32: 'float32',
			float64: 'float64',
			string: 'string',
			time: 'time',
			duration: 'duration'
		    },
		    useCPP: true
		}
	    };
	    this.editor = new CodeMirror.fromTextArea(
		this._codearea.get(0),
		CodeMirrorEditorOptions
	    );

            this.text = ''; // Keep track modified text in editor
        };

        /**
         * Initialize DocumentEditorDialog by creating EpicEditor in Bootstrap modal
         * window and set event listeners on its subcomponents like save button. Notice
         * EpicEditor is created but not loaded yet. The creation and loading of editor
         * are seperated due to the reason decorator component is not appended to DOM within
         * its own domain.
         * @param  {String}     text           Text to be rendered in editor initially
         * @param  {Function}   saveCallback   Callback function after click save button
         * @return {void}
         */
        DocumentEditorDialog.prototype.initialize = function (title, text, saveCallback) {
            var self = this;
            this.text = text; // Initial text from Attribute documentation

            // Initialize Modal and append it to main DOM
            this._dialog.modal({ show: false});

	    this._title.find('#title').text(title);

            // Event listener on click for SAVE button
            this._btnSave.on('click', function (event) {
                // Invoke callback to deal with modified text, like save it in client.
                if (saveCallback) {
                    saveCallback.call(null, self.editor.getValue());
                }

                // Close dialog
                self._dialog.modal('hide');
                event.stopPropagation();
                event.preventDefault();
            });

            // Listener on event when dialog is shown
            // Use callback to show editor after Modal window is shown.
            this._dialog.on('shown.bs.modal', function () {
                // Render text from params into Editor and store it in local storage
		self.editor.setValue(self.text);
		self.editor.markText({line: -1, 
				      ch: 0}, 
				     {line: 2,
				      ch: 0}, 
				     {readOnly: true} 
				  );
		self.editor.markText({line: 3, 
				      ch: 0}, 
				     {line: 4,
				      ch: 0}, 
				     {readOnly: true} 
				  );
		self.editor.refresh();
            });

            // Listener on event when dialog is hidden
            this._dialog.on('hidden.bs.modal', function () {
                self._dialog.empty();
                self._dialog.remove();
            });
        };

        /**
         * Update text in editor area
         * @param  {String} newtext [new text to replace old one]
         */
        DocumentEditorDialog.prototype.updateText = function (newtext) {
            this.text = newtext;
        };

        /**
         * Show actual text editor in its container by loading EpicEditor, this method
         * must be put into listener's callback function because its container is not appended
         * into DOM at this point and load() cannot access other DOM elements.
         * @return {void}
         */
        DocumentEditorDialog.prototype.show = function () {
            var self = this;
            self._dialog.modal('show');
        };

        return DocumentEditorDialog;
});
