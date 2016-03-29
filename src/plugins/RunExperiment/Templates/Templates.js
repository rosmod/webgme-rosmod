/* Generated file based on ejs templates */
define([], function() {
    return {
    "node.xml.ejs": "<?xml version=\"1.0\"?>\n<node name=\"<%- nodeInfo.name %>\">\n  <priority setting=\"<%- nodeInfo.priority %>\"/>\n<% for (var c in nodeInfo.compInstances) {\n     var ci = nodeInfo.compInstances[c]; -%>\n  <component_instance name=\"<%- ci.name %>\">\n    <library name=\"lib<%- ci.component.name %>.so\"/>\n    <scheduling_scheme setting=\"<%- ci.schedulingScheme %>\"/>\n    <numCompsToSync setting=\"1\"/>\n    <syncTimeout setting=\"0.0\"/>\n    <logging>\n      <is_periodic_logging setting=\"True\"/>\n      <periodic_log_unit setting=\"<%- ci.loggingUnit %>\"/>\n    </logging>    \n  </component_instance>\n<% \n   } \n-%>\n</node>\n"
}});