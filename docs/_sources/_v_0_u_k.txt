Experiment
==========

An experiment maps a ``Deployment``'s abstract grouping of component
instances into processes and finally into ``Containers`` to ``Hosts``
from the selected ``System``.

RunExperiment Plugin
--------------------

The mapping and experiment deployment is performed automatically by the
``RunExperiment`` plugin based on which ``Hosts`` are reachable and not
busy (i.e. not running any other experiment or compilation processes)
from the selected system, and also ensures that the hosts satisfy all of
the constraints from all of the component instances in a container's
nodes. If there are not enough hosts for the number of containers or if
the constraints of the software cannot be satisfied by the available
hosts, the ``RunExperiment`` plugin informs the user, else the plugin
finishes the deployment and saves the mapping into the model for
reference and showing to the user.

StopExperiment Plugin
---------------------

If an experiment is currently running (based on the existence of model
objects corresponding to the mapping of containers to hosts), the
``StopExperiment`` plugin will stop all the associated experiment
processes and copy back all the components' generated logs. The logs are
saved onto the server file system and their contents are also copied
into attributes of an automatically created ``Results`` object, whose
name will be the current time at which the experiment finished. If the
user opens the ``Results`` object and selects the ``ResultsViz``
visualizer, any tracing logs that were recovered will be automatically
plotted in the canvas.

.. toctree::
    :includehidden:
    :maxdepth: 2

    _v_0_u_k_A
