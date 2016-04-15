System
======

In a ``System`` model, you define:

-  The ``Hosts`` which are computers with a specified **OS**,
   **Architecture**, **Device ID**, and **Device ID Command**. The
   **Device ID** allows the user to delineate between two different
   devices (e.g. a BeagleBone Black and an NVIDIA Jetson TK1) which may
   have the same *Architecture* (e.g. ``armv7l``), but may need to be
   separated for binary/library incompatibility. Because these devices
   may have different subsystems, we allow the user to specify the
   **Device ID Command** which is run on the host and should return a
   string containing the specified *Device ID*.
-  The ``Users`` which have an associated **SSH Key** location and
   **Directory**. The user's **Directory** is where any processes
   started during experiment deployment or compilation on behalf of the
   user will be run and where any artifacts will be generated.
-  The ``Network`` which is a group containing a ``Network`` object, as
   well as ``Links`` from the network object to ``Interfaces`` on the
   ``Hosts``. When a ``Host`` has an ``Interface`` child, the
   ``Interface`` is displayed on the side of the host as a ``Port``. By
   clicking on this port and dragging to a ``Network`` object, the user
   can create a ``Link`` between the host's interface and the network.
   This link is visualized as a line which displays the assigned **IP
   address** that the interface will receive. The user can edit this ip
   address by clicking on the line and editing the ``IP`` property in
   the ``Property Editor``. All IP addresses of all interfaces of a host
   will be tested for connectivity.


.. toctree::
    :includehidden:
    :maxdepth: 2

    _0_g_X_0
    _0_g_X_8
    _0_g_X_U
    _0_g_X_Y
    _0_g_X_R
