// bar chart filters
var selectedBrand = null;

// alluvial filters
var selectedValue = null;
var targetAttributes = new Set();
var targetValues = new Set();

const selectedColor = "#fc8d62";
const hoveredColor = "#1f78b4";

const colorScale = d3.scaleQuantize([2, 7], d3.schemeGreens[6]);

function resetHighlightedBrand() {
  d3.selectAll(".bar")
    .filter(function (d) {
      return d.Brand == selectedBrand;
    })
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);
  
  // reset stroke collor
  const lines = d3.selectAll(".lines")
    .filter(function (d) {
      return d.Brand == selectedBrand;
    })
    .attr("stroke", colorScale(5));
  
  filteredLines = getFilteredLines(lines);
  // reset opacity (different filter)
  filteredLines.attr("opacity", 0.7);
}

function updateHighlightedBrandClick(clickedBar) {
  var brand = clickedBar.Brand;

  // de-select brand
  if (selectedBrand == brand) {
    resetHighlightedBrand();
    selectedBrand = null;
  } else {
    // select new brand
    if (selectedBrand != null) {
      resetHighlightedBrand();
    }
    selectedBrand = brand;
    d3.selectAll(".bar")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", selectedColor)
      .attr("stroke-width", 2.5);

    const lines = d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", selectedColor);
  
    // reset opacity (different filter)
    filteredLines = getFilteredLines(lines);
    filteredLines.attr("opacity", 1);
  }
}

function updateHighlightedBrandMouseOver(hoveredBar) {
  var brand = hoveredBar.Brand;
  if (selectedBrand != brand) {
    d3.selectAll(".bar")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", hoveredColor)
      .attr("stroke-width", 2.5);

    const lines = d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", hoveredColor);
    
    // reset opacity (different filter)
    filteredLines = getFilteredLines(lines);
    filteredLines.attr("opacity", 1);
  }
}

function updateHighlightedBrandMouseOut(hoveredBar) {
  var brand = hoveredBar.Brand;
  if (selectedBrand != brand) {
    d3.selectAll(".bar")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);

    const lines = d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", colorScale(5));
    
    // reset opacity (different filter)
    filteredLines = getFilteredLines(lines);
    filteredLines.attr("opacity", 1);
  }
}

// give array of data, return data that's within the markers range
function getFilteredLines(data) {
  
  const yScale = {};
  axisCombination.forEach((attr) => {
    yScale[attr] = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[attr]))
      .range([height * 3, 0]);
  });

  yMaxValues = {};
  maxMarkerGroups = d3.selectAll(".maxValueMarkers");
  maxMarkerGroups.each(function (axis) {
    if (d3.select(this).attr("y") == null) {
      yMaxValues[axis] = 0;
    } else {
      yMaxValues[axis] = parseInt(d3.select(this).attr("y"));
    }
  });

  yMinValues = {};
  minMarkerGroups = d3.selectAll(".minValueMarkers");
  minMarkerGroups.each(function (axis) {
    if (d3.select(this).attr("y") == null) {
      yMinValues[axis] = height * 3;
    } else {
      yMinValues[axis] = parseInt(d3.select(this).attr("y"));
    }
  });

  var currY;
  const filteredLines = data.filter(function (a) {
      for (let i = 0; i < axisCombination.length; i++) {
        const axis = axisCombination[i];
        currY = yScale[axis](a[axis]);
        if (currY <= yMinValues[axis] && currY >= yMaxValues[axis]) {
        } else {
          return false;
        }
      }
      return true;
    });
  return filteredLines;
}

