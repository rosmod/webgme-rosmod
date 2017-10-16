# Component

Components are single threaded actors which communicate with other components using the publish/subscribe and client/server interaction patterns. These interactions trigger operations to fire in the components, where the operation is a function implemented by the user inside the `operation` attribute of the relevant `subscriber` or `server`.  The component can also have timer operations which fire either sporadically or periodically and similarly have an `operation` attribute in which the user specifies the c++ code to be run when the operation executes.  These operations happen serially through the operation queue and are not preemptable by other operations of that component.  Inside these operations, `publisher` or `client` objects can be used to trigger operations on components which have associated and connected `servers` or `subscribers`.  These `publisher`, `subscriber`, `client`, `server`, and `timer` objects are added by the user and defined inside the component.

Components contain `forwards`, `members`, `definitions`, `initialization`, and `destruction` attributes which provide an interface for the user to add their own `C++ code` to the component.

Additionally, components contain `User Configuration` and `User Artifacts` attributes. Note that both the `User Configuration` and `User Artifacts` can be overridden independently within any `Component Instance` in a `Deployment`.


## Documentation Style Guide

For a Component-level documentation block use the following headers in order to generate consistent and flowing documentation.

```no-highlight
# [Component Name Here]
## Purpose
## Inputs
## Outputs
## Timing
## User Configuration and Artifacts
## Libraries
```