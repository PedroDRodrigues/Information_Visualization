let selectedBrands = new Set();
let selectedAvgSeats = new Set();
let nextColors = "red";

const colorScale = d3.scaleSequential([4, 7], d3.interpolateBlues);

function updateHighlightedBrand(clickedBar) {
    var brand = clickedBar.Brand;
    
    if (selectedBrands.has(brand)) {
        selectedBrands.delete(brand);
        color = d3.selectAll(".bar").filter(function (d) { return d.Brand == brand })
            .attr("fill");
        
        d3.selectAll(".bar").filter(function (d) { return d.Brand == brand })
            .attr("fill", colorScale(clickedBar.avgSeats));
        
        d3.selectAll(".lines").filter(function (d) { return d.Brand == brand })
            .attr("stroke", "#69b3a2");

        nextColors = color;
    } else {
        if (selectedBrands.size == 2) {
            firstBrand = selectedBrands.values().next().value;
            firstAvgSeats = d3.selectAll(".bar").filter(function (d) { return d.Brand == firstBrand })._groups[0][0].__data__.avgSeats;
            selectedBrands.delete(firstBrand);

            d3.selectAll(".bar").filter(function (d) { return d.Brand == firstBrand })
                .attr("fill", colorScale(firstAvgSeats));
        
            d3.selectAll(".lines").filter(function (d) { return d.Brand == firstBrand })
                .attr("stroke", "#69b3a2");
        }
        color = (selectedBrands.size == 0) ? "red" : nextColors;
        nextColors = color == "red" ? "purple" : "red";

        d3.selectAll(".bar").filter(function (d) { return d.Brand == brand })
            .attr("fill", color);

        d3.selectAll(".lines").filter(function (d) { return d.Brand == brand })
            .attr("stroke", color);
        
        selectedBrands.add(brand);
    }
}