

define(['q'], function(Q) {
    'use strict';

    return {
	trackedProcesses: ['catkin_make', 'node_main', 'roscore'],
	sanitizePath: function(path) {
	    return path.replace(/ /g, '\ ');
	},
	getDeviceType: function(host) {
	    return host.deviceId + '+' + host.architecture;
	},
	range: function(lowEnd,highEnd) {
	    var arr = [],
	    c = highEnd - lowEnd + 1;
	    while ( c-- ) {
		arr[c] = highEnd--
	    }
	    return arr;
	},
	testPing: function(ip) {
	    var self = this;
	    var ping = require('ping');
	    return ping.promise.probe(ip)
		.then(function (res) {
		    if (!res.alive)
			throw new String(ip + ' is not reachable.');
		    return true;
		});
	},
	testSSH: function(ip, user) {
	    var self = this;
	    return self.executeOnHost(['echo "hello"'], ip, user)
		.then(function () {
		    return true;
		})
		.catch(function (err) {
		    throw new String(user.name + '@' + ip + ' not SSH-able: ' + err);
		});
	},
	testArchOS: function(arch, os, ip, user) {
	    var self = this;
	    return self.executeOnHost(['uname -om'], ip, user)
		.then(function (output) {
		    var correctArch = output.stdout.indexOf(arch) > -1;
		    var correctOS = output.stdout.indexOf(os) > -1;
		    if (!correctArch) {
			throw new String('host ' + ip + ':' + arch +
					 ' has incorrect architecture: '+ output.stdout);
		    }
		    if (!correctOS) {
			throw new String('host ' + ip + ':' + os +
					 ' has incorrect OS: '+ output.stdout);
		    }
		    return true;
		});
	},
	testDeviceId: function(deviceId, deviceIdCommand, ip, user) {
	    var self = this;
	    var cmds = [deviceIdCommand];
	    return self.executeOnHost(cmds, ip, user)
		.then(function (output) {
		    var correctDeviceId = output.stdout.indexOf(deviceId) > -1;
		    if (!correctDeviceId) {
			throw new String('host ' + ip + ':' + deviceId +
					 ' has incorrect deviceId: '+ output.stdout);
		    }
		    return true;
		});
	},
	isFree: function(ip, user) {
	    var self = this;
	    var tasks = self.trackedProcesses.map(function(procName) {
		return self.getPidOnHost(procName, ip, user);
	    });
	    return Q.all(tasks)
		.then(function(outputs) {
		    outputs.forEach(function (output) {
			if (output.stdout) {
			    throw new String(ip + ' is already running: ' + output.stdout);
			};
		    });
		    return true;
		});
	},
	getAvailability: function(host, checkTasks) {
	    var self = this;
	    if (checkTasks === undefined)
		checkTasks = true;
	    // test IP connectivity
	    var tasks = Object.keys(host.interfaces).map(function(index) {
		var intf = host.interfaces[index];
		return self.testPing(intf.ip)
		    .then(function() {
			var userTasks = Object.keys(host.users).map(function(index) {
			    var user = host.users[index];
			    self.logger.info('testing ' + user.name + ' on ' + intf.ip);
			    return self.testSSH(intf.ip, user)
				.then(function() {
				    return user;
				});
			});
			return Q.any(userTasks);
		    })
		    .then(function(user) {
			self.logger.info(intf.ip + ' got valid user: ' + user.name);
			return self.testArchOS(host.architecture, host.os, intf.ip, user)
			    .then(function() {
				return self.testDeviceId(host.deviceId, host.deviceIdCommand, intf.ip, user);
			    })
			    .then(function() {
				if (checkTasks)
				    return self.isFree(intf.ip, user)
				else
				    return [];
			    })
			    .then(function() {
				return {host: host, intf:intf, user:user};
			    });
		    })
		    .catch(function(err) {
			self.logger.error(err);
		    });
	    });
	    return Q.all(tasks);
	},
	getAvailableHosts: function(hosts, checkTasks) {
	    var self = this;
	    if (checkTasks === undefined)
		checkTasks = true;
	    var tasks = Object.keys(hosts).map(function(index) {
		var host = hosts[index];
		return self.getAvailability(host, checkTasks);
	    });
	    return Q.all(tasks)
		.then(function(availArray) {
		    var hostsUp = [];
		    for (var i=0; i < availArray.length; i++) {
			if (availArray[i][0])
			    hostsUp.push(availArray[i][0]);
		    }
		    return hostsUp;
		});
	},
	executeOnHost: function(cmds, ip, user, cb_message, cb_complete, cb_processing, cb_error) {
	    var self = this;
	    var ssh2shell = require('ssh2shell');
	    var output = {
		user: user,
		ip: ip,
		stdout: ''
	    };
	    
	    var host = {
		server: {
		    host: ip,
		    port: 22,
		    userName: user.name,
		    privateKey: require('fs').readFileSync(user.key)
		},
		commands: cmds,
		idleTimeOut: 10000,
		msg: {
		    send: function( message ) {
			if (cb_message)
			    cb_message(message);
		    }
		},
		onCommandProcessing: function( command, response, sshObj, stream ) {
		    if (cb_processing) {
			cb_processing(command, response);
		    }
		},
		onCommandComplete: function( command, response, sshObj ) {
		    if (cb_complete) {
			self.logger.info(command);
			self.logger.info(response);
			//cb_complete(command, response);
		    }
		},
		onCommandTimeout: function( command, response, sshObj, stream, connection) {
		    // pass through, we don't want to time out
		},
		onEnd: function( sessionText, sshObj ) {
		    var stdout = sessionText;
		    stdout = stdout.replace('Connected to '+ip,'');
		    stdout = stdout.replace(new RegExp(user.name + '@.+\$'), '');
		    output.stdout = stdout;
		}
	    };
	    var ssh = new ssh2shell(host);
	    /*
	      ssh.on ("error", function(err, type, close, cb) {
	      reject(err + ' on ' + user.name + '@' + ip);
	      if (cb_error)
	      cb_error(err, type, close, cb);
	      });
	    */
	    var deferred = Q.defer();
	    ssh.on("close", function(hadError) {
		if (hadError) {
		    deferred.reject();
		}
		else {
		    deferred.resolve(output);
		}
	    });
	    ssh.connect();
	    return deferred.promise;
	},
	parseMakePercentOutput: function(output) {
	    var regex = /[0-9]+%/gm;
	    var match = null;
	    var retVals = [];
	    while (match = regex.exec(output)) {
		var percent = parseInt(new String(match).replace('%',''), 10);
		retVals.push(percent);
	    }
	    return retVals;
	},
	parseMakeErrorOutput: function(output) {
	    var regex = /([^:^\n]+):(\d+):(\d+):\s(\w+\s*\w*):\s(.+)\n(\s+)(.*)\s+\^+/gm;
	    var match = null;
	    var retVals = [];
	    while (match = regex.exec(output)) {
		retVals.push({
		    filename:       match[1].replace(self.gen_dir + '/src/', ''),
		    packageName:    filename.split('/')[0],
		    line:           parseInt(match[2]),
		    column:         parseInt(match[3]),
		    type:           match[4],
		    text:           match[5],
		    codeWhitespace: match[6],
		    code:           match[7],
		    adjustedColumn: column - codeWhitespace.length
		});
	    }
	    return retVals;
	},
	parsePsAuxOutput: function(output) {
	    return output;
	},
	mkdirRemote: function(dir, ip, user) {
	    var self = this;
	    dir = self.sanitizePath(dir);
	    return self.executeOnHost(['mkdir -p ' + dir],
				      ip,
				      user);
	},
	copyToHost: function(from, to, ip, user) {
	    var self = this;
	    var client = require('scp2');
	    from = self.sanitizePath(from);
	    to = self.sanitizePath(to);
	    var deferred = Q.defer();
	    client.scp(from, {
		host: ip,
		username: user.name,
		privateKey: require('fs').readFileSync(user.key),
		path: to
	    }, function(err) {
		if (err)
		    deferred.reject(err);
		else
		    deferred.resolve();
	    });
	    return deferred.promise;
	},
	copyFromHost: function(from, to, ip, user) {
	    var self = this;
	    var url = require('url'),
	    from = self.sanitizePath(from);
	    to = self.sanitizePath(to);
	    path = require('path'),
	    fs = require('fs'),
	    unzip = require('unzip'),
	    fstream = require('fstream'),
	    child_process = require('child_process');
	    
	    var local = to;
	    var remote = user.name + '@' + ip + ':' + from;

	    var scp = 'scp -o StrictHostKeyChecking=no -i ' + user.key + ' -r ' + remote + ' ' + local;
	    
	    var deferred = Q.defer();

	    var child = child_process.exec(scp, function(err, stdout, stderr) {
		if (err) {
		    deferred.reject(err);
		}
		else {
		    deferred.resolve('copied ' + remote + ' into ' + local);
		}
	    });
	    return deferred.promise;
	},
	getPidOnHost: function(procName, ip, user, stdout_cb, stderr_cb) {
	    var self = this;
	    var cmd = 'ps aux | grep -v grep | grep ' + procName;
	    return self.executeOnHost([cmd], ip, user)
		.then(function(output) {
		    output.stdout = output.stdout.replace(cmd, '').match(procName);
		    return output;
		});
	},
	wgetAndUnzipLibrary: function(file_url, dir) {
	    var url = require('url'),
	    dir = self.sanitizePath(dir);
	    path = require('path'),
	    fs = require('fs'),
	    unzip = require('unzip'),
	    fstream = require('fstream'),
	    child_process = require('child_process');
	    // extract the file name
	    var file_name = url.parse(file_url).pathname.split('/').pop();

	    var final_dir = path.join(process.cwd(), dir).toString();
	    var final_file = path.join(final_dir, file_name);

	    // compose the wget command; -O is output file
	    var wget = 'wget --no-check-certificate -P ' + dir + ' ' + file_url;

	    var deferred = Q.defer();

	    // excute wget using child_process' exec function
	    var child = child_process.exec(wget, function(err, stdout, stderr) {
		if (err) {
		    deferred.reject(err);
		}
		else {
		    var fname = path.join(dir,file_name);
		    var readStream = fs.createReadStream(fname);
		    var writeStream = fstream.Writer(dir);
		    if (readStream == undefined || writeStream == undefined) {
			deferred.reject("Couldn't open " + dir + " or " + fname);
			return;
		    }
		    readStream
			.pipe(unzip.Parse())
			.pipe(writeStream);
		    fs.unlink(fname);
		    deferred.resolve('downloaded and unzipped ' + file_name + ' into ' + dir);
		}
	    });
	    return deferred.promise;
	}
    }
});
