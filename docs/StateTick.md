The `Tick` action allows you to specify code that will execute
periodically while the HFSM is in this state. The `Tick` action is
executed recursively from the HFSM _root_ all the way down to the
HFSM's _currently active leaf state_.  The periodicity of the `Tick`
is determined by the _currently active leaf state_'s `Timer Period`
attribute.
