import preloaderFragmentShader from "../shaders/preloader/fragment.glsl";
import preloaderVertexShader from "../shaders/preloader/vertex.glsl";

import * as THREE from "three";
import { gsap } from "gsap";

import Renderer from "./Renderer";
import Camera from "./Camera";

export default class Transition {
  constructor(time, sizes, resources) {
    this.resources = resources;

    this.time = time;
    this.sizes = sizes;

    this.canvas = document.querySelector("canvas.preloader");
    this.scene = new THREE.Scene();
    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.renderer.instance.setClearColor(0x2d0037, 0);

    this.preloaderEl = document.querySelector("div.preloader");
    this.preloaderLogo = this.preloaderEl.querySelector(".preloaderLogo");

    this.navLogo = document.querySelector('.navLogo')

    // Resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
      this.overlayMaterial.uniforms.uTime.value = this.time.elapsed;
    });
    this.setMesh();

    this.preloaderTimeline = gsap.timeline();
    // Progress
    this.resources.on("progress", (progress) => {
      gsap.to(".clipRect", {
        attr: {
          y: `${progress / 100}%`,
        },
        ease: "power1.out",
        duration: 1,
      });
    });

    this.resources.on("ready", () => {
      gsap.to(this.preloaderLogo, {
        top: "4rem",
        left: "10rem",
        width: "4.5rem",
        transform: "translate(0,0)",
        ease: "power2.out",
        duration: 1,
        delay: 0.75,
        onComplete: () => {
          this.animateOut(2, 0);
          gsap.to(this.preloaderLogo, {
            autoAlpha: 0,
            duration: 0,
            delay: 1.75,
          });

          gsap.to(this.navLogo, {
            autoAlpha: 1,
            duration: 0,
            delay: 1.7,
          });
        },
      });
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
  }

  animateOut(duration, delay = 0) {
    return gsap.to(this.overlayMaterial.uniforms.uProgress, {
      duration: duration,
      value: 1,
      delay: delay,
      ease: "power1.out",
    });
  }

  animateIn() {
    return gsap.to(this.overlayMaterial.uniforms.uProgress, {
      duration: 1,
      value: 0,
      ease: "power1.out",
    });
  }
}
