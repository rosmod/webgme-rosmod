# Action Client

Action clients contain the following callback definitions:

1. `Active Callback`: invoked whenever the server is tracking the goal.
2. `Done Callback`: invoked whenever the server has completed the goal.
3. `Feedback Callback`: invoked whenever the server sends feedback /
   progress / current state about the goal.

All of these callbacks run from within the component's thread context.
