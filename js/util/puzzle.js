
function initData(data) {
    // vertex <-> edge <-> face
    data.verticesToVertices = [];
    data.verticesToEdges = [];
    data.verticesToFaces = [];
    for (_ in data.vertices) { data.verticesToVertices.push([]); }
    data.edgesToVertices = [];
    data.edgesToEdges = [];
    data.edgesToFaces = [];
    for (_ in data.edges) { data.edgesToEdges.push([]); }
    data.facesToVertices = [];
    data.facesToEdges = [];
    data.facesToFaces = [];
    for (_ in data.faces) { data.facesToEdges.push([]); data.facesToFaces.push([]); }
    // other
    data.edgesToAngles = [];
    data.edgesToFormula = [];
    data.edgesToPosition = [];
    data.edgesToLength = [];
    data.facesToAreas = [];
    data.facesToPosition = [];
    data.facesToSize = [];
    data.cell = function(id) { let ids = id.split("-"); switch (ids[0]) {
        case "vertex":
            return this.symbol.vertices[ids[1]][ids[2]];
        case "edge":
            return this.symbol.edges[ids[1]][ids[2]];
        case "face":
            return this.symbol.faces[ids[1]][ids[2]];
    }}
}

const CYCLE_DIRECTION = [[ 
    (x, source) => (x < source ? x + (Math.PI * 2) : x), 
    (p, c) => (p[1] === null || Math.min(p[1], c[1]) !== p[1] ? c : p)
], [
    (x, source) => (x > source ? x - (Math.PI * 2) : x), 
    (p, c) => (p[1] === null || Math.max(p[1], c[1]) !== p[1] ? c : p)
]];
function findFaces(data) {
    // naive implementation for //* Finding all "faces" on a witness puzzle; something about cycles and graphs
    for (d of CYCLE_DIRECTION) for (let edge of data.edges) { 
        let prev = edge.x; let cur = edge.y; let visited = [];
        while (true) {
            let angle = getAngle(data, cur, prev);
            let next = data.edges
                .filter(x => x.has(cur) && !x.has(prev))
                .map(x => [x, d[0](getAngle(data, cur, x.other(cur)), angle)])
                .reduce((p, c) => d[1](p, c), [null, null])[0]?.other(cur);
            log("core", visited, prev, cur, next);
            visited.push(prev);
            if (next === undefined) {
                visited.push(prev);
                prev = cur; cur = visited.pop();
                if (!visited.length) break;
            } else {
                prev = cur; cur = next;
                if (visited.includes(next)) {
                    visited.push(prev);
                    break;
                }
            }
        }
        if (d === CYCLE_DIRECTION[1]) visited = [visited[0], ...visited.slice(1).reverse()]; // reverse & rotate at the same time
        log("core", visited[0] === cur, visited, cur, prev);
        if (visited[0] === cur && !data.faces.reduce((p, c) => p || (c.every(x => visited.includes(x))), false)) data.faces.push(visited);
    }
    data.faces.sort();
}

function populateVerticesToEdges(data) {
    data.edgesToVertices = data.edges.map(x => [x.x, x.y]);
    data.verticesToEdges = transpose(data.edgesToVertices);
}

function getEdgeFromVertexChain(data, ...verts) {
    let ret = [];
    for (let i = 0; i < verts.length; i++) {
        let k = data.edges.findIndex(x => x.has(verts.at(i - 1)) && x.has(verts.at(i)));
        if (k !== -1) ret.push(k);
    }
    return ret;
}
function populateEdgesToFaces(data) {
    for (let k in data.faces) data.facesToEdges[k] = getEdgeFromVertexChain(data, ...data.faces[k]);
    data.edgesToFaces = transpose(data.facesToEdges);
    for (let i in data.edges) data.edgesToFaces[i] ??= [];
}

function populateFacesToVertices(data) {
    data.facesToVertices = [...data.faces];
    data.verticesToFaces = transpose(data.facesToVertices);
}

