function require(src) {
    let script = document.createElement("script");
    script.async = true; script.type = 'text/javascript'; script.src = src; 
    script.onload = function() { console.log("Loaded " + src); }
    document.getElementsByTagName("head")[0].appendChild(script);
}

function log(mode, ...things) {
    if (window.DEBUG_MODE === mode) console.log(...things)
}

window.THIS_URL = "http://looksy3.kro.kr";
window.DEBUG_MODE = "disabled";
require("./js/lib/polylabel.js");
require("./js/util/math.js");
require("./js/render/svg.js");
require("./js/util/puzzle.js");
require("./js/puzzle/validate.js");
require("./js/render/render.js");
require("./js/ui/puzzle.js");

window.onload = function() {
    let PUZZLE = {
        "vertices": [
            new Pos(0.1, 0.1),
            new Pos(0.1, 0.3),
            new Pos(0.1, 0.5),
            new Pos(0.1, 0.7),
            new Pos(0.1, 0.9),
            new Pos(0.3, 0.1),
            new Pos(0.3, 0.3),
            new Pos(0.3, 0.5),
            new Pos(0.3, 0.7),
            new Pos(0.3, 0.9),
            new Pos(0.5, 0.1),
            new Pos(0.5, 0.3),
            new Pos(0.5, 0.5),
            new Pos(0.5, 0.7),
            new Pos(0.5, 0.9),
            new Pos(0.7, 0.1),
            new Pos(0.7, 0.3),
            new Pos(0.7, 0.5),
            new Pos(0.7, 0.7),
            new Pos(0.7, 0.9),
            new Pos(0.9, 0.1),
            new Pos(0.9, 0.3),
            new Pos(0.9, 0.5),
            new Pos(0.9, 0.7),
            new Pos(0.9, 0.9),
            new Pos(0.95, 0.95)
        ],
        "edges": [
            new Edge(0, 1),
            new Edge(1, 2),
            new Edge(2, 3),
            new Edge(3, 4),
            new Edge(5, 6),
            new Edge(6, 7),
            new Edge(7, 8),
            new Edge(8, 9),
            new Edge(10, 11),
            new Edge(11, 12),
            new Edge(12, 13),
            new Edge(13, 14),
            new Edge(15, 16),
            new Edge(16, 17),
            new Edge(17, 18),
            new Edge(18, 19),
            new Edge(20, 21),
            new Edge(21, 22),
            new Edge(22, 23),
            new Edge(23, 24),
            new Edge(0, 5),
            new Edge(1, 6),
            new Edge(2, 7),
            new Edge(3, 8),
            new Edge(4, 9),
            new Edge(5, 10),
            new Edge(6, 11),
            new Edge(7, 12),
            new Edge(8, 13),
            new Edge(9, 14),
            new Edge(10, 15),
            new Edge(11, 16),
            new Edge(12, 17),
            new Edge(13, 18),
            new Edge(14, 19),
            new Edge(15, 20),
            new Edge(16, 21),
            new Edge(17, 22),
            new Edge(18, 23),
            new Edge(19, 24),
            new Edge(24, 25)
        ],
        "symbol": {
            "vertices": {1: [{type: "dot", fill: 0xABCDEFFF}]},
            "edges": {},
            "faces": {1: [{type: "square", fill: 0xFFFFFFFF}], 4: [{type: "square", fill: 0xFFFFFFFF}], 12: [{type: "square", fill: 0x000000FF}]},
            "start": {0: true},
            "gap": {},
            "line": {},
            "end": {25: true}
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
    primePuzzle(PUZZLE);
    drawPuzzle("puzzle", PUZZLE);
    window.puzzle = PUZZLE;
}