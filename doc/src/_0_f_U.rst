Package
=======

A ROSMOD package contains the definitions for its associated
``Messages`` and ``Services``, which follow the
`ROS <http://www.ros.org>`__ definitions, as well as the definitions for
ROSMOD ``Components``.

Messages
~~~~~~~~

Messages contain a ``definition`` attribute (editable using a
`CodeMirror <http://codemirror.net>`__ dialog). This definition
attribute conforms to the `ROS Message Description
Specification <http://wiki.ros.org/msg>`__. Messages allow components to
interact using ``Publishers`` and ``Subscribers``, through a
*non-blocking*, *one-to-many* publish/subscribe interaction pattern.
Non-blocking means that when a component publishes a message, the
publish returns immediately, without waiting for any or all subscribers
to acknowledge that they have received the message.

Here is an example Message ``definition``:

::

    int32 X=123
    int32 Y=-123
    string FOO="this is a constant"
    string EXAMPLE="this is another constant"

Services
~~~~~~~~

Services contain a ``definition`` attribute (editable using a
`CodeMirror <http://codemirror.net>`__ dialog). This definition
attribute conforms to the `ROS Service Description
Specification <http://wiki.ros.org/srv>`__. Services allow components to
interact using ``Clients`` and ``Servers``, through a *blocking*,
*one-to-one* client/server interaction pattern. Blocking means that the
component that issues the client call to the server must wait and cannot
execute other code until it receives the response from the server.

Here is an example Service ``definition``:

::

    #request constants
    int8 FOO=1
    int8 BAR=2
    #request fields
    int8 foobar
    another_pkg/AnotherMessage msg
    ---
    #response constants
    uint32 SECRET=123456
    #response fields
    another_pkg/YetAnotherMessage val
    CustomMessageDefinedInThisPackage value
    uint32 an_integer

Components
~~~~~~~~~~

Components are single threaded actors which communicate with other
components using the publish/subscribe and client/server interaction
patterns. These interactions trigger operations to fire in the
components, where the operation is a function implemented by the user
inside the ``operation`` attribute of the relevant ``subscriber`` or
``server``. The component can also have timer operations which fire
either sporadically or periodically and similarly have an ``operation``
attribute in which the user specifies the c++ code to be run when the
operation executes. These operations happen serially through the
operation queue and are not preemptable by other operations of that
component. Inside these operations, ``publisher`` or ``client`` objects
can be used to trigger operations on components which have associated
and connected ``servers`` or ``subscribers``. These ``publisher``,
``subscriber``, ``client``, ``server``, and ``timer`` objects are added
by the user and defined inside the component.

Components contain ``forwards``, ``members``, ``definitions``,
``initialization``, and ``destruction`` attributes which provide an
interface for the user to add their own ``C++ code`` to the component.

``Forwards`` corresponds to code that comes *before the class
declaration* in the generated ``component header file``, e.g

::

    #include <stdio.h>

or user-created structure or class definitions.

``Members`` corresponds to *private members and methods* that the user
wishes to add to the component in the generated
``component header file``.

``Definitions`` corresponds to function definitions or other code that
the user wishes to add to the generated ``component source file``.

``Initialization`` corresponds to the code the user wishes to run when
the component starts up to initialize members to specific values or
begin the process of triggering other components in the system through
publish or client interactions.

Finally, ``Destruction`` allows the user to specify destruction of any
objects they have allocated on the heap that need to be manually
destructed during component destruction.

.. toctree::
    :includehidden:
    :maxdepth: 2

    _0_f_U_0
    _0_f_U_3
    _0_f_U_8
    _0_f_U_o
    _0_f_U_A
