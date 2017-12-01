The `Entry` attribute of a state allows you to specify the code that
will execute any time this state is entered.  The `Entry` is executed
recursively down from the _root_ of the HFSM to the HFSM's _currently
active leaf state_.  Note that `Entry` actions are not re-executed
every time the state changes; they are only executed for states that
are were not in the previously active branch.
