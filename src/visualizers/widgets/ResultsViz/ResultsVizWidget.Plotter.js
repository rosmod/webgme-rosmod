

define(['./plotly.min', 'd3'], function(Plotly,d3) {
    'use strict';
    return {
	plotData: function(plotId, data, offset) {
	    // extent returns array: [min, max]
	    var maxXs = Object.keys(data).map(function(key) {
		return d3.extent(data[key].data, function(xy) { return xy[0] - offset; })[1];
	    });
	    var maxYs = Object.keys(data).map(function(key) {
		return d3.extent(data[key].data, function(xy) { return xy[1]; })[1];
	    });
	    var xdomain = d3.max(maxXs);
	    var ydomain = d3.max(maxYs);

	    var pdata = [];

	    Object.keys(data).map(function(key) {
		pdata.push({
		    x : data[key].data.map(function(xy) { return xy[0] - offset; }),
		    y : data[key].data.map(function(xy) { return xy[1]; }),
		    mode: 'lines',
		    name: key
		});
	    });

	    var layout = {
		xaxis: {
		    title: 'Time (s)'
		}
	    };

	    Plotly.newPlot(plotId, pdata, layout);
	}
    }
});
