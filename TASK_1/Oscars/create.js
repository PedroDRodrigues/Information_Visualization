// Function to create a bar chart
function createBarChart(data) {
  // Select the #barChart element and append an SVG to it
  const svg = d3
    .select("#barChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x and y scales for the bar chart
  const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.oscar_year))
    .range([0, height])
    .padding(0.2);

  // Create a color scale for the bars based on the budget data
  const colorScale = d3
    .scaleSequential(d3.interpolateBlues)
    .domain([d3.min(data, (d) => d.budget), d3.max(data, (d) => d.budget)]);

  // Append and style the bars using the data and scales
  svg
    .selectAll(".bar")
    .data(data, (d) => d.title)
    .enter()
    .append("rect")
    .attr("class", "bar data")
    .attr("y", (d) => yScale(d.oscar_year))
    .attr("width", (d) => xScale(d.rating))
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.budget))
    .attr("stroke", "black")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d.title);

  // Append x and y axes to the chart
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale).tickSizeOuter(0));

  // Append x and y axis labels
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 20)
    .style("text-anchor", "middle")
    .text("Rating");

  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Oscar Year");
}

// Function to create a scatter plot
function createScatterPlot(data) {
  // Select the #scatterPlot element and append an SVG to it
  const svg = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x, y, and radius scales for the scatter plot
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.budget)])
    .range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]);
  const rScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d.oscar_year),
      d3.max(data, (d) => d.oscar_year),
    ])
    .range([5, 15]);

  // Append and style circles using the data and scales
  svg
    .selectAll(".circle")
    .data(data, (d) => d.title)
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.budget))
    .attr("cy", (d) => yScale(d.rating))
    .attr("r", (d) => rScale(d.oscar_year))
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d.title);

  // Append x and y axes to the scatter plot
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat((d) => d3.format(".1f")(d / 1000000) + "M")
        .tickSizeOuter(0)
    );

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  // Append x and y axis labels
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 20)
    .style("text-anchor", "middle")
    .text("Budget");

  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 50)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Rating");
}

// Function to create a line chart
function createLineChart(data) {
  // Select the #lineChart element and append an SVG to it
  const svg = d3
    .select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x and y scales for the line chart
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.oscar_year))
    .range([width, 0])
    .padding(1);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.budget)])
    .range([height, 0]);

  // Create a line generator to draw the line path
  const line = d3
    .line()
    .x((d) => xScale(d.oscar_year))
    .y((d) => yScale(d.budget));

  // Append the line path to the chart
  svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);

  // Append circles using the data and scales to create data points on the line
  svg
    .selectAll(".circle")
    .data(data, (d) => d.title)
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.oscar_year))
    .attr("cy", (d) => yScale(d.budget))
    .attr("r", 5)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d.title);

  // Append x and y axes to the line chart
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickSizeOuter(0));

  svg
    .selectAll(".x-axis text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em");

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => d3.format(".1f")(d / 1000000) + "M")
        .tickSizeOuter(0)
    );

  // Append x and y axis labels
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 30)
    .style("text-anchor", "middle")
    .text("Oscar Year");

  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Budget");
}

// Function to create a box plot
function createBoxPlot(data) {
  // Select the #boxPlot element and append an SVG to it
  const svg = d3
    .select("#boxPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Combine all budget values into a single array
  const allBudgets = data.map((d) => d.budget);

  // Compute summary statistics used for the box:
  var data_sorted = allBudgets.sort(d3.ascending)
  var q1 = d3.quantile(data_sorted, .25)
  var median = d3.quantile(data_sorted, .5)
  var q3 = d3.quantile(data_sorted, .75)
  var min = d3.min(allBudgets)
  var max = d3.max(allBudgets)

  // Create y scale for the line chart
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(allBudgets)])
    .range([height, 0]);

  const box_center = 200;
  const box_width = 100;

  // Create the main vertical line
  svg
    .append("line")
    .attr("class", "line") // is there a better way to get the line?
    .attr("x1", box_center + box_width / 2)
    .attr("x2", box_center + box_width / 2)
    .attr("y1", yScale(min))
    .attr("y2", yScale(max))
    .attr("stroke", "black")

  // Create the box plot elements
  svg
    .selectAll(".box")
    .data([allBudgets])
    .enter()
    .append("rect")
    .attr("class", "box")
    .attr("x", box_center)
    .attr("y", yScale(q3))
    .attr("width", box_width)
    .attr("height", (yScale(q1) - yScale(q3)))
    .attr("stroke", "black")
    .attr("stroke-width", 2.5)
    .style("fill", "steelblue")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d.title);

  svg
    .selectAll(".median")
    .data([min, median, max])
    .enter()
    .append("line")
    .attr("class", "medianLine")
    .attr("x1", box_center)
    .attr("y1", (d) => yScale(d))
    .attr("x2", box_center + box_width)
    .attr("y2", (d) => yScale(d))
    .attr("stroke", "black")
    .attr("stroke-width", 5)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .append("title")
    .text((d) => d3.format(".1f")(d / 1000000) + "M");

  // Append y axis to the line chart

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => d3.format(".1f")(d / 1000000) + "M")
        .tickSizeOuter(0)
    );

  // Append y axis label
  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Budget");
}
