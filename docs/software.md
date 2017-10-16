# Software

The `software model` contains all the information required to generate and compile the software for the project.  Because ROSMOD is an extension of [ROS](http://www.ros.org), software is organized by `Packages`, which are `ROS` applications that contain executable code, as well as _message_ and _service_ definitions.  We have extended and formalized these concepts (described in the documentation for a `Package`) and have included information related to required `System Libraries` or `Source Libraries`.  These libraries are defined in the software model and include relevant attributes required for compilation (e.g. `link libraries` or `include directories`).

Contains:
1. Packages
2. Source Libraries
3. System Libraries
4. Documentation

## Documentation Style Guide

For a Software-level documentation block use the following headers in order to generate consistent and flowing documentation.

```no-highlight
# Software
## Overview
### Goal(s)
### Design Requirements
## Packages
## Libraries Used
```