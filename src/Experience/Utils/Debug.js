import GUI from "three/examples/jsm/libs/lil-gui.module.min.js"

export default class Debug {
    constructor(){
        this.active = window.location.hash === '#debug'

        if(this.active)
        {
            this.ui = new GUI()
        }
    }
}