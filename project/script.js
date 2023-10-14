// Declare a variable to hold the loaded csv data.
var globalData;
var totalModels;

// Define margins for the visualizations. 
const margin = { top: 20, right: 20, bottom: 50, left: 80 };

// Calculate the width and height of the visualizations based on the margins.
const width = 1200 - margin.left - margin.right;
const height = 150 - margin.top - margin.bottom;

// Keep track of the positions of all axes
const axisPositions = {};
const axisCombination = ['AccelSec', 'Battery_Pack Kwh', 'Efficiency_WhKm', 'FastCharge_KmH', 'PriceEuro', 'Range_Km', 'TopSpeed_KmH'];
const spaceBetweenAxes = width / 6;

// This function initiates the dashboard and loads the csv data.
function startDashboard() {
  // Load the csv data using D3.js.
  d3.csv("ev_cars.csv")
    .then((data) => {

      const cleanData = removeColumn(data, 'PlugType');

      // Once the data is loaded successfully, store it in the globalData variable.
      globalData = data;
      totalModels = data;

 
      // Create different visualizations using the loaded data.
      createBarChart(data);
      createParallelSets(data);
      createParallelCoordinates(cleanData);

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
        .attr("height", height + margin.top + margin.bottom + 50)
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
    //const colorScale = d3.scaleOrdinal()
      //  .domain([4, 7])
      //  .range(d3.schemeCategory10); // change
    const colorScale = d3.scaleSequential(d3.interpolateViridis) // You can choose a different color scheme
      .domain([0, modelsPerBrandArray]);
    

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
        .call(d3.axisLeft(yScale).ticks(5)); // change ?

    // Create a color scale legend on the left underside
    const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0, ${height + 80})`);

    const legendGradient = d3.scaleLinear()
        .domain([0, d3.max(modelsPerBrandArray, d => d.Seats)])
        .range([height, 0]);

    legend.append("rect")
        .attr("width", 200)
        .attr("height", 20)
        .style("fill", "url(#legendGradient)");

    legend.append("text")
        .attr("x", 100)
        .attr("y", -10)
        //size of letter need to be lower
        .attr("font-size", "10px")
        .attr("dy", "0.5em")
        .attr("text-anchor", "middle")
        .text("Seats Counter");

    // Create a gradient for the color legend
    svg.append("defs")
        .append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        //.attr("y1", "0%")
        //.attr("y2", "100%")
        .selectAll("stop")
        .data(d3.range(0, 1.1, 0.1)) // Adjust the range as needed
        .enter().append("stop")
        .attr("offset", d => d * 100 + "%")
        .attr("stop-color", d => colorScale(d3.max(modelsPerBrandArray, d => d.Seats) * d));

    // Add labels for the gradient
    legend.selectAll("text.label")
        .data(d3.range(0, 1.1, 0.1)) // Adjust the range as needed
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => legendGradient(d * d3.max(modelsPerBrandArray, d => d.Seats)))
        .attr("y", 30)
        .attr("dy", "0.5em")
        .text(d => Math.round(d * d3.max(modelsPerBrandArray, d => d.Seats)));

}

function createParallelCoordinates(data) {

    const selectedData = data.map((d) => {
        const selectedObj = {};
        axisCombination.forEach((attr) => {
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

    // For each dimension, build a linear scale.
    const xScale = d3
      .scalePoint()
      .range([0, width])
      .padding(0.15)
      .domain(axisCombination);

    const yScale = {};
    axisCombination.forEach((attr) => {
      yScale[attr] = d3
        .scaleLinear()
        .domain(d3.extent(data, (d) => +d[attr]))
        .range([height, 0]);
    });

    // Calculate the mean values of each attribute
    const meanValues = {};
    axisCombination.forEach((attr) => {
      meanValues[attr] = d3.mean(data, (d) => +d[attr]);
    });

    // Draw the axis
    const axisGroups = svg
      .selectAll(".axis")
      .data(axisCombination)
      .enter()
      .append("g")
      .attr("class", "axisGroup")
      .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; });

     // Draw the lines
     svg
     .selectAll(".lines")
     .data(data)
     .enter()
     .append("path")
     .attr("class", "lines")
     .attr("d", (d) => d3.line()(axisCombination.map(function(p) {return ([xScale(p), yScale[p](d[p])]);})))
     .attr("fill", "none")
     .attr("stroke", "#69b3a2")
     .attr("opacity", 0.5);

    axisGroups
      .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yScale[d])); })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", height - margin.top + margin.bottom - 10)
      .text(function(d) { return d; })
      .style("fill", "black");
    
    const pointMeans = axisGroups
      .select(".points")
      .data(axisCombination)
      .enter()
      .append("circle")
      .attr("class", "meanPoint")
      .attr("data-axis", (d) => d) // Set the data-axis attribute
      .attr("r", 2)
      .attr("cx",  function (d) { return xScale(d) })
      .attr("cy", function (d) { return yScale[d](meanValues[d]) })
      .attr("fill", "black");

    // Add drag behavior to axis labels
    axisGroups
      .call(
        d3.drag()
          .on("start", function (event, d) {
            //Occulte the mean point
            d3.selectAll(".meanPoint").attr("opacity", 0);

            // Store the original position for reference
            d3.select(this).attr("data-original-x", d3.select(this).attr("transform"));
          })
          .on("drag", function (event, d) {
            const x = event.x;
            const originalX = d3.select(this).attr("data-original-x");
            const draggedAxis = d;

            // Update the position of the axis label
            //d3.select(this).attr("transform", `translate(${x})`);

            // Find the nearest axis and swap positions
            const closestAxis = axisCombination.reduce(function (a, b) {
              return Math.abs(xScale(b) - x) < Math.abs(xScale(a) - x) ? b : a;
            });

            // Update the positions of the axes (only visually)
            d3.select(this)
              .transition()
              .duration(250)
              .attr("transform", `translate(${xScale(closestAxis)}, 0)`);
            
            console.log("closest: ", closestAxis);
            console.log("dragged: ", draggedAxis);

            d3.selectAll(".axisGroup")
              .filter(function(axis) {
                return axis == closestAxis;
              })
              .transition()
              .duration(150)
              .attr("transform", `translate(${xScale(draggedAxis)}, 0)`);

            // Update the order of dimensions
            const oldIndex = axisCombination.indexOf(draggedAxis);
            const newIndex = axisCombination.indexOf(closestAxis);

            if (oldIndex !== newIndex) {
              axisCombination[oldIndex] = closestAxis;
              axisCombination[newIndex] = draggedAxis;

              axisCombination.forEach((attr) => {
                meanValues[attr] = d3.mean(data, (d) => +d[attr]);
              });

              // update the domain on xScale
              xScale.domain(axisCombination);

              // Redraw the data lines with the new order of dimensions
              svg
                .selectAll(".lines")
                .data(data)
                .transition()
                .duration(300)
                .attr("d", (d) => d3.line()(axisCombination.map(function(p) {return ([xScale(p), yScale[p](d[p])]);})))
          }
        }) 
        .on("end", function(event, d) {
          //Ensure the final position of the attached point matches the axis label's position
          const x = event.x; // Extract x-coordinate
          const draggedAxis = d;

          d3.selectAll(".meanPoint")
            .attr("cx", (a) => xScale(a) )
            .attr("cy", (a) => yScale[a](meanValues[a]) )
            .attr("opacity", 1);
        })
      );


}

function createParallelSets(data) {
  //esta maneira aqui acaba por ser mais simples e mais facil de perceber
  //porque damos import do sankey.js e depois é so usar as funçoes
  //o problema e que o import nao esta bem dado logo nao reconhce algumas cenas
  /*const d3sankey = require('./sankey');
  const sankey = d3sankey.sankey();

  const {nodes, links} = sankey(data);
  
  const svg = d3
    .select("#parallelSets")
    .append("svg")
    .attr("width", window.innerWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create a color scale for the links
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Draw the links
  svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3sankey.sankeyLinkHorizontal())
    .style("stroke", (d) => colorScale(d.source.name))
    .style("stroke-width", (d) => Math.max(1, d.width))
    .style("fill", "none");

  // Draw the nodes
  svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .call(
      d3
        .drag()
        .subject((d) => d)
        .on("start", () => {
          d3.event.sourceEvent.stopPropagation();
        })
    );

  // Add rectangles to the nodes
  svg
    .selectAll(".node")
    .append("rect")
    .attr("height", (d) => d.y1 - d.y0)
    .attr("width", sankey.nodeWidth())
    .style("fill", "#69b3a2");

  // Add text labels to the nodes
  svg
    .selectAll(".node")
    .append("text")
    .attr("x", -6)
    .attr("y", (d) => (d.y1 - d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text((d) => d.name)
    .style("font-size", "10px");
  */




  /// ESTA ERA OUTRA MANEIRA DE SE FAZER MAS AINDA TENHO DE VER QUAL A MELHOR
  /*const svg = d3
    .select("#parallelSets")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create a Sankey diagram generator
  const sankey = d3.sankey().nodeWidth(15).nodePadding(10).size([width, height]);

  // Generate the Sankey diagram layout from the data
  const { nodes, links } = sankey({ nodes: [], links: data });

  // Create a color scale for the links
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Draw the links
  svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .style("stroke", (d) => colorScale(d.source.name))
    .style("stroke-width", (d) => Math.max(1, d.width))
    .style("fill", "none");

  // Draw the nodes
  svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .call(
      d3
        .drag()
        .subject((d) => d)
        .on("start", () => {
          d3.event.sourceEvent.stopPropagation();
        })
    );

  // Add rectangles to the nodes
  svg
    .selectAll(".node")
    .append("rect")
    .attr("height", (d) => d.y1 - d.y0)
    .attr("width", sankey.nodeWidth())
    .style("fill", "#69b3a2");

  // Add text labels to the nodes
  svg
    .selectAll(".node")
    .append("text")
    .attr("x", -6)
    .attr("y", (d) => (d.y1 - d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text((d) => d.name)
    .style("font-size", "10px");

  // Add labels for each link
  svg
    .selectAll(".link")
    .append("text")
    .attr("x", (d) => (d.source.x + d.target.x) / 2)
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .text((d) => d.value)
    .style("font-size", "12px");*/
}