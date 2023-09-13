// Function to update the bar chart with new data
function updateBarChart(data) {
  // Select the SVG element of the bar chart
  const svg = d3.select("#barChart").select("svg").select("g");

  // Create x and y scales for the chart
  const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.oscar_year))
    .range([0, height])
    .padding(0.2);

  // Create a color scale for the bars based on the budget data
  const colorScale = d3
    .scaleSequential(d3.interpolateBlues)
    .domain([
      d3.min(globalData, (d) => d.budget),
      d3.max(globalData, (d) => d.budget),
    ]);

  // Select all existing bars and bind the data to them
  const bars = svg.selectAll(".bar").data(data, (d) => d.title);

  // Update existing bars with transitions for position, width, height, and color
  bars
    .transition()
    .duration(1000)
    .attr("y", (d) => yScale(d.oscar_year))
    .attr("width", (d) => xScale(d.rating))
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.budget));

  // Add new bars for any new data points and transition them to their correct position and width
  bars
    .enter()
    .append("rect")
    .attr("class", "bar data")
    .attr("y", (d) => yScale(d.oscar_year))
    .attr("width", 0)
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.budget))
    .attr("stroke", "black")
    .transition()
    .duration(2000)
    .attr("width", (d) => xScale(d.rating));

  // Remove any bars that are no longer in the updated data
  bars.exit().transition().duration(500).attr("width", 0).remove();

  // Update the y-axis with the new data points
  svg
    .select(".y-axis")
    .transition()
    .duration(500)
    .call(d3.axisLeft(yScale).tickSizeOuter(0));

  // Add tooltips to all bars with the movie title as the content
  svg
    .selectAll(".bar")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d.title);
}

// Function to update the scatter plot with new data
function updateScatterPlot(data) {
  // Select the SVG element of the scatter plot
  const svg = d3.select("#scatterPlot").select("svg").select("g");

  // Create x, y, and r (radius) scales for the plot
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.budget)])
    .range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]);
  const rScale = d3
    .scaleLinear()
    .domain([
      d3.min(globalData, (d) => d.oscar_year),
      d3.max(globalData, (d) => d.oscar_year),
    ])
    .range([5, 15]);

  // Select all existing circles and bind the data to them
  const circles = svg.selectAll(".circle").data(data, (d) => d.title);

  // Update existing circles with transitions for position and radius
  circles
    .transition()
    .duration(1000)
    .attr("cx", (d) => xScale(d.budget))
    .attr("cy", (d) => yScale(d.rating))
    .attr("r", (d) => rScale(d.oscar_year));

  // Add new circles for any new data points and transition them to their correct position and radius
  circles
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.budget))
    .attr("cy", (d) => yScale(d.rating))
    .attr("r", 0)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .transition()
    .duration(500)
    .attr("r", (d) => rScale(d.oscar_year));

  // Remove any circles that are no longer in the updated data
  circles.exit().transition().duration(500).attr("r", 0).remove();

  // Update the y-axis with the new data points
  svg.select(".y-axis").transition().duration(500).call(d3.axisLeft(yScale));

  // Update the x-axis with the new data points, formatting the labels for budget in millions
  svg
    .select(".x-axis")
    .transition()
    .duration(500)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat((d) => d3.format(".1f")(d / 1000000) + "M")
        .tickSizeOuter(0)
    );

  // Add tooltips to all circles with the movie title as the content
  svg
    .selectAll(".circle")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d.title);
}

