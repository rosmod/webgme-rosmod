define([], function() {
    'use strict';
    return {
	getDataFromAttribute: function(attribute) {   
	    var re = /ROSMOD::(\w+)::(\d+)::(-?\d+(?:\.\d+)?)/gi;   
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
		var time = parseFloat(result[2]);
		time = time / 1000000000.0;
		var data = parseFloat(result[3]);
		log_data[alias].data.push([time, data]); 	          
		result = re.exec(attribute);   
	    }   
	    return log_data; 
	},
    }
});
