# ROSMOD Project

[ROSMOD](http://github.com/rosmod) is an extension and formalization of [ROS](http://www.ros.org) which extends the scheduling layer, formalizes a component model with proper execution semantics, and adds modeling of software and systems for a full tool-suite according to model-driven engineering.

When developing models using ROSMOD, the top-level entity is a ROSMOD `Project`, which is a self-contained collection of

* Software
* Systems
* Deployments
* Experiments

These collections act as folders to categorize and separate the many different model objects by their associated modeling concept.  In this way, the software defined for a project can be kept completely separate from any of the systems on which the software may run.  Similarly, the different ways the software may be instantiated and collocated at run-time is separated into specific deployments which are independent of the hardware model and to some degree the software model.

## Project Creation

To create a new project, you can either drag and drop a `Project` object from the `Part Browser` into the canvas when viewing the `Projects` _root node_ or you can right click on the `Projects` _root node_ of the `Tree Browser` and create a new child of type `Project`.  Please note that you cannot drag a `Documentation` object into the `Projects` canvas to create a documentation object and that if you choose to create a `Documentation` object inside the `Projects` _root node_ it will not be displayed in the `RootViz` visualizer which shows all the Projects and will not be included in any of the generated documentation.

## Project Attributes

Each project has special `Code Documentation` attributes: `Authors`, `Brief Description`, and `Detailed Description`, which are best edited by clicking on the `CodeEditor` visualizer.  This visualizer fills the canvas with a [CodeMirror](http://www.codemirror.net) instance which allows the user to easily edit multi-line strings with: 

* automatic saving when changes are made
* undo/redo
* syntax highlighting
* code completion, activated with `ctrl+space`
* code folding, using the _gutter_ buttons or `ctrl+q` on the top of the code to be folded (e.g. start of an `if` block)

while allowing the user to configure (using drop-down menus):

* the currently viewed/edited **attribute**
* the current **color theme** of the code editor
* the current **keybindings** associated with the code editor (supported keybindings are `sublime`, `emacs`, and `vim`)

The `CodeEditor` visualizer is used in many places throughout the UI; any object that has attributes which support editing using the `CodeEditor` will display the `CodeEditor` as a selection in the visualizers list in the `Visualizer Panel`.

## Project Plugins

While viewing a project, the user can run the following plugins: 

* **SoftwareGenerator**: for generating and optionally compiling the `software` defined for the project according to the `host architectures` defined in the `system models` of the project.
* **GenerateDocumenation**: aggregates all the `Documentation` objects in the project's tree, converts them to `ReStructuredText` and compiles them into `html` and `pdf`.
* **TimingAnalysis**: generates a `Colored Petri-Net` model for performing timing analysis on the `deployments` (software instanced on _abstract_ hardware)