function updateBarChart(data) {
  var filteredData;
  if (selectedValue != null) {
    // lines with alluvial filter
    const lines = d3.selectAll(".lines")
      .filter(function (d) {
        return d[selectedAttribute] == selectedValue;
      });
    const linesData = lines._groups[0].map((d) => d.__data__);
    filteredData = getFilteredLines(linesData);
  } else {
    filteredData = getFilteredLines(data);
  }
  data = filteredData;


  // Select the SVG element of the bar chart
  const currentModels = data.length;
  const svg = d3.select("#barChart").select("svg").select("g");

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

  const xScale = d3
    .scaleBand()
    .domain(modelsPerBrandArray.map((d) => d.Brand))
    .range([0, width])
    .padding(0.15);

  const yScale = d3.scaleLinear().domain([0, 15]).range([height, 0]);

  // Select all existing bars and bind the data to them
  const bars = svg.selectAll(".bar").data(modelsPerBrandArray);

  bars
    .transition()
    .duration(500)
    .attr("x", (d) => xScale(d.Brand))
    .attr("y", (v) => yScale(v.Count))
    .attr("width", xScale.bandwidth())
    .attr("height", (v) => height - yScale(v.Count))
    .attr("fill", (v) => colorScale(v.avgSeats))
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("end", function () {
      if (selectedBrand != null) {
        d3.selectAll(".bar").filter(function (d) { return d.Brand == selectedBrand; }).attr("stroke", selectedColor).attr("stroke-width", 2.5);
      }
    });

  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.Brand))
    .attr("y", (v) => yScale(v.Count))
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .attr("fill", (v) => colorScale(v.avgSeats))
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .transition()
    .duration(500)
    .attr("height", (v) => height - yScale(v.Count));

  bars.exit().transition().duration(500).attr("height", 0).remove();

  svg
    .select(".y-axis")
    .transition()
    .duration(500)
    .call(d3.axisLeft(yScale).ticks(5));

  svg
    .select(".x-axis")
    .transition()
    .duration(500)
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45) translate(0, 5)")
    .style("text-anchor", "end");

  svg
    .select(".total-percentage-label")
    .transition()
    .duration(500)
    .attr("x", width - margin.right - 60)
    .attr("y", 145)
    .attr("text-anchor", "middle")
    .text(((currentModels / totalModels).toFixed(2) * 100).toFixed(0) + "% models");

  svg
    .selectAll(".bar")
    .on("click", function (d) {
      updateHighlightedBrandClick(d.target.__data__);
      updateParallelSets(data);
    })
    .on("mouseover", function (event, d) {
      showBarTooltip(event, d);
      updateHighlightedBrandMouseOver(event.target.__data__);
    })
    .on("mouseout", function (event) {
      hideTooltip();
      updateHighlightedBrandMouseOut(event.target.__data__);
    });
}

function updateParallelCoordsLines(data) {
  const svg = d3.select("#parallelCoords").select("svg").select("g");

  const yScale = {};
  axisCombination.forEach((attr) => {
    yScale[attr] = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[attr]))
      .range([height * 3, 0]);
  });

  yMaxValues = {};
  maxMarkerGroups = d3.selectAll(".maxValueMarkers");
  maxMarkerGroups.each(function (axis) {
    if (d3.select(this).attr("y") == null) {
      yMaxValues[axis] = 0;
    } else {
      yMaxValues[axis] = parseInt(d3.select(this).attr("y"));
    }
  });

  yMinValues = {};
  minMarkerGroups = d3.selectAll(".minValueMarkers");
  minMarkerGroups.each(function (axis) {
    if (d3.select(this).attr("y") == null) {
      yMinValues[axis] = height * 3;
    } else {
      yMinValues[axis] = parseInt(d3.select(this).attr("y"));
    }
  });

  var currY;
  // Redraw the data lines with the new filter
  svg
    .selectAll(".lines")
    .filter(function (a) {
      for (let i = 0; i < axisCombination.length; i++) {
        const axis = axisCombination[i];
        currY = yScale[axis](a[axis]);
        if (currY >= yMinValues[axis] || currY <= yMaxValues[axis]) {
          return true;
        }
      }
      return false;
    })
    .attr("opacity", 0.20);

  svg
    .selectAll(".lines")
    .filter(function (a) {
      for (let i = 0; i < axisCombination.length; i++) {
        const axis = axisCombination[i];
        currY = yScale[axis](a[axis]);
        if (currY <= yMinValues[axis] && currY >= yMaxValues[axis]) {
        } else {
          return false;
        }
      }
      return true;
    })
    .attr("opacity", 0.7);

  const filteredLines = d3.selectAll(".lines").filter(function (d) { return (d3.select(this).style("opacity") >= 0.7); })._groups[0];
  const filteredData = filteredLines.map(d => d.__data__);

  // Calculate the mean values of each attribute
  const meanValues = {};
  axisCombination.forEach((attr) => {
    meanValues[attr] = d3.mean(filteredData, (d) => +d[attr]);
  });

  svg.selectAll(".meanPointFiltered")
  .attr("cy", function(a) {
    if (meanValues[a]) {
      return yScale[a](meanValues[a]);
    } else {
      const mean = d3.selectAll(".meanPoint").filter(function(axis) {return axis == a}).attr("cy");
      return mean;
    }})

}

