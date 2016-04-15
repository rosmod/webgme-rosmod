Hosts
=====

Hosts can have two types of children: ``Interfaces`` and
``Capabilities``. The attributes of ``Hosts`` are described in the
section regarding ``System`` models.

Interfaces
----------

Interfaces are used to specify the network interfaces available on the
host. Each interface only has a **name**, e.g. ``eth0``, specifying the
network interface as it would be seen on the actual hardware, for
instance by running ``ifconfig`` in *linux*.

Capabilities
------------

Capabilities are the corresponding object to ``Constraints``, which are
contained by ``Components``. A ``Capability`` corresponds to some
provision that the ``Host`` has that the software may need, for instance
``hasCamera``, or ``hasGPIO``. Components which have the correspondingly
named ``Constraint`` can only be mapped during deployment/execution to
hosts which have ``Capabilities`` of the same name. Note that
``Capabilities`` need not be unique within or between hosts.

.. toctree::
    :includehidden:
    :maxdepth: 2

    _v_0_g_X_8_8
    _v_0_g_X_8_B
    _v_0_g_X_8_M
    _v_0_g_X_8_G
