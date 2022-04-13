Element.prototype.with = function(id, thing) { this.setAttribute(id, thing); return this; }
function parseTransformString(tr) { return Object.fromEntries(tr?.match(/\w+\([^\(\)]*/g)?.map(x => x?.split("("))?.map(x => [x[0], x[1]?.split(",")]) ?? []); }
SVG = {
    draw: function(type, pos) {
        return document.createElement(type).with(type === "circle" ? "cx" : "x", pos.x).with(type === "circle" ? "cy" : "y", pos.y);
    },
    refresh: function(id) {
        if (typeof(id) === "string") id = document.getElementById(id);
        id.parentElement.innerHTML += " ";
    },
    circle: function(pos, r, fill=0xFFFFFFFF, stroke=0, strokeColor=0x000000FF) {
        return this.draw("circle", pos).with("r", r).with("fill", Math.color(fill)).with("stroke-width", stroke).with("stroke", Math.color(strokeColor));
    },
    line: function(pos1, pos2, r, fill=0xFFFFFFFF) {
        return document.createElement("line").with("x1", pos1.x).with("y1", pos1.y).with("x2", pos2.x).with("y2", pos2.y).with("fill", Math.color(fill)).with("stroke-width", r * 2).with("stroke", Math.color(fill));
    },
    polygon: function(poly, pos, fill=0xFFFFFFFF, stroke=0, strokeColor=0x000000FF) {
        return document.createElement("polygon").with("points", poly).with("transform", "translate(" + pos.x + ", " + pos.y + ")").with("fill", Math.color(fill)).with("stroke-width", stroke).with("stroke", Math.color(strokeColor));
    },
    path: function(d, pos, fill=0xFFFFFFFF, stroke=0, strokeColor=0x000000FF) {
        return document.createElement("path").with("d", d).with("transform", "translate(" + pos.x + ", " + pos.y + ")").with("fill", Math.color(fill)).with("stroke-width", stroke).with("stroke", Math.color(strokeColor));
    },
    group: function(...elements) {
        let ret = document.createElement("g");
        for (let element of elements) ret.appendChild(element);
        return ret;
    },
    symbols: function(...elements) {
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
}
SVG.symbol = { //! Edit this to add new symbols
    sus: function (fill) { return SVG.group(
        SVG.path("M0 1A1 1 0 000-1 1 1 0 000 1M.3-.7.3 0 .2 0 .2-.7M.6-.7.6 0 .5 0 .5-.7M.92.4-.1.4-.1.3.95.3", ORIGIN, fill)
    )},
    diamond: function (fill) { return SVG.group(
        SVG.path("M0 1 1 0 0-1-1 0", ORIGIN, fill)
    )},
}

SVG.renderSymbol = function(params) {
    return SVG.symbol[params.type](params.fill);
}