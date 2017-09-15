(function(Figures) {

Figures.Cylinder = class {

    constructor(opts={}) {
        var { discretion = 32 } = opts
        this.position = revolution.flattenSurface(
            revolution.revolve([[-1,0,1], [1,0,1]], Math.PI/discretion, {axis:0})
        )
        this.index = revolution.meshIndex(discretion*2, 2, {close: true})
        this.position = this.position.concat([-1,0,0])
        this.position = this.position.concat([1,0,0])
        for (var i = 0; i < this.index.length; i++) {
            if (this.index[i] == this.index[i-1]) {
                if (this.index[i] % 2 == 1) this.index.splice(i, 0, this.position.length/3 - 1)
                else this.index.splice(i, 0, this.position.length/3 - 2)
                i++
            }
        }
        this.index.push(this.position.length/3 - 2)
        this.index.push(2)
    }

}

}(window.Figures = window.Figures || {}))