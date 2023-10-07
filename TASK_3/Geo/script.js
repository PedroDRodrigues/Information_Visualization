// Declare global variables to hold data for countries and capita
var globalDataCountries;
var globalDataCapita;

// Define margin and dimensions for the charts
const margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 80,
};
const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Function to start the dashboard
function startDashboard() {
  // Helper functions to load JSON and CSV files using D3's d3.json and d3.csv
  function loadJSON(file) {
    return d3.json(file);
  }
  function loadCSV(file) {
    return d3.csv(file);
  }

  // Function to import both files (data.json and gapminder.csv) using Promise.all
  function importFiles(file1, file2) {
    return Promise.all([loadJSON(file1), loadCSV(file2)]);
  }

  // File names for JSON and CSV files
  const file1 = "data.json";
  const file2 = "gapminder.csv";

  // Import the files and process the data
  importFiles(file1, file2).then(function (results) {
    // Store the JSON data into globalDataCountries using topojson.feature
    globalDataCountries = topojson.feature(results[0], results[0].objects.countries);
    
    // Store the CSV data into globalDataCapita
    globalDataCapita = results[1];

    // Convert incomeperperson and alcconsumption data to numbers
    globalDataCapita.forEach(function (d) {
      d.incomeperperson = +d.incomeperperson;
      d.alcconsumption = +d.alcconsumption;
    });

    // Call functions to create the choropleth map and scatter plot
    createChoroplethMap();
    createScatterPlot();
    createMirroredBeeswarmPlot();
  });
}

// Function to create the choropleth map
function createChoroplethMap() {
  // Filter the data to remove entries with missing incomeperperson values
  currentData = globalDataCapita.filter(function (d) {
    return d.incomeperperson != "";
  });

  // Create a title for the choropleth map
  const chartTitle = d3
    .select("#choroplethTitle")
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top)
    .text("Income per person");

  // Create an SVG element to hold the map
  const svg = d3
    .select("#choropleth")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a group to hold the map elements
  const mapGroup = svg.append("g");

  // Create a color scale for the incomeperperson values
  const colorScale = d3
    .scaleLog()
    .domain([
      d3.min(currentData, (d) => d.incomeperperson),
      d3.max(currentData, (d) => d.incomeperperson),
    ])
    .range([0, 1]);

  // Create a projection to convert geo-coordinates to pixel values
  const projection = d3
    .geoMercator()
    .fitSize([width, height], globalDataCountries);

  // Create a path generator for the map
  const path = d3.geoPath().projection(projection);

  // Add countries as path elements to the map
  mapGroup
    .selectAll(".country")
    .data(globalDataCountries.features)
    .enter()
    .append("path")
    .attr("class", "country data")
    .attr("d", path)
    .attr("stroke", "black")
    .on("mouseover", handleMouseOver) // Function to handle mouseover event
    .on("mouseout", handleMouseOut)   // Function to handle mouseout event
    .append("title")
    .text((d) => d.properties.name);

  // Set the fill color of each country based on its incomeperperson value
  currentData.forEach((element) => {
    mapGroup
      .selectAll("path")
      .filter(function (d) {
        return d.properties.name == element.country;
      })
      .attr("fill", d3.interpolateBlues(colorScale(element.incomeperperson)));
  });

  // Create zoom behavior for the map
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", zoomed);

  // Apply zoom behavior to the SVG element
  svg.call(zoom);

  // Function to handle the zoom event
  function zoomed(event) {
    mapGroup.attr("transform", event.transform);
  }

  // Create a legend for the choropleth map
  const svg2 = d3
    .select("#choroplethLabel")
    .append("svg")
    .attr("width", width * 0.2)
    .attr("height", height);

  // Create a gradient for the legend color scale
  const defs = svg2.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", "colorScaleGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.interpolateBlues(0));

  gradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.interpolateBlues(1));

  // Create the legend rectangle filled with the color scale gradient
  const legend = svg2.append("g").attr("transform", `translate(0, 40)`);
  const legendHeight = height - 40;
  const legendWidth = 20;

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#colorScaleGradient)");

  // Add tick marks and labels to the legend
  for (let index = 0; index <= 1; index += 0.25) {
    legend
      .append("text")
      .attr("x", legendWidth + 5)
      .attr("y", legendHeight * index)
      .text(Math.round(colorScale.invert(index)));
  }
}

