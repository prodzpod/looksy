function drawFace(el, face, data) { el.appendChild(SVG.polygon(data.faces[face].map(x => data.vertices[x].x + " " + data.vertices[x].y).join(","), new Pos(0, 0), data.style.color.inner)); }
function drawFaces(el, data) {
    if (data.outside !== -1) drawFace(el, data.outside, data);
    else if (data.facesToVertices.length) drawFace(el, 0, data);
}

function drawVertex(el, pos, data) { el.appendChild(SVG.circle(pos, data.style.lineWidth, data.style.color.line)); }
function drawStartPoint(el, pos, data) { el.appendChild(SVG.circle(pos, data.style.lineWidth * 2, data.style.color.line)); }
function drawVertices(el, data) {
    for (let i in data.vertices) {
        let vert = data.vertices[i];
        if (data.symbol.end[i] || data.verticesToEdges[i].length > 1) drawVertex(el, vert, data);
        if (data.symbol.start[i]) drawStartPoint(el, vert, data);
    }
}

function drawEdge(el, pos1, pos2, data) { el.appendChild(SVG.line(pos1, pos2, data.style.lineWidth, data.style.color.line)); }
function drawEdgeWithGap(el, pos1, pos2, gap, data) {
    if (gap >= 1) return;
    if (gap <= 0) return drawEdge(el, pos1, pos2, data);
    drawEdge(el, pos1, Pos.lerp(pos1, pos2, gap / 2));
    drawEdge(el, pos2, Pos.lerp(pos1, pos2, 1 - (gap / 2)));
}
function drawEdges(el, data) {
    for (let i in data.edges) {
        let edge = data.edges[i];
        drawEdgeWithGap(el, data.vertices[edge.x], data.vertices[edge.y], data.symbol.gap[i] ?? 0, data);
    }
}

function drawSymbols(el, data) {
    for (let vert in data.vertices) { //* Vertex Symbols
        if (!data.symbol.vertices[vert]) continue;
        el.appendChild(SVG.symbols(...data.symbol.vertices[vert]).with("transform", `translate(${data.vertices[vert].x}, ${data.vertices[vert].y}) scale(${data.style.lineWidth}, ${data.style.lineWidth})`));
    }
    for (let edge in data.edges) { //* Edge Symbols
        if (!data.symbol.edges[edge]) continue;
        el.appendChild(SVG.symbols(...data.symbol.edges[edge]).with("transform", `translate(${data.edgesToPosition[edge].x}, ${data.edgesToPosition[edge].y}) scale(${data.style.lineWidth}, ${data.style.lineWidth})`));
    }
    for (let face in data.faces) { //* Face Symbols
        if (data.outside == face || !data.symbol.faces[face]) continue;
        el.appendChild(SVG.symbols(...data.symbol.faces[face]).with("transform", `translate(${data.facesToPosition[face].x}, ${data.facesToPosition[face].y}) scale(${data.facesToSize[face]}, ${data.facesToSize[face]})`));
    }
}

function drawPuzzle(id, data) {
    let el = document.getElementById(id);
    el.setAttribute("viewBox", "0 0 1 1");
    drawFaces(el, data);
    drawVertices(el, data);
    drawEdges(el, data);
    drawSymbols(el, data);
    //! DEVELOPER FUNCTION !//
    for (let vert of data.vertices) {
        let e = SVG.draw("text", vert).with("fill", "black");
        e.innerHTML = data.vertices.indexOf(vert);
        el.appendChild(e)
    }
    //! DEVELOPER FUNCTION !//
    SVG.refresh("puzzle");
}