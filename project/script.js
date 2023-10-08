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
      // Once the data is loaded successfully, store it in the globalData variable.
      globalData = data;
      totalModels = data;

      // Create different visualizations using the loaded data.
      createBarChart(data);
      //createParallelCoordinates(data);
      //createParallelSets(data);
    })
    .catch((error) => {
      // If there's an error while loading the csv data, log the error.
      console.error("Error loading the csv file:", error);
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