function drawFace(el, face, data) { 
    let ret = SVG.polygon(data.faces[face].map(x => data.vertices[x].x + " " + data.vertices[x].y).join(","), new Pos(0, 0), data.style.color.inner);
    data.faceElement = ret;
    el.appendChild(ret); 
    return ret;
}
function drawFaces(el, data) {
    if (data.outside !== -1) drawFace(el, data.outside, data);
    else if (data.facesToVertices.length) drawFace(el, 0, data);
}

function drawVertex(el, pos, data, i, isEndpoint) { 
    let ret = SVG.circle(pos, data.style.lineWidth, data.style.color.line)
    if (isEndpoint) ret.classList.add("endpoint");
    data.vertexElements[i] = ret;
    el.appendChild(ret);
    return ret;
}
function drawStartPoint(el, pos, data, i) { 
    let ret = SVG.circle(pos, data.style.lineWidth * 2, data.style.color.line).with("onclick", "traceStart(" + i + ")");
    ret.classList.add("startpoint");
    el.appendChild(ret); 
    return ret;
}
function drawVertices(el, data) {
    for (let i in data.vertices) {
        let vert = data.vertices[i];
        if (data.symbol.end[i]) drawVertex(el, vert, data, i, true);
        else if (data.verticesToEdges[i].length > 1) drawVertex(el, vert, data, i, false);
        if (data.symbol.start[i]) drawStartPoint(el, vert, data, i);
    }
}

function drawEdge(el, pos1, pos2, data, i) { 
    let ret = SVG.line(pos1, pos2, data.style.lineWidth, data.style.color.line);
    el.appendChild(ret); 
    return ret;
}
function drawEdgeWithGap(el, pos1, pos2, gap, data, i) {
    if (gap >= 1) data.edgeElements[i] = [];
    else if (gap <= 0) data.edgeElements[i] = [drawEdge(el, pos1, pos2, data)];
    else data.edgeElements[i] = [drawEdge(el, pos1, Pos.lerp(pos1, pos2, gap / 2), data, i), drawEdge(el, pos2, Pos.lerp(pos1, pos2, 1 - (gap / 2)), data, i)];
    return data.edgeElements[i];
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
        data.vertexSymbolElements[vert] = Array.from(ret.childNodes);
        el.appendChild(ret);
    }
    for (let edge in data.edges) { //* Edge Symbols
        if (!data.symbol.edges[edge]) continue;
        let ret = SVG.symbols(...data.symbol.edges[edge].map(x => SVG.renderSymbol(x))).with("transform", `translate(${data.edgesToPosition[edge].x}, ${data.edgesToPosition[edge].y}) scale(${data.style.lineWidth}, ${data.style.lineWidth})`);
        data.edgeSymbolElements[edge] = Array.from(ret.childNodes);
        el.appendChild(ret);
    }
    for (let face in data.faces) { //* Face Symbols
        if (data.outside == face || !data.symbol.faces[face]) continue;
        let ret = SVG.symbols(...data.symbol.faces[face].map(x => SVG.renderSymbol(x))).with("transform", `translate(${data.facesToPosition[face].x}, ${data.facesToPosition[face].y}) scale(${data.facesToSize[face]}, ${data.facesToSize[face]})`);
        data.faceSymbolElements[face] = Array.from(ret.childNodes);
        el.appendChild(ret);
    }
}

function drawPuzzle(id, data) {
    let el = document.getElementById(id);
    preDrawPuzzle(el, data)
    el.setAttribute("viewBox", "0 0 1 1");
    drawFaces(el, data);
    drawVertices(el, data);
    drawEdges(el, data);
    drawSymbols(el, data);
    el.appendChild(SVG.group().with("id", "line"));
    SVG.refresh("puzzle");
}