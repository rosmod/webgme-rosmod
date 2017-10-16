# Package


A ROSMOD package contains the definitions for its associated `Messages` and `Services`, which follow the [ROS](http://www.ros.org) definitions, as well as the definitions for ROSMOD `Components`.

**Note**: a `Package` must have a valid `c++` name, of the form: `[a-zA-Z_][a-zA-Z0-9_]+`, e.g. `package_1`, `Package2`, etc.

Contains:
1. Components
2. Messages
3. Services
4. Documentation

## Documentation Style Guide

For a package-level documentation block use the following headers in order to generate consistent and flowing documentation.

```no-highlight
# [Package Name]
## Overview
## Libraries
```
