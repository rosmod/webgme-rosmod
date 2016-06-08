Experiments
===========

Experiments are deployable instances of software mapped to hardware. An
experiment contains a pointer to a ``Deployment`` and a pointer to a
``System``. In this way, the same conceptual grouping of component
instances into processes and containers can be easily redeployed onto a
different system by just swapping the experiment's ``System`` pointer.
The experiment will automatically ensure that the system's capabilities
satisfy the deployment's software's constraints.

.. toctree::
    :includehidden:
    :maxdepth: 2

    introduction_to_rosmod_v_0_u_Q
    introduction_to_rosmod_v_0_u_k
