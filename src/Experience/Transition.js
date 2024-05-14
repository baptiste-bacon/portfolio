import preloaderFragmentShader from "../shaders/preloader/fragment.glsl";
import preloaderVertexShader from "../shaders/preloader/vertex.glsl";

import * as THREE from "three";
import { gsap } from "gsap";

import Renderer from "./Renderer";
import Camera from "./Camera";

export default class Transition {
  constructor(experience) {
    this.experience = experience;
    this.resources = this.experience.resources;

    this.time = this.experience.time;
    this.sizes = this.experience.sizes;

    this.canvas = document.querySelector("canvas.preloader");
    this.scene = new THREE.Scene();
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.renderer.instance.setClearColor(0x2d0037, 0);

    this.preloaderEl = document.querySelector("div.preloader");
    this.preloaderText = this.preloaderEl.querySelector(".preloaderText");
    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });

    this.setMesh();

    this.destroy.bind(this);

    this.resources.on("ready", () => {
      this.animateOut();
    });

    this.time.on("tick", () => {
      this.overlayMaterial.uniforms.uTime.value = this.time.elapsed;
    });
  }

  setMesh() {
    this.overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    this.overlayMaterial = new THREE.ShaderMaterial({
      fragmentShader: preloaderFragmentShader,
      vertexShader: preloaderVertexShader,
      defines: {
        PR: this.sizes.pixelRatio,
      },
      uniforms: {
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 },
        uRes: {
          value: new THREE.Vector2(this.sizes.width, this.sizes.height),
        },
      },
      transparent: true,
    });
    this.overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial);
    this.scene.add(this.overlay);
  }

  update() {
    this.camera.update();
    this.renderer.update();
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  destroy() {
    // this.time.off("tick");
    // this.sizes.off("resize");

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
    // if (this.debug.active) this.debug.ui.destroy();
    // this.canvas.remove();
  }

  animateOut() {
    return gsap.to(this.overlayMaterial.uniforms.uProgress, {
      duration: 1,
      value: 1,
      onUpdate: () => {
        // console.log(this.overlayMaterial.uniforms.uProgress.value);
      },
    });
  }

  animateIn() {
    return gsap.to(this.overlayMaterial.uniforms.uProgress, {
      duration: 1,
      value: 0,
      onUpdate: () => {
        // console.log(this.overlayMaterial.uniforms.uProgress.value);
      },
    });
  }
}
