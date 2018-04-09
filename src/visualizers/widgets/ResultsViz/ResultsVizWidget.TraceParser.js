define([], function() {
    'use strict';
    return {
	getDataFromAttribute: function(attribute) {
	    var re = /((?:[^:\r\n,+\-\(\)\\\/])*), ([0-9\.]+), ([0-9\.]+), ([0-9\.]+), ([0-9\.]+), ([0-9\.]+)/gi;
	    var result = re.exec(attribute);
	    var log_data = {};
	    while(result != null) {
		var alias = result[1];
		if (!log_data[alias]) {
		    log_data[alias] = {
			name : alias,
			data : [],
			begin: -1,
			end: -1,
			annotations: []
		    };
		}
		var enq = parseFloat(result[2]) * 1000.0;
		var deq = parseFloat(result[3]) * 1000.0;
		if (deq < enq)
		    deq = enq;
		var comp = parseFloat(result[4]) * 1000.0;
		var wait_time = parseFloat(result[3]) - parseFloat(result[2]);
		if (wait_time < 0)
		    wait_time = 0;
		var exec_time = parseFloat(result[5]) - wait_time;
		var deadline  = parseFloat(result[6]);
		log_data[alias].data.push([enq,  0]);
		log_data[alias].data.push([enq,  wait_time]);
		log_data[alias].data.push([deq,  wait_time]);
		log_data[alias].data.push([deq,  exec_time]);
		log_data[alias].data.push([comp, exec_time]);
		log_data[alias].data.push([comp, 0]);

		// KEEP TRACK OF THE BEGIN AND END OF THIS LOG
		if (log_data[alias].begin == -1) {
		    log_data[alias].begin = enq;
		}
		if (log_data[alias].end == -1) {
		    log_data[alias].end = comp;
		}
		else if (log_data[alias].end < comp) {
		    log_data[alias].end = comp;
		}

		result = re.exec(attribute);
	    }
	    return log_data;
	}
    };
});
