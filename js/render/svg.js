Element.prototype.with = function(id, thing) { this.setAttribute(id, thing); return this; }
function elem(id) { return document.getElementById(id); } //! shorthand
document.removeElementById = function(id) { let el = elem(id); return el?.parentElement.removeChild(el); }
document.removeElementsByClassName = function(clazz) { let els = document.getElementsByClassName(clazz); return els.map(x => x?.parentElement.removeChild(x)); }
document.removeElementsByTagName = function(tag) { let els = document.getElementsByTagName(tag); return els.map(x => x?.parentElement.removeChild(x)); }
document.removeAllChildren = function(el) { while (el.firstChild) el.removeChild(el.firstChild); }
function parseTransformString(tr) { return Object.fromEntries(tr?.match(/\w+\([^\(\)]*/g)?.map(x => x?.split("("))?.map(x => [x[0], x[1]?.split(",")]) ?? []); }
SVG = {
    draw: function(type, pos) {
        return document.createElement(type).with(type === "circle" ? "cx" : "x", pos.x).with(type === "circle" ? "cy" : "y", pos.y);
    },
    refresh: function(id) {
        if (typeof(id) === "string") id = elem(id);
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
    sus: function (skin, fill, _, _) { return SVG.group(
        SVG.path("M0 1A1 1 0 000-1 1 1 0 000 1M.3-.7.3 0 .2 0 .2-.7M.6-.7.6 0 .5 0 .5-.7M.92.4-.1.4-.1.3.95.3", ORIGIN, fill)
    )},
    dot: function (skin, fill, soundDots, mode) { return SVG.group(
        SVG.path("M.5.8654 1 0 .5-.8654-.5-.8654-1 0-.5.8654", ORIGIN, 0x000000FF)
    )},
    square: function (skin, fill, _, _) { return SVG.group(
        SVG.path("M.375-.75Q.75-.75.75-.375L.75.375Q.75.75.375.75L-.375.75Q-.75.75-.75.375L-.75-.375Q-.75-.75-.375-.75", ORIGIN, fill)
    )},
    sun: function (skin, fill, _, _) { return SVG.group(
        SVG.path("M-.5625-.5625-.5089-.2143-.8036 0-.5089.2143-.5625.5625-.2143.5089 0 .8036.2143.5089.5625.5625.5089.2143.8036 0 .5089-.2143.5625-.5625.2143-.5089 0-.8036-.2143-.5089", ORIGIN, fill)
    )},
    triangle: function (skin, fill, count, _) { 
        const triDistribution = {
            "canonical": [[], [1], [2], [3], [2, 2], [2, 3], [3, 3], [2, 3, 2], [3, 2, 3], [3, 3, 3]],
            "simplified": [[], [1], [2], [1, 2], [2, 2], [2, 3], [1, 2, 3], [2, 3, 2], [3, 2, 3], [3, 3, 3]]
        }[skin][count]; let ret = []; let triCanonical = "M0-.4286-.4286.3214.4286.3214";
        for (let y = 0; y < triDistribution.length; y++) for (let x = 0; x < triDistribution[y]; x++) 
            ret.push(SVG.path(triCanonical, new Pos(0.59 * (2 * x - triDistribution[y] + 1), 0.54 * (2 * y - triDistribution.length + 1)), fill))
        return SVG.group(...ret);
    }
}

SVG.renderSymbol = function(params) {
    return SVG.symbol[params.type](params.skin ?? "canonical", params.fill, params.count, params.special);
}