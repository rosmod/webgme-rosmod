define([], function() {
    'use strict';
    return {
	getDataFromAttribute: function(attribute) {
	    var log_data = {};
	    // get numerical data of the form:
	    //   ROSMOD::<DATA NAME>::<TIMESTAMP>::<DATA VALUE>
	    // or get text logs of the form
	    //   ROSMOD::<DATA NAME>::<TIMESTAMP>::<SINGLE LINE TEXT LOG>
	    //var re = /ROSMOD::(.+)::(\d+)::(-?\d+(?:\.\d+)?)/gi;
	    var re = /ROSMOD::(.+)::(\d+)::(.+)/gi;
	    var result = re.exec(attribute);
	    var annY = 0;
	    var annYIncrement = 0.5;
	    while(result != null) {
		var alias = result[1];
		if (!log_data[alias]) {
		    log_data[alias] = {
			name : alias,
			data : [],
			annotations: []
		    };
		}
		var time = parseFloat(result[2]);
		time = time / 1000000.0;
		var data = parseFloat(result[3]);
		if (isNaN(data)) {
		    // the data/text didn't start with a number, so must be annotation
		    log_data[alias].annotations.push({
			x: time,
			y: annY,
			text: result[3]
		    });
		    annY += annYIncrement;
		}
		else {
		    // a number was successfully parsed from the log, plot it
		    log_data[alias].data.push([time, data]);
		}
		result = re.exec(attribute);
	    }
	    return log_data;
	}
    };
});
