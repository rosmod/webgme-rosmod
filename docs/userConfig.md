# User Configuration

`User Configuration` is a way of specifying the options passed to the component at run-time.  The configuration object will be stored as a (possibly nested) dictionary within the component's config, at `config["User Configuration"]`.  These data are used instead of command line arguments to allow the user to send complex/nested data structures as configuration to the component, allow multiple component (instance) within a process to be configured with different values for the same parameter, and to save developer time by automatically parsing these data into usable structures.  For example, given the following config:
```
{
  "logSensorData": true,
  "logPeriod": 0.1,
  "logFields": {
    "time": "float",
    "data": "int"
  }
  "sensorOffsets": [
    0.1,
    0.2,
    0.3
  ]
}
```
  The user could access the configuration structure using the following `c++` code anywhere within the component:
```
bool logData = config["User Configuration"]["logSensorData"].asBool();
float period = config["User Configuration"]["logPeriod"].asFloat();
std::string firstField = config["User Configuration"]["logFields"]["time"].asString(); 
std::string secondField = config["User Configuration"]["logFields"]["data"].asString(); 
float firstOffset = config["User Configuration"]["sensorOffsets"][0].asFloat(); 
float secondOffset = config["User Configuration"]["sensorOffsets"][1].asFloat();
```
  The documentation for the generated objects can be found at [jsoncpp](http://open-source-parsers.github.io/jsoncpp-docs/doxygen/), which is the library used to parse the `JSON`.