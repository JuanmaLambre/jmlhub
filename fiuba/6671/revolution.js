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
var EPSILON =Math.pow(10,-10)


function transpose(mat) {
    return mat[0].map((col, i) => {
        return mat.map((row) => {
            return row[i];
        })
    })
}

revolution.transpose = transpose;

function cross_prod(u, v) {
    return [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
}

function dot_prod(u, v) {
    return u.map((x,i) => {return x * v[i]}).reduce((x,y) => {return x + y});
}

function normalize(v) {
    var length = Math.sqrt(v.reduce((x, y) => {return x + y**2}, 0));
    return v.map((x) => {return x/length});
}

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

function minus(a, b) {
    if (typeof(a) === "number") {
        if (typeof(b) === "number") {
            return a - b;
        } else {
            throw "Not a number: " + b;
        }
    } else {
        return a.map((x,i) => {return minus(x, b[i])});
    }
}

function sum(a, b) {
    if (typeof(a) === "number") {
        return a + b;
    } else {
        return a.map((x,i) => {return sum(x, b[i])});
    }
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

/*
https://math.stackexchange.com/questions/180418/calculate-rotation-matrix-to-align-vector-a-to-vector-b-in-3d
where K = [v]x
*/
function reflectionMat(a, b) {
    a = normalize(a);
    b = normalize(b);
    var cos_ab = dot_prod(a, b);
    var v = cross_prod(a, b);
    var K = [[0,-v[2],v[1]], [v[2],0,-v[0]], [-v[1],v[0],0]];
    var K2cos_ab = dot(K,K).map((row) => {return row.map((x) => {return x/(1+cos_ab)})})
    var Id = [[1,0,0],[0,1,0],[0,0,1]];
    return sum(sum(Id,K), K2cos_ab);
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
        angle: length (in angle) of revolution. Defaults 2*PI (minus MIN_VALUE)
    */
revolution.revolve = function (outline, delta, opts={}) {
    var { axis } = opts
    if (axis == null) axis = DEFAULT_AXIS
    var maxAngle = opts.angle || 2*Math.PI - Number.MIN_VALUE

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

    var { close = false } = opts
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
        delta: steps for x. Can be function of step number. Defaults to (end-init)/50
        init: starting value. Defaults 0
*/
revolution.outline = function (f, end, opts={}) {
    var { init = 0.0, 
            delta = (end-init)/50.0 } = opts;
    var x = init, 
        points = [];
    for (var i = 1; x <= end; i++) {
        points.push([x, f(x), 0])
        x += typeof(delta) === "function" ? delta(i) : delta
    }
    return points
}


/**
 * Returns an outline of a semicircle at plane z = 0, y > 0
 * 
 * @param {int} radius
 * @param opts
        discretion: integer
    */
revolution.semicircle = function (radius=1, opts={}) {
    var { discretion = 32 } = opts
    var sc = []
    for (var i = 0; i <= discretion; i++) {
        var angle = i*Math.PI/discretion;
        sc.push([radius*Math.cos(angle), radius*Math.sin(angle), 0])
    }
    return sc
}

/**
 * Given a 2D outline with normal (0,0,1) and a straight path return a 
 * sweep solid over said path.
 * 
 * @return a surface
 * 
 * @param outline 2D outline with normal (0,0,1)
 * @param init point where path begins
 * @param end point where path ends
 * @param opts
        steps: number of steps. Defaults to 50
        scale: function receiving a number between 0 and 1, returns a 3D vector
        twist: function receiving a number between 0 and 1, and returns twist angle
 */
revolution.sweep = (outline, init, end, opts={}) => {
    var { steps = 50,
        scale = (i) => {return [1,1,1]},
        twist = (i) => {return 0}
    } = opts;
    var R = reflectionMat([0,0,1], minus(end, init));
    return range(0,steps+1).map( (i) => {
        var stepIndex = 1.0*i/steps;
        var newCenter = sum(init, minus(end, init).map((x)=>{return x*stepIndex}));
        return outline.map( (point) => {
            var scaled = point.map((x,p) => {return x*scale(stepIndex)[p]})
            var angle = twist(stepIndex)
            var T = [[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]]
            var twisted = transpose(dot(T, transpose([scaled])))[0]
            var rotated = transpose(dot(R, transpose([twisted.concat(0)])))[0]
            return sum(newCenter, rotated)
        })
    })
}

}(window.revolution = window.revolution || {}))
    