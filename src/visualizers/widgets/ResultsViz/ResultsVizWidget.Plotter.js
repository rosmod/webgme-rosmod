

define(['d3'], function() {
    'use strict';
    return {
	plotData: function(plotId, data, offset) {
	    if (_.isEmpty(data))
		return;

	    var names = Object.keys(data);

	    var bandPos = [-1, -1];
	    var pos;

	    // extent returns array: [min, max]
	    var maxXs = Object.keys(data).map(function(key) {
		return d3.extent(data[key].data, function(xy) { return xy[0] - offset; })[1];
	    });
	    var maxYs = Object.keys(data).map(function(key) {
		return d3.extent(data[key].data, function(xy) { return xy[1]; })[1];
	    });
	    var xdomain = d3.max(maxXs);
	    var ydomain = d3.max(maxYs); 

	    var colors = ["steelblue", "green", "red", "purple", "lavender", "orange", "yellow", "blue", "grey"];
	    var colorMap = {};
	    var tmp =0;
	    for (var key in data) {
		colorMap[key] = colors[tmp];
		tmp++;
		if (tmp >= colors.length)
		    tmp = 0;
	    }

	    var margin = {
		top: 40,
		right: 40,
		bottom: 50,
		left: 60
	    }
	    var base_width = 760;
	    var base_height = 250;
	    var width = base_width - margin.left - margin.right;
	    var height = base_height - margin.top - margin.bottom;
	    var zoomArea = {
		x1: 0,
		y1: 0,
		x2: xdomain,
		y2: ydomain
	    };

	    var svg = d3.select(plotId)
		.attr('preserveAspectRatio', 'xMinYMin meet')
		.attr('viewBox', '0 0 '+(width+margin.left+margin.right) + ' '+(height +margin.bottom+margin.top))
	    //.attr("width", "100%")
	    //.attr("height", height + margin.top + margin.bottom)
		.classed('svg-content-responsive', true)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	    // axes
	    var x = d3.scale.linear()
		.domain([0, xdomain])
		.range([0, width]);

	    var y = d3.scale.linear()
		.domain([0, ydomain])
		.range([height, 0]);

	    var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	    var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	    // Line functions for data
	    var line = d3.svg.line()
	    //.interpolate("basis")  // Don't want to interpolate between points!
		.x(function(d) {
		    return x(d[0] - offset);
		})
		.y(function(d) {
		    return y(d[1]);
		});

	    // add axes
	    svg.append("g")
		.attr("class", "x axis")
		.call(xAxis)
		.attr("transform", "translate(0," + height + ")");

	    svg.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", base_width / 2)
		.attr("y", base_height - margin.bottom - 6)
		.text("Time (s)");

	    svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)

	    svg.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "end")
		.attr("y", 6)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.attr("x", -margin.left/2)
		.attr("y", -60)
		.text("Execution Time (s)");

	    // add clipping for plot
	    svg.append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", width)
		.attr("height", height);

	    // add data
	    for (var alias in data) {
		svg.append("path")
		    .datum(data[alias].data)
		    .attr("class", "line line" + plotId.replace('#','')+alias)
		    .attr("clip-path", "url(#clip)")
		    .style("opacity", 1)
		    .style("stroke", colorMap[alias])
		    //.attr("id", plotId+alias)
		    .attr("d", line);
	    }

	    var bandId = 'band_'+plotId.replace('#','');
	    // handle zoom and its overlay
	    var band = svg.append("rect")
		.attr("id", bandId)
		.attr("width", 0)
		.attr("height", 0)
		.attr("x", 0)
		.attr("y", 0)
		.attr("class", "band");

	    var drag = d3.behavior.drag();

	    var zoomOverlayId = 'zoomOverlay_'+plotId.replace('#','');
	    var zoomOverlay = svg.append("rect")
		.attr("id", zoomOverlayId)
		.attr("width", width - 10)
		.attr("height", height)
		.attr("class", "zoomOverlay")
		.call(drag);

	    var zoomout = svg.append("g");

	    zoomout.append("rect")
		.attr("class", "zoomOut")
		.attr("width", 75)
		.attr("height", 40)
		.attr("x", -12)
		.attr("y", height + (margin.bottom - 20))
		.on("click", function() {
		    zoomOut();
		});

	    zoomout.append("text")
		.attr("class", "zoomOutText")
		.attr("width", 75)
		.attr("height", 30)
		.attr("x", -10)
		.attr("y", height + (margin.bottom - 5))
		.text("Zoom Out");

	    zoom();

	    drag.on("dragend", function() {
		var pos = d3.mouse(this);
		var x1 = x.invert(bandPos[0]);
		var x2 = x.invert(pos[0]);

		if (x1 < x2) {
		    zoomArea.x1 = x1;
		    zoomArea.x2 = x2;
		} else {
		    zoomArea.x1 = x2;
		    zoomArea.x2 = x1;
		}

		var y1 = y.invert(pos[1]);
		var y2 = y.invert(bandPos[1]);

		if (x1 < x2) {
		    zoomArea.y1 = y1;
		    zoomArea.y2 = y2;
		} else {
		    zoomArea.y1 = y2;
		    zoomArea.y2 = y1;
		}

		bandPos = [-1, -1];

		d3.select("#"+bandId).transition()
		    .attr("width", 0)
		    .attr("height", 0)
		    .attr("x", bandPos[0])
		    .attr("y", bandPos[1]);

		zoom();
	    });

	    drag.on("drag", function() {

		var pos = d3.mouse(this);

		if (pos[0] < bandPos[0]) {
		    d3.select("#"+bandId).
			attr("transform", "translate(" + (pos[0]) + "," + bandPos[1] + ")");
		}
		if (pos[1] < bandPos[1]) {
		    d3.select("#"+bandId).
			attr("transform", "translate(" + (pos[0]) + "," + pos[1] + ")");
		}
		if (pos[1] < bandPos[1] && pos[0] > bandPos[0]) {
		    d3.select("#"+bandId).
			attr("transform", "translate(" + (bandPos[0]) + "," + pos[1] + ")");
		}

		//set new position of band when user initializes drag
		if (bandPos[0] == -1) {
		    bandPos = pos;
		    d3.select("#"+bandId).attr("transform", "translate(" + bandPos[0] + "," + bandPos[1] + ")");
		}

		d3.select("#"+bandId).transition().duration(1)
		    .attr("width", Math.abs(bandPos[0] - pos[0]))
		    .attr("height", Math.abs(bandPos[1] - pos[1]));
	    });

	    function zoom() {
		//recalculate domains
		if (zoomArea.x1 > zoomArea.x2) {
		    x.domain([zoomArea.x2, zoomArea.x1]);
		} else {
		    x.domain([zoomArea.x1, zoomArea.x2]);
		}

		if (zoomArea.y1 > zoomArea.y2) {
		    y.domain([zoomArea.y2, zoomArea.y1]);
		} else {
		    y.domain([zoomArea.y1, zoomArea.y2]);
		}

		//update axis and redraw lines
		var t = svg.transition().duration(750);
		t.select(".x.axis").call(xAxis);
		t.select(".y.axis").call(yAxis);

		t.selectAll(".line").attr("d", line); 
	    }

	    var zoomOut = function() {
		x.domain([0, xdomain]);
		y.domain([0, ydomain]);

		var t = svg.transition().duration(750);
		t.select(".x.axis").call(xAxis);
		t.select(".y.axis").call(yAxis);

		t.selectAll(".line").attr("d", line);     
	    }
	    var longestName = names.sort(function (a, b) { return b.length - a.length; })[0];
	    var legendWidth = longestName.length * 5 + 10;
	    // add legend   
	    var legend = svg.append("g")
		.attr("class", "legend")
		.attr("height", 100)
		.attr("width", legendWidth * 2)
		.attr('transform', 'translate(0, 0)');

	    legend.selectAll('g').data(names)
		.enter()
		.append('g')
		.each(function(d, i) {
		    var g = d3.select(this);
		    g.append("rect")
			.attr("x", width - legendWidth)
			.attr("y", i*25)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", colorMap[d])
			.on('click', function() {
			    var active = data[d].active ? false : true,
			    newOpacity = active ? 0 : 1;
			    d3.select('.line'+d)
				.transition().duration(100)
				.style("opacity", newOpacity);
			    data[d].active = active;
			});

		    
		    g.append("text")
			.attr("x", width - legendWidth + 10)
			.attr("y", i * 25 + 8)
			.attr("height",30)
			.attr("width",legendWidth)
			.style("fill", "black")
			.text(d)
			.on('click', function() {
			    var active = data[d].active ? false : true,
			    newOpacity = active ? 0 : 1;
			    d3.select('.line'+plotId.replace('#','')+d)
				.transition().duration(100)
				.style("opacity", newOpacity);
			    data[d].active = active;
			});
		})
	},
    }
});
