// Declare a variable to hold the loaded csv data.
var globalData;
var totalModels;

// Define margins for the visualizations. 
const margin = { top: 20, right: 20, bottom: 50, left: 80 };

// Calculate the width and height of the visualizations based on the margins.
const width = 1200 - margin.left - margin.right;
const height = 150 - margin.top - margin.bottom;

// This function initiates the dashboard and loads the csv data.
function startDashboard() {
  // Load the csv data using D3.js.
  d3.csv("ev_cars.csv")
    .then((data) => {

      const cleanData = removeColumn(data, 'PlugType');
      console.log(cleanData);

      // Once the data is loaded successfully, store it in the globalData variable.
      globalData = data;
      totalModels = data;

      // Create different visualizations using the loaded data.
      createBarChart(data);
      createParallelCoordinates(cleanData);
      //createParallelSets(data);
    })
    .catch((error) => {
      // If there's an error while loading the csv data, log the error.
      console.error("Error loading the csv file:", error);
    });
}

function removeColumn(data, columnToRemove) {
    return data.map((obj) => {
        const newObj = { ...obj }; // Create a shallow copy of the object
        delete newObj[columnToRemove]; // Remove the specified column
        return newObj;
    });
}

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
      

    modelsPerBrand = d3.rollup(data, v => v.length, d => d.Brand);
    const modelsPerBrandArray = Array.from(modelsPerBrand, ([brand, count]) => ({ brand, count }));
    modelsPerBrandArray.sort((a, b) => b.count - a.count);

    // Create scales for x and y
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Brand))
        .range([0, width])
        .padding(0.15);

    const yScale = d3.scaleLinear()
        .domain([0, 15])
        .range([height, 0]);

    // Create a color scale for the bars based on the seats data
    const colorScale = d3.scaleOrdinal()
        .domain([4, 7])
        .range(d3.schemeCategory10); // change

    svg.append("text")
        .attr("class", "total-percentage-label")
        .attr("x", 0)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .text("100% models");

    // Create the bars
    svg
        .selectAll(".bar")
        .data(modelsPerBrandArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.brand))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.count))
        .attr("fill", d => colorScale(d.Seats));

    // Append x and y axes to the chart
    svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-90) translate(-10, -10)")
        .style("text-anchor", "end");

    svg
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(3)); // change ?
}

function createParallelCoordinates(data) {

    const selectedAttributes = ['AccelSec', 'Battery_Pack Kwh', 'Efficiency_WhKm', 'FastCharge_KmH', 'PriceEuro', 'Range_Km', 'TopSpeed_KmH'];

    const selectedData = data.map((d) => {
        const selectedObj = {};
        selectedAttributes.forEach((attr) => {
          selectedObj[attr] = d[attr];
        });
        return selectedObj;
    });
    
    // Select the #parallelCoords element and append an SVG to it
    const svg = d3
        .select("#parallelCoords")
        .append("svg")
        .attr("width", window.innerWidth)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const dimensions = Object.keys(selectedData[0]).filter(function(d) { return d != "Species" });

    // For each dimension, build a linear scale.
    const yScale = {}
    for (i in dimensions) {
      const name = dimensions[i]
      yScale[name] = d3.scaleLinear()
        .domain( d3.extent(data, function(d) { return +d[name]; }) )
        .range([height, 0])
    }

    // Build the X scale -> it find the best position for each Y axis
    xScale = d3
      .scalePoint()
      .range([0, width])
      .padding(0.15)
      .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
    }

     // Draw the lines
    svg
      .selectAll(".lines")
      .data(data)
      .join("path")
      .attr("d",  path)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5);

    
    // Draw the axis
    svg
      .selectAll("myAxis")
      .data(dimensions).enter()
      .append("g")
      .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
      .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yScale[d])); })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black");

}