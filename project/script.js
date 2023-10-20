// Declare a variable to hold the loaded csv data.
var globalData;
var totalModels;

// Define margins for the visualizations.
const margin = { top: 20, right: 10, bottom: 50, left: 10 };

// Calculate the width and height of the visualizations based on the margins.
const width = 1200 - margin.left - margin.right;
const height = 150 - margin.top - margin.bottom;

var axisCombination = [
  "AccelSec",
  "Battery_Pack Kwh",
  "Efficiency_WhKm",
  "FastCharge_KmH",
  "PriceEuro",
  "Range_Km",
  "TopSpeed_KmH",
];

const axisLabels = {
  "AccelSec": "Acceleration",
  "Battery_Pack Kwh": "Battery Pack",
  "Efficiency_WhKm": "Efficiency",
  "FastCharge_KmH": "Fast Charge",
  "PriceEuro": "Price",
  "Range_Km": "Range",
  "TopSpeed_KmH": "Top Speed" 
}

const measuresLabels = {
  "AccelSec": "0-100 (s)",
  "Battery_Pack Kwh": "(kW/h)",
  "Efficiency_WhKm": "(Wh/km)",
  "FastCharge_KmH": "(km/h)",
  "PriceEuro": "(€)",
  "Range_Km": "(km)",
  "TopSpeed_KmH": "(km/h)" 
}

const axisCombinationSets = [
  "RapidCharge",
  "BodyStyle",
  "Segment",
  "PowerTrain",
];

const spaceBetweenAxes = width / 6;

// This function initiates the dashboard and loads the csv data.
function startDashboard() {
  // Load the csv data using D3.js.
  d3.csv("ev_cars.csv")
    .then((data) => {
      const cleanData = removeColumn(data, "PlugType");

      // Once the data is loaded successfully, store it in the globalData variable.
      globalData = data;
      totalModels = data.length;

      // Create different visualizations using the loaded data.
      createBarChart(data);
      //createParallelSets(data);
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
    .attr("width", width + margin.left + margin.right + 50)
    .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", `translate(${margin.left + 10},${margin.top})`);

  const modelsPerBrand = d3.rollup(
    data,
    (v) => ({
      Count: v.length,
      avgSeats: d3.mean(v, (d) => d.Seats),
    }),
    (d) => d.Brand
  );

  const modelsPerBrandArray = Array.from(
    modelsPerBrand,
    ([Brand, { avgSeats, Count }]) => ({ Brand, avgSeats, Count })
  );

  modelsPerBrandArray.sort((a, b) => b.Count - a.Count);

  // Create scales for x and y
  const xScale = d3
    .scaleBand()
    .domain(modelsPerBrandArray.map((d) => d.Brand))
    .range([0, width])
    .padding(0.15);

  const yScale = d3.scaleLinear().domain([0, 15]).range([height, 0]);

  // Create a color scale for the bars based on the seats data
  const colorScale = d3.scaleSequential([4, 7], d3.interpolateGreens); // You can choose a different color scheme

  svg
    .append("text")
    .attr("class", "total-percentage-label")
    .attr("x", width - margin.right - 23)
    .attr("y", 180)
    .attr("text-anchor", "middle")
    .text("100% models");

  // Create the bars
  svg
    .selectAll(".bar")
    .data(modelsPerBrandArray)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.Brand))
    .attr("y", (v) => yScale(v.Count))
    .attr("width", xScale.bandwidth())
    .attr("height", (v) => height - yScale(v.Count))
    .attr("fill", (v) => colorScale(v.avgSeats))
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("click", function (d) {
      updateHighlightedBrand(d.target.__data__);
    });

  // Append x and y axes to the chart
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-90) translate(-10, -10)")
    .style("text-anchor", "end");

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale).ticks(5)); // change ?

  // Create a gradient for the color legend
  linearGradient = svg
    .append("g")
    .append("linearGradient")
    .attr("id", "linearGradient")
    .attr("x1", "0%")
    .attr("x2", "100%");

  const numStops = 3;
  const stopPositions = d3.range(numStops).map((d) => d / (numStops - 1));
  linearGradient
    .selectAll("stop")
    .data(stopPositions)
    .enter()
    .append("stop")
    .attr("offset", (d) => d * 100 + "%")
    .attr("stop-color", (d) => colorScale(d * 3 + 4));

  svg
    .append("rect")
    .attr("width", 200)
    .attr("height", 10)
    .style("fill", "url(#linearGradient)")
    .attr("transform", `translate(0, ${height + 90})`)
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  svg
    .append("text")
    .attr("x", 100)
    .attr("y", 0)
    //size of letter need to be lower
    .attr("font-size", "10px")
    .attr("dy", "0.5em")
    .attr("text-anchor", "middle")
    .text("Seats Counter")
    .attr("transform", `translate(0, ${height + 80})`);

  // Add ticks and labels
  const ticks = [4, 5, 6, 7]; // Specify the values for which you want ticks
  const tickXPositions = ticks.map((value) => ((value - 4) / 3) * 200 - 2);
  const tickLabels = ["4", "5", "6", "7"]; // Labels corresponding to the ticks
  const tickHeight = 10; // Height of the tick lines

  // Create ticks and labels
  for (let i = 0; i < ticks.length; i++) {
    /*
    svg.append("line")
      .attr("x1", tickXPositions[i] + 2)
      .attr("x2", tickXPositions[i] + 2)
      .attr("y1", height + 90 - tickHeight)
      .attr("y2", height + 90)
      .style("stroke", "black")
      .style("stroke-width", 1);
    */
    svg
      .append("text")
      .attr("x", tickXPositions[i])
      .attr("y", tickHeight + height + 100)
      .text(tickLabels[i])
      .style("font-size", "10px")
      .style("fill", "black");
  }
}

