Math.lerp = function(a, b, t) { return a + ((b - a) * t); }
Math.clamp = function(x, a, b) { return Math.min(Math.max(x, Math.min(a, b)), Math.max(a, b)); }
Math.between = function(a, b, c) { return a <= b && b <= c; }
Math.div = function(n, a) { return Math.trunc(n / a); }
Math.demod = function(n, a) { return n - (n % a); }
Math.posmod = function(n, a) { return ((n % a) + a) % a; }
Math.color = function(a) { return "#" + a.toString(16).padStart(8, "0"); }
Element.prototype.with = function(id, thing) { this.setAttribute(id, thing); return this; }
function remove(arr, ...thing) { return arr.filter(x => !thing.includes(x)); }
function unique(arr) {
    let found = [];
    for (let i = 0; i < arr.length; i++) if (!found.includes(arr[i])) found.push(arr[i]);
    return found;
}

class Pair {
    constructor(x, y) {
        if (y === undefined) {
            this.x = x.x;
            this.y = y.y;
        }
        this.x = x;
        this.y = y;
    }
}
Pair.prototype.offset = function(x, y) {
    if (y === undefined) {
        this.x += x.x;
        this.y += x.y;
    } else {
        this.x += x;
        this.y += y;
    }
    return this;
}

class Pos extends Pair {
    static lerp(pos1, pos2, t) {
        return new Pos(Math.lerp(pos1.x, pos2.x, t), Math.lerp(pos1.y, pos2.y, t));
    }
}
Pos.prototype.isOOB = function() { return Math.between(0, this.x, 1) && Math.between(0, this.y, 1); }
Pos.prototype.wrap = function(x, y) {
    if (x) this.x = Math.posmod(this.x, 1);
    if (y) this.y = Math.posmod(this.y, 1);
    return this;
}

