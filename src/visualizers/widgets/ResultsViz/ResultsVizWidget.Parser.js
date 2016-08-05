

define([], function() {
    'use strict';
    return {
	getDataFromAttribute: function(attribute) {
	    var re = /ROSMOD::DEBUG::(\d)+::(\d)+/gi
	    var result = re.exec(attribute);
	    var log_data = {};
	    while(result != null) {
		var alias = 'log'
		if (!log_data[alias]) {
		    log_data[alias] = {
			name : alias,
			data : [],
		    };
		}
		var time = parseFloat(result[1]);
		time = time / 1000000000.0; // since it's in nanoseconds
		var data = parseFloat(result[2]);
		log_data[alias].data.push([time, data]);
		result = re.exec(attribute);
	    }
	    return log_data;
	},
    }
});
