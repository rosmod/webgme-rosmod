#!/usr/bin/env python

import subprocess
import threading
import time

def serve():
    subprocess.check_call(['make', 'sphinx-autobuild'])

t2 = threading.Thread(target=serve)
t2.start()

try:
    t2.join()
except KeyboardInterrupt:
    print 'Shutting down...'
