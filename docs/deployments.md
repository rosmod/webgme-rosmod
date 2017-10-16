# Deployments

Deployments are an abstract grouping of **Instances** of `Components` into processes (which are called `Nodes` in ROS terminology), and further grouping processes into `Containers`, which are an abstract definition of `Hosts`.  The actual mapping from `Containers` to `Hosts` happens automatically in an `Experiment`.

In other words, a deployment is a model of how the user wants to group and run software components on separate pieces of hardware. As the mapping between any given deployment and available hosts in a given system is not done until running an experiment, the maximum number of containers (abstracted hosts) can exceed what is currently available in any system.

## CommViz

The `CommViz` visualizer can be accessed in the root level of a deployment. This shows a graphic representation of all software components, the nodes and containers they are in, and the message/service links between components.

<img src="https://github.com/rosmod/webgme-rosmod/raw/master/img/commViz.png" width="100%">

## Example

TODO

1. Case study of multi-container deployment, probably from intro to rosmod
2. commViz images of said deployment

## Documentation Style Guide

For a Deployments-level documentation block use the following headers in order to generate consistent and flowing documentation.

```no-highlight
# Deployments
## Intended Target(s)
## Portability

```
