(function(Revolution) {
    
Revolution.Object3D = class {

    constructor(opts={}) {
        var { 
            discretion = 32,
            radius = 1
        } = opts
        this.position = revolution.flattenSurface(
            revolution.revolve(
                revolution.semicircle(radius, {discretion: discretion}),
                Math.PI/discretion, {axis:0}
            )
        )
        this.index = revolution.meshIndex(discretion*2, discretion+1, {close: true})
    }

}
    
}(window.Revolution = window.Revolution || {}))