function updateParallelSets(data) {
  var filteredData;
  const originalData = data;
  if (selectedBrand != null) {
    // lines with selected brand
    const lines = d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == selectedBrand;
      });
    const linesData = lines._groups[0].map((d) => d.__data__);
    filteredData = getFilteredLines(linesData);
  } else {
    filteredData = getFilteredLines(data);
  }
  data = filteredData;

  const svg = d3.select("#parallelSets").select("svg").select("g");

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
  const x = d3
    .scalePoint()
    .range([0, width])
    .padding(0.08)
    .domain(Object.keys(setsData));

  const ys = [];
  var attributeGroup = svg.selectAll("rect.attributeGroup").remove();
  var LinkAreaGroup = svg.selectAll(".linkAreaGroup").remove();  

  // Iterate through the attributes
  Object.keys(setsData).forEach(function (attribute) {
    const y = {};
    const values = Object.keys(setsData[attribute]);
    const numValues = values.length;

    const rectWidth = 10;

    const totalCount = d3.sum(values, (value) => setsData[attribute][value]);
    const maxHeight = height * 3 - (numValues - 1);

    // Rereate a group for each attribute
    attributeGroup = svg
    .append("g")
    .attr("transform", "translate(" + x(attribute) + ", 20)");

    attributeGroup
      .selectAll(".attributeGroup")
      .data(values)
      .enter()
      .append("rect")
      .attr("class", "attributeGroup")
      .attr("x", 20)
      .attr("y", function (d, i) {
        if (i === 0) {
          y[d] = 0;
          return 0;
        }
        const prevHeight = d3.sum(
          values
            .slice(0, i)
            .map(function (value) { return (setsData[attribute][value] / totalCount) * maxHeight;
          })
        );
        y[d] = prevHeight + i;
        return prevHeight + i;
      })
      .attr("width", rectWidth)
      .attr("height", function (value) {
        return (setsData[attribute][value] / totalCount) * maxHeight;
      })
      .style("fill", "black")
      .style("opacity", 0.75)
      .on("click", function () {
        clickSetAttribute(d3.select(this)._groups[0][0].__data__, attribute);
        updateBarChart(originalData);
      })
      .on("mouseover", function (event, item) {
        sumCount = 0;
        d3.selectAll(".linkAreaGroup")
          .filter(function (d) {
            if (d[attribute] == item) {sumCount += (d["Count"]);}
          });
        if (attribute == "BodyStyle" || attribute == "Segment") {
          sumCount = sumCount / 2;
        }
        showSetsTooltip(event, item, sumCount);
      })
      .on("mouseout", function () {
        hideTooltip();
      });

    ys.push(y);
  }); 

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

  //console.log("groupedDaata: ", groupedData);

  const multipleColors = ["#669900", "#99cc33", "#ccee66", "#006699", "#3399cc", "#990066", "#cc3399", "#ff6600", "#ff9900", "#ffcc00"];
  const linkColorScale = d3.scaleOrdinal().range(multipleColors);

  const lineGenerator = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .curve(d3.curveBasis);


  groupedData.forEach(function (d, i) {
    // get the values of starting y of each attribute rect
    var ySource = { ... ys[i] };
    var yTarget = { ... ys[i+1] };

    const totalValues = data.length;
    
    // iterate over each attribute to draw the polygnon for each link
    for (let j = 0; j < d.length; j++) {
      const source = Object.keys(setsData)[i];
      const target = Object.keys(setsData)[i + 1];

      // Source
      const valuesSource = Object.keys(setsData[source]);

      const totalCountSource = setsData[source][d[j][source]]
      const numValuesSource = valuesSource.length;
      const maxHeightSource = height * 3 - (numValuesSource - 1);

      // Target
      const valuesTarget = Object.keys(setsData[source]);
      const totalCountTarget = setsData[target][d[j][target]];
      const numValuesTarget = valuesSource.length;
      const maxHeightTarget = height * 3 - (numValuesSource - 1);

      const sourceHeight =
        (setsData[source][d[j][source]] / totalValues) * maxHeightSource;
      const targetHeight =
        (setsData[target][d[j][target]] / totalValues) * maxHeightTarget;
      const count = d[j]["Count"];

      const paintSource = sourceHeight * count / totalCountSource;
      const paintTarget = targetHeight * count / totalCountTarget;

      if (paintSource == 0 || paintTarget == 0) { continue;}

      // Define the vertice s of the polygon.
      const polygonVertices = [
        { x: x(source) + 10 + 20, y: ySource[d[j][source]] + 20}, // Vertex 1
        { x: x(source) + 10 + 20, y: ySource[d[j][source]] + paintSource + 20}, // Vertex 2 
        { x: x(target) + 20, y: yTarget[d[j][target]] + paintTarget + 20}, // Vertex 3
        { x: x(target) + 20, y: yTarget[d[j][target]] + 20}, // Vertex 4
      ];

      // update yTarget to the next linker
      ySource[d[j][source]] += paintSource;
      yTarget[d[j][target]] += paintTarget;

      const linkColor = linkColorScale(i);

      const saturation = count / (totalCountSource + totalCountTarget);
      
      // Create a group for each attribute
      LinkAreaGroup = svg
        .append("g")
        //.attr("transform", "translate(${x(source) - 150}, 5)")
        //.attr("class", "linkAreaGroup");

      // Create a set of Plygnons to link each source to target
      LinkAreaGroup
        .append("polygon")
        .data([d[j]])
        .attr("class", "linkAreaGroup")
        .attr("points", polygonVertices.map((d) => `${d.x},${d.y}`).join(" "))
        .attr("fill", "green")//d3.color(linkColor).brighter(saturation).copy({ opacity: 0.5 }))
        .attr("stroke", "black")//d3.color(linkColor).darker(saturation).copy({ opacity: 0.5 }))
        .on("mouseover", function (event, d) {
          //console.log(d3.select(this)._groups[0][0].__data__)
          //showSetsTooltip();
        });
      } 
    });
  if (selectedValue != null) {
    //resetHighlightedAttribute(selectedAttribute);
    //resetHighlightedAttribute(selectedAttribute);
    targetAttributes = new Set();
    targetValues = new Set();
    highlightSetAttribute(selectedValue, selectedAttribute);
  }
}

