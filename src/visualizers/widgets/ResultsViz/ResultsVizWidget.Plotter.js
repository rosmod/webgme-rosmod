

define(['plottable/plottable', 'd3', 'css!plottable/plottable.css'], function(Plottable,d3) {
    'use strict';
    return {
	plotData: function(plotId, data, offset) {
	    /*
	    var msPerDay = 86400000;
	    var dataObjects = [];
	    var labelList = [];
	    var lineRenderer;

	    var linear= {};
	    linear.data = makeLinearData(2, 20, 2);
	    linear.color = "#34b24c";
	    var exponential = {};
	    exponential.data = makeExponentialData(20, 1, 1.5);
	    exponential.color = "#ffa500";
	    var oscillate = {};
	    oscillate.data = makeOscillatingData(50, .4);
	    oscillate.color = "#551a8b";
	    dataObjects = [linear, exponential, oscillate];

	    dataObjects.forEach(function(dataObject) {
		dataObject.dataset = new Plottable.Dataset(dataObject.data, {"color": dataObject.color});
		dataObject.include = true;
	    });

	    var xScale = new Plottable.Scales.Time();
	    var xAxis = new Plottable.Axes.Time(xScale, "bottom");

	    var yScale = new Plottable.Scales.Linear().domain([0, 40]);
	    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

	    includeDatasets();

	    var linLabel = makeLabel("☑ linear dataset");
	    var expLabel = makeLabel("☑ exponential dataset");
	    var oscLabel = makeLabel("☑ oscillating dataset");

	    var labels = new Plottable.Components.Table([[linLabel], [expLabel], [oscLabel]]);
	    var areaChart = new Plottable.Components.Table([[null, labels],
							    [yAxis, lineRenderer],
							    [null,  xAxis]]);

	    areaChart.renderTo(plotId);

	    new Plottable.Interactions.Click()
		.onClick(function() {
		    toggle(linLabel, linear)
		})
		.attachTo(linLabel);
	    new Plottable.Interactions.Click()
		.onClick(function() {
		    toggle(expLabel, exponential)
		})
		.attachTo(expLabel);
	    new Plottable.Interactions.Click()
		.onClick(function() {
		    toggle(oscLabel, oscillate)
		})
		.attachTo(oscLabel);
	    */

	    // extent returns array: [min, max]
	    var maxXs = Object.keys(data).map(function(key) {
		return d3.extent(data[key].data, function(xy) { return xy[0] - offset; })[1];
	    });
	    var maxYs = Object.keys(data).map(function(key) {
		return d3.extent(data[key].data, function(xy) { return xy[1]; })[1];
	    });
	    var xdomain = d3.max(maxXs);
	    var ydomain = d3.max(maxYs); 

	    var xScale = new Plottable.Scales.Linear();
	    var yScale = new Plottable.Scales.Linear();
	    var colorScale = new Plottable.Scales.Color();

	    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
	    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
	    var xLabel = new Plottable.Components.AxisLabel("Time (s)");
	    var yLabel = new Plottable.Components.AxisLabel("Execution\nTime (s)", -90.0);

	    var legend = new Plottable.Components.Legend(colorScale).maxEntriesPerRow(3);
	    var plots = new Plottable.Components.Group();
	    
	    var panZoom = new Plottable.Interactions.PanZoom();
	    panZoom.addXScale(xScale);
	    panZoom.addYScale(yScale);
	    panZoom.attachTo(plots);
	    var panZoomX = new Plottable.Interactions.PanZoom();
	    panZoomX.addXScale(xScale);
	    panZoomX.attachTo(xAxis);
	    var panZoomY = new Plottable.Interactions.PanZoom();
	    panZoomY.addYScale(yScale);
	    panZoomY.attachTo(yAxis);

	    for (var alias in data) {
		plots.append(new Plottable.Plots.Line()
			     .addDataset(new Plottable.Dataset(data[alias].data))
			     .x(function(d) { return d[0] - offset; }, xScale)
			     .y(function(d) { return d[1]; }, yScale)
			     .attr("stroke", colorScale.scale(alias))
			     .attr("stroke-width", 1)
			    );
	    }

	    var table = new Plottable.Components.Table([
		[null,null, legend],
		[yLabel,yAxis, plots],
		[null,null, xAxis],
		[null,null, xLabel]
	    ]);

	    var plotName = plotId.replace('#','');
	    $("#pan-zoom-buttons_"+plotName+" li").on("click", function(event) {
		event.preventDefault();

		$("#pan-zoom-buttons_"+plotName+" li").removeClass("selected");
		var id = $(this).attr("id");
		if (id == "pan-zoom-x") {
		    panZoom.xScales([xScale]);
		    panZoom.yScales([]);
		    panZoomX.enabled(true);
		    panZoomY.enabled(false);
		} else if (id == "pan-zoom-y") {
		    panZoom.xScales([]);
		    panZoom.yScales([yScale]);
		    panZoomX.enabled(false);
		    panZoomY.enabled(true);
		} else {
		    panZoom.xScales([xScale]);
		    panZoom.yScales([yScale]);
		    panZoomX.enabled(true);
		    panZoomY.enabled(true);
		}
		$(this).addClass("selected");
	    });

	    table.renderTo(plotId);
	}
    }
});
