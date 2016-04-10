

define(['q'], function(Q) {
    'use strict';

    return {
	trackedProcesses: ['catkin_make', 'node_main', 'roscore'],
	chunkString: function(str, len) {
	    return str.match(new RegExp('(.|[\r\n ]){1,' + len + '}', 'g'));
	},
	sanitizePath: function(path) {
	    return path.replace(/ /g, '\\ ');
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
	executeOnHost: function(cmds, ip, user, stderrCB) {
	    var self = this;
	    var Client = require('ssh2').Client;

	    var deferred = Q.defer();
	    var output = {
		user: user,
		ip: ip,
		returnCode: -1,
		signal: undefined,
		stdout: '',
		stderr: ''
	    };

	    if ( stderrCB == undefined ) {
		stderrCB = function(data) {
		    return true;
		};
	    }

	    var remote_stdout = '';
	    var remote_stderr = '';
	    cmds.push('exit\n');
	    var cmdString = cmds.join('\n');
	    var conn = new Client();
	    conn.on('ready', function() {
		//self.logger.info('Client :: ready');

		conn.exec(cmdString, function(err, stream) {
		    if (err) { 
			var msg = 'SSH2 Exec error: ' + err;
			throw new String(msg);
		    }
		    stream.on('close', function(code, signal) {
			//self.logger.info('stream closed.');
			conn.end();
			output.returnCode = code;
			output.signal = signal;
			output.stdout = remote_stdout.replace(new RegExp(user.name + '@.+\$','gi'), '');
			for (var c in cmds) {
			    output.stdout = output.stdout.replace(new RegExp(cmds[c], 'gi'), '');
			}
			output.stderr = remote_stderr;
			//self.logger.info(output.stdout);
			deferred.resolve(output);
		    }).stdout.on('data', function(data) {
			remote_stdout += data;
			//self.logger.info('STDOUT:: ' + data);
		    }).stderr.on('data', function(data) {
			remote_stderr += data;
			if (stderrCB(data)) {
			    conn.end();
			    deferred.reject(data);
			}
		    });
		})
	    }).connect({
		host: ip,
		port: 22,
		username: user.name,
		privateKey: require('fs').readFileSync(user.key)
	    });
	    return deferred.promise;
	},
	deployOnHost: function(cmds, ip, user) {
	    var self = this;
	    var Client = require('ssh2').Client;

	    var deferred = Q.defer();
	    var output = {
		user: user,
		ip: ip,
		returnCode: -1,
		signal: undefined,
		stdout: '',
		stderr: ''
	    };

	    var remote_stdout = '';
	    var remote_stderr = '';
	    cmds.push('exit\n');
	    var cmdString = cmds.join('\n');
	    var conn = new Client();
	    conn.on('ready', function() {
		//self.logger.info('Client :: ready');

		conn.shell(function(err, stream) {
		    if (err) { 
			var msg = 'SSH2 Exec error: ' + err;
			throw new String(msg);
		    }
		    stream.on('close', function(code, signal) {
			//self.logger.info('stream closed.');
			conn.end();
			output.returnCode = code;
			output.signal = signal;
			output.stdout = remote_stdout.replace(new RegExp(user.name + '@.+\$','gi'), '');
			for (var c in cmds) {
			    output.stdout = output.stdout.replace(new RegExp(cmds[c], 'gi'), '');
			}
			output.stderr = remote_stderr;
			//self.logger.info(output.stdout);
			deferred.resolve(output);
		    }).stdout.on('data', function(data) {
			remote_stdout += data;
			//self.logger.info('STDOUT:: ' + data);
		    }).stderr.on('data', function(data) {
			remote_stderr += data;
			conn.end();
			deferred.reject(data);
		    });
		    stream.end(cmdString);
		})
	    }).connect({
		host: ip,
		port: 22,
		username: user.name,
		privateKey: require('fs').readFileSync(user.key)
	    });
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
	parseMakeErrorOutput: function(output, replaceDir) {
	    var regex = /([^:^\n]+):(\d+):(\d+):\s(\w+\s*\w*):\s(.+)\n(\s+)(.*)\s+\^+/gm;
	    var match = null;
	    var retVals = [];
	    while (match = regex.exec(output)) {
		var baseName = match[1].replace(replaceDir, ''),
		packageName = baseName.split('/')[0],
		fileName = baseName.split('/').slice(-1)[0],
		column = parseInt(match[3]),
		codeWhitespace = match[6];
		retVals.push({
		    fileName:       fileName,
		    packageName:    packageName,
		    line:           parseInt(match[2]),
		    column:         column,
		    type:           match[4],
		    text:           match[5],
		    codeWhitespace: codeWhitespace,
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
	    //from = self.sanitizePath(from);
	    //to = self.sanitizePath(to);
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
	    from = self.sanitizePath(from);
	    to = self.sanitizePath(to);
	    var url = require('url'),
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
		    output.stdout = output.stdout.match(procName);
		    return output;
		});
	},
	wgetAndUnzipLibrary: function(file_url, dir) {
	    var self = this;
	    var url = require('url'),
	    path = require('path'),
	    fs = require('fs'),
	    unzip = require('unzip'),
	    fstream = require('fstream'),
	    child_process = require('child_process');
	    var sanitized_dir = self.sanitizePath(dir);
	    // extract the file name
	    var file_name = url.parse(file_url).pathname.split('/').pop();
	    var final_file = path.join(dir, file_name);

	    // compose the wget command; -O is output file
	    var wget = 'wget --no-check-certificate -P ' + sanitized_dir + ' ' + file_url;

	    var deferred = Q.defer();

	    // excute wget using child_process' exec function
	    var child = child_process.exec(wget, function(err, stdout, stderr) {
		if (err) {
		    deferred.reject("Couldn't download " + file_url + ' :: ' + stderr);
		}
		else {
		    var readStream = fs.createReadStream(final_file);
		    var writeStream = fstream.Writer(dir);
		    if (readStream == undefined || writeStream == undefined) {
			deferred.reject("Couldn't open " + dir + " or " + final_file);
		    }
		    else {
			readStream
			    .pipe(unzip.Parse())
			    .pipe(writeStream);
			fs.unlinkSync(final_file);
			deferred.resolve('downloaded and unzipped ' + file_name + ' into ' + dir);
		    }
		}
	    });
	    return deferred.promise;
	}
    }
});