function resetHighlightedAttribute(attribute) {
  d3.selectAll(".linkAreaGroup")
    .filter(function (d) {
      return d[attribute] != selectedValue;
    })
    .attr("opacity", 1);
  
  d3.selectAll(".attributeGroup")
    .filter(function (d) {
      return !targetValues.has(d);
    })
    .style("opacity", 0.75);
  
  targetAttributes = new Set();
  targetValues = new Set();
  
  const lines = d3.selectAll(".lines").filter(function (d) {return true});
  updateParallelCoordsLines(lines._groups[0].map((d) => d.__data__))
}

function highlightSetAttribute(attribute, value) {
  // links
  const links = d3.selectAll(".linkAreaGroup")
      .filter(function (d) {
        return d[attribute] == value;
      });
  const linksData = links._groups[0].map(link => link.__data__);
  
  // get different attributes (targets)
  linksData.forEach(link => {
    for (const key in link) {
        if (key != attribute && key != "Count") {
            targetAttributes.add(key);
        }
    }
  });
  //console.log("target attributes", targetAttributes)

  // get all different values (targets)
  targetAttributes.forEach(attribute => {
    linksData.forEach(link => {
      if (link.hasOwnProperty(attribute)) {
          targetValues.add(link[attribute]);
      }
    });
  });
  targetValues.add(value);
  //console.log(targetValues)

  // attribute
  d3.selectAll(".attributeGroup")
    .filter(function (d) {
      return !targetValues.has(d);
    })
    .style("opacity", 0.25);

  d3.selectAll(".linkAreaGroup")
    .filter(function (d) {
      return d[attribute] != value;
    })
    .attr("opacity", 0.25);

  const lines = d3.selectAll(".lines")
    .filter(function (d) {
      return d[attribute] != value;
    })
    .attr("opacity", 0.2);
}

function clickSetAttribute(value, attribute) {
  if (selectedValue == value) {
    resetHighlightedAttribute(attribute);
    selectedValue = null;
    selectedAttribute = null;
  } else {
    if (selectedValue != null) {
      resetHighlightedAttribute(attribute);
    }
    selectedValue = value;
    selectedAttribute = attribute;
    highlightSetAttribute(attribute, value);
  }
}