function populateVerticesToVertices(data) {
    for (let i in data.edges) {
        if (data.symbol.gap[i]) continue; let edge = data.edges[i];
        data.verticesToVertices[edge.x].push(edge.y);
        data.verticesToVertices[edge.y].push(edge.x);
    }
}
function populateEdgesToEdges(data) { for (let o of data.verticesToEdges) for (let p of o) data.edgesToEdges[p].push(...o); }
function populateFacesToFaces(data) { for (let o of data.edgesToFaces) for (let p of o) data.facesToFaces[p].push(...o); }

function getCentroid(...pos) { return new Pos(Math.prec(pos.reduce((p, c) => p + c.x, 0) / pos.length), Math.prec(pos.reduce((p, c) => p + c.y, 0) / pos.length)); }
function getEdgeInformation(data) {
    for (let i in data.edges) {
        i = Number(i); let edge = data.edges[i];
        let m = Math.prec(Math.posmod(getAngle(data, edge.x, edge.y), Math.PI));
        let b = Math.prec(data.vertices[edge.x].y - (Math.tan(m) * data.vertices[edge.x].x));
        data.edgesToAngles[i] = m;
        if (m === 1.5707963268) data.edgesToFormula[i] = "vertical, x=" + Math.prec(data.vertices[edge.x].x);
        else data.edgesToFormula[i] = Math.prec(Math.tan(m)) + "x" + (b === 0 ? "" : (b > 0 ? "+" + b : b));
        let x = data.vertices[edge.x]; let y = data.vertices[edge.y];
        data.edgesToLength[i] = Math.prec(Math.hypot(x.x - y.x, x.y - y.y));
    }
    for (let i in data.edgesToVertices) data.edgesToPosition[i] = getCentroid(...data.edgesToVertices[i].map(x => data.vertices[x]));
}

function getArea(...pos) { return pos.reduce((p, c) => [p[0] + ((p[1].x + c.x) * (p[1].y - c.y)), c], [0, pos.at(-1)])[0] / 2; }
function getFaceInformation(data) {
    for (let i in data.facesToVertices) data.facesToAreas[i] = Math.prec(getArea(...data.facesToVertices[i].map(x => data.vertices[x])));
    data.outside = data.facesToAreas.indexOf(data.facesToAreas.filter(c => c < 0)[0]);
    for (let i in data.facesToVertices) {
        let label = polylabel([data.facesToVertices[i].map(x => [data.vertices[x].x, data.vertices[x].y])], 0.0001);
        data.facesToPosition[i] = new Pos(Math.prec(label[0]), Math.prec(label[1]));
        data.facesToSize[i] = Math.prec(label.distance / Math.SQRT2);
    }
}

function uniqueSort(arr) { return arr.map(x => unique(x).sort()); }
function uniqueRemoveSort(arr) { for (let i in arr) arr[i] = remove(unique(arr[i]), Number(i)).sort(); return arr; }
function postProcessArrays(data) {
    data.verticesToVertices = uniqueRemoveSort(data.verticesToVertices);
    data.verticesToFaces = uniqueSort(data.verticesToFaces);
    data.edgesToEdges = uniqueRemoveSort(data.edgesToEdges);
    data.edgesToFaces = uniqueSort(data.edgesToFaces);
    data.facesToVertices = uniqueSort(data.facesToVertices);
    data.facesToEdges = uniqueSort(data.facesToEdges);
    data.facesToFaces = uniqueRemoveSort(data.facesToFaces);
}

function primePuzzle(data) {
    data.faces = [];
    findFaces(data);

    initData(data);

    populateVerticesToEdges(data);
    populateEdgesToFaces(data);
    populateFacesToVertices(data);
    populateVerticesToVertices(data);
    populateEdgesToEdges(data);
    populateFacesToFaces(data);

    getEdgeInformation(data);
    getFaceInformation(data);

    postProcessArrays(data);
    console.log(data);
}

function preDrawPuzzle(el, data) {
    data.trace = [];
}

