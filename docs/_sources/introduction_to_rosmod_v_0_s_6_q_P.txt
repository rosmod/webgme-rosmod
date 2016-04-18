Node
====

A node can contain any number of **Instances** of ``Components`` defined
in the ``Software`` model. A node also has **CMDLine** and **Priority**
attributes which specify the command line string that will be passed to
the process upon execution and the linux scheduling priority of the
node's process, respectively.

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
component or any other component instances.

Finally, each ``Component Instance`` corresponds to a separate thread of
the ``Node``'s process.

.. toctree::
    :includehidden:
    :maxdepth: 2

    introduction_to_rosmod_v_0_s_6_q_P_K
    introduction_to_rosmod_v_0_s_6_q_P_P
