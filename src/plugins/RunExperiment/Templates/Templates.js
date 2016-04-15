/* Generated file based on ejs templates */
define([], function() {
    return {
    "node.xml.ejs": "<?xml version=\"1.0\"?>\n<node name=\"<%- nodeInfo.name %>\">\n  <priority setting=\"<%- nodeInfo.Priority %>\"/>\n<% \nif (nodeInfo.Component_list) {\nnodeInfo.Component_list.map(function(comp) {\n-%>\n  <component_instance name=\"<%- comp.name %>\">\n    <library name=\"lib<%- comp.base.name %>.so\"/>\n    <scheduling_scheme setting=\"<%- comp.SchedulingScheme %>\"/>\n    <numCompsToSync setting=\"1\"/>\n    <syncTimeout setting=\"0.0\"/>\n    <logging>\n      <is_periodic_logging setting=\"<%- comp.EnableLogging ? \"True\" : \"False\" %>\"/>\n      <periodic_log_unit setting=\"<%- comp.LoggingUnit %>\"/>\n    </logging>    \n  </component_instance>\n<% \n});\n}\n-%>\n</node>\n"
}});