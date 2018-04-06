define(['plotly-js/plotly.min', 'd3'], function(Plotly,d3) {
    'use strict';
    return {
	sharedY: false,
	sharedX: true,
	legendInPlot: false,
	makeLayout: function(datas) {
	    var self = this;
	    var layout = {
		xaxis: {
		    'title': 'Time (s)',
		},
		yaxis: {
		    'title': 'Time (s)',
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
	    if (!self.legendInPlot) {
		layout['legend'] = {
		    x: 1,
		    y: 1,
		};
	    } else {
		layout['legend'] = {
		    xanchor: 'right'
		}
	    }

	    if (!self.sharedX) {
		var numDatas = datas.length;
		for (var i=0; i<numDatas; i++) {
		    var key = 'xaxis'+self.getXSuffix(i);
		    var anchor = 'y' + self.getXSuffix(i);
		    layout[key] = {
			'title': 'Time (s)',
			'domain': [0, 1],
			'anchor': anchor
		    };
		}
	    }
	    if (!self.sharedY) {
		var numDatas = datas.length;
		var domain = 1.0 / numDatas;
		var current = 1.0;
		for (var i=0; i<numDatas; i++) {
		    var key = 'yaxis'+self.getYSuffix(i);
		    layout[key] = {
			'title': 'Time (s)',
			'domain': [current-(domain*0.8), current],
		    };
		    current -= domain;
		}
	    }

	    return layout;
	},
	getXSuffix: function(index) {
	    var self = this;
	    if (!self.sharedX) {
		return ((index+1) > 1) ? (index+1) : '';
	    } else {
		return '';
	    }
	},
	getYSuffix: function(index) {
	    var self = this;
	    if (!self.sharedY) {
		return ((index+1) > 1) ? (index+1) : '';
	    } else {
		return '';
	    }
	},
	convertData: function(plotId, data) {
	},
	plotData: function(container, plotId, datas, onclick) {
	    var self = this;

	    var pdata = [];
	    var annotations = [];

	    var findAnnotations = function(key, x, y, floorAnn) {
		var foundAnnotations = annotations.filter(function(ann) {
                    if (ann.key != key)
                        return false;
                    var annTime = Math.floor(ann.x);
		    //console.log('comparing x,y point ('+x+', '+y+')');
		    //console.log('           to ann   ('+ann.x+', '+ann.y+')');
		    return annTime == x && ann.y == y;
		});
		return foundAnnotations;
	    };

	    function dataSort(a, b) {
		if (a == 'init_timer_operation') {
		    return -1;
		}
		else if (b == 'init_timer_operation') {
		    return 1;
		}
		else {
		    return a.localeCompare(b);
		}
	    }

	    var dataNum = 0;
	    datas.map((data) => {
		Object.keys(data).sort(dataSort).map(function(key) {
		    if (data[key].annotations.length) {
			data[key].annotations.map(function(ann) {
			    annotations.push({
				x: ann.x,
				y: ann.y,
				//xref: 'x',
				//yref: 'y',
				xref: 'x' + self.getXSuffix(dataNum),
				yref: 'y' + self.getYSuffix(dataNum),
				key: key,
				text: ann.text,
				showarrow: true,
				arrowhead: 7,
				ax: 0,
				ay: -40
			    });
			});
		    }
		    pdata.push({
			x : data[key].data.map(function(xys) { return new Date(xys[0]).toISOString(); }),
			y : data[key].data.map(function(xys) { return xys[1]; }),
			mode: !data[key].annotations.length ? 'lines' : 'markers+lines',
			type: 'scatter',
			name: key,
			xaxis: 'x' + self.getXSuffix(dataNum),
			yaxis: 'y' + self.getYSuffix(dataNum),
			marker: {
                            maxdisplayed: 1000,
                            size: !data[key].annotations.length ? [] : data[key].data.map(function(xys) { return xys[2] })
                            /*
                              color: "rgb(164, 194, 244)",
                              line: {
                              color: "white",
                              width: 0.5
                              }
                            */
			}
		    });
		});
		dataNum += 1;
	    });

	    var layout = self.makeLayout(datas);

	    var id = '#'+plotId;
	    var gd3 = d3.selectAll(container).select(id)
		.style({
		    width: '100%',
		    'min-width': '400px',
		    height: '100%',
		    'min-height': '200px'
		});

	    var gd = gd3.node();
	    Plotly.plot(gd, pdata, layout, {
		modeBarButtons: [[{
		    'name': 'toImage',
		    'title': 'Download plot as png',
		    'icon': Plotly.Icons.camera,
		    'click': function(gd) {
			var format = 'png';

			var n = $(container).find(id);
			Plotly.downloadImage(gd, {
			    'format': format,
			    'width': n.width(),
			    'height': n.height(),
			})
			    .then(function(filename) {
			    })
			    .catch(function() {
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
	    });

	    var myPlot = d3.selectAll(container).select(id).node();

	    myPlot.on('plotly_click', function(data){
		onclick();
                data.points.map(function(point) {
		    var foundAnnotations = findAnnotations(
                        point.data.name,
                        point.xaxis.d2l(point.x),
		        point.y,
		        true
                    );
		    if (foundAnnotations.length) {
		        var yOffset = 0;
		        var yIncrement = 20;
		        foundAnnotations.map((foundAnn) => {
			    var newAnnotation = {
			        x: new Date(foundAnn.x).toISOString(),
			        y: foundAnn.y,
				xref: foundAnn.xref,
				yref: foundAnn.yref,
			        arrowhead: 6,
			        ax: 0,
			        ay: -80 - yOffset,
			        bgcolor: 'rgba(255, 255, 255, 0.9)',
			        //arrowcolor: point.fullData.marker.color,
			        font: {size:12},
			        //bordercolor: point.fullData.marker.color,
			        borderwidth: 3,
			        borderpad: 4,
			        text: foundAnn.text
			    },
			        divId = d3.selectAll(container).select(id).node(),
			        newIndex = (divId.layout.annotations || []).length;
			    // delete instead if clicked twice
			    if(newIndex) {
			        var foundCopy = false;
			        divId.layout.annotations.forEach(function(ann, sameIndex) {
				    if(ann.text === newAnnotation.text &&
				       ann.x == newAnnotation.x &&
				       ann.y == newAnnotation.y) {
				        Plotly.relayout(myPlot, 'annotations[' + sameIndex + ']', 'remove');
				        foundCopy = true;
				    }
			        });
			        if(foundCopy) return;
			    }
			    yOffset += yIncrement;
			    Plotly.relayout(myPlot, 'annotations[' + newIndex + ']', newAnnotation);
		        });
		    }

                });
	    })
		.on('plotly_clickannotation', function(event, data) {
		    //Plotly.relayout(myPlot, 'annotations[' + data.index + ']', 'remove');
		});
	}
    };
});
