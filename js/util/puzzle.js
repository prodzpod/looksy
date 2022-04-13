
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
    data.edgesToPosition = [];
    data.edgesToLength = [];
    data.facesToAreas = [];
    data.facesToPosition = [];
    data.facesToSize = [];
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
    for (d of CYCLE_DIRECTION) for (let edge of data.edges) { // TODO: !! FIX THIS
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
    data.verticesToEdges = swap(data.edgesToVertices);
}

function populateEdgesToFaces(data) {
    for (let k in data.faces) for (let i = 0; i < data.faces[k].length; i++) {
        let edge = data.edges.findIndex(x => x.has(data.faces[k].at(i-1)) && x.has(data.faces[k].at(i)));
        if (edge !== undefined) data.facesToEdges[k].push(edge)
    }
    data.edgesToFaces = swap(data.facesToEdges);
    for (let i in data.edges) data.edgesToFaces[i] ??= [];
}

function populateFacesToVertices(data) {
    data.facesToVertices = [...data.faces];
    data.verticesToFaces = swap(data.facesToVertices);
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
        data.edgesToAngles[i] = Math.prec(Math.posmod(getAngle(data, edge.x, edge.y), Math.PI));
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
        let label = polylabel([data.facesToVertices[i].map(x => [data.vertices[x].x, data.vertices[x].y])], 0.001);
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
    data.element = el;
    data.vertexElements = [];
    data.edgeElements = [];
    data.faceElement = undefined;
    data.vertexSymbolElements = [];
    data.edgeSymbolElements = [];
    data.faceSymbolElements = [];
}