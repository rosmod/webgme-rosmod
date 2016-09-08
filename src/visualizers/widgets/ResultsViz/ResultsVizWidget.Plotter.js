

define(['plottable/plottable', 'd3', 'css!plottable/plottable.css'], function(Plottable,d3) {
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

	    return table.renderTo(plotId);
	}
    }
});
