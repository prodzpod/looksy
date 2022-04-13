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
require("./js/render/render.js");
require("./js/ui/puzzle.js");

window.onload = function() {
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
            "vertices": {0: [{type: "sus", fill: 0xABCDEFFF}]},
            "edges": {},
            "faces": {},
            "start": {0: true},
            "gap": {1: 0.4},
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
    primePuzzle(PUZZLE);
    drawPuzzle("puzzle", PUZZLE);
    window.puzzle = PUZZLE;
}