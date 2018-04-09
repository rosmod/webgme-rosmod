# Action Definition

Here is an example Action `Definition`:

```
# Define the goal
geometry_msgs/Pose goalPose
---
# Define the result
bool success
geometry_msgs/Pose finalPose
---
# Define a feedback message
geometry_msgs/Pose currentPose
geometry_msgs/Twist twist
```
