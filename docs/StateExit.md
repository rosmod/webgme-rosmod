The `Exit` action allows you to specify code that will execute every
time the state is exited. The `Exit` action is called recursively up
from the HFSM's _currently active leaf state_ up to the common
ancestor between the new active leaf and the currently active leaf.
