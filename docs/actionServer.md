# Action Server

Action servers contain the following callback definitions:

1. `Preempt Callback`: invoked whenever the server receives a new goal
   from a client while processing another goal - this callback is
   called before the `Goal Callback` is called. This callback is
   called from the component's thread context.
2. `Goal Callback`: invoked whenever the server receives a new goal
   from a client. This callback is called before the `Execute
   Callback` is called. This callback is called from the component's
   thread context.
3. `Execute Callback`: invoked when the server accepts a new goal -
   this callback is run from it's own thread within the component and
   is designed to be a (potentially) long-running task. Note that the
   developer should ensure that the work done here is thread safe
   w.r.t. the other component operations. The component's `logger` is
   thread-safe and fine to use within this callback.
