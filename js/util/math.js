Math.lerp = function(a, b, t) { return a + ((b - a) * t); }
Math.clamp = function(x, a, b) { return Math.min(Math.max(x, Math.min(a, b)), Math.max(a, b)); }
Math.between = function(a, b, c) { return a <= b && b <= c; }
Math.div = function(n, a) { return Math.trunc(n / a); }
Math.demod = function(n, a) { return n - (n % a); }
Math.posmod = function(n, a) { return ((n % a) + a) % a; }
Math.color = function(a) { return "#" + a.toString(16).padStart(8, "0"); }
Math.prec = function(n, a=10) { return Math.round(n * Math.pow(10, a)) / Math.pow(10, a); }
function getAngle(data, x, y) {
    return Math.atan2(data.vertices[y].y - data.vertices[x].y, data.vertices[y].x - data.vertices[x].x);
}
function pointToLine(p0, p1, p2) {
    return Math.abs(((p2.x - p1.x) * (p1.y - p0.y)) - ((p1.x - p0.x) * (p2.y - p1.y))) / Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x)) + ((p2.y - p1.y) * (p2.y - p1.y)));
}

function remove(arr, ...thing) { return arr.filter(x => !thing.includes(x)); }
function unique(arr) {
    let found = [];
    for (let i = 0; i < arr.length; i++) if (!found.includes(arr[i])) found.push(arr[i]);
    return found;
}
function swap(arr) {
    let ret = [];
    for (let i in arr) for (let o of arr[i]) {
        ret[o] ??= []; ret[o].push(Number(i));
    }
    return ret;
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
    
    offset(x, y) {
        if (y === undefined) {
            this.x += x.x;
            this.y += x.y;
        } else {
            this.x += x;
            this.y += y;
        }
        return this;
    }
}

class Pos extends Pair {
    static lerp(pos1, pos2, t) { return new Pos(Math.lerp(pos1.x, pos2.x, t), Math.lerp(pos1.y, pos2.y, t)); }
    isOOB() { return Math.between(0, this.x, 1) && Math.between(0, this.y, 1); }
    wrap(x, y) {
        if (x) this.x = Math.posmod(this.x, 1);
        if (y) this.y = Math.posmod(this.y, 1);
        return this;
    }
}
const ORIGIN = new Pos(0, 0);

class Edge extends Pair { 
    constructor(x, y) { return super(Math.min(x, y), Math.max(x, y)); }
    has(x) { return this.x === x || this.y === x; }
    other(x) {
        if (this.x === x) return this.y;
        return this.x;
    }
}