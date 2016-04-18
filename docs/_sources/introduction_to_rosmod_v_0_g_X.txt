System
======

In a ``System`` model, you define ``Hosts``, ``Users``, ``Networks``,
and ``Links``:

Hosts
-----

The ``Hosts`` which are computers with a specified **OS**,
**Architecture**, **Device ID**, and **Device ID Command**. The **Device
ID** allows the user to delineate between two different devices (e.g. a
BeagleBone Black and an NVIDIA Jetson TK1) which may have the same
*Architecture* (e.g. ``armv7l``), but may need to be separated for
binary/library incompatibility. Because these devices may have different
subsystems, we allow the user to specify the **Device ID Command** which
is run on the host and should return a string containing the specified
*Device ID*. Hosts can have any number of ``Interface`` *children*,
which are displayed as ``ports`` on the ``Host``.

Users
-----

The ``Users`` which have an associated **SSH Key** location and
**Directory**. The user's **Directory** is where any processes started
during experiment deployment or compilation on behalf of the user will
be run and where any artifacts will be generated.

Networks
--------

A Network defines the **Subnet** of IP addresses available as well as
the **Netmask** which, together with the **Subnet** defines the range of
available IP addresses.

Links
-----

Links connect a *hosts* ``Interface`` to a ``Network`` and has an
associated **IP** address that the interface will have on that network.
The user can create links and assign the IP addresses by clicking and
dragging from the host's interface to a network. The IP address is
displayed on the link and can be edited by clicking on the Link and
editing its IP property in the ``Property Panel``.

.. toctree::
    :includehidden:
    :maxdepth: 2

    introduction_to_rosmod_v_0_g_X_0
    introduction_to_rosmod_v_0_g_X_8
    introduction_to_rosmod_v_0_g_X_U
    introduction_to_rosmod_v_0_g_X_Y
    introduction_to_rosmod_v_0_g_X_R
