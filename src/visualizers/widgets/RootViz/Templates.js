/* Generated file based on ejs templates */
define([], function() {
    return {
    "Project.html.ejs": "<div id=\"<%= id %>-node-panel\" class=\"root-viz-project-panel\">\n  <div class=\"panel-heading\">\n    <h3 class=\"panel-title\"><%= title %></h3>\n  </div>\n  <div class=\"panel-body\">\n    <div style=\"text-align:center;\">\n      <%- icon %>\n    </div>\n<% if (authors) { -%>\n    <div class=\"authors\"><b>Authors:</b> \n      <%= authors %>\n    </div>\n<% } -%>\n<% if (brief) { -%>\n    <div class=\"brief\"><b>Brief Description:</b> \n      <%= brief %>\n    </div>\n<% } -%>\n<% if (detailed) { -%>\n    <div class=\"description\"><b>Detailed Description:</b> \n      <%= detailed %>\n    </div>\n<% } -%>\n  </div>\n</div>\n"
}});