// Function to update the line chart with new data
function updateLineChart(data) {
  // Select the SVG element of the line chart
  const svg = d3.select("#lineChart").select("svg").select("g");

  // Create x and y scales for the chart
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.oscar_year))
    .range([width, 0])
    .padding(1);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.budget)])
    .range([height, 0]);

  // Create a line generator to draw the path based on the data points
  const line = d3
    .line()
    .x((d) => xScale(d.oscar_year))
    .y((d) => yScale(d.budget));

  // Update the line with the new data points
  svg.select(".line").datum(data).transition().duration(500).attr("d", line);

  // Select all existing circles and bind the data to them
  const circles = svg.selectAll(".circle").data(data, (d) => d.title);

  // Update existing circles with transitions for position
  circles
    .transition()
    .duration(500)
    .attr("cx", (d) => xScale(d.oscar_year))
    .attr("cy", (d) => yScale(d.budget));

  // Add new circles for any new data points and transition them to their correct position
  circles
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.oscar_year))
    .attr("cy", (d) => yScale(d.budget))
    .attr("r", 0)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .transition()
    .duration(500)
    .attr("r", 5);

  // Remove any circles that are no longer in the updated data
  circles.exit().transition().duration(500).attr("r", 0).remove();

  // Update the x-axis with the new data points, rotating the labels and adjusting the position
  svg
    .select(".x-axis")
    .transition()
    .duration(500)
    .call(d3.axisBottom(xScale).tickSizeOuter(0))
    .selectAll(".x-axis text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em");

  // Update the y-axis with the new data points, formatting the labels for budget in millions
  svg
    .select(".y-axis")
    .transition()
    .duration(500)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => d3.format(".1f")(d / 1000000) + "M")
        .tickSizeOuter(0)
    );

  // Add tooltips to all circles with the movie title as the content
  svg
    .selectAll(".circle")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d.title);
}

// Function to update the boxplot with new data
function updateBoxPlot(data) {

  // Select the SVG element of the boxplot
  const svg = d3.select("#boxPlot").select("svg").select("g");

  // Combine all budget values into a single array
  const allBudgets = data.map((d) => d.budget);

  // Create y scales for the chart
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(allBudgets)])
    .range([height, 0]);

  const box_center = 200;
  const box_width = 100;

  // Compute summary statistics used for the box:
  var data_sorted = allBudgets.sort(d3.ascending)
  var q1 = d3.quantile(data_sorted, .25)
  var median = d3.quantile(data_sorted, .5)
  var q3 = d3.quantile(data_sorted, .75)
  var min = d3.min(allBudgets)
  var max = d3.max(allBudgets)

  // Update the line with the new data points
  svg.select(".line").transition().duration(500).attr("y1", yScale(min)).attr("y2", yScale(max));
  
  // Select all existing boxes and bind the data to them
  const boxes = svg.selectAll(".box").data([allBudgets]);

  // Update existing boxes with transitions for position, width, height, and color
  boxes
    .transition()
    .duration(1000)
    .attr("y", yScale(q3))
    .attr("height", (yScale(q1) - yScale(q3)));
    
  // Add new box for any new data points and transition them to their correct position, width, height, and color
  boxes
    .enter()
    .append("rect")
    .attr("class", "box data")
    .attr("x", box_center)
    .attr("y", yScale(q3))
    .attr("width", box_width)
    .attr("height", 0)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .attr("stroke-width", 2.5)
    .transition()
    .duration(500)
    .attr("height", (yScale(q1) - yScale(q3)));

  // Remove the box that are no longer in the updated data
  boxes.exit().transition().duration(500).attr("height", 0).remove();

  // Select all existing circles and bind the data to them
  const medianLines = svg.selectAll(".median").data([min, median, max]);

  // Update existing circles with transitions for position
  medianLines
    .transition()
    .duration(500)
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d));

  // Add new circles for any new data points and transition them to their correct position
  medianLines
    .enter()
    .append("line")
    .attr("x1", box_center)
    .attr("y1", 0)
    .attr("x2", box_center + box_width)
    .attr("y2", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 5)
    .transition()
    .duration(500)
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d));

  // Remove any circles that are no longer in the updated data
  medianLines.exit().transition().duration(500).attr("y1", 0).attr("y2", 0).remove();

  // Update the y-axis with the new data points, formatting the labels for budget in millions
  svg
    .select(".y-axis")
    .transition()
    .duration(500)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => d3.format(".1f")(d / 1000000) + "M")
        .tickSizeOuter(0)
    );

  // Add tooltips to all boxes with the movie title as the content
  svg
    .selectAll(".box")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d.title);

  svg
    .selectAll(".median")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d3.format(".1f")(d / 1000000) + "M");
}