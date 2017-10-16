# Publisher

`Publishers` are objects that faciliate the transmission of `messages` to other components on the system. A single publisher in a component is associated with a single message and is responsible for publishing messages of that type.

## Usage

```c++
packageName::messageName msg;
msg.messageField = value;
publisherName.publish(message);
```
