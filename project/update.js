function updateParallelCoordinates(newAxisCombination) {
    d3.select("#parallelCoords").selectAll("*").remove();
    createParallelCoordinates(data, newAxisCombination);
}

