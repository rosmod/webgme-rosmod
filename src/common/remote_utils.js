

define(['q'], function(Q) {
    'use strict';
    return {
	executeOnHost: function(cmds, ip, user, cb_message, cb_complete, cb_processing, cb_error) {
	    var self = this;
	    var ssh2shell = require('ssh2shell');
	    var output = {
		user: user,
		ip: ip,
		stdout: ''
	    };
	    
	    var prevStr = '';

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
		    var tmp = response;
		    response = response.replace(prevStr,'');
		    prevStr = tmp;
		    if (cb_processing) {
			process.stdout.write(response);
			//cb_processing(command, response);
		    }
		},
		onCommandComplete: function( command, response, sshObj ) {
		    if (cb_complete)
			cb_complete(command, response);
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
	    var client = require('scp2');
	    client.defaults({
		host: ip,
		username: user.name,
		privateKey: require('fs').readFileSync(user.key),
	    });
	    var deferred = Q.defer();
	    client.mkdir(dir, function(err) {
		if (err)
		    deferred.reject(err);
		else
		    deferred.resolve();
	    });
	    return deferred.promise;
	},
	copyToHost: function(from, to, ip, user) {
	    var client = require('scp2');
	    
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
		    output.stdout = output.stdout.replace(cmd, '').match(procName);
		    return output;
		});
	},
	wgetAndUnzipLibrary: function(file_url, dir) {
	    var url = require('url'),
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
