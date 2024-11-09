// Function to parse input points as (x, y; x, y; ...)
function parsePoints(input) {
    return input.split(";").map(point => {
        const coords = point.trim().split(",").map(Number);
        return { x: coords[0], y: coords[1] };
    }).filter(point => !isNaN(point.x) && !isNaN(point.y));
}

// Function to calculate Euclidean distance between two points
function calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

// Function to create a distance matrix based on parsed points
function createDistanceMatrix(points) {
    const matrix = [];
    for (let i = 0; i < points.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < points.length; j++) {
            matrix[i][j] = calculateDistance(points[i], points[j]);
        }
    }
    return matrix;
}

// Recursive function to generate all permutations and find the shortest path
function solveTSP(points, distanceMatrix) {
    let minPath = null;
    let minDistance = Infinity;

    const permute = (arr, l, r) => {
        if (l === r) {
            const distance = calculateTotalDistance(arr, distanceMatrix);
            if (distance < minDistance) {
                minDistance = distance;
                minPath = [...arr];
            }
        } else {
            for (let i = l; i <= r; i++) {
                [arr[l], arr[i]] = [arr[i], arr[l]];
                permute(arr, l + 1, r);
                [arr[l], arr[i]] = [arr[i], arr[l]];
            }
        }
    };

    // Helper to calculate total path distance for the given permutation
    const calculateTotalDistance = (arr, distanceMatrix) => {
        let total = 0;
        for (let i = 0; i < arr.length; i++) {
            total += distanceMatrix[arr[i].index][arr[(i + 1) % arr.length].index];
        }
        return total;
    };

    // Assign indexes to points and calculate permutations
    points.forEach((point, index) => { point.index = index; });
    permute(points, 0, points.length - 1);

    return { path: minPath, distance: minDistance };
}

// Function to render points and paths on a canvas
function drawCanvas(points, path) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 40;
    const offsetX = 50;
    const offsetY = 50;
    
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x * scale + offsetX, point.y * scale + offsetY, 8, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? "#e74c3c" : "#9b59b6"; // Start point is red
        ctx.fill();
        ctx.font = "12px Arial";
        ctx.fillStyle = "#2c3e50";
        ctx.fillText(`(${point.x},${point.y})`, point.x * scale + offsetX + 10, point.y * scale + offsetY);
    });

    if (path) {
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path[0].x * scale + offsetX, path[0].y * scale + offsetY);
        path.forEach(point => ctx.lineTo(point.x * scale + offsetX, point.y * scale + offsetY));
        ctx.lineTo(path[0].x * scale + offsetX, path[0].y * scale + offsetY); // Closing loop to start
        ctx.stroke();
    }
}

// Event listener for 'Solve' button
document.getElementById("solve").addEventListener("click", () => {
    const input = document.getElementById("points").value;
    const points = parsePoints(input);
    if (points.length < 2) {
        document.getElementById("result").textContent = "Please enter at least two points.";
        return;
    }

    const distanceMatrix = createDistanceMatrix(points);
    const { path, distance } = solveTSP(points, distanceMatrix);

    drawCanvas(points, path);
    document.getElementById("result").textContent = `Minimum Distance: ${distance.toFixed(2)}`;
});
