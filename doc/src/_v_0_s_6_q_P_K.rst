Example Sender Component
========================

Inside the component, the user can define the interaction ports the
component supports (i.e. any ``publisher``, ``subscriber``, ``client``,
and ``server`` objects), by dragging and dropping them into the
component's canvas. The relevant ``Message`` or ``Service`` pointers for
these objects can be defined by either creating the port by dragging the
relevant ``Message`` or ``Service`` object from the ``Tree Browser``
into the canvas and selecting the appropriate port type from the pop-up
dialog or by dragging the ``Message`` or ``Service`` object onto the
relevant ``Pointer`` of the already created port. Alternatively, the
``Message`` or ``Service`` object can be dragged on to the port in the
canvas.

Timers
------

Inside this aspect is where the user can specify the c++ code that will
execute upon the expiry of the relevant ``timer``, or when relevant data
is received for a ``subscriber`` or ``server``. The attributes for the
ports and timers can be specified in this aspect as well. These
attributes include the ``period`` of the ``timer`` or the ``deadline``
of the subscriber operation, for instance.

Libraries
---------

Also inside this aspect is where the user can select the ``Set Editor``
visualizer, which allows the user to see or configure the *set* of
**Libraries** that the component requires for compilation/execution. The
user can drag a ``Source Library`` or ``System Library`` from the
``Tree Browser`` to into the ``Libraries`` Set Editor to add the library
as a requirement for the component.

Constraints
-----------

The user can drag in ``constraints`` from the ``Part Browser`` and name
them accordingly to specify that the component must be deployed onto a
``Host`` which has a ``Capability`` with a name that matches the
constraint's name.

Description
-----------

This component acts as an example for a time-triggered component, which
sends out a ``Message`` publish through its ``publisher`` and a
``Service`` request through its client every time its timer fires. The
code which shows the publishing and server request can be found in the
``Operation`` of the ``intro_sender_timer``.

.. toctree::
    :includehidden:
    :maxdepth: 2

    _v_0_s_6_q_P_K_r
    _v_0_s_6_q_P_K_I
    _v_0_s_6_q_P_K_x
    _v_0_s_6_q_P_K_N