// Function to create the scatter plot
function createScatterPlot() {
  // Filter the data to remove entries with missing incomeperperson or alcconsumption values
  currentData = globalDataCapita.filter(function (d) {
    return d.incomeperperson != "" && d.alcconsumption != "";
  });

  // Create an SVG element to hold the scatter plot
  const svg = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x and y scales for the scatter plot
  const xScale = d3
    .scaleLog()
    .domain([
      d3.min(currentData, (d) => d.incomeperperson),
      d3.max(currentData, (d) => d.incomeperperson),
    ])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(currentData, (d) => d.alcconsumption),
      d3.max(currentData, (d) => d.alcconsumption),
    ])
    .range([height, 0]);

  // Add circles to the scatter plot representing each country
  svg
    .selectAll(".circle")
    .data(currentData, (d) => d.country)
    .enter()
    .append("circle")
    .attr("class", "circle data")
    .attr("cx", (d) => xScale(d.incomeperperson))
    .attr("cy", (d) => yScale(d.alcconsumption))
    .attr("r", 5)
    .attr("fill", "steelblue")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOver) // Function to handle mouseover event
    .on("mouseout", handleMouseOut)   // Function to handle mouseout event
    .append("title")
    .text((d) => d.country);

  // Create tick marks and labels for the x and y axes
  var xTicks = [];
  var yTicks = [];
  for (let index = 0; index <= 1; index += 0.25) {
    xTicks.push(Math.round(xScale.invert(index * width)));
    yTicks.push(Math.round(yScale.invert(index * height)));
  }

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat((d) => d)
        .tickValues(xTicks)
        .tickSizeOuter(0)
    );

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => d)
        .tickValues(yTicks)
        .tickSizeOuter(0)
    );

  // Add labels for the x and y axes
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 20)
    .style("text-anchor", "middle")
    .text("Income per person");

  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Alcohol Consumption");
}

function dodge (data, {radius, x}) {
  const radius2 = radius ** 2;
  const circles = data.map(d => ({x: x(d), data: d})).sort((a, b) => a.x - b.x);
  const epsilon = 1e-3;
  let head = null, tail = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const b of circles) {

    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && head.x < b.x - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(b.x, b.y = 0)) {
      let a = head;
      b.y = Infinity;
      do {
        let y1 = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
        let y2 = a.y - Math.sqrt(radius2 - (a.x - b.x) ** 2);
        if (Math.abs(y1) < Math.abs(b.y) && !intersects(b.x, y1)) b.y = y1;
        if (Math.abs(y2) < Math.abs(b.y) && !intersects(b.x, y2)) b.y = y2;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return circles;
}

// Function to create a mirrored beeswarm plot
function createMirroredBeeswarmPlot() {
  
  // Filter the data to remove entries with missing incomeperperson or alcconsumption values
  currentData = globalDataCapita.filter(function (d) {
    return d.incomeperperson !== "" && !isNaN(d.incomeperperson) && d.alcconsumption !== "";
  })

  // Create an SVG element to hold the beeswarm plot
  const svg = d3
    .select("#beeswarm-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("style", "max-width: 100%; height: auto;")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x, r and f scales for the beeswarm plot
  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(currentData, (d) => d.incomeperperson),
      d3.max(currentData, (d) => d.incomeperperson),
    ])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(currentData, d => d.alcconsumption)])
    .range([0, height]);

  const rScale = d3.scaleLinear()
    .domain([d3.min(currentData, (d) => d.alcconsumption), d3.max(currentData, (d) => d.alcconsumption)])
    .range([0, 10]); 
  
  // Create a color scale for the incomeperperson values
  const colorScale = d3
    .scaleSequential()
    .domain([
      d3.min(currentData, (d) => d.incomeperperson),
      d3.max(currentData, (d) => d.incomeperperson),
    ])
    .interpolator(d3.interpolateBlues);
  
  const padding = 10;

  // Create an empty index or mapping object
  const circleIndex = {};
  
  // Define your circles using the dodge function and index them
  const circles = dodge(currentData, { radius: 5, x: (d) => xScale(d.incomeperperson) }).map((circle, index) => {
    circleIndex[index] = circle.data; // Associate each circle with its data point
    return {
      circle: circle,
      //country: circle.data.country, // Add the 'country' property to each element
    };
  });

  // Filter circles based on your criteria (example: incomeperperson)
  const filteredCircles = circles.filter((circle) => {
    return circle.circle.data.incomeperperson !== "" && !isNaN(circle.circle.data.incomeperperson);
  });

  // Add circles to the mirrored beeswarm plot representing each country
  svg
    .selectAll(".circle")
    .data(filteredCircles, (d) => (d.circle.data ? d.circle.data.country : null))
    .enter()
    .append("circle")
    .attr("class", "bee data")
    .attr("cx", (d) => xScale(d.circle.data.incomeperperson))
    .attr("cy", (d, i) => {
      let cy;
      if (isNaN(d.circle.data.alcconsumption)) {
        // Calculate the y-position for circles without 'alcconsumption' data
        cy = i % 2 === 0 ? height / 2 + padding : height / 2 - padding;
      } else {
        // Calculate the y-position for circles with 'alcconsumption' data
        const yOffset = rScale(d.circle.data.alcconsumption) * 0.1; // Adjust the vertical spacing as needed
        cy = height / 2 - yOffset + (i % 2 === 0 ? - padding : padding);
      }
      return cy;
    })    
    .attr("r", (d) => rScale(d.circle.data.alcconsumption))
    .attr("fill", "steelblue")
    .attr("stroke", "black") 
    .append("title")
    .text((d) => d.circle.data && d.circle.data.country);


  // Create tick marks and labels for the x and y axes
  var xTicks = [];
  var yTicks = [];
  for (let index = 0; index <= 1; index += 0.25) {
    xTicks.push(Math.round(xScale.invert(index * width)));
    yTicks.push(Math.round(yScale.invert(index * height)));
  }

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat((d) => d)
        .tickValues(xTicks)
        .tickSizeOuter(0)
    );

  // Add labels for the x and y axes
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 20)
    .style("text-anchor", "middle")
    .text("Income per person");

}