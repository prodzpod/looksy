'use strict'; //* Polylabel by mapbox, modified to work nodeless
class Queue {
    constructor(func) {
        this.func = func;
        this.q = [];
        this.length = 0;
    }
}
Queue.prototype.push = function(thing) {
    this.length++;
    for (let i = 0; i < this.q.length; i++) {
        if (this.func(thing, this.q[i]) > 0) {
            this.q.splice(i, 0, thing);
            return this;
        }
    }
    this.q.push(thing); return this;
}
Queue.prototype.pop = function() { this.length--; return this.q.pop(); }

function polylabel(polygon, precision, debug) {
    precision = precision || 1.0;

    // find the bounding box of the outer ring
    let minX, minY, maxX, maxY;
    for (let i = 0; i < polygon[0].length; i++) {
        let p = polygon[0][i];
        if (!i || p[0] < minX) minX = p[0];
        if (!i || p[1] < minY) minY = p[1];
        if (!i || p[0] > maxX) maxX = p[0];
        if (!i || p[1] > maxY) maxY = p[1];
    }

    let width = maxX - minX;
    let height = maxY - minY;
    let cellSize = Math.min(width, height);
    let h = cellSize / 2;

    if (cellSize === 0) {
        let degeneratePoleOfInaccessibility = [minX, minY];
        degeneratePoleOfInaccessibility.distance = 0;
        return degeneratePoleOfInaccessibility;
    }

    // a priority queue of cells in order of their "potential" (max distance to polygon)
    let cellQueue = new Queue(compareMax);

    // cover polygon with initial cells
    for (let x = minX; x < maxX; x += cellSize) {
        for (let y = minY; y < maxY; y += cellSize) {
            cellQueue.push(new Cell(x + h, y + h, h, polygon));
        }
    }

    // take centroid as the first best guess
    let bestCell = getCentroidCell(polygon);

    // second guess: bounding box centroid
    let bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon);
    if (bboxCell.d > bestCell.d) bestCell = bboxCell;

    let numProbes = cellQueue.length;
    
    while (cellQueue.length) {
        // pick the most promising cell from the queue
        let cell = cellQueue.pop();
        // update the best cell if we found a better one
        if (cell.d > bestCell.d) {
            bestCell = cell;
            if (debug) console.log('found best %f after %d probes', Math.round(1e4 * cell.d) / 1e4, numProbes);
        }

        // do not drill down further if there's no chance of a better solution
        if (cell.max - bestCell.d <= precision) continue;

        // split the cell into four cells
        h = cell.h / 2;
        cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon));
        cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon));
        cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon));
        cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon));
        numProbes += 4;
    }

    if (debug) {
        console.log('num probes: ' + numProbes);
        console.log('best distance: ' + bestCell.d);
    }

    let poleOfInaccessibility = [bestCell.x, bestCell.y];
    poleOfInaccessibility.distance = bestCell.d;
    return poleOfInaccessibility;
}

function compareMax(a, b) {
    return b.max - a.max;
}

function Cell(x, y, h, polygon) {
    this.x = x; // cell center x
    this.y = y; // cell center y
    this.h = h; // half the cell size
    this.d = pointToPolygonDist(x, y, polygon); // distance from cell center to polygon
    this.max = this.d + this.h * Math.SQRT2; // max distance to polygon within a cell
}

// signed distance from point to polygon outline (negative if point is outside)
function pointToPolygonDist(x, y, polygon) {
    let inside = false;
    let minDistSq = Infinity;

    for (let k = 0; k < polygon.length; k++) {
        let ring = polygon[k];

        for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
            let a = ring[i];
            let b = ring[j];

            if ((a[1] > y !== b[1] > y) &&
                (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) inside = !inside;

            minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
        }
    }

    return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

// get polygon centroid
function getCentroidCell(polygon) {
    let area = 0;
    let x = 0;
    let y = 0;
    let points = polygon[0];

    for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
        let a = points[i];
        let b = points[j];
        let f = a[0] * b[1] - b[0] * a[1];
        x += (a[0] + b[0]) * f;
        y += (a[1] + b[1]) * f;
        area += f * 3;
    }
    if (area === 0) return new Cell(points[0][0], points[0][1], 0, polygon);
    return new Cell(x / area, y / area, 0, polygon);
}

// get squared distance from a point to a segment
function getSegDistSq(px, py, a, b) {

    let x = a[0];
    let y = a[1];
    let dx = b[0] - x;
    let dy = b[1] - y;

    if (dx !== 0 || dy !== 0) {

        let t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = b[0];
            y = b[1];

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
}