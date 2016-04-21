.. _intro:

Introduction to ROSMOD
======================

WebGME Usage
------------

WebGME provides the base of the user-interface front-end, as well as the
model storage, versioning, and management infrastructure which allows
the creation and invocation of plugins which act on parts of the created
models.

The main view aspect of WebGME modeling is split into three panels,
arranged horizontally with each other into left, center, and right
panels. The center panel is the main view for the currently selected
model object; and the left and right panels can be optionally hidden by
using the mouse and dragging/clicking their hide function or by using
``ctrl+right`` (to toggle the display of the right panel) or
``ctrl+left`` (to toggle the display of the left panel).

Visualizer Selection and Part Browser
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The left panel is composed of two sub-panels (arranged vertically): the
``Visualizer Selection`` panel and the ``Part Browser`` panel. The
``Visualizer Selection`` panel allows the user to select between the
available visualizations of the currently selected model object. This
visualization affects the content and interaction of the center portion
of the UI. The ``Part Browser`` panel displays the object types which
can be created as children of the currently selected model object.
Creation of objects can be achieved by dragging from the
``Part Browser`` panel into the center panel.

Active Object Visualization
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The center panel displays selected visualization of the currently
selected model object. The default visualization displays the children
of the currently selected model object, and allows drag-and-drop from
the ``Part Browser`` or ``Tree Browser`` into the center panel for
creation (from part browser) or move/instance/copy (from the tree
browser).

Tree Browser and Attribute Editor
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The right panel is composed of two sub-panels (arranged vertically): the
``Tree Browser`` panel and the ``Attribute Editor`` panel. The
``Tree Browser`` panel allows the navigation of all the projects in the
current model and all of their children objects in a tree. It also
supports group selection, movement, copying, deletion, and drag/drop to
other panels (for instance the ``Attribute Editor`` or the center
panel). The ``Attribute Editor`` panel allows the editing of the
currently selected model object's *Attributes* and *Pointers*. Since
pointers are references to other model objects, the user can drag an
object from the ``Tree Browser`` onto a pointer of the selected model
object to set that pointer. Note that the drop action will check to
ensure that the object to which the pointer is being set belongs to the
types of objects that are valid for that pointer to point to. If the
object is of the correct type, the pointer will be set and it will show
green while hovering over it; otherwise the pointer will show red and
will not update the value.

Constraints
~~~~~~~~~~~

In the upper left of the UI, WebGME provides the utility to check the
``constraints`` defined in the ``meta``. These constraints can be
checked for just the currently selected model object, the selected model
object and all its children, or the whole project. Upon completion it
returns a form which specifies any constraints (e.g. containment
cardinality) that have been violated and provides links to the offending
objects.

Plugins
~~~~~~~

Finally, WebGME provides the infrastructure for executing ``Plugins``,
which can create, edit, or delete model objects in addition to creating
and returning artifacts based on the model. Additionally, these plugins
can spawn off other tasks (e.g. compilation).

Plugins can run on either the server or within the client browser,
though not all plugins support execution on both of these platforms.
When executing the plugin, the user will be presented with a dialog to
specify the configuration of the plugin which may contain many fields of
different types and may even ask the user to upload a file of a specific
type (depending on the purpose of the plugin).

When the plugin has been configured and the user starts it, it begins
execution and the user is free to continue interacting with and possibly
editing the model.

While the plugin is executing, it may produce notifications (view-able
in the bottom right) as a list that is clear-able; each notification
received shows as a popup temporarily but is also saved into the list.
The list is view-able by clicking on the ``Notifications`` button.

When the plugin completes (possibly terminating due to an error), the
user is notified and may view the results of the plugin. The results are
presented as messages and optionally some downloadable artifacts. Note
that a plugin may have also altered the model (adding, removing, or
editing).

ROSMOD Project
--------------

`ROSMOD <http://github.com/rosmod>`__ is an extension and formalization
of `ROS <http://www.ros.org>`__ which extends the scheduling layer,
formalizes a component model with proper execution semantics, and adds
modeling of software and systems for a full tool-suite according to
model-driven engineering.

When developing models using ROSMOD, the top-level entity is a ROSMOD
``Project``, which is a self-contained collection of

-  Software
-  Systems
-  Deployments
-  Experiments

These collections act as folders to categorize and separate the many
different model objects by their associated modeling concept. In this
way, the software defined for a project can be kept completely separate
from any of the systems on which the software may run. Similarly, the
different ways the software may be instantiated and collocated at
run-time is separated into specific deployments which are independent of
the hardware model and to some degree the software model.

