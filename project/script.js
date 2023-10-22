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
  AccelSec: "Acceleration",
  "Battery_Pack Kwh": "Battery Pack",
  Efficiency_WhKm: "Efficiency",
  FastCharge_KmH: "Fast Charge",
  PriceEuro: "Price",
  Range_Km: "Range",
  TopSpeed_KmH: "Top Speed",
};

const measuresLabels = {
  AccelSec: "0-100 (s)",
  "Battery_Pack Kwh": "(kW/h)",
  Efficiency_WhKm: "(Wh/km)",
  FastCharge_KmH: "(km/h)",
  PriceEuro: "(€)",
  Range_Km: "(km)",
  TopSpeed_KmH: "(km/h)",
};

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
      //createParallelSets(data);
      createBarChart(data);
      createParallelCoordinates(cleanData);
      createPS(data);
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
  const colorScale = d3.scaleQuantize([2, 7], d3.schemeGreens[6]);
  colors = [];
  colors.push(colorScale.range()[0]);
  colors.push(colorScale.range()[1]);
  colors.push(colorScale.range()[2]);
  colors.push(colorScale.range()[3]);
  colors.push(colorScale.range()[4]);
  colors.push(colorScale.range()[5]);

  svg
    .append("text")
    .attr("class", "total-percentage-label")
    .attr("x", width - margin.right - 60)
    .attr("y", 150)
    .attr("text-anchor", "middle")
    .text("100% models");

  // Add a phrase explaining what "100% models" represents
  svg
    .append("text")
    .attr("class", "explanation-label")
    .attr("x", width - margin.right - 60)
    .attr("y", 170) // Adjust the Y position as needed
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .text("Proportion of models filtered");

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
      updateHighlightedBrandClick(d.target.__data__);
    })
    .on("mouseover", function (event, d) {
      showBarTooltip(event, d);
      updateHighlightedBrandMouseOver(event.target.__data__);
    })
    .on("mouseout", function (d) {
      hideTooltip();
      updateHighlightedBrandMouseOut(event.target.__data__);
    });

  // Append x and y axes to the chart
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45) translate(0, 5)")
    .style("text-anchor", "end");

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale).ticks(5)); // change ?

  const colorSections = svg.append("g").attr("transform", "translate(10, 10)");

  const sectionWidth = 40; // Width of each color section
  const sectionHeight = 10; // Height of each color section

  // Iterate over your colors and create sections
  colors.forEach((color, index) => {
    // Create a rectangle for each color section
    colorSections
      .append("rect")
      .attr("x", index * sectionWidth)
      .attr("width", sectionWidth)
      .attr("height", sectionHeight)
      .style("fill", color);

    // Create a label for each value at the bottom of the section
    colorSections
      .append("text")
      .text(index + 2) // Corresponding value
      .attr("x", index * sectionWidth + sectionWidth / 2)
      .attr("y", sectionHeight + 15) // Position the label below the section
      .style("text-anchor", "middle")
      .style("font-size", "12px");
  });

  colorSections
    .attr("stroke", "black")
    .attr("stroke-width", 0.3)
    .attr("transform", `translate(0, ${height + 70})`);

  // Create a gradient for the color legend
  colorSections
    .append("text")
    .attr("x", 280)
    .attr("y", 4)
    //size of letter need to be lower
    .attr("font-size", "12px")
    .attr("dy", "0.5em")
    .attr("text-anchor", "middle")
    .text("Seats Counter");
}

function createParallelCoordinates(data) {
  const selectedData = data.map((d) => {
    const selectedObj = {};
    axisCombination.forEach((attr) => {
      selectedObj[attr] = d[attr];
    });
    return selectedObj;
  });

  const colorScale = d3.scaleQuantize([2, 7], d3.schemeGreens[6]);
  const color = colorScale(5);

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
    .attr("opacity", 0.6);

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
    .on("mouseover", function (event, item) {
      return showTooltip(event, item, yScale);
    })
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
        d3.selectAll(".meanPointFiltered").attr("opacity", 0);
        d3.selectAll(".meanPoint").attr("opacity", 0);
        
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
            return axis == closestAxis;
          })
          .transition()
          .duration(100)
          .attr("x", xScale(draggedAxis) - 5);

        d3.selectAll(".maxValueMarkers")
          .filter(function (axis) {
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

        const filteredLines = d3.selectAll(".lines").filter(function (d) { return (d3.select(this).style("opacity") == 0.7); })._groups[0];
        const filteredData = filteredLines.map(d => d.__data__);
      
        // Calculate the mean values of each attribute
        const meanFilteredValues = {};
        axisCombination.forEach((attr) => {
          meanFilteredValues[attr] = d3.mean(filteredData, (d) => +d[attr]);
        });

        d3.selectAll(".meanPointFiltered")
          .attr("cx", (a) => xScale(a))
          .attr("cy", (a) => yScale[a](meanFilteredValues[a]))
          .attr("opacity", 1);

        d3.selectAll(".meanPoint")
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

        var ymin = parseInt(
          d3
            .selectAll(".minValueMarkers")
            .filter(function (axis) {
              return axis == d;
            })
            .attr("y")
        );
        ymin ? (ymin = ymin) : (ymin = height * 3);

        y < 0 ? (y = 0) : (y = y);
        y > ymin ? (y = ymin) : (y = y);

        d3.select(this).attr("y", y);

        updateParallelCoordsLines(data);
      })
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
        var ymax = parseInt(
          d3
            .selectAll(".maxValueMarkers")
            .filter(function (axis) {
              return axis == d;
            })
            .attr("y")
        );
        ymax ? (ymax = ymax) : (ymax = 0);

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

