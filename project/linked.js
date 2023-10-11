// Function to swap axes
function swapAxes() {
    // Find the next axis combination
    const currentIndex = axisCombinations.indexOf(currentAxisCombination);
    const nextIndex = (currentIndex + 1) % axisCombinations.length;
    currentAxisCombination = axisCombinations[nextIndex];

    // Redraw the plot with the new axis combination
    updateParallelCoordinates(currentAxisCombination);
}

// Function to check and perform swaps if necessary
function checkAndPerformSwaps(axisPositions) {
    const axisNames = Object.keys(axisPositions);

    for (let i = 0; i < axisNames.length - 1; i++) {
        const currentAxis = axisNames[i];
        const nextAxis = axisNames[i + 1];

        if (axisPositions[currentAxis] > axisPositions[nextAxis]) {
            // Swap the axes in the current axis combination
            const index1 = currentAxisCombination.indexOf(currentAxis);
            const index2 = currentAxisCombination.indexOf(nextAxis);

            currentAxisCombination[index1] = nextAxis;
            currentAxisCombination[index2] = currentAxis;
        }
    }
}

// Function to update the current axis combination based on the arrangement
function updateAxisCombination() {
    const axisOrder = d3.select("#parallelCoords")
        .selectAll(".axis")
        .nodes()
        .map((axis) => axis.getAttribute("data-attribute"));

    return axisOrder;
}
