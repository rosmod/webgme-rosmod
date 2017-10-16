# Subscriber

A `subscriber` is a recepient of a `message` and  contains c++ code that is executed on receipt of an associated message.

## Accessing Received Message Data

```c++
type classVariable = received_data->messageField;
```

## Deadline Violations
