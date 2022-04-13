function traceStart(startVertex) {
    let data = window.puzzle; let puzzle = elem("puzzle"); let line = elem("line");
    if (data.trace.length !== 0) return trace(startVertex);
    data.trace.push(startVertex);
    line.appendChild(SVG.circle(data.vertices[startVertex], data.style.lineWidth * 2 + 0.001, data.style.color.lineDefault));
    for (let i of data.verticesToVertices[startVertex]) elem("puzzle-tapsolve-" + i).with("stroke-width", data.style.lineWidth / 2);
    SVG.refresh(puzzle);
}

function trace(vertex) {
    let data = window.puzzle; let puzzle = elem("puzzle"); let line = elem("line");
    if (data.trace.length === 0 || !data.verticesToVertices[data.trace.at(-1)].includes(vertex)) return;
    if (data.symbol.end[vertex] && data.trace.at(-1) === vertex) return traceEnd();
    if (data.trace.at(-2) === vertex) {
        line.removeChild(line.lastChild);
        line.removeChild(line.lastChild);
        data.trace.pop();
    } else {
        line.appendChild(SVG.line(data.vertices[data.trace.at(-1)], data.vertices[vertex], data.style.lineWidth + 0.001, data.style.color.lineDefault));
        line.appendChild(SVG.circle(data.vertices[vertex], data.style.lineWidth + 0.001, data.style.color.lineDefault));
        data.trace.push(vertex);
    }
    for (let i in data.vertices) elem("puzzle-tapsolve-" + i).with("stroke-width", 0);
    for (let i of data.verticesToVertices[vertex]) elem("puzzle-tapsolve-" + i).with("stroke-width", data.style.lineWidth / 2);
    if (data.symbol.end[vertex]) elem("puzzle-tapsolve-" + vertex).with("stroke-width", data.style.lineWidth / 2);
    SVG.refresh(puzzle);
}

function traceEnd() {
    let data = window.puzzle; let puzzle = elem("puzzle"); let line = elem("line");
    document.removeAllChildren(line);
    for (let i in data.vertices) elem("puzzle-tapsolve-" + i).with("stroke-width", 0);
    data.trace = [];
    SVG.refresh(puzzle);
}