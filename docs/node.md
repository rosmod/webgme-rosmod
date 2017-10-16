# Node

This is a node. It represents an independent operating system process that will exist on a host at experiment run-time. Instantiate components inside here.

## Component Instantiation

Note that any changes made to component instances **will not** be reflected in the software model, but changes in the software model will be reflected in a component instance **as long as the instance's attribute has not been modified**

If an attribute of a component instance is modified, it can be reset to the original value of the software component by clearing the attribute in the property editor windown (lower right side of the screen).

## Documentation Style Guide

For a node-level documentation block use the following headers in order to generate consistent and flowing documentation.

```no-highlight
# [Node Name]
## Process Priority
## Component Instances

```