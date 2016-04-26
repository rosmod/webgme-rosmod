Node
====

A node can contain any number of **Instances** of ``Components`` defined
in the ``Software`` model. A node also has a **Priority** attribute
which specifies the linux scheduling priority of the node's process,
respectively.

    NOTE:: To create a ``Component`` *Instance*, you **never** drag from
    the ``Part Browser``, but must instead drag and drop a ``Component``
    from this project's ``Software`` model into the canvas and select
    ``Create Instance Here``.

By creating ``Component Instances`` in this way, the user can go into a
Component Instance and change attributes, e.g. a ``Timer``'s **Period**
or **Priority**, which will not require a code re-compilation. Further,
any changes made to the original component in the software model will
automatically propagate to any ``Component Instances`` that have been
created from it. Any changes made to the instance will *override* the
original component's properties, but will not affect the original
component or any other component instances. To make such changes to
timer or other port properties, simply double click on the newly created
**instance** and select the relevant port, after which you may edit its
attributes. Once an attribute has been over-ridden, any changes made to
the original port attribute or component attribute will not reflect in
the instance.

Similarly, the component instance's ``User Configuration`` attribute can
be over-ridden here to provide instance-specific configuration
parameters, which are more powerful, complex configuration data than
command line arguments (see the ``Component`` documentation in the
``Software``).

Finally, each ``Component Instance`` corresponds to a separate thread of
the ``Node``'s process.

.. toctree::
    :includehidden:
    :maxdepth: 2

    introduction_to_rosmod_v_0_s_6_q_P_P
    introduction_to_rosmod_v_0_s_6_q_P_K
    introduction_to_rosmod_v_0_s_6_q_P_R