class Edge extends Pair { constructor(x, y) { return super(Math.min(x, y), Math.max(x, y)); }}
Edge.prototype.has = function(x) { return this.x === x || this.y === x; }
Edge.prototype.other = function(x) {
    if (this.x === x) return this.y;
    return this.x;
}
SVG = {};
SVG.draw = function(type, pos) {
    return document.createElement(type).with(type === "circle" ? "cx" : "x", pos.x).with(type === "circle" ? "cy" : "y", pos.y);
}
function parseTransformString(tr) { return Object.fromEntries(tr?.match(/\w+\([^\(\)]*/g)?.map(x => x?.split("("))?.map(x => [x[0], x[1]?.split(",")]) ?? []); }
SVG.refresh = function(id) {
    if (typeof(id) === "string") id = document.getElementById(id);
    id.parentElement.innerHTML += " ";
}
SVG.circle = function(pos, r, fill=0xFFFFFFFF, stroke=0, strokeColor=0x000000FF) {
    return this.draw("circle", pos).with("r", r).with("fill", Math.color(fill)).with("stroke-width", stroke).with("stroke", Math.color(strokeColor));
}
SVG.line = function(pos1, pos2, r, fill=0xFFFFFFFF) {
    return document.createElement("line").with("x1", pos1.x).with("y1", pos1.y).with("x2", pos2.x).with("y2", pos2.y).with("fill", Math.color(fill)).with("stroke-width", r * 2).with("stroke", Math.color(fill));
}
SVG.polygon = function(poly, pos, fill=0xFFFFFFFF, stroke=0, strokeColor=0x000000FF) {
    return document.createElement("polygon").with("points", poly).with("transform", "translate(" + pos.x + ", " + pos.y + ")").with("fill", Math.color(fill)).with("stroke-width", stroke).with("stroke", Math.color(strokeColor));
}
SVG.path = function(d, pos, fill=0xFFFFFFFF, stroke=0, strokeColor=0x000000FF) {
    return document.createElement("path").with("d", d).with("transform", "translate(" + pos.x + ", " + pos.y + ")").with("fill", Math.color(fill)).with("stroke-width", stroke).with("stroke", Math.color(strokeColor));
}
SVG.group = function(...elements) {
    let ret = document.createElement("g");
    for (let element of elements) ret.appendChild(element);
    return ret;
}
SVG.symbols = function(...elements) {
    const POSITIONS = [
        [""],
        ["translate(-0.5, -0.5) scale(0.8, 0.8)", "translate(0.5, 0.5) scale(0.8, 0.8)"],
        ["translate(-0.5, -0.5) scale(0.45, 0.45)", "translate(0.5, -0.5) scale(0.45, 0.45)", "translate(0, 0.5) scale(0.45, 0.45)"],
        ["translate(-0.5, -0.5) scale(0.45, 0.45)", "translate(0.5, -0.5) scale(0.45, 0.45)", "translate(-0.5, 0.5) scale(0.45, 0.45)", "translate(0.5, 0.5) scale(0.45, 0.45)"],
        ["translate(-0.7, -0.7) scale(0.45, 0.45)", "translate(0.7, -0.7) scale(0.45, 0.45)", "translate(-0.7, 0.7) scale(0.45, 0.45)", "translate(0.7, 0.7) scale(0.45, 0.45)", "translate(0, 0) scale(0.45, 0.45)"],
        ["translate(-0.8, -0.8) scale(0.35, 0.35)", "translate(0.8, -0.8) scale(0.35, 0.35)", "translate(-0.8, 0.8) scale(0.35, 0.35)", "translate(0.8, 0.8) scale(0.35, 0.35)", "translate(-0.8, 0) scale(0.35, 0.35)", "translate(0.8, 0) scale(0.35, 0.35)"],
        ["translate(-0.8, -0.8) scale(0.35, 0.35)", "translate(0.8, -0.8) scale(0.35, 0.35)", "translate(-0.8, 0.8) scale(0.35, 0.35)", "translate(0.8, 0.8) scale(0.35, 0.35)", "translate(-0.8, 0) scale(0.35, 0.35)", "translate(0.8, 0) scale(0.35, 0.35)", "translate(0, 0) scale(0.35, 0.35)"],
        ["translate(-0.8, -0.8) scale(0.35, 0.35)", "translate(0.8, -0.8) scale(0.35, 0.35)", "translate(-0.8, 0.8) scale(0.35, 0.35)", "translate(0.8, 0.8) scale(0.35, 0.35)", "translate(-0.8, 0) scale(0.35, 0.35)", "translate(0.8, 0) scale(0.35, 0.35)", "translate(0, -0.8) scale(0.35, 0.35)", "translate(0, 0.8) scale(0.35, 0.35)"],
        ["translate(-0.8, -0.8) scale(0.35, 0.35)", "translate(0.8, -0.8) scale(0.35, 0.35)", "translate(-0.8, 0.8) scale(0.35, 0.35)", "translate(0.8, 0.8) scale(0.35, 0.35)", "translate(-0.8, 0) scale(0.35, 0.35)", "translate(0.8, 0) scale(0.35, 0.35)", "translate(0, -0.8) scale(0.35, 0.35)", "translate(0, 0.8) scale(0.35, 0.35)", "translate(0, 0) scale(0.35, 0.35)"],
    ];
    let poses = POSITIONS[elements.length - 1];
    return this.group(...elements.map((x, i) => x.with("transform", poses[i])));
}
SVG.symbol = {
    sus: function (fill) { return SVG.group(SVG.path("M0 1A1 1 0 000-1 1 1 0 000 1M.3-.7.3 0 .2 0 .2-.7M.6-.7.6 0 .5 0 .5-.7M.92.4-.1.4-.1.3.95.3", ORIGIN, fill)) },
    diamond: function (fill) { return SVG.group(SVG.path("M0 1 1 0 0-1-1 0", ORIGIN, fill)) }
}

const ORIGIN = new Pos(0, 0);
let PUZZLE = {
    "vertices": [
        new Pos(0.2, 0.2),
        new Pos(0.2, 0.8),
        new Pos(0.8, 0.8),
        new Pos(0.8, 0.2),
        new Pos(0.1, 0.1),
        new Pos(0.7, 0.7),
    ],
    "edges": [
        new Edge(0, 1),
        new Edge(1, 2),
        new Edge(2, 3),
        new Edge(3, 0),
        new Edge(0, 4),
        new Edge(2, 5)
    ],
    "symbol": {
        "vertices": {},
        "edges": {},
        "faces": {},
        "start": {0: true},
        "gap": {},
        "line": {},
        "end": {5: true}
    },
    "style": {
        "lineWidth": 0.015,
        "color": {
            "line": 0x888888FF,
            "lineDefault": 0xFFFFFFFF,
            "inner": 0xAAAAAAFF
        }
    }
}

window.onload = function() {
    primePuzzle(PUZZLE);
    drawPuzzle("puzzle", PUZZLE);
}

function getAngle(data, x, y) {
    return Math.atan2(data.vertices[y].y - data.vertices[x].y, data.vertices[y].x - data.vertices[x].x);
}
function pointToLine(p0, p1, p2) {
    return Math.abs(((p2.x - p1.x) * (p1.y - p0.y)) - ((p1.x - p0.x) * (p2.y - p1.y))) / Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x)) + ((p2.y - p1.y) * (p2.y - p1.y)));
}
function primePuzzle(data) {
    data.faces = [];
    // naive implementation for //* Finding all "faces" on a witness puzzle; something about cycles and graphs
    const CYCLE_DIRECTION = [[ 
        (x, source) => (x < source ? x + (Math.PI * 2) : x), 
        (p, c) => (p[1] === null || Math.min(p[1], c[1]) !== p[1] ? c : p)
    ], [
        (x, source) => (x > source ? x - (Math.PI * 2) : x), 
        (p, c) => (p[1] === null || Math.max(p[1], c[1]) !== p[1] ? c : p)
    ]];
    for (d of CYCLE_DIRECTION) for (let edge of data.edges) { // TODO: !! FIX THIS
        let prev = edge.x;
        let cur = edge.y;
        let visited = [];
        while (true) {
            let angle = getAngle(data, cur, prev);
            let next = data.edges
                .filter(x => x.has(cur) && !x.has(prev))
                .map(x => [x, d[0](getAngle(data, cur, x.other(cur)), angle)])
                .reduce((p, c) => d[1](p, c), [null, null])[0]?.other(cur);
            console.log("PROG", visited, prev, cur, next);
            visited.push(prev);
            if (next === undefined) {
                visited.push(prev);
                prev = cur;
                cur = visited.pop();
                if (!visited.length) break;
            } else {
                prev = cur;
                cur = next;
                if (visited.includes(next)) {
                    visited.push(prev);
                    break;
                }
            }
        }
        if (d === CYCLE_DIRECTION[1]) visited = [visited[0], ...visited.slice(1).reverse()]; // reverse & rotate at the same time
        console.log(visited[0] === cur, visited, cur, prev);
        if (visited[0] === cur && !data.faces.reduce((p, c) => p || (c.every(x => visited.includes(x))), false)) data.faces.push(visited);
    }
    data.faces.sort();
    // init & port obvious redundant data
    data.verticesToVertices = [];
    data.verticesToEdges = [];
    data.verticesToFaces = [];
    for (_ in data.vertices) { data.verticesToVertices.push([]); data.verticesToEdges.push([]); data.verticesToFaces.push([]); }
    data.edgesToVertices = data.edges.map(x => [x.x, x.y]);
    data.edgesToEdges = [];
    data.edgesToFaces = [];
    data.edgesToAngles = [];
    for (_ in data.edges) { data.edgesToEdges.push([]); data.edgesToFaces.push([]); }
    data.facesToVertices = [...data.faces];
    data.facesToEdges = [];
    data.facesToFaces = [];
    for (_ in data.faces) { data.facesToEdges.push([]); data.facesToFaces.push([]); }
    // -----------------------------------------------------------------------------------
    for (let i in data.edges) {
        i = Number(i)
        let edge = data.edges[i]
        data.verticesToVertices[edge.x].push(edge.y);
        data.verticesToVertices[edge.y].push(edge.x);
        data.verticesToEdges[edge.x].push(i);
        data.verticesToEdges[edge.y].push(i);
        data.edgesToAngles[i] = Math.posmod(getAngle(data, edge.x, edge.y), Math.PI);
    }
    for (let i in data.faces) {
        i = Number(i)
        let face = data.faces[i]
        for (let j in face) {
            data.verticesToFaces[face[j]].push(i);
            data.facesToEdges[i].push(data.edges.indexOf(data.edges.filter(x => x.has(face.at(j)) && x.has(face.at(j-1)))[0]));
        }
    }
    for (let i in data.facesToEdges) for (let p of data.facesToEdges[i]) data.edgesToFaces[p].push(Number(i));
    for (let o of data.edgesToFaces) for (let p of o) data.facesToFaces[p].push(o);
    for (let i in data.facesToFaces) {
        data.facesToFaces[i] = remove(unique(data.facesToFaces[i].flat()), Number(i)).sort();
    }
    for (let o of data.verticesToEdges) {
        for (p of o) data.edgesToEdges[p].push(...o);
    }
    for (let i in data.edgesToEdges) {
        data.edgesToEdges[i] = remove(unique(data.edgesToEdges[i]), Number(i)).sort();
    }
    data.facesToAreas = [];
    for (let i in data.facesToVertices) data.facesToAreas[i] = data.facesToVertices[i].reduce((p, c) => [p[0] + ((p[1].x + data.vertices[c].x) * (p[1].y - data.vertices[c].y)), data.vertices[c]], [0, data.vertices[data.facesToVertices[i].at(-1)]])[0] / 2;
    data.outside = data.facesToAreas.indexOf(data.facesToAreas.filter(c => c < 0)[0]);
    data.edgesToPosition = [];
    for (let i in data.edgesToVertices) data.edgesToPosition[i] = new Pos(data.edgesToVertices[i].reduce((p, c) => p + data.vertices[c].x, 0) / data.edgesToVertices[i].length, data.edgesToVertices[i].reduce((p, c) => p + data.vertices[c].y, 0) / data.edgesToVertices[i].length)
    data.facesToPosition = [];
    data.facesToSize = [];
    for (let i in data.facesToVertices) {
        let label = polylabel([data.facesToVertices[i].map(x => [data.vertices[x].x, data.vertices[x].y])], 0.001)
        data.facesToPosition[i] = new Pos(label[0], label[1])
        data.facesToSize[i] = label.distance / Math.SQRT2
    }
    // -----------------------------------------------------------------------------------
    // post-process in case of a go back and forth
    data.facesToVertices = data.facesToVertices.map(x => unique(x).sort());
    data.facesToEdges = data.facesToEdges.map(x => unique(x).sort());
    data.verticesToFaces = data.verticesToFaces.map(x => unique(x).sort());
    data.edgesToFaces = data.edgesToFaces.map(x => unique(x).sort());
    console.log(data);
}

