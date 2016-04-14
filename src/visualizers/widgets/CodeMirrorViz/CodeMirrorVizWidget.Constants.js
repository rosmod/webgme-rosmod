
define([], function () {
    "use strict";

    //return string constants
    return {
        /*
         * TERRITORY EVENTS
         */
        SELF : "__SELF__",

        /*
         * CLASS DEFINITIONS
         */
        DESIGNER_ITEM_CLASS : "designer-item",
        DESIGNER_CONNECTION_CLASS: "netlabel-connection",
        NETLIST: "netlist",
        NETLIST_TITLE : "title",
        ADD_CONNECTION: "add-conn",
        DESIGNER_NETLABEL_CLASS : "netLabel",
        MAX_LABEL_NUMBER: 1,
        MAX_TEXT_WIDTH: 100,
        CONNECTION_DRAGGABLE_END_CLASS : "c-d-end",
        CONNECTOR_CLASS : "connector",
        CONNECTION_END_SRC : 'src',
        CONNECTION_END_DST : 'dst',
        CONNECTION_CONTAINER_SVG_CLASS : 'connection-container',
        HIGHLIGHT_MODE_CLASS: 'highlight-mode',
        SRCLABEL_HIGHLIGHT_CLASS: 'src-highlighted',
        DSTLABEL_HIGHLIGHT_CLASS: 'dst-highlighted',
        AUTOCOMPLETE_FOCUS_CLASS: "autocomplete-focus",
        HIGHLIGHT_CLASS: "highlighted",
        HOVER_CLASS: "hovered",
        SHOW_MODE: "show-mode",
        DROP_REGION_CLASS: 'drop-region',
        DROP_REGION_ACCEPT_DROPPABLE_CLASS: 'accept-droppable',
        DROP_REGION_REJECT_DROPPABLE_CLASS: 'reject-droppable',
        CONNECTION_TEXT_CLASS: 'c-text',

        /*DOM ELEMENT ATTRIBUTES*/
        DATA_ITEM_ID : 'data-oid',
        DATA_SUBCOMPONENT_ID : 'data-sid',

        /* Show connection as label attribute name*/
        SHOW_AS_LABEL: 'ShowAsLabel',

        /*
         * ROTATINO RESET CONSTANTS
         */
        ROTATION_RESET: 'reset',

        /* Netlabel class attributes */
        NETLIST_ID: 'id',
        CONNECTION_ID: 'connid'
    };
});
