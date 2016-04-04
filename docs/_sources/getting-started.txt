.. _getting-started:

Getting Started
===============

This repository code and its documentation cover the techniques for
modeling, generating, deploying, managing, and analyzing distributed
CPS applications that use ROS.  Within ROSMOD, there are two types of
users: 1) the users who develop the models, software, and systems for
distributed CPS applications, and 2) the users who manage, extend, and
deploy ROSMOD and its associated modeling language.

As an overview, ROSMOD provides a semantic backplane for developing
models of distributed CPS applications.  In this way, ROSMOD enables
the development of plugins which act on any model developed using its
meta-model.  Examples of such plugins include the software generators
and compilers associated with ROSMOD, as well as the deployment
managmenet plugins which handle constraint checking, deployment
initialization, deployment monitoring, deployment teardown, and result
plotting.

.. figure:: images/ROSMOD-Meta.png
   :align: center
   :width: 600px

   ROSMOD Meta-Model.

* :ref:`users` : for readers interested in using ROSMOD-GUI; provides
  an explanation the interfaces provided by the tools and walks
  through some examples to demonstrate how they can be used.  This
  section is for people who want to use a pre-existing ROSMOD server.
* :ref:`developers` : for readers interested in extending this work or
  learning more about the complete implementation of ROSMOD; provides
  a launching point which directs them to the APIs that have been
  developed for interfacing between the code's modules.  Also explains
  what WebGME is and how to run a local or cloud-based server of
  ROSMOD / WebGME.
