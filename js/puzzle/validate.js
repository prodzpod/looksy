function validate(quick=false) { // here we go again
    let panel = {};
    panel.pathVertices = [...puzzle.trace];
    panel.pathEdges = getEdgeFromVertexChain(puzzle, ...puzzle.trace);
    panel.walls = unique([...panel.pathEdges, ...Object.keys(puzzle.symbol.line).map(x => Number(x))]);
    panel.regionVertices = [unique([...puzzle.trace, ...Object.keys(puzzle.symbol.line).map(x => puzzle.edgesToVertices[x])].flat())];
    panel.regionEdges = [[...panel.walls]];
    panel.regionFaces = [[puzzle.outside]];
    let visited = [puzzle.outside];
    mainloop: while (true) {
        for (let i = 0; i < puzzle.faces.length; i++) {
            if (visited.includes(i)) continue;
            panel.regionVertices.push([]);
            panel.regionEdges.push([]);
            panel.regionFaces.push([]);
            floodFillRegion(panel, visited, i, panel.regionFaces.length - 1);
            visited.push(...panel.regionFaces.at(-1));
            continue mainloop;
        }
        break;
    }
    panel.regions = panel.regionFaces.length;
    panel.regionSymbols = [];
    panel.regionSymbolTypes = [];
    panel.regionSymbolColors = [];
    panel.regionSymbolTypeColors = [];
    panel.regionTypes = [];
    panel.regionColors = [];
    panel.symbols = [];
    panel.symbolTypes = {};
    panel.symbolColors = {};
    panel.symbolTypeColors = {};
    panel.types = [];
    panel.colors = [];
    function regionAggregate(panel, i, z, regionArea, area) {
        for (let j of regionArea[i]) {
            let symbols = area[j];
            for (k in symbols) {
                let o = symbols[k]; if (!o) continue;
                let id = z + "-" + j + "-" + k;
                panel.regionSymbols[i].push(id);
                panel.symbols.push(id);
                panel.regionSymbolTypes[i][o.type] ??= [];
                panel.regionSymbolTypes[i][o.type].push(id);
                panel.symbolTypes[o.type] ??= [];
                panel.symbolTypes[o.type].push(id);
                panel.regionSymbolColors[i][o.fill] ??= [];
                panel.regionSymbolColors[i][o.fill].push(id);
                panel.symbolColors[o.fill] ??= [];
                panel.symbolColors[o.fill].push(id);
                panel.regionSymbolTypeColors[i][o.type] ??= {};
                panel.regionSymbolTypeColors[i][o.type][o.fill] ??= [];
                panel.regionSymbolTypeColors[i][o.type][o.fill].push(id);
                panel.symbolTypeColors[o.type] ??= {};
                panel.symbolTypeColors[o.type][o.fill] ??= [];
                panel.symbolTypeColors[o.type][o.fill].push(id);
                panel.regionTypes[i] ??= [];
                panel.regionTypes[i].push(o.type);
                panel.regionColors[i] ??= [];
                panel.regionColors[i].push(o.fill);
                panel.types.push(o.type);
                panel.colors.push(o.fill);
            }
        }
    }
    for (let i = 0; i < panel.regions; i++) {
        panel.regionSymbols[i] = [];
        panel.regionSymbolTypes[i] = {};
        panel.regionSymbolColors[i] = {};
        panel.regionSymbolTypeColors[i] = {};
        regionAggregate(panel, i, "vertex", panel.regionVertices, puzzle.symbol.vertices);
        regionAggregate(panel, i, "edge", panel.regionEdges, puzzle.symbol.edges);
        regionAggregate(panel, i, "face", panel.regionFaces, puzzle.symbol.faces);
        panel.regionTypes[i] = unique(panel.regionTypes[i] ?? []);
        panel.regionColors[i] = unique(panel.regionColors[i] ?? []);
    }
    // panel.types = unique(panel.types);
    // panel.colors = unique(panel.colors);
    panel.invalidSymbols = [];
    console.log(panel);
    // ------------------------------------------------------------------------------------------------------------------------------
    for (let fn of GLOBAL_VALIDATE) {
        if (fn.or ? intersects(fn.or, panel.types) : (fn.orNot ? !intersects(fn.orNot, panel.types) : fn.orCustom(panel))) { 
            panel.invalidSymbols.push(...(fn.func(panel, quick) ?? []));
            if (quick && panel.invalidSymbols.length) return panel.invalidSymbols;
        }
    }
    for (let fn of LINE_VALIDATE) {
        if (fn.or ? intersects(fn.or, panel.regionTypes[0]) : (fn.orNot ? !intersects(fn.orNot, panel.regionTypes[0]) : fn.orCustom(panel))) { 
            panel.invalidSymbols.push(...(fn.func(panel, quick) ?? []));
            if (quick && panel.invalidSymbols.length) return panel.invalidSymbols;
        }
    }
    for (let i = 1; i < panel.regions; i++) for (let fn of VALIDATE) {
        if (fn.or ? intersects(fn.or, panel.regionTypes[i]) : (fn.orNot ? !intersects(fn.orNot, panel.regionTypes[i]) : fn.orCustom(panel, i))) { 
            panel.invalidSymbols.push(...(fn.func(panel, i, quick) ?? []));
            if (quick && panel.invalidSymbols.length) return panel.invalidSymbols;
        }
    }
    return panel.invalidSymbols;
}

function floodFillRegion(panel, visited, face, index) {
    panel.regionFaces[index].push(face);
    // step 1: get edges near this panel
    for (let o of puzzle.facesToEdges[face]) if (!panel.regionEdges[0].includes(o) && !panel.regionEdges[index].includes(o)) {
        panel.regionEdges[index].push(o);
        // step 2: get vertices near this edge
        for (let p of puzzle.edgesToVertices[o]) if (!panel.regionVertices[0].includes(p) && !panel.regionVertices[index].includes(p))
            panel.regionVertices[index].push(p);
        // step 3: get faces near this edge
        for (let q of puzzle.edgesToFaces[o]) if (!panel.regionFaces[0].includes(q) && !panel.regionFaces[index].includes(q))
            floodFillRegion(panel, visited, q, index);
    }
}

GLOBAL_VALIDATE = [
    
]

LINE_VALIDATE = []

VALIDATE = [{
    "_name": "dot check",
    "or": ["dot"],
    "func": (panel, regionNumber, quick) => {
        return [...panel.regionSymbolTypes[regionNumber].dot];
    }
}, {
    "_name": "square check",
    "or": ["square"],
    "func": (panel, regionNumber, quick) => {
        let colors = Object.keys(panel.regionSymbolTypeColors[regionNumber].square);
        if (quick && colors > 1) return ["invalid"];
        let majority = 0; let wrong = []; let right = [];
        for (k of colors) {
            let squares = panel.regionSymbolTypeColors[regionNumber].square[k];
            if (squares.length > majority) { // majority found
                wrong.push(...right) // push out previous majority
                right = squares;
                majority = squares.length;
            } else if (squares.length === majority) { // equal
                wrong.push(...right, ...squares); // push out both
                right = []; // reset
                majority += 0.5; // back out
            } else { // not majority
                wrong.push(...squares);
            }
        }
        return wrong;
    }
}]