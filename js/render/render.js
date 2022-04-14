function drawFace(el, face, data) { 
    let ret = SVG.polygon(data.faces[face].map(x => data.vertices[x].x + " " + data.vertices[x].y).join(","), new Pos(0, 0), data.style.color.inner).with("id", "puzzle-face");
    el.appendChild(ret); 
    return ret;
}
function drawFaces(el, data) {
    if (data.outside !== -1) drawFace(el, data.outside, data);
    else if (data.facesToVertices.length) drawFace(el, 0, data);
}

function drawVertex(el, pos, data, i, isEndpoint) { 
    let ret = SVG.circle(pos, data.style.lineWidth, data.style.color.line).with("id", "puzzle-vertex-" + i);
    if (isEndpoint) ret.classList.add("endpoint");
    el.appendChild(ret);
    return ret;
}
function drawStartPoint(el, pos, data, i) { 
    let ret = SVG.circle(pos, data.style.lineWidth * 2, data.style.color.line).with("onmousedown", "traceStart(" + i + ")").with("id", "puzzle-startpoint-" + i);
    ret.classList.add("startpoint");
    el.appendChild(ret); 
    return ret;
}
function drawVertices(el, data) {
    for (let i in data.vertices) {
        let vert = data.vertices[i];
        if (data.symbol.end[i]) drawVertex(el, vert, data, i, true);
        else if (data.verticesToEdges[i]?.length > 1) drawVertex(el, vert, data, i, false);
        if (data.symbol.start[i]) drawStartPoint(el, vert, data, i);
    }
}

function drawEdge(el, pos1, pos2, data, i) { 
    let ret = SVG.line(pos1, pos2, data.style.lineWidth, data.style.color.line);
    el.appendChild(ret); 
    return ret;
}
function drawEdgeWithGap(el, pos1, pos2, gap, data, i) {
    if (gap <= 0) drawEdge(el, pos1, pos2, data).with("id", "puzzle-edge-" + i);
    else if (gap < 1) {
        drawEdge(el, pos1, Pos.lerp(pos1, pos2, gap / 2), data, i).with("id", "puzzle-edge-" + i + "-left");
        drawEdge(el, pos2, Pos.lerp(pos1, pos2, 1 - (gap / 2)), data, i).with("id", "puzzle-edge-" + i + "-right");
    }
}
function drawLine(el, pos1, pos2, data, i) {
    let ret;
    ret = SVG.line(pos1, pos2, data.style.lineWidth / 2, data.style.color.lineDefault).with("id", "puzzle-line-" + i);
    el.appendChild(ret);
    ret = SVG.circle(pos1, data.style.lineWidth / 2, data.style.color.lineDefault).with("id", "puzzle-line-" + i + "-left");
    el.appendChild(ret);
    ret = SVG.circle(pos2, data.style.lineWidth / 2, data.style.color.lineDefault).with("id", "puzzle-line-" + i + "-right");
    el.appendChild(ret);
}
function drawEdges(el, data) {
    for (let i in data.edges) {
        let edge = data.edges[i];
        drawEdgeWithGap(el, data.vertices[edge.x], data.vertices[edge.y], data.symbol.gap[i] ?? 0, data, i);
    }
}

function drawSymbols(el, data) {
    for (let vert in data.vertices) { //* Vertex Symbols
        if (!data.symbol.vertices[vert]) continue;
        let ret = SVG.symbols(...data.symbol.vertices[vert].map(x => SVG.renderSymbol(x))).with("transform", `translate(${data.vertices[vert].x}, ${data.vertices[vert].y}) scale(${data.style.lineWidth}, ${data.style.lineWidth})`);
        for (let i = 0; i < ret.childNodes.length; i++) ret.childNodes[i].with("class", "symbol").with("id", "puzzle-symbol-vertex-" + vert + "-" + i);
        el.appendChild(ret);
    }
    for (let edge in data.edges) { //* Edge Symbols
        if (!data.symbol.edges[edge]) continue;
        let ret = SVG.symbols(...data.symbol.edges[edge].map(x => SVG.renderSymbol(x))).with("transform", `translate(${data.edgesToPosition[edge].x}, ${data.edgesToPosition[edge].y}) scale(${data.style.lineWidth}, ${data.style.lineWidth})`);
        for (let i = 0; i < ret.childNodes.length; i++) ret.childNodes[i].with("class", "symbol").with("id", "puzzle-symbol-edge-" + edge + "-" + i);
        el.appendChild(ret);
    }
    for (let face in data.faces) { //* Face Symbols
        if (data.outside == face || !data.symbol.faces[face]) continue;
        let ret = SVG.symbols(...data.symbol.faces[face].map(x => SVG.renderSymbol(x))).with("transform", `translate(${data.facesToPosition[face].x}, ${data.facesToPosition[face].y}) scale(${data.facesToSize[face]}, ${data.facesToSize[face]})`);
        for (let i = 0; i < ret.childNodes.length; i++) ret.childNodes[i].with("class", "symbol").with("id", "puzzle-symbol-face-" + face + "-" + i);
        el.appendChild(ret);
    }
}

function drawTapSolve(el, data) {
    for (let i in data.vertices) {
        let text = document.createElement("text");
        text.innerHTML = i;
        // el.appendChild(text.with("x", data.vertices[i].x).with("y", data.vertices[i].y));
        el.appendChild(SVG.circle(
            data.vertices[i], 
            data.style.lineWidth * 3, 
            0x00000000,
            0, 0xFF0000FF
        ).with("onmousedown", (data.symbol.start[i] ? "traceStart(" : "trace(") + i + ")").with("id", "puzzle-tapsolve-" + i));
    }
}

function drawPuzzle(id, data) { 
    //! Used in editor to "refresh" puzzles, and in player to initially draw puzzles, 
    //! use other functions to modify puzzle's looks in play.
    let el = elem(id);
    preDrawPuzzle(el, data)
    el.setAttribute("viewBox", "0 0 1 1");
    drawFaces(el, data);
    drawVertices(el, data);
    drawEdges(el, data);
    for (let i in data.edges) if (data.symbol.line[i]) drawLine(el, data.vertices[data.edges[i].x], data.vertices[data.edges[i].y], data, i);
    drawSymbols(el, data);
    let trace = SVG.group().with("id", "line");
    el.appendChild(trace);
    let tapsolve = SVG.group().with("id", "tapsolve");
    el.appendChild(tapsolve);
    drawTapSolve(tapsolve, data);
    SVG.refresh("puzzle");
}