function createPS(data) {
  // Select the #parallelSets element and append an SVG to it
  const svg = d3
    .select("#parallelSets")
    .append("svg")
    .attr("height", height * 3 + margin.left + margin.right + 50)
    .attr("width", width + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const nominalAttributes = data.map(function (d) {
    return {
      RapidCharge: d.RapidCharge,
      BodyStyle: d.BodyStyle,
      Segment: d.Segment,
      PowerTrain: d.PowerTrain,
    };
  });

  const setsData = {};

  Object.keys(nominalAttributes[0]).forEach(function (attribute) {
    setsData[attribute] = {};
  });

  nominalAttributes.forEach(function (d) {
    Object.keys(d).forEach(function (attribute) {
      const value = d[attribute];
      if (!setsData[attribute][value]) {
        setsData[attribute][value] = 1;
      } else {
        setsData[attribute][value]++;
      }
    });
  });

  // Define the x and y positions for the rectangles
  const x = d3.scaleBand().domain(Object.keys(setsData)).range([0, width]);

  const ys = [];

  // Iterate through the attributes
  Object.keys(setsData).forEach(function (attribute) {
    const y = [];
    const values = Object.keys(setsData[attribute]);
    const numValues = values.length;
    const rectWidth = 10;

    const totalCount = d3.sum(values, (value) => setsData[attribute][value]);
    const maxHeight = height * 3 - (numValues - 1);

    // Create a group for each attribute
    const attributeGroup = svg
      .append("g")
      .attr("transform", "translate(" + x(attribute) + ", 5)");

    // Create a set of rectangles for each attribute
    attributeGroup
      .selectAll("rect")
      .data(values)
      .enter()
      .append("rect")
      .attr("x", 150)
      .attr("y", function (d, i) {
        if (i === 0) {
          y.push(0);
          return 0;
        }
        const prevHeight = d3.sum(
          values
            .slice(0, i)
            .map(
              (value) => (setsData[attribute][value] / totalCount) * maxHeight
            )
        );
        y.push(prevHeight + i);
        return prevHeight + i;
      })
      .attr("width", rectWidth)
      .attr("height", function (value) {
        return (setsData[attribute][value] / totalCount) * maxHeight;
      })
      .style("fill", "green") // You can customize the colors
      .on("mouseover", function (event, d) {
        showSetsTooltip(event, d);
      })
      .on("mouseout", function (event, d) {
        hideTooltip();
      });

    // Add labels to the attribute group
    attributeGroup
      .append("text")
      .attr("x", rectWidth / 2 + 150)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(attribute);
    ys.push(y);
  });
  ys.pop();

  const groupedData = [];

  // Iterate through the attributes
  Object.keys(setsData).forEach(function (attribute, index, attributes) {
    if (attribute == "PowerTrain") {
      return;
    }
    const values = Object.keys(setsData[attribute]);

    // Create a set of rectangles for each attribute with proportional heights
    const attributeData = [];
    values.forEach(function (value, i) {
      const valueCount = setsData[attribute][value];
      const nextAttribute = attributes[index + 1];

      if (nextAttribute) {
        const nextAttributeValues = Object.keys(setsData[nextAttribute]);
        nextAttributeValues.forEach(function (nextValue) {
          const modelsWithNextValue = data.filter(
            (d) => d[attribute] === value && d[nextAttribute] === nextValue
          );
          const count = modelsWithNextValue.length;
          attributeData.push({
            [attribute]: value,
            [nextAttribute]: nextValue,
            Count: count,
          });
        });
      } else {
        // If this is the last attribute, add a data point for the current attribute value
        attributeData.push({
          [attribute]: value,
          Count: valueCount,
        });
      }
    });
    groupedData.push(attributeData);
  });
  //console.log(groupedData)

  groupedData.forEach(function (d) {
    console.log(d);
  });
}

function createParallelSets(data) {
  // Select the #parallelSets element and append an SVG to it
  const svg = d3
    .select("#parallelSets")
    .append("svg")
    .attr("height", height + margin.left + margin.right + 50)
    .attr("width", width + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const nodes = [];
  const links = [];

  const rapidCharge = { Yes: 0, No: 0 };
  const bodyStyle = {
    Sedan: 0,
    Hatchback: 0,
    Liftback: 0,
    SUV: 0,
    Pickup: 0,
    MPV: 0,
    Cabrio: 0,
    SPV: 0,
    Station: 0,
  };
  const segment = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, N: 0, S: 0 };
  const powerTrain = { AWD: 0, RWD: 0, FWD: 0 };

  // Count how many times each value appears on each attribute
  data.forEach((d) => {
    for (let i = 0; i < axisCombinationSets.length; i++) {
      const axis = axisCombinationSets[i];
      if (axis == "RapidCharge") {
        rapidCharge[d[axis]]++;
      } else if (axis == "BodyStyle") {
        bodyStyle[d[axis]]++;
      } else if (axis == "Segment") {
        segment[d[axis]]++;
      } else if (axis == "PowerTrain") {
        powerTrain[d[axis]]++;
      }
    }
  });

  console.log(rapidCharge);
  console.log(bodyStyle);
  console.log(segment);
  console.log(powerTrain);

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
          targetIndex: targetIndex,
        });
      }
    }

    nodes.push([
      `${axisCombinationSets[0]}_${d[axisCombinationSets[0]]}`,
      `${axisCombinationSets[1]}_${d[axisCombinationSets[1]]}`,
      `${axisCombinationSets[2]}_${d[axisCombinationSets[2]]}`,
      `${axisCombinationSets[3]}_${d[axisCombinationSets[3]]}`,
    ]);
  });

  const maxLinkValue = d3.max(links, (d) => d.value);

  /*\

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
    .style("stroke-width", (d) => (d.value / maxLinkValue) * 10); */

  const padding = 10;
  const heightSets = 120;

  // Create an axis per attribute and slipt it accordingly the percentage of each value
  // RapidCharging
  let i = 0;
  var availableHeight =
    heightSets - (Object.keys(rapidCharge).length - 1) * padding;
  var translation = 0;

  const rapidChargeAxis = svg
    .append("g")
    .attr("class", "rapidChargeAxis")
    .attr("transform", `translate(${i * spaceBetweenAxes}, 0)`);

  for (const value in rapidCharge) {
    const height = (rapidCharge[value] / data.length) * availableHeight;

    rapidChargeAxis
      .append("rect")
      .attr("width", 5)
      .attr("height", height)
      .attr("fill", "black")
      .attr("transform", `translate(0, ${translation})`);

    rapidChargeAxis
      .append("text")
      .attr("x", 10)
      .attr("y", height / 2)

      .attr("text-anchor", "start")
      .style("fill", "white")
      .text(value);

    translation += padding + height;
  }

  // Calculate available height for the "BodyStyle" axis
  availableHeight = heightSets - (Object.keys(bodyStyle).length - 1) * padding;
  translation = 0;
  i++; // Update the index to position the axis correctly

  const bodyStyleAxis = svg
    .append("g")
    .attr("class", "bodyStyleAxis")
    .attr("transform", `translate(${i * spaceBetweenAxes}, 0)`);

  // Create rectangles for each "BodyStyle" value
  for (const value in bodyStyle) {
    const height = (bodyStyle[value] / data.length) * availableHeight;

    bodyStyleAxis
      .append("rect")
      .attr("width", 5)
      .attr("height", height)
      .attr("fill", "black")
      .attr("transform", `translate(0, ${translation})`);

    bodyStyleAxis
      .append("text")
      .attr("x", 10)
      .attr("y", height / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "white")
      .text(value);

    translation += padding + height;
  }

  // Calculate available height for the "Segment" axis
  availableHeight = heightSets - (Object.keys(segment).length - 1) * padding;
  translation = 0;
  i++; // Update the index to position the axis correctly

  const segmentAxis = svg
    .append("g")
    .attr("class", "segmentAxis")
    .attr("transform", `translate(${i * spaceBetweenAxes}, 0)`);

  // Create rectangles for each "Segment" value
  for (const value in segment) {
    const height = (segment[value] / data.length) * availableHeight;

    segmentAxis
      .append("rect")
      .attr("width", 5)
      .attr("height", height)
      .attr("fill", "black")
      .attr("transform", `translate(0, ${translation})`);

    segmentAxis
      .append("text")
      .attr("x", 10)
      .attr("y", height / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "white")
      .text(value);

    translation += padding + height;
  }

  // Calculate available height for the "PowerTrain" axis
  availableHeight = heightSets - (Object.keys(powerTrain).length - 1) * padding;
  translation = 0;
  i++; // Update the index to position the axis correctly

  const powerTrainAxis = svg
    .append("g")
    .attr("class", "powerTrainAxis")
    .attr("transform", `translate(${i * spaceBetweenAxes}, 0)`);

  // Create rectangles for each "PowerTrain" value
  for (const value in powerTrain) {
    const height = (powerTrain[value] / data.length) * availableHeight;

    powerTrainAxis
      .append("rect")
      .attr("width", 5)
      .attr("height", height)
      .attr("fill", "black")
      .attr("transform", `translate(0, ${translation})`);

    powerTrainAxis
      .append("text")
      .attr("x", 10)
      .attr("y", height / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "white")
      .text(value);

    translation += padding + height;
  }

  /*
  node
    .append("rect")
    .attr("width", 10)
    .attr("height", axisCombinationSets.length * spaceBetweenAxes - 10)
    .style("fill", "black"); */

  /*node
    .append("text")
    .attr("x", 10)
    .attr("y", axisCombinationSets.length * spaceBetweenAxes * 0.5)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .text((d) => d.split("_")[1]);*/
}
