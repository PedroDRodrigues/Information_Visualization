var selectedBrand = null;

const selectedColor = "#fc8d62";
const hoveredColor = "#1f78b4";

const colorScale = d3.scaleQuantize([2, 7], d3.schemeGreens[6]);

function resetHighlightedBrand(clickedBar) {
  d3.selectAll(".bar")
    .filter(function (d) {
      return d.Brand == clickedBar.Brand;
    })
    .attr("stroke", "black")
    .attr("stroke-width", 0.5);

  d3.selectAll(".lines")
    .filter(function (d) {
      return d.Brand == clickedBar.Brand;
    })
    .attr("stroke", colorScale(5));
}

function updateHighlightedBrandClick(clickedBar) {
  var brand = clickedBar.Brand;

  // de-select brand
  if (selectedBrand == brand) {
    selectedBrand = null;
    resetHighlightedBrand(clickedBar);
  } else {
    // select new brand
    if (selectedBrand != null) {
      console.log(selectedBrand)
      const bar = d3.selectAll(".bar").filter(function (d) { return d.Brand == selectedBrand; })._groups[0][0];
      if (bar != undefined) { resetHighlightedBrand(bar.__data__); }
    }
    selectedBrand = brand;
    d3.selectAll(".bar")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", selectedColor)
      .attr("stroke-width", 2.5);
    
    d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", selectedColor);
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

    d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", hoveredColor);
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

    d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", colorScale(5));
  }
}

function updateBarChart(data) {
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
    .text((currentModels / totalModels).toFixed(2) * 100 + "% models");

  svg
    .selectAll(".bar")
    .on("click", function (d) {
      updateHighlightedBrandClick(d.target.__data__);
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
    .attr("opacity", 0.05);

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

  const filteredLines = d3.selectAll(".lines").filter(function (d) { return (d3.select(this).style("opacity") == 0.7); })._groups[0];
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