function findVerticesInSegment(data, pos, angle) {
    let ret = []; angle = Math.posmod(Math.prec(angle), Math.PI * 2);
    if (Math.approxeq(angle, Math.PI / 2)) return data.vertices.map((vert, i) => Math.approxeq(vert.x, pos.x) && vert.y < pos.y ? i : '').filter(String);
    else if (Math.approxeq(angle, 3 * Math.PI / 2)) return data.vertices.map((vert, i) => Math.approxeq(vert.x, pos.x) && vert.y > pos.y ? i : '').filter(String);
    let m = Math.prec(Math.tan(angle));
    let b = pos.y - (m * pos.x);
    for (let i in data.vertices) { let vert = data.vertices[i];
        if (Math.between(0.5, angle / Math.PI, 1.5)) { if (vert.x > pos.x) continue; }
        else if (vert.x < pos.x) continue;
        if (Math.approxeq((vert.y - (m * vert.x)), b)) ret.push(Number(i));
    }
    return ret;
}

function edgeCrossProduct(p1, p2, p3) { return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y); }
function findEdgesInSegment(data, pos, angle) {
    let ret = []; angle = Math.posmod(Math.prec(angle), Math.PI * 2);
    let pos2 = new Pos(pos.x + Math.prec(Math.SQRT2 * Math.cos(angle)), pos.y + Math.prec(Math.SQRT2 * Math.sin(angle))); // who cares if it goes outside lol
    for (let i in data.edges) {
        let v1 = data.vertices[data.edges[i].x]; let v2 = data.vertices[data.edges[i].y];
        let d = [edgeCrossProduct(v1, v2, pos), edgeCrossProduct(v1, v2, pos2), edgeCrossProduct(pos, pos2, v1), edgeCrossProduct(pos, pos2, v2)];
        if ((d[0] * d[1] < 0) && (d[2] * d[3] < 0)) ret.push(Number(i));
        // could check for intersection, but do we need it?
    }
    return remove(ret, data.vertices.findIndex(x => x.x === pos.x && x.y === pos.y)); // remove origin point in case
}

function posInFace(pos, ...polygon) { // stolen and adapted from Randolph Franklin
    let ret = false;
    for (let i in polygon) {
        if (
            (Math.between(polygon.at(i-1).y, pos.y, polygon.at(i).y) || Math.between(polygon.at(i).y, pos.y, polygon.at(i-1).y)) &&
            (pos.x > (pos.y * polygon.at(i).x / polygon.at(i).y))
        ) ret = !ret;
    }
    return ret;
}
function getFaceFromVertex(data, pos) { return data.faces.findIndex(x => posInFace(pos, ...x.map(y => data.vertices[y]))); }
function findFacesInSegment(data, pos, angle) {
    let edges = findEdgesInSegment(data, pos, angle); let vertices = findVerticesInSegment(data, pos, angle);
    let ogFace = getFaceFromVertex(data, pos); let currentFace = ogFace; let ret = [];
    while (edges.length + vertices.length) {
        let edge = intersect(edges, data.facesToEdges[currentFace] ?? [])[0];
        if (edge !== undefined) {
            currentFace = (remove(data.edgesToFaces[edge], currentFace)[0] ?? -1);
            ret.push(currentFace);
            edges = remove(edges, edge);
            continue;
        } 
        let vertex = intersect(vertices, data.facesToVertices[currentFace] ?? [])[0];
        if (vertex !== undefined) { // TODO: debug this
            let nears = remove(data.verticesToEdges[vertex], ...intersect(data.facesToEdges[currentFace], data.verticesToEdges[vertex]));
            currentFace = data.facesToEdges.findIndex((x, i) => i !== currentFace && intersect(x, nears).length >= Math.min(nears.length, 2));
            ret.push(currentFace);
            vertices = remove(vertices, vertex);
            continue;
        }
        break;
    }
    return remove(ret, ogFace, data.outside);
}