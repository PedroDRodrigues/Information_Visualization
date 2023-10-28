const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px");

  const drawer = d3.select("#drawer");
//const event = d3.event;

// Function to handle mouseover event
function handleMouseOver(event, item) {
  // Select all elements with class "data" and filter based on the item's properties
  d3.selectAll(".data")
    .filter(function (d) {
      // Check if "properties" exist in both item and d objects
      if ("properties" in item) {
        if ("properties" in d) return item.properties.name == d.properties.name;
        else return item.properties.name == d.country;
      } else if ("properties" in d) {
        return item.country == d.properties.name;
      } else {
        return item.country == d.country;
      }
    })
    .attr("fill", "red"); // Change the fill color of the matching elements to red

  tooltip.transition()
    .duration(200)
    .style("opacity", 0.9);
  tooltip.html(`
    Country: ${d.country}<br>
    Income per Person: ${d.incomeperperson}<br>
    Alcohol Consumption: ${d.alcconsumption}<br>
    Employment Rate: ${d.employrate}%`);
}

// Function to handle mouseout event
function handleMouseOut(event, item) {
  // Filter the current data to remove entries with missing incomeperperson values
  currentData = globalDataCapita.filter(function (d) {
    return d.incomeperperson != "";
  });

  // Create a color scale for the incomeperperson values
  const colorScale = d3
    .scaleLog()
    .domain([
      d3.min(currentData, (d) => d.incomeperperson),
      d3.max(currentData, (d) => d.incomeperperson),
    ])
    .range([0, 1]);

  // Reset the fill color of all elements with class "country data" to black
  d3.selectAll(".country.data").attr("fill", "black");

  // Set the fill color of each country based on its incomeperperson value
  currentData.forEach((element) => {
    d3.selectAll(".country.data")
      .filter(function (d) {
        return d.properties.name == element.country;
      })
      .attr("fill", d3.interpolateBlues(colorScale(element.incomeperperson)));
  });

  // Reset the fill color of all elements with class "circle data" to steelblue
  d3.selectAll("circle.data").attr("fill", "steelblue");

  tooltip.transition()
    .duration(500)
    .style("opacity", 0);
}




/*.on("mouseover", (d, event) => {
  // Show tooltip on hover
  tooltip.transition()
    .duration(200)
    .style("opacity", 0.9);
  tooltip.html(`
    Country: ${d.country}<br>
    Income per Person: ${d.incomeperperson}<br>
    Alcohol Consumption: ${d.alcconsumption}<br>
    Employment Rate: ${d.employrate}%`)
  })*/
/*.on("mouseout", () => {
  // Hide tooltip on mouseout
  tooltip.transition()
    .duration(500)
    .style("opacity", 0);
})*/
/*.on("click", (d) => {
  // Toggle selected country in the drawer
  const isSelected = drawer.selectAll(".selected-country")
    .filter((country) => country === d.country)
    .size() > 0;
  if (isSelected) {
  // Remove from drawer if already selected
  drawer.selectAll(".selected-country")
    .filter((country) => country === d.country)
    .remove();
  } else {
    // Add to drawer if not selected
    drawer.append("div")
      .attr("class", "selected-country")
      .text(d.country)
      .on("click", () => {
        // Remove from drawer on click
        drawer.selectAll(".selected-country")
          .filter((country) => country === d.country)
          .remove();
      });
  }
})*/