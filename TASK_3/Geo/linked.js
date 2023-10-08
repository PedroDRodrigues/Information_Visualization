// Function to handle mouseover event
function handleMouseOver(event, item) {
  
  let country;
  // Access the data point within the "item" object
  if ("circle" in item) country = item.circle.data.country; //beewarm
  else if ("properties" in item) country = item.properties.name; //choreoplot
  else country = item.country; //scatterplot

  // Check if data is defined and has the "country" property
  if (country) {
    // Select all elements with class "data" and filter based on the data's country
    d3.selectAll(".data")
      .filter(function (d) {
        // Check if "properties" exist in both data and d objects
        if ("properties" in d) {
          return country == d.properties.name;
        } else if ("circle" in d) {
          return country == d.circle.data.country;
        } else {
          return country == d.country;
        }
      })
      .attr("fill", "red"); // Change the fill color of the matching elements to red
  }
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
  
    const fScale = d3
    .scaleSequential()
    .domain([
      d3.min(currentData, (d) => d.lifeexpectancy),
      d3.max(currentData, (d) => d.lifeexpectancy),
    ])
    .interpolator(d3.interpolateBlues);

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
  d3.selectAll(".circle.data").attr("fill", "steelblue");
  
  currentData.forEach((element) => {
    console.log(element.country)
    d3.selectAll(".bee.data")
      .filter(function (d) {
        return element.country == d.circle.data.country;
      })
      .attr("fill", fScale(element.lifeexpectancy))
  })
}
