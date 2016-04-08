/**
 * @author Qishen Zhang  https://github.com/VictorCoder123
 */

define(['js/util',
	'rosmod/Libs/cm/lib/codemirror', 'rosmod/Libs/cm/mode/clike/clike',
	'rosmod/Libs/cm/keymap/emacs', 'rosmod/Libs/cm/keymap/sublime', 'rosmod/Libs/cm/keymap/vim',
	'rosmod/Libs/cm/addon/display/fullscreen',
	'rosmod/Libs/cm/addon/fold/foldcode',
	'rosmod/Libs/cm/addon/fold/foldgutter',
	'rosmod/Libs/cm/addon/fold/brace-fold',
	'rosmod/Libs/cm/addon/fold/xml-fold',
	'rosmod/Libs/cm/addon/fold/markdown-fold',
	'rosmod/Libs/cm/addon/fold/comment-fold',
	'text!./DocumentEditorDialog.html',
	'css!./DocumentEditorDialog.css',
	'css!rosmod/Libs/cm/addon/display/fullscreen.css',
	'css!rosmod/Libs/cm/theme/night.css',
	'css!rosmod/Libs/cm/lib/codemirror.css',
	'css!rosmod/Libs/cm/theme/3024-day.css',
	'css!rosmod/Libs/cm/theme/3024-night.css',
	'css!rosmod/Libs/cm/theme/abcdef.css',
	'css!rosmod/Libs/cm/theme/ambiance.css',
	'css!rosmod/Libs/cm/theme/base16-dark.css',
	'css!rosmod/Libs/cm/theme/bespin.css',
	'css!rosmod/Libs/cm/theme/base16-light.css',
	'css!rosmod/Libs/cm/theme/blackboard.css',
	'css!rosmod/Libs/cm/theme/cobalt.css',
	'css!rosmod/Libs/cm/theme/colorforth.css',
	'css!rosmod/Libs/cm/theme/dracula.css',
	'css!rosmod/Libs/cm/theme/eclipse.css',
	'css!rosmod/Libs/cm/theme/elegant.css',
	'css!rosmod/Libs/cm/theme/erlang-dark.css',
	'css!rosmod/Libs/cm/theme/hopscotch.css',
	'css!rosmod/Libs/cm/theme/icecoder.css',
	'css!rosmod/Libs/cm/theme/isotope.css',
	'css!rosmod/Libs/cm/theme/lesser-dark.css',
	'css!rosmod/Libs/cm/theme/liquibyte.css',
	'css!rosmod/Libs/cm/theme/material.css',
	'css!rosmod/Libs/cm/theme/mbo.css',
	'css!rosmod/Libs/cm/theme/mdn-like.css',
	'css!rosmod/Libs/cm/theme/midnight.css',
	'css!rosmod/Libs/cm/theme/monokai.css',
	'css!rosmod/Libs/cm/theme/neat.css',
	'css!rosmod/Libs/cm/theme/neo.css',
	'css!rosmod/Libs/cm/theme/night.css',
	'css!rosmod/Libs/cm/theme/paraiso-dark.css',
	'css!rosmod/Libs/cm/theme/paraiso-light.css',
	'css!rosmod/Libs/cm/theme/pastel-on-dark.css',
	'css!rosmod/Libs/cm/theme/railscasts.css',
	'css!rosmod/Libs/cm/theme/rubyblue.css',
	'css!rosmod/Libs/cm/theme/seti.css',
	'css!rosmod/Libs/cm/theme/solarized.css',
	'css!rosmod/Libs/cm/theme/the-matrix.css',
	'css!rosmod/Libs/cm/theme/tomorrow-night-bright.css',
	'css!rosmod/Libs/cm/theme/tomorrow-night-eighties.css',
	'css!rosmod/Libs/cm/theme/ttcn.css',
	'css!rosmod/Libs/cm/theme/twilight.css',
	'css!rosmod/Libs/cm/theme/vibrant-ink.css',
	'css!rosmod/Libs/cm/theme/xq-dark.css',
	'css!rosmod/Libs/cm/theme/xq-light.css',
	'css!rosmod/Libs/cm/theme/yeti.css',
	'css!rosmod/Libs/cm/theme/zenburn.css',
	'css!rosmod/Libs/cm/addon/fold/foldgutter'],
    function(Util,
             CodeMirror,
	     CodeMirrorModeClike,
	     CodeMirrorEmacsKeymap, CodeMirrorSublimeKeymap, CodeMirrorVimKeymap,
	     CodeMirrorFullScreen, CodeMirrorFoldCode, CodeMirrorFoldGutter,
	     CodeMirrorBraceFold, CodeMirrorXMLFold, CodeMirrorMarkdownFold, 
	     CodeMirrorCommentFold,
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
		keyMap: 'sublime',
		path: 'rosmod/Libs/cm/lib/',
		theme: 'default',
		fullscreen: false,
		mode: {name:'text/x-c++src', useCPP:true},
		foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
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
		},
		"Ctrl-Q": function(cm){ 
		    cm.foldCode(cm.getCursor()); 
		}
	    });

	    this.editor.foldCode(CodeMirror.Pos(0, 0));

	    // THEME SELECT
	    var editor = this.editor;
	    var input = document.getElementById("theme_select");
	    $(input).on('change', selectTheme);
	    function selectTheme() {
		var theme = input.options[input.selectedIndex].textContent;
		editor.setOption("theme", theme);
		location.hash = "#" + theme;
	    }
	    var choice = (location.hash && location.hash.slice(1)) ||
		(document.location.search &&
		 decodeURIComponent(document.location.search.slice(1)));
	    var kbs = ["emacs", "sublime", "vim"];
	    if (choice) {
		if (kbs.indexOf(choice) < 0) {
		    input.value = choice;
		    editor.setOption("theme", choice);
		}
	    }
	    CodeMirror.on(window, "hashchange", function() {
		var theme = location.hash.slice(1);
		var kbs = ["emacs", "sublime", "vim"];
		if (theme && kbs.indexOf(theme) < 0) { 
		    input.value = theme; selectTheme(); 
		}
	    });

	    // KEY MAP SELECTION
	    var kb_input = document.getElementById("binding_select");
	    $(kb_input).on('change', selectKeyBinding);
	    function selectKeyBinding() {
		var binding = kb_input.options[kb_input.selectedIndex].textContent;
		editor.setOption("keyMap", binding);
		location.hash = "#" + binding;
	    }
	    var binding = (location.hash && location.hash.slice(1)) ||
		(document.location.search &&
		 decodeURIComponent(document.location.search.slice(1)));
	    if (binding && kbs.indexOf(binding) > -1) {
		kb_input.value = binding;
		editor.setOption("keyMap", binding);
	    }
	    CodeMirror.on(window, "hashchange", function() {
		var binding = location.hash.slice(1);
		var kbs = ["emacs", "sublime", "vim"];
		if (binding && kbs.indexOf(binding) > -1) {
		    kb_input.value = binding; selectKeyBinding(); 
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
