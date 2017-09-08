/** 
 * ------------------------            >>>>>>>>>>>>>>>>>>>>>>>>
 * ------------------------ Revolution >>>>>>>>>>>>>>>>>>>>>>>>
 * ------------------------    lib     >>>>>>>>>>>>>>>>>>>>>>>>
 * ------------------------            >>>>>>>>>>>>>>>>>>>>>>>>
 * 
 * Some terminology:
 *      point: list of size=3 representing (x, y, z)
 *      outline: list of points representing a line
 *      mesh: list of points representing a 2D figure
 *      surface: list of outlines
 */


(function(revolution) {

var DEFAULT_AXIS = 1 // x=0, y=1, z=2


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

function rotate(point, angle, axis=DEFAULT_AXIS) {
    var R = [[axis == 0 ? 1 : Math.cos(angle), axis == 2 ? -Math.sin(angle) : 0, axis == 1 ? Math.sin(angle) : 0],
             [axis == 2 ? Math.sin(angle) : 0, axis == 1 ? 1 : Math.cos(angle), axis == 0 ? -Math.sin(angle) : 0],
             [axis == 1 ? -Math.sin(angle) : 0, axis == 0 ? Math.sin(angle) : 0, axis == 2 ? 1 : Math.cos(angle)]]
    return dot([point], R)[0]
}

function range(x, y) {
    var ret = [];
    for (var i = x; i < y; i++) {
        ret.push(i);
    }
    return ret;
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
revolution.revolve = function (outline, delta, opts={}) {
    var { axis } = opts
    if (axis == null) axis = DEFAULT_AXIS
    var maxAngle = opts.angle || 2*Math.PI - 0.000001

    var res = [outline];
    theta = delta;
    while (theta <= maxAngle) {
        res.push(outline.map((p) => { return rotate(p, theta, axis) }))
        theta += delta
    }
    return res
}


/**
 * Makes a grid with points spaced by 1, on plane z=0
 *
 * @return a grid surface
 *
 * @param rows amount of vertical points
 * @param cols amount of horizontal points
 */
revolution.grid = function (rows, cols) {
    var res = []
    for (var y = rows - 1; y >= 0; y--) {
        for (var x = 0; x < cols; x++) {
            res.push([x-(cols-1)/2.0, y-(rows-1)/2.0, 0])
        }
    }
    return res
}


/**
 * Flattens a grid for WebGL
 *
 * @param grid
 */
revolution.flattenGrid = function (grid) {
   var flat = []
   for (var point = 0; point < grid.length; point++) {
       flat = flat.concat(grid[point])
   }
   return flat
}

/**
 * Flattens a surface for WebGL
 *
 * @param {*} surface
 */
revolution.flattenSurface = function (surface) {
    var flat = []
    for (var outline = 0; outline < surface.length; outline++) {
        for (var point = 0; point < surface[outline].length; point++) {
            flat = flat.concat(surface[outline][point])
        }
    }
    return flat
}


/** 
 * Creates an index buffer for a mesh with rows*cols points
 * 
 * @param rows amount of points in row
 * @param cols amount of points in columns
 * @param opts
        close: whether the last row intertwines with the first one
 */
revolution.meshIndex = function (rows, cols, opts={}) {
    var intertwine = function(a1, a2) {
        var ret = [];
        for (var i = 0; i < a1.length; i++) {
            ret.push(a1[i]);
            ret.push(a2[i]);
        }
        return ret;
    }

    var close = opts.close
    var buffer = [];
    var toprow, bottomrow = range(0, cols).reverse();

    var row = 1;
    for (; row < rows; row++) {
        toprow = bottomrow.reverse();
        bottomrow = range(row*cols, (row+1)*cols);
        if (row % 2 == 0)
            bottomrow = bottomrow.reverse();
        buffer = buffer.concat(intertwine(toprow, bottomrow));
    }

    if (close) {
        toprow = bottomrow.reverse()
        bottomrow = range(0, cols)
        if (row % 2 == 0) bottomrow = bottomrow.reverse();
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
revolution.outline = function (f, end, opts={}) {
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

}(window.revolution = window.revolution || {}))
