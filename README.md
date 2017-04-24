# ROSMOD

ROSMOD is a web-based, collaborative, modeling and execution
environment for distributed embedded applications built using
[ROS](http://www.ros.org).

## Contents

1. [What is ROSMOD](#what-is-rosmod)
  1. [Motivation](#motivation)
  2. [Implementation](#implementation)
  3. [Features](#features)
2. [How to set up ROSMOD](#how-to-set-up-rosmod)
  1. [Setting up the ROSMOD server](#setting-up-the-rosmod-server)
  2. [Setting up target systems to run ROSMOD](#setting-up-target-systems-to-run-rosmod)
3. [How to use ROSMOD](#how-to-use-rosmod)
  1. [Creating a ROSMOD project](#creating-a-rosmod-project)
  2. [Modeling the Software](#modeling-the-software)
  3. [Modeling the Systems](#modeling-the-systems)
  4. [Creating a Deployment](#creating-a-deployment)
  5. [Running an Experiment](#running-an-experiment)
4. [Keeping ROSMOD up to date](#keeping-rosmod-up-to-date)


## What is ROSMOD?

This repository contains the implementation of ROSMOD-GUI, based on
[WebGME](http://github.com/webgme/webgme), a live demo of which can be
found on [WebGME.org](http://webgme.org).

An example server running ROSMOD-GUI can be found on
[rosmod.rcps.isis.vanderbilt.edu](http://rosmod.rcps.isis.vanderbilt.edu).
RCPS is a BeagleBone Black cluster at the Vanderbilt University
Institute for Software Integrated Systems (ISIS), on which we run
resilient, distributed CPS research.  Please note that guest accounts
are not allowed to run any processes on the cluster (such as
compilation or experiment deployments), but are allowed to create
models and download the generated artifacts from those models (such as
code source and deployment files).

### Motivation

### Implementation

### Features

## How to set up ROSMOD

### Setting up the ROSMOD Server

1. Install [NVM](https://github.com/creationix/nvm)
   ```bash
   wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
   ```
2. Install [NodeJS LTS](http://nodejs.org)
   ```bash
   nvm install --lts nodejs
   ```
3. Install Bower
   ```bash
   npm install -g bower
   ```
4. Install [MongoDB](http://mongodb.com)
   ```bash
   sudo apt-get install mongodb
   ```
5. Clone this repo
   ```bash
   git clone https://github.com/rosmod/webgme-rosmod
   ```
6. Install dependencies
   ```bash
   cd webgme-rosmod
   npm update
   ```
7. Start the server
   ```bash
   npm start
   ```
   
*NOTE:* to make changes to the `META` or to view the `META`, you can run 

``` bash
npm run start-dev
```

which enables the `META` visualizer.

### Setting up target systems to run ROSMOD

1. Install [ROS](http://www.ros.org) onto the target platform.
2. Install [ROSMOD-COMM](http://github.com/rosmod/rosmod-comm) onto
   the target platform.
3. Ensure the target has *SSH capabilities*; configure an ssh key that
   the ROSMOD server can use to remotely access the target device.
   
*NOTE:* password-based authentication is not allowed for ROSMOD
 targets.

## How to use ROSMOD

### Creating a ROSMOD Project

### Modeling the Software

### Modeling the Systems

### Creating a Deployment

### Running an Experiment

## Keeping ROSMOD Up-to-Date
