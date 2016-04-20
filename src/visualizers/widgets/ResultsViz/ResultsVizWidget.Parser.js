

define([], function() {
    'use strict';
    return {
	getDataFromAttribute: function(attribute) {
	    var re = /ROSMOD::(\w+)::([\d]*)::((?:CALLBACK COMPLETED)|(?:CALLBACK FIFO ENQUEUE) ?)*::Alias=(\w+); (?:(?:[\w=;, ]*Enqueue Time)|(?:Completion Time)) sec=(\d*), nsec=(\d*)/gi;
	    var result = re.exec(attribute);
	    var log_data = {};
	    var first_time = 0.0;
	    var max_exec_time = 0.0;
	    if (result != null)
		var first_time = parseInt(result[5]) + result[6]/1000000000.0;
	    while(result != null) {
		var alias = result[4];
		if (!log_data[alias]) {
		    log_data[alias] = {
			data : [],
			enqueue_times: [],
			completion_times: []
		    };
		}
		if (result[3].indexOf('ENQUEUE') > -1) {
		    var enqueue_time = parseInt(result[5]) + result[6]/1000000000.0;
		    log_data[alias].enqueue_times.push(enqueue_time);
		    if (first_time == 0.0)
			first_time = enqueue_time;
		}
		else if (result[3].indexOf('COMPLETED') > -1) {
		    var completion_time = parseInt(result[5]) + result[6]/1000000000.0;
		    log_data[alias].completion_times.push(completion_time);
		}
		if ( log_data[alias].completion_times.length > 0 && log_data[alias].enqueue_times.length > 0 ) {
		    // at this point there can only be one completion_time, though there may be multiple enqueue times
		    var comp = log_data[alias].completion_times[0];
		    var enq = log_data[alias].enqueue_times[0];
		    var exec_time = comp - enq;
		    if (exec_time > max_exec_time)
			max_exec_time = exec_time;
		    log_data[alias].data.push([enq - first_time,  0]);
		    log_data[alias].data.push([enq - first_time,  exec_time]);
		    log_data[alias].data.push([comp - first_time, exec_time]);
		    log_data[alias].data.push([comp - first_time, 0]);
		    // remove the currently processed enqueue / completion time
		    log_data[alias].enqueue_times = log_data[alias].enqueue_times.slice(1);
		    log_data[alias].completion_times = log_data[alias].completion_times.slice(1);
		}
		result = re.exec(attribute);
	    }
	    return log_data;
	},
    }
});
