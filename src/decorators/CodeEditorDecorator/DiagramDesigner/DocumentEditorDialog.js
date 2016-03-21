/**
 * @author Qishen Zhang  https://github.com/VictorCoder123
 */

define(['js/util',
	'rosmod/Libs/cm/lib/codemirror', 'rosmod/Libs/cm/mode/clike/clike',
	'rosmod/Libs/cm/keymap/emacs', 'rosmod/Libs/cm/keymap/sublime', 'rosmod/Libs/cm/keymap/vim',
	'rosmod/Libs/cm/addon/display/fullscreen',
	'text!./DocumentEditorDialog.html',
	'css!./DocumentEditorDialog.css',
	'css!rosmod/Libs/cm/addon/display/fullscreen.css',
	'css!rosmod/Libs/cm/theme/night.css',
	'css!rosmod/Libs/cm/lib/codemirror.css'],
    function(Util,
             CodeMirror,
	     CodeMirrorModeClike,
	     CodeMirrorEmacsKeymap, CodeMirrorSublimeKeymap, CodeMirrorVimKeymap,
	     CodeMirrorFullScreen,
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

	    this._title = this._dialog.find('#title').first();
	    this._codearea = this._dialog.find('#codearea').first();

	    var CodeMirrorEditorOptions = {
		lineNumbers: true,
		matchBrackets: true,
		viewPortMargin: Infinity,
		keyMap: 'emacs',
		path: 'rosmod/Libs/cm/lib/',
		theme: 'night',
		fullscreen: false,
		mode: {name:'text/x-c++src', useCPP:true}
	    };
	    this.editor = new CodeMirror.fromTextArea(
		this._codearea.get(0),
		CodeMirrorEditorOptions
	    );
	    this.editor.setOption("extraKeys", {
		'F11': function(cm) {
		    cm.setOption('fullScreen', !cm.getOption('fullScreen'));
		},
		'Esc': function(cm) {
		    cm.setOption('fullScreen', false);
		}
	    });

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

	    //this._title.find('#title').text(title);
	    this._title.text(title);

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
