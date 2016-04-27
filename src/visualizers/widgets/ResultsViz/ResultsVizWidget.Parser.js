

define([], function() {
    'use strict';
    return {
	getDataFromAttribute: function(attribute) {
	    var re = /((?:[^\r\n,+\-\(\)\\\/][\S])+),([0-9\.]+),([0-9\.]+),([0-9\.]+),([0-9\.]+),([0-9\.]+)/gi;
	    var result = re.exec(attribute);
	    var log_data = {};
	    var first_time = 0.0;
	    if (result != null)
		var first_time = parseFloat(result[2]);
	    while(result != null) {
		var alias = result[1];
		if (!log_data[alias]) {
		    log_data[alias] = {
			data : [],
		    };
		}
		var enq = parseFloat(result[2]);
		var comp = parseFloat(result[4]);
		var exec_time = parseFloat(result[5]);
		log_data[alias].data.push([enq - first_time,  0]);
		log_data[alias].data.push([enq - first_time,  exec_time]);
		log_data[alias].data.push([comp - first_time, exec_time]);
		log_data[alias].data.push([comp - first_time, 0]);
		result = re.exec(attribute);
	    }
	    return log_data;
	},
    }
});
