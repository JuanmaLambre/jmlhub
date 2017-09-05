function test_me() {
    return "HI";
}

/**
 * Some terminology:
 *      point: list of size=3 representing (x, y, z)
 *      outline: list of points
 *      surface: list of outlines
 */


var DEFAULT_AXIS = 1    // x=0, y=1, z=2

function dot(A, B) {
    var res = [];
    var n = A[0].length;
    for (var row = 0; row < A.length; row++) {
        var rowRes = []
        for (var col = 0; col < B[0].length; col++) {
            var sum = 0;
            for (var i = 0; i < n; i++) {
                sum += A[row][i] * B[i][col];
            }
            rowRes.push(sum);
        }
        res.push(rowRes);
    }
    return res;
}

function range(x, y) {
    var ret = [];
    for (var i = x; i < y; i++) {
        ret.push(i);
    }
    return ret;
}

function _rotate(point, angle, axis=DEFAULT_AXIS) {
    var R = [[axis == 0 ? 1 : Math.cos(angle), axis == 2 ? -Math.sin(angle) : 0, axis == 1 ? Math.sin(angle) : 0],
             [axis == 2 ? Math.sin(angle) : 0, axis == 1 ? 1 : Math.cos(angle), axis == 0 ? -Math.sin(angle) : 0],
             [axis == 1 ? -Math.sin(angle) : 0, axis == 0 ? Math.sin(angle) : 0, axis == 2 ? 1 : Math.cos(angle)]]
    return dot([point], R)[0]
}


/**
 * Makes a revolution surface out of outline.
 * 
 * @return a surface, with each outline rotated 'delta' degrees
 * 
 * @param {*} outline 
 * @param {*} delta precision angle for discrete resolution
 * @param {*} opts 
       axis: rotation axis (defaults DEFAULTS_AXIS)
       angle: length (in angle) of revolution. Defaults 2*PI (minus epsilon)
 */
function revolve(outline, delta, opts={}) {
    var axis = opts.axis || DEFAULT_AXIS
    var maxAngle = opts.angle || 2*Math.PI - 0.000001

    var res = [outline];
    theta = delta;
    while (theta <= maxAngle) {
        res.push(outline.map(function(p) { return _rotate(p, theta, axis) }))
        theta += delta
    }
    return res
}


/**
 * Flattens a surface for WebGL
 * 
 * @param {*} surface of outlines
 */
function flattenSurface(surface) {
    var flat = []
    for (var outline = 0; outline < surface.length; outline++) {
        for (var point = 0; point < surface[outline].length; point++) {
            flat = flat.concat(surface[outline][point])
        }
    }
    return flat
}


/** Creates an index buffer for a mesh with rows*cols points
 */
function meshIndex(rows, cols) {
    function intertwine(a1, a2) {
        var ret = [];
        for (var i = 0; i < a1.length; i++) {
            ret.push(a1[i]);
            ret.push(a2[i]);
        }
        return ret;
    }

    buffer = [];
    var toprow, bottomrow = range(0, cols).reverse();

    for (var row = 1; row < rows; row++) {
        toprow = bottomrow.reverse();
        bottomrow = range(row*cols, (row+1)*cols);
        if (row % 2 == 0) 
            bottomrow = bottomrow.reverse();
        buffer = buffer.concat(intertwine(toprow, bottomrow));
    }
    return buffer
}


/**
 * Outlines the given function 'f'
 *
 * @param f function to outline
 * @param end last value
 * @param opts
        delta: space between evaluations. Defaults (end-init)/50
        init: starting value. Defaults 0
*/
function outline(f, end, opts={}) {
    var init = opts.init || 0.0,
        delta = opts.delta || (end-init)/50.0,
        points = [],
        x = init;
    while (x <= end) {
        points.push([x, f(x), 0])
        x += delta
    }
    return points
}