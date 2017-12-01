define([], function() {
    'use strict';
    return {
	getTimeBeginEnd: function(log_data) {
	    var logKeys = Object.keys(log_data);
	    var range = {
		begin: -1,
		end: -1
	    };
	    logKeys.map(function(key) {
		var log = log_data[key];
		if (range.begin == -1 || range.begin > log.begin) {
		    range.begin = log.begin;
		}
		if (range.end == -1 || range.end < log.end) {
		    range.end = log.end;
		}
	    });
	    return range;
	},
	alignLogs: function(log_data, begin, end) {
	    var logKeys = Object.keys(log_data);
	    logKeys.map(function(key) {
		var log = log_data[key];
		var beginY = log.data[0][1]; 
		var endY = log.data[log.data.length-1][1];
                log.data = [[begin, beginY]].concat(log.data);
		log.data.push([end, endY]);
	    });
	    return log_data;
	},
        removeAlignment: function(log_data) {
	    var logKeys = Object.keys(log_data);
	    logKeys.map(function(key) {
		var log = log_data[key];
                log.data.splice(0, 1); // remove the first element
                log.data.splice(-1, 1); // remove the last element
	    });
	    return log_data;
        },
	getDataFromAttribute: function(attribute) {
	    var log_data = {};
	    // get numerical data of the form:
	    //   ROSMOD::<DATA NAME>::<TIMESTAMP>::<DATA VALUE>
	    // or get text logs of the form
	    //   ROSMOD::<DATA NAME>::<TIMESTAMP>::<SINGLE LINE TEXT LOG>
	    //var re = /ROSMOD::(.+)::(\d+)::(-?\d+(?:\.\d+)?)/gi;
	    var re = /ROSMOD::(.+)::(\d+)::(.+)/gi;
	    var result = re.exec(attribute);
	    var annY = 1;
	    var annYIncrement = 0;
	    while(result != null) {
		var alias = result[1];
		if (!log_data[alias]) {
		    log_data[alias] = {
			name : alias,
			data : [],
			begin: -1,
			end: -1,
			annotations: [],
			_lastAnnX: 0
		    };
		}
		var time = parseFloat(result[2]);
		time = time / 1000000.0;
		// KEEP TRACK OF THE BEGIN AND END OF THIS LOG
		if (log_data[alias].begin == -1) {
		    log_data[alias].begin = time;
		}
		if (log_data[alias].end == -1) {
		    log_data[alias].end = time;
		}
		else if (log_data[alias].end < time) {
		    log_data[alias].end = time;
		}
		// WHAT KIND OF LOG IS THIS?
		var data = parseFloat(result[3]);
		if (isNaN(data)) {
		    // the data/text didn't start with a number, so must be annotation
		    //if (Math.floor(time) == Math.floor(log_data[alias]._lastAnnX))
		    //time += 1; // make a minor difference to annotations can be clicked
		    log_data[alias].annotations.push({
			x: time,
			y: annY,
			text: result[3]
		    });
		    //log_data[alias]._lastAnnX = time;
		    annY += annYIncrement;
		    log_data[alias].data.push([time, annY, 15]);
		}
		else {
		    // a number was successfully parsed from the log, plot it
		    log_data[alias].data.push([time, data, 1]);
		}
		result = re.exec(attribute);
	    }
	    return log_data;
	}
    };
});