function createParallelCoordinates(data) {
  const selectedData = data.map((d) => {
    const selectedObj = {};
    axisCombination.forEach((attr) => {
      selectedObj[attr] = d[attr];
    });
    return selectedObj;
  });

  const colorScale = d3.scaleSequential([4, 7], d3.interpolateGreens);
  const color = colorScale(6);

  // Select the #parallelCoords element and append an SVG to it
  const svg = d3
    .select("#parallelCoords")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 50)
    .attr("height", height * 3 + margin.top + margin.bottom + 50)
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
      .range([height * 3, 0]);
  });

  // Calculate the mean values of each attribute
  const meanValues = {};
  axisCombination.forEach((attr) => {
    meanValues[attr] = d3.mean(data, (d) => +d[attr]);
  });

  const filteredMeanValues = meanValues;

  // Calculate the max values of each attribute
  const maxValues = {};
  axisCombination.forEach((attr) => {
    maxValues[attr] = d3.max(data, (d) => +d[attr]);
  });

  // Calculate the min values of each attribute
  const minValues = {};
  axisCombination.forEach((attr) => {
    minValues[attr] = d3.min(data, (d) => +d[attr]);
  });

  // Draw the lines
  svg
    .selectAll(".lines")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "lines")
    .attr("d", (d) =>
      d3.line()(
        axisCombination.map(function (p) {
          return [xScale(p), yScale[p](d[p])];
        })
      )
    )
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("opacity", 0.7);

  // Draw the axis
  const axisGroups = svg
    .selectAll(".axis")
    .data(axisCombination)
    .enter()
    .append("g")
    .attr("class", "axisGroup")
    .attr("transform", function (d) {
      return "translate(" + xScale(d) + ")";
    });

  // Axis Labels
  axisGroups
    .each(function (d) {
      const axis = d3.axisLeft().scale(yScale[d]);
      const minMaxValues = [yScale[d].domain()[0], yScale[d].domain()[1]];
      axis.tickValues(minMaxValues);
      d3.select(this).call(axis);
    })
    .on("mouseover", function(event, item) { return showTooltip(event, item, yScale)})
    .on("mouseout", hideTooltip);

  axisGroups
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", height * 3 - margin.top + margin.bottom - 5)
    .text(function (d) {
      return axisLabels[d];
    })
    .style("fill", "black")
    .style("font-size", "12px");


  // Measures labels
  axisGroups
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", height * 3 - margin.top + margin.bottom + 10)
    .text(function (d) {
      return measuresLabels[d];
    })
    .style("fill", "black");

  
  // Create the means for each filtered axis
  const pointMeansFiltered = axisGroups
    .select(".points")
    .data(axisCombination)
    .enter()
    .append("circle")
    .attr("class", "meanPointFiltered")
    .attr("data-axis", (d) => d)
    .attr("r", 3)
    .attr("cx", function (d) {
      return xScale(d);
    })
    .attr("cy", function (d) {
      return yScale[d](filteredMeanValues[d]);
    })
    .attr("fill", colorScale(6))
    .attr("stroke", "black");


  // Create the means for each axis
  const pointMeans = axisGroups
    .select(".points")
    .data(axisCombination)
    .enter()
    .append("circle")
    .attr("class", "meanPoint")
    .attr("data-axis", (d) => d)
    .attr("r", 3)
    .attr("cx", function (d) {
      return xScale(d);
    })
    .attr("cy", function (d) {
      return yScale[d](meanValues[d]);
    })
    .attr("fill", "black");


  // Create the max markers for the filters
  const maxMarkerGroups = axisGroups
    .select(".markers")
    .data(axisCombination)
    .enter()
    .append("rect")
    .attr("class", "maxValueMarkers")
    .attr("width", 10)
    .attr("height", 5)
    .attr("x", (d) => xScale(d) - 5)
    .attr("y", (d) => yScale[d](maxValues[d]) - 0.5)
    .attr("fill", "black")
    .attr("stroke", "black");

    
  // Create the markers for the filters
  const minMarkerGroups = axisGroups
    .append("g")
    .attr("class", "minValueMarkers");

  // Add a min value marker to each axis
  minMarkerGroups
    .append("rect")
    .attr("class", "minValue-marker")
    .attr("width", 10)
    .attr("height", 5)
    .attr("x", -5)
    .attr("y", (d) => yScale[d](minValues[d]) + 0.5)
    .attr("fill", "black")
    .attr("stroke", "black");


  // Add drag behavior to axis labels
  axisGroups.call(
    d3
      .drag()
      .on("start", function (event, d) {
        //Occulte the mean point
        d3.selectAll(".meanPoint").attr("opacity", 0);
        d3.selectAll(".meanPointFiltered").attr("opacity", 0);

        // Store the original position for reference
        d3.select(this).attr(
          "data-original-x",
          d3.select(this).attr("transform")
        );
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

        d3.selectAll(".axisGroup")
          .filter(function (axis) {
            return axis == closestAxis;
          })
          .transition()
          .duration(100)
          .attr("transform", `translate(${xScale(draggedAxis)}, 0)`);

        // to update markers
        d3.selectAll(".maxValueMarkers")
          .filter(function (axis) {
            if (axis == closestAxis)
              console.log("x: ", xScale(draggedAxis) - 5);
            return axis == closestAxis;
          })
          .transition()
          .duration(100)
          .attr("x", xScale(draggedAxis) - 5);

        d3.selectAll(".maxValueMarkers")
          .filter(function (axis) {
            if (axis == draggedAxis)
              console.log("x: ", xScale(closestAxis) - 5);
            return axis == draggedAxis;
          })
          .transition()
          .duration(100)
          .attr("x", xScale(closestAxis) - 5);

        // Update the order of dimensions
        const oldIndex = axisCombination.indexOf(draggedAxis);
        const newIndex = axisCombination.indexOf(closestAxis);

        if (oldIndex != newIndex) {
          axisCombination[oldIndex] = closestAxis;
          axisCombination[newIndex] = draggedAxis;

          console.log(axisCombination);

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
            .attr("d", (d) =>
              d3.line()(
                axisCombination.map(function (p) {
                  return [xScale(p), yScale[p](d[p])];
                })
              )
            );
        }
      })
      .on("end", function (event, d) {
        //Ensure the final position of the attached point matches the axis label's position
        const x = event.x; // Extract x-coordinate
        const draggedAxis = d;

        d3.selectAll(".meanPoint")
          .attr("cx", (a) => xScale(a))
          .attr("cy", (a) => yScale[a](meanValues[a]))
          .attr("opacity", 1);

        d3.selectAll(".meanPointFiltered")
          .attr("cx", (a) => xScale(a))
          .attr("cy", (a) => yScale[a](meanValues[a]))
          .attr("opacity", 1);
      })
  );

  maxMarkerGroups.call(
    d3
      .drag()
      .on("start", function (event, d) {
        // Store the original position for reference
        d3.select(this).attr("data-original-y", d3.select(this).attr("y"));
      })
      .on("drag", function (event, d) {
        var y = event.y;

        var ymin = parseInt(d3.selectAll(".minValueMarkers").filter(function(axis) { if (axis == d) console.log(d); return axis == d;}).attr("y"));
        ymin ? ymin = ymin : ymin = height * 3;

        y < 0 ? (y = 0) : (y = y);
        y > ymin ? (y = ymin) : (y = y);

        d3.select(this).attr("y", y);

        updateParallelCoordsLines(data);     })
      .on("end", function (event, d) {
        lines = d3.selectAll(".lines").filter(function (d) {
          return d3.select(this).style("opacity") == 0.7;
        })._groups[0];
        updateBarChart(lines.map((d) => d.__data__));
      })
  );

  minMarkerGroups.call(
    d3
      .drag()
      .on("start", function (event, d) {
        // Store the original position for reference
        d3.select(this).attr("data-original-y", d3.select(this).attr("y"));
      })
      .on("drag", function (event, d) {
        var y = event.y;
        var ymax = parseInt(d3.selectAll(".maxValueMarkers").filter(function(axis) { if (axis == d) console.log(d); return axis == d;}).attr("y"));
        ymax ? ymax = ymax : ymax = 0;

        y > ymax ? (y = y) : (y = ymax);
        y > height * 3 ? (y = height * 3) : (y = y);

        d3.select(this)
          .attr("transform", `translate(0, ${y - height * 3})`)
          .attr("y", y);

        updateParallelCoordsLines(data);
      })
      .on("end", function (event, d) {
        lines = d3.selectAll(".lines").filter(function (d) {
          return d3.select(this).style("opacity") == 0.7;
        })._groups[0];
        updateBarChart(lines.map((d) => d.__data__));
      })
  );
}

