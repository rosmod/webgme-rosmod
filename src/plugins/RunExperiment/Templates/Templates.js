/* Generated file based on ejs templates */
define([], function() {
    return {
    "node.xml.ejs": "<?xml version=\"1.0\"?>\n<node name=\"<%- nodeInfo.name -%>\">\n<% for (var l in nodeInfo.requiredLibs) {  -%>\n<%   var lib = nodeInfo.requiredLibs[l]; -%>\n  <library name=\"lib<%- lib.name -%>.so\"/>\n<% } -%>\n<% for (var c in nodeInfo.compInstances) {  -%>\n<%   var ci = nodeInfo.compInstances[c]; -%>\n  <component_instance name=\"<%- ci.name -%>\">\n    <library name=\"lib<%- ci.component.name -%>.so\"/>\n    <scheduling_scheme setting=\"<%- ci.schedulingScheme -%>\"/>\n  </component_instance>\n<% } -%>\n</node>\n"
}});