/* Generated file based on ejs templates */
define([], function() {
    return {
    "node.xml.ejs": "<?xml version=\"1.0\"?>\n<node name=\"Sensor_Node\">\n  <library name=\"libKRPCI.so\"/>\n  <component_instance name=\"sensor_i\">\n    <library name=\"libsensor.so\"/>\n    <scheduling_scheme setting=\"FIFO\"/>\n    <numCompsToSync setting=\"4\"/>\n    <syncTimeout setting=\"5.0\"/>\n    <logging>\n      <is_periodic_logging setting=\"True\"/>\n      <periodic_log_unit setting=\"1\"/> \n      <debug setting=\"True\"/>\n      <info setting=\"True\"/>\n      <warning setting=\"True\"/>\n      <error setting=\"True\"/>\n      <critical setting=\"True\"/>\n    </logging>\n  </component_instance>\n</node>\n"
}});