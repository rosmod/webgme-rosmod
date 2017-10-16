# Message

Messages contain a `definition` attribute (editable using a [CodeMirror](http://codemirror.net) dialog).  This definition attribute conforms to the [ROS Message Description Specification](http://wiki.ros.org/msg).  Messages allow components to interact using `Publishers` and `Subscribers`, through a _non-blocking_, _one-to-many_ publish/subscribe interaction pattern.  Non-blocking means that when a component publishes a message, the publish returns immediately, without waiting for any or all subscribers to acknowledge that they have received the message.

The `definition` is edited using the `CodeEditor` visualizer, as described in the beginning of this sample's documentation.  Since a `Message` has no other valid visualizers, when you double-click on a message, it will automatically open into its definition to be viewed/edited using the `CodeEditor` visualizer.
