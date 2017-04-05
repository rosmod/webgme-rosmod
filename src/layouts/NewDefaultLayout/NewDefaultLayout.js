/*globals define, WebGMEGlobal, $ */
define([
    'lib/jquery/' + (DEBUG ? 'jquery.layout' : 'jquery.layout.min'),
    'js/logger',
    'text!./templates/NewDefaultLayout.html',
    'text!./NewDefaultLayoutConfig.json'
], function(
    _jQueryLayout,
    Logger,
    defaultLayoutTemplate,
    LayoutConfigJSON
) {
    'use strict';
    
    var CONFIG = JSON.parse(LayoutConfigJSON),
    SPACING_OPEN_TOUCH = 10,
    SPACING_CLOSED_TOUCH = 10,
    SPACING_OPEN_DESKTOP = 3,
    SPACING_CLOSED_DESKTOP = 6,
    SPACING_OPEN = WebGMEGlobal.SUPPORTS_TOUCH ? SPACING_OPEN_TOUCH : SPACING_OPEN_DESKTOP,
    SPACING_CLOSED = WebGMEGlobal.SUPPORTS_TOUCH ? SPACING_CLOSED_TOUCH : SPACING_CLOSED_DESKTOP,
    SIDE_PANEL_WIDTH = 202;

    var NewDefaultLayout = function(params) {
        this._logger = (params && params.logger) || Logger.create('gme:Layouts:NewDefaultLayout',
								  WebGMEGlobal.gmeConfig.client.log);

        this._config = CONFIG;
        ComponentSettings.resolveWithWebGMEGlobal(this._config, NewDefaultLayout.getComponentId());

        this.panels = this._config.panels;
        this._template = (params && params.template) || defaultLayoutTemplate;

        //this._body = null;
        //this._panelToContainer = {};
    };

    NewDefaultLayout.getName = function () {
        return 'NewDefaultLayout';
    };

    NewDefaultLayout.getVersion = function () {
        return '0.1.0';
    };

    NewDefaultLayout.getComponentId = function () {
        return 'NewDefaultLayout';
    };

    /**
     * Initialize the html page. This example is using the jQuery Layout plugin.
     *
     * @return {undefined}
     */
    NewDefaultLayout.prototype.init = function() {
        var self = this;

        this._body = $('body');
        this._body.html(this._template);

        this._westPanel = this._body.find('div.ui-layout-west');
        this._centerPanel = this._body.find('div.ui-layout-center');
        this._eastPanel = this._body.find('div.ui-layout-east');
        this._floatContainer = this._body.find('div.float');

        this._headerPanel = this._body.find('div.ui-layout-north');
        this._footerPanel = this._body.find('div.ui-layout-south');

        this._westPanels = [];
        this._eastPanels = [];

        this._canvas = null;
        this._east = null;
        this._body.layout({
            north: {
                closable: false,
                resizable: false,
                slidable: false,
                spacing_open: 0, //jshint ignore: line
                size: 64
            },
            south: {
                closable: false,
                resizable: false,
                slidable: false,
                spacing_open: 0, //jshint ignore: line
                size: 27        //has to match footer CSS settings (height + border)
            },
            east: {
                size: SIDE_PANEL_WIDTH,
                minSize: SIDE_PANEL_WIDTH,
                resizable: true,
                slidable: false,
                spacing_open: SPACING_OPEN, //jshint ignore: line
                spacing_closed: SPACING_CLOSED, //jshint ignore: line
                onresize: function (/*paneName, paneElement, paneState, paneOptions, layoutName*/) {
                    self._onEastResize();
                }
            }, 
	    west: {
                size: SIDE_PANEL_WIDTH,
                minSize: SIDE_PANEL_WIDTH,
                resizable: true,
                slidable: false,
                spacing_open: SPACING_OPEN, //jshint ignore: line
                spacing_closed: SPACING_CLOSED, //jshint ignore: line
                onresize: function (/*paneName, paneElement, paneState, paneOptions, layoutName*/) {
                    self._onWestResize();
                }
            },
            center: {
                onresize: function (/*paneName, paneElement, paneState, paneOptions, layoutName*/) {
                    self._onCenterResize();
                }
            }
        });
    };

    /**
     * Add a panel to a given container. This is defined in the corresponding
     * layout config JSON file.
     *
     * @param {Panel} panel
     * @param {String} container
     * @return {undefined}
     */
    NewDefaultLayout.prototype.addToContainer = function(panel, container) {
        if (container === 'header') {
            this._headerPanel.append(panel.$pEl);
        } else if (container === 'footer') {
            this._footerPanel.append(panel.$pEl);
        } else if (container === 'float') {
            this._floatContainer.append(panel.$pEl);
        } else if (container === 'west') {
            this._westPanel.append(panel.$pEl);
            this._westPanels.push(panel);
            this._onWestResize();
            return this._onWestResize;
        } else if (container === 'east') {
            this._eastPanel.append(panel.$pEl);
            this._eastPanels.push(panel);
            this._onEastResize();
        } else if (container === 'center') {
            this._centerPanel.append(panel.$pEl);
            this._canvas = panel;
            this._onCenterResize();
            return this._onCenterResize;
        }
    };

    /**
     * Remove the given panel from the views
     *
     * @param {Panel} panel
     * @return {undefined}
     */
    NewDefaultLayout.prototype.remove = function(panel) {
        if (this._eastPanels.indexOf(panel) > -1) {
	    var idx = this._eastPanels.indexOf(panel);
            this._eastPanels[idx].splice(idx, 1);
	    this._onCenterResize();
        } else if (this._westPanels.indexOf(panel) > -1) {
	    var idx = this._westPanels.indexOf(panel);
	    this._westPanels[idx].splice(idx, 1);
	    this._onCenterResize();
        } else if (this._canvas === panel) {
            this._centerPanel.empty();
        }
    };

    /**
     * Remove the current layout
     *
     * @return {undefined}
     */
    NewDefaultLayout.prototype.destroy = function() {
        this._body.empty();
    };

    // Resize handlers
    //
    // These are internally called and used by the example to provide a responsive
    // UI (even if it is simply scaling linearly here)
    NewDefaultLayout.prototype._onCenterResize = function() {
        if (this._canvas) {
            this._canvas.setSize(this._centerPanel.width(), this._centerPanel.height());
        }
    };

    NewDefaultLayout.prototype._onEastResize = function() {
	var len = this._eastPanels.length,
            w = this._eastPanel.width(),
            h = this._eastPanel.height(),
            pHeight = Math.floor(h / len),
            i;

        for (i = 0; i < len; i += 1) {
            this._eastPanels[i].setSize(w, pHeight);
        }

	/*
        //TODO: fix this
        //second widget takes all the available space
        if (len === 2) {
            h0 = this._westPanels[0].$pEl.outerHeight(true);
            this._westPanels[1].setSize(w, h - h0);
        }
	*/
    };

    NewDefaultLayout.prototype._onWestResize = function () {
        var len = this._westPanels.length,
        w = this._westPanel.width(),
        h = this._westPanel.height(),
        h0;

        //TODO: fix this
        //second widget takes all the available space
        if (len === 2) {
            h0 = this._westPanels[0].$pEl.outerHeight(true);
            this._westPanels[1].setSize(w, h - h0);
        }
    };

    return NewDefaultLayout;
});
