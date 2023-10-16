let selectedBrands = new Set();
let selectedAvgSeats = new Set();
let nextColors = "red";

const colorScale = d3.scaleSequential([4, 7], d3.interpolateGreens);

function updateHighlightedBrand(clickedBar) {
  var brand = clickedBar.Brand;

  if (selectedBrands.has(brand)) {
    selectedBrands.delete(brand);
    color = d3
      .selectAll(".bar")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("fill");

    d3.selectAll(".bar")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("fill", colorScale(clickedBar.avgSeats));

    d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", "#69b3a2");

    nextColors = color;
  } else {
    if (selectedBrands.size == 2) {
      firstBrand = selectedBrands.values().next().value;
      firstAvgSeats = d3.selectAll(".bar").filter(function (d) {
        return d.Brand == firstBrand;
      })._groups[0][0].__data__.avgSeats;
      selectedBrands.delete(firstBrand);

      d3.selectAll(".bar")
        .filter(function (d) {
          return d.Brand == firstBrand;
        })
        .attr("fill", colorScale(firstAvgSeats));

      d3.selectAll(".lines")
        .filter(function (d) {
          return d.Brand == firstBrand;
        })
        .attr("stroke", "#69b3a2");
    }
    color = selectedBrands.size == 0 ? "red" : nextColors;
    nextColors = color == "red" ? "blue" : "red";

    d3.selectAll(".bar")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("fill", color);

    d3.selectAll(".lines")
      .filter(function (d) {
        return d.Brand == brand;
      })
      .attr("stroke", color)
      .attr("opacity", 1);

    selectedBrands.add(brand);
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
    .duration(1000)
    .attr("x", (d) => xScale(d.Brand))
    .attr("y", (v) => yScale(v.Count))
    .attr("width", xScale.bandwidth())
    .attr("height", (v) => height - yScale(v.Count))
    .attr("fill", (v) => colorScale(v.avgSeats));

  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.Brand))
    .attr("y", (v) => yScale(v.Count))
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .attr("fill", (v) => colorScale(v.avgSeats))
    .transition()
    .duration(2000)
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
    .attr("transform", "rotate(-90) translate(-10, -10)")
    .style("text-anchor", "end");

  svg
    .select(".total-percentage-label")
    .transition()
    .duration(500)
    .attr("x", width - margin.right - 23)
    .attr("y", 150)
    .attr("text-anchor", "middle")
    .text((currentModels / totalModels).toFixed(2) * 100 + "% models");
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

  yMaxValues = [];
  maxMarkerGroups = d3.selectAll(".maxValueMarkers");
  maxMarkerGroups.each(function () {
    if (d3.select(this).attr("y") == null) {
      yMaxValues.push(0);
    } else {
      yMaxValues.push(parseInt(d3.select(this).attr("y")));
    }
  });

  yMinValues = [];
  minMarkerGroups = d3.selectAll(".minValueMarkers");
  minMarkerGroups.each(function () {
    if (d3.select(this).attr("y") == null) {
      yMinValues.push(height * 3);
    } else {
      yMinValues.push(parseInt(d3.select(this).attr("y")));
    }
  });

  var currY;
  // Redraw the data lines with the new filter
  svg
    .selectAll(".lines")
    .filter(function (a) {
      for (let i = 0; i < axisCombination.length; i++) {
        currY = yScale[axisCombination[i]](a[axisCombination[i]]);
        if (currY >= yMinValues[i] || currY <= yMaxValues[i]) {
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
        if (currY <= yMinValues[i] && currY >= yMaxValues[i]) {
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

  console.log(yMinValues[0]);

  svg.selectAll(".meanPointFiltered")
  .attr("cy", (a) => yScale[a](meanValues[a]))

}
