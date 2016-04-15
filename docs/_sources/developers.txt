.. _developers:

Deploying ROSMOD
================

This page acts as a launchpad for diving into the different aspects of
the code, the interfaces provided by each submodule, and learning how
everything works behind the scenes.  It covers everything from how to
create meta-models, how to create domain-specific interfaces and
plugins based on those meta-models and provides some guide-lines for
such interfaces.

Pre-Requisites for Installation
-------------------------------

First and foremost, ROSMOD server's plugins require **Linux**, but if you wish to not run any of the compilation, deployment, or generation functions, you can run the server on any platform for which `node` and `mongodb` are available.

To run a ROSMOD WebGME server, you must have the following things installed:

* `node <nodejs.org>`_, version 4.X; 
.. note:: you **cannot** install *node* from `apt-get` as it is the wrong version
* `mongodb`: installable from `apt-get`
* `ROS`: installable according to the instructions at `<ros.org>`_
* `ROSMOD-COMM <github.com/rosmod/rosmod>`_ : installable according to the `comm` instructions
* `pandoc`: for documentation generation
* `sphinx`: for documentation generation

And for compilation and deployment you must have proper SSH keys and accessibility set up in you system.

Cloning, Installing Dependencies, and Running the Server
--------------------------------------------------------

After you have these prerequisites installed, you can clone the repository and install the dependencies:

.. code-block:: bash

   git clone https://github.com/rosmod/webgme-rosmod
   npm update

Assuming you have `mongod` running, you can now start the server (sudo permissions are required because by default it starts on port 80):

.. code-block:: bash

   sudo npm start

.. toctree::
   :includehidden:
   :maxdepth: 2

   webgme
   plugins
