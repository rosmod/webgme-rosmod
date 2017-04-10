

define(['plotly-js/plotly.min', 'd3'], function(Plotly,d3) {
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
                    type: 'scatter',
		    name: key,
                    marker: {
                        maxdisplayed: 1000,
                        /*
                          color: "rgb(164, 194, 244)",
                          size: 12,
                          line: {
                          color: "white",
                          width: 0.5
                          }
                        */
                    }
		});
	    });

	    var layout = {
		xaxis: {
		    title: 'Time (s)'
		},
                legend: {
                    xanchor: 'right'
                },
                margin: {
                    pad: 0,
                    l: 50,
                    r: 0,
                    b: 50,
                    t: 0
                },
                hovermode: 'closest',
                autosize: true,
                showlegend: true
	    };

	    Plotly.plot(plotId, pdata, layout, {
		modeBarButtons: [[{
		    'name': 'toImage',
		    'title': 'Download plot as png',
		    'icon': Plotly.Icons.camera,
		    'click': function(gd) {
			var format = 'png';
			var id = '#'+plotId;

			/*
			  Plotly.Lib.notifier('Taking snapshot - this may take a few seconds', 'long');

			  if(Plotly.Lib.isIE()) {
			  Plotly.Lib.notifier('IE only supports svg.  Changing format to svg.', 'long');
			  format = 'svg';
			  }
			*/
			
			Plotly.downloadImage(gd, {
			    'format': format,
			    'width': $(id).width(),
			    'width': $(id).width(),
			})
			    .then(function(filename) {
				//Plotly.Lib.notifier('Snapshot succeeded - ' + filename, 'long');
			    })
			    .catch(function() {
				//Plotly.Lib.notifier('Sorry there was a problem downloading your snapshot!', 'long');
			    });
		    }
		}],[
		    'zoom2d',
		    'pan2d',
		    'select2d',
		    'lasso2d',
		    'zoomIn2d',
		    'zoomOut2d',
		    'autoScale2d',
		    'resetScale2d',
		    'hoverClosestCartesian',
		    'hoverCompareCartesian'
		]],
		/*
		  modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
		  modeBarButtonsToAdd: [{
		  name: 'toImage2',
		  icon: Plotly.Icons.camera,
		  click: function(gd) {
		  console.log($('#'+plotId).height());
		  console.log($('#'+plotId).width());
		  Plotly.downloadImage(gd, {
		  height: $('#'+plotId).height(),
		  width: $('#'+plotId).width(),
		  });
		  }
		  }],
		*/
	    });
	}
    }
});
