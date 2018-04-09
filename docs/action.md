# Action

Actions contain a `Definition` attribute (editable using a
[CodeMirror](http://codemirror.net) dialog).  This definition
attribute conforms to the [Actionlib .action file
specificiation](http://wiki.ros.org/actionlib) (which contains
sub-parts that must conform to the [ROS Message Description
Specification](http://wiki.ros.org/msg)).  Actions allow components to
interact using `Action Clients` and `Action Servers`, through a
_non-blocking_, _one-to-one_ asynchronous method invocation (AMI)
interaction pattern.  Non-blocking means that when a component calls `sendGoal()` on its `Action Client`, the call returns immediately, without waiting
for the `Action Server` to acknowledge that it has received the
goal. The `Action Client` will be notified asynchronously when:

1. The goal has been accepted
2. The `Action Server` is tracking the goal
3. The `Action Server` has provided some feedback to the `Action Client` about its status, and
4. The `Action Server` has finished executing the goal

The `Definition` is edited using the `CodeEditor` visualizer, as
described in the beginning of this sample's documentation.  Since an
`Action` has no other valid visualizers, when you double-click on an
action, it will automatically open into its definition to be
viewed/edited using the `CodeEditor` visualizer.