Project Creation
~~~~~~~~~~~~~~~~

To create a new project, you can either drag and drop a ``Project``
object from the ``Part Browser`` into the canvas when viewing the
``Projects`` *root node* or you can right click on the ``Projects``
*root node* of the ``Tree Browser`` and create a new child of type
``Project``. Please note that you cannot drag a ``Documentation`` object
into the ``Projects`` canvas to create a documentation object and that
if you choose to create a ``Documentation`` object inside the
``Projects`` *root node* it will not be displayed in the ``RootViz``
visualizer which shows all the Projects and will not be included in any
of the generated documentation.

Project Attributes
~~~~~~~~~~~~~~~~~~

Each project has special ``Code Documentation`` attributes: ``Authors``,
``Brief Description``, and ``Detailed Description``, which are best
edited by clicking on the ``CodeEditor`` visualizer. This visualizer
fills the canvas with a `CodeMirror <http://www.codemirror.net>`__
instance which allows the user to easily edit multi-line strings with:

-  automatic saving when changes are made
-  undo/redo
-  syntax highlighting
-  code completion, activated with ``ctrl+space``
-  code folding, using the *gutter* buttons or ``ctrl+q`` on the top of
   the code to be folded (e.g. start of an ``if`` block)

while allowing the user to configure (using drop-down menus):

-  the currently viewed/edited **attribute**
-  the current **color theme** of the code editor
-  the current **keybindings** associated with the code editor
   (supported keybindings are ``sublime``, ``emacs``, and ``vim``)

The ``CodeEditor`` visualizer is used in many places throughout the UI;
any object that has attributes which support editing using the
``CodeEditor`` will display the ``CodeEditor`` as a selection in the
visualizers list in the ``Visualizer Panel``.

Project Plugins
~~~~~~~~~~~~~~~

While viewing a project, the user can run the following plugins:

-  **SoftwareGenerator**: for generating and optionally compiling the
   ``software`` defined for the project according to the
   ``host architectures`` defined in the ``system models`` of the
   project.

    **NOTE::** If you choose to download the software sources and
    compile them locally, you will need to run
    ``catkin_make -DNAMESPACE=ros`` to build against *stock ros*
    dependencies (in which case the operation **deadline**/**priority**
    settings and the **SchedulingScheme** of the component queue will
    not have any effect) or ``catkin_make -DNAMESPACE=rosmod`` to build
    with *rosmod* dependencies. In order to build with ``rosmod``
    dependencies, you will need to have
    `ROSMOD-COMM <https://github.com/rosmod/rosmod/tree/master/comm>`__
    installed.

    **NOTE::** When running a build on a project, the compilation is
    performed on one of each of the different *types* of ``hosts`` in
    the defined ``systems``. Because many of the samples support
    execution on the RCPS cluster of 32 *BeagleBone Blacks (BBB)*, a
    compilation process will be started on a BBB for the project if
    compilation is selected. Compilation on a BBB takes a long time
    (more than 5 minutes for a simple sample), so it is recommended that
    ``guests`` never issue a compilation request. By invoking the plugin
    without requesting compilation, the user will be able to download
    the most recently compiled binaries for that sample along with the
    code (they will be in the ``bin`` folder inside the returned
    compressed file).

-  **GenerateDocumenation**: aggregates all the ``Documentation``
   objects in the project's tree, converts them to ``ReStructuredText``
   and compiles them into ``html`` and ``pdf``.
-  **TimingAnalysis**: generates a ``Colored Petri-Net`` model for
   performing timing analysis on the ``deployments`` (software instanced
   on *abstract* hardware)

Saving/Exporting the Project
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Currently there are two ways to save/export and Load a ``Project`` or
sub-model (e.g. a ``System`` model).

The first way is to save a selected (sub-)tree of the WebGME model, by
right-clicking on the sub-tree's root (e.g. a ``System`` model) and
selecting ``Export Library``. This exported library can be shared among
WebGME models and organizations. To **load** a library saved in this
way, simply right-click on the ``parent`` node in the ``Tree Browser``
for which you want the library to be a child. Select
``Import/Update Library`` and choose the library file you like.

The second way is to go to the ``root`` of the WebGME model (i.e. the
``Projects`` node), and run the plugin ``ExportImport`` which will
provide you a dialog to configure what you wish to do.

.. toctree::
    :includehidden:
    :maxdepth: 2

    introduction_to_rosmod_v_0_g
    introduction_to_rosmod_v_0_R
    introduction_to_rosmod_v_0_f
    introduction_to_rosmod_v_0_s
    introduction_to_rosmod_v_0_u