function drawPuzzle(id, data) {
    let el = document.getElementById(id);
    el.setAttribute("viewBox", "0 0 1 1");
    if (data.outside !== -1) el.appendChild(SVG.polygon(data.faces[data.outside].map(x => data.vertices[x].x + " " + data.vertices[x].y).join(","), new Pos(0, 0), data.style.color.inner));
    else if (data.facesToVertices.length) el.appendChild(SVG.polygon(data.faces[0].map(x => data.vertices[x].x + " " + data.vertices[x].y).join(","), new Pos(0, 0), data.style.color.inner));
    // verts
    for (let i in data.vertices) {
        let vert = data.vertices[i];
        if (data.symbol.end[i] || data.verticesToEdges[i].length > 1) el.appendChild(SVG.circle(vert, data.style.lineWidth, data.style.color.line));
        if (data.symbol.start[i]) el.appendChild(SVG.circle(vert, data.style.lineWidth * 2, data.style.color.line));
    }
    // edges
    for (let i in data.edges) {
        let edge = data.edges[i];
        if (!data.symbol.gap[i]) el.appendChild(SVG.line(data.vertices[edge.x], data.vertices[edge.y], data.style.lineWidth, data.style.color.line));
        else if (data.symbol.gap[i] !== 1) {
            el.appendChild(SVG.line(data.vertices[edge.x], Pos.lerp(data.vertices[edge.x], data.vertices[edge.y], Math.min((data.symbol.gap[i] / 2), 1 - (data.symbol.gap[i] / 2))), data.style.lineWidth, data.style.color.line));
            el.appendChild(SVG.line(Pos.lerp(data.vertices[edge.x], data.vertices[edge.y], Math.max((data.symbol.gap[i] / 2), 1 - (data.symbol.gap[i] / 2))), data.vertices[edge.y], data.style.lineWidth, data.style.color.line));
        }
        if (data.symbol.line[i]) {
            el.appendChild(SVG.line(data.vertices[edge.x], data.vertices[edge.y], data.style.lineWidth / 3, data.style.color.lineDefault));
            el.appendChild(SVG.circle(data.vertices[edge.x], data.style.lineWidth / 3, data.style.color.lineDefault));
            el.appendChild(SVG.circle(data.vertices[edge.y], data.style.lineWidth / 3, data.style.color.lineDefault));
        }
    }
    // symbols
    for (let vert in data.vertices) {
        if (!data.symbol.vertices[vert]) continue;
        el.appendChild(SVG.symbols(...data.symbol.vertices[vert]).with("transform", `translate(${data.vertices[vert].x}, ${data.vertices[vert].y}) scale(${data.style.lineWidth}, ${data.style.lineWidth})`));
    }
    for (let edge in data.edges) {
        if (!data.symbol.edges[edge]) continue;
        el.appendChild(SVG.symbols(...data.symbol.edges[edge]).with("transform", `translate(${data.edgesToPosition[edge].x}, ${data.edgesToPosition[edge].y}) scale(${data.style.lineWidth}, ${data.style.lineWidth})`));
    }
    for (let face in data.faces) {
        if (data.outside == face || !data.symbol.faces[face]) continue;
        el.appendChild(SVG.symbols(...data.symbol.faces[face]).with("transform", `translate(${data.facesToPosition[face].x}, ${data.facesToPosition[face].y}) scale(${data.facesToSize[face]}, ${data.facesToSize[face]})`));
    }
    // dev
    for (let vert of data.vertices) {
        let e = SVG.draw("text", vert).with("fill", "black");
        e.innerHTML = data.vertices.indexOf(vert);
        el.appendChild(e)
    }
    SVG.refresh("puzzle");
}