function createParallelSets(data) {

  // Select the #parallelSets element and append an SVG to it
  const svg = d3
    .select("#parallelSets")
    .append("svg")
    .attr("height", (axisCombinationSets.length * spaceBetweenAxes / 8) + margin.left + margin.right + 50)
    .attr("width", width + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const nodes = [];
  const links = [];

  data.forEach((d, i) => {
    
    nodes[i] = [];

    for (let j = 0; j < axisCombinationSets.length; j++) {
      const nodeName = axisCombinationSets[j] + "_" + d[axisCombinationSets[j]];
      const sourceNode = i === 0 ? null : nodes[i - 1][j];
      let sourceIndex = -1;

      if (sourceNode) {
        sourceIndex = nodes[i - 1].indexOf(sourceNode);
        if (sourceIndex === -1) {
          sourceIndex = nodes[i - 1].push(nodeName) - 1;
        }
      }

      const targetNode = sourceIndex !== -1 ? nodes[i - 1][j] : null;
      const targetIndex = i === 0 ? -1 : nodes[i].indexOf(nodeName);
      
      if (targetIndex === -1) {
        nodes[i].push(nodeName);
      }

      if (sourceNode && targetNode) {
        links.push({
          source: sourceNode,
          target: targetNode,
          value: d.count,
          sourceIndex: sourceIndex,
          targetIndex: targetIndex
        });
      }
    }

    nodes.push([
      `${axisCombinationSets[0]}_${d[axisCombinationSets[0]]}`, 
      `${axisCombinationSets[1]}_${d[axisCombinationSets[1]]}`, 
      `${axisCombinationSets[2]}_${d[axisCombinationSets[2]]}`, 
      `${axisCombinationSets[3]}_${d[axisCombinationSets[3]]}`
    ]);
  });

  const maxLinkValue = d3.max(links, (d) => d.value);

  const link = svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", (d) => {
      const startIndex = d.sourceIndex * spaceBetweenAxes;
      const endIndex = d.targetIndex * spaceBetweenAxes;

      return `M ${d.sourceIndex * 5} ${startIndex} L ${d.targetIndex * 5} ${endIndex}`; 
    })
    .style("stroke", "blue")
    .style("stroke-width", (d) => (d.value / maxLinkValue) * 10);

  const node = svg
    .selectAll(".node")
    .data(nodes[0])
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d, i) => `translate(${i * spaceBetweenAxes}, 0)`);
  
  node
    .append("rect")
    .attr("width", 20)
    .attr("height", (axisCombinationSets.length * spaceBetweenAxes) - 10)
    .style("fill", "blue");

  node
    .append("text")
    .attr("x", 10)
    .attr("y", (axisCombinationSets.length * spaceBetweenAxes * 0.5))
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .text((d) => d.split("_")[1]);
}