import * as THREE from "three";

import sources from "./sources.js";
import Resources from "./Utils/Resources.js";

import Debug from "./Utils/Debug.js";
import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Scroll from "./World/Scroll.js";

import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import World from "./World/World.js";

export default class Experience {
  constructor(canvas, resources) {
    // window.experience = this;

    this.canvas = canvas;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scroll = new Scroll();

    this.scene = new THREE.Scene();
    this.resources = resources;

    this.camera = new Camera(this);
    this.camera.instance.position.set(6, 4, 8);

    this.renderer = new Renderer(this);
    this.renderer.instance.setClearColor(0x2d0037, 1);
    this.world = new World(this);

    this.paused = true;
    this.canvas.classList.add("-hidden");

    this.initEvents();
  }

  initEvents() {
    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }

  pause() {
    this.paused = true;
    this.canvas.classList.add("-hidden");
  }

  play() {
    this.paused = false;
    this.canvas.classList.remove("-hidden");
  }

  destroy() {
    this.sizes.off("resize");
    this.time.off("tick");

    // Traverse the whole scene
    this.scene.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key];

          // Test if there is a dispose function
          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });
    this.camera.controls.dispose();
    this.renderer.instance.dispose();
    if (this.debug.active) this.debug.ui.destroy();
  }
}
