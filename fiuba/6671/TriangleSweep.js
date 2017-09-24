(function(Revolution) {
    
Revolution.TriangleSweep = class {

    constructor(opts={}) {
        var scale = (x) => {return [0,0,0].fill(3*x**2-3*x+1)}
        //var outline = [[1,1], [1,2], [-1,2], [-1,-2], [1,-2], [1,-1], [0,-1], [0,1]];
        var outline = [[-1,-1], [0,1], [1,-1]]
        var steps = 50;
        var twist = (i) => {return Math.PI*i}

        var sweep = revolution.sweep(
            outline, [-1,0,0], [1,0,0],
            {steps: steps, scale: scale, twist: twist}
        )
        this.position = revolution.flattenSurface(
            revolution.transpose(sweep)
        )
        this.index = revolution.meshIndex(outline.length, steps+1, {close: true, inverted: true})
    }

}
    
}(window.Revolution = window.Revolution || {}))