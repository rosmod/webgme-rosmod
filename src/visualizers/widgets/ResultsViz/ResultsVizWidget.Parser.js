

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
		    };
		}
		var enq = parseFloat(result[2]);
		var comp = parseFloat(result[4]);
		var exec_time = parseFloat(result[5]);
		log_data[alias].data.push([enq,  0]);
		log_data[alias].data.push([enq,  exec_time]);
		log_data[alias].data.push([comp, exec_time]);
		log_data[alias].data.push([comp, 0]);
		result = re.exec(attribute);
	    }
	    return log_data;
	},
    }
});
