import preloaderFragmentShader from "../shaders/preloader/fragment.glsl";
import preloaderVertexShader from "../shaders/preloader/vertex.glsl";

import * as THREE from "three";
import { gsap } from "gsap";

import Renderer from "./Renderer";
import Camera from "./Camera";

import { isMobileDevice } from "../utils.js";

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

    this.navLogo = document.querySelector(".navLogo");

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

    const delay = 0.5;
    let animationStarted = false; // Flag to check if the animation has started

    this.resources.on("progress", (progress) => {
      if (!animationStarted) {
        animationStarted = true; // Set the flag to true to prevent further calls

        setTimeout(() => {
          // Animate the clipRect
          this.preloaderTimeline.to(".clipRect", {
            attr: {
              y: `${progress / 100}%`,
            },
            ease: "power3.out",
            duration: 0.75,
          });
        }, delay * 1000); // Convert seconds to milliseconds
      }
    });

    this.resources.on("ready", () => {
      this.preloaderTimeline.eventCallback(
        "onComplete",
        this.handlePreloaderLogoAnimation.bind(this)
      );
    });
  }

  // Function to handle the animation of the preloader logo
  handlePreloaderLogoAnimation() {
    let logoWidth;
    let logoLeft;
    let logoTop;
    if (isMobileDevice()) {
      logoWidth = 4.5;
      logoLeft = 1.6;
      logoTop = 2;
    } else {
      logoWidth = 4.5;
      logoLeft = 10;
      logoTop = 4;
    }

    gsap
      .to(this.preloaderLogo, {
        scale: 1.1,
        duration: 0.25,
        ease: "power3.out",
      })
      .then(() => {
        gsap.to(this.preloaderLogo, {
          top: `${logoTop}rem`,
          left: `${logoLeft}rem`,
          width: `${logoWidth}rem`,
          transform: "translate(0,0)",
          ease: "power2.inOut",
          duration: 1,
          onComplete: this.handleFinalAnimations.bind(this),
        });
      });
  }

  // Function to handle the final set of animations
  handleFinalAnimations() {
    this.animateOut(1.5, 0).then(() => {
      this.animateLogo();
    });
  }

  animateLogo() {
    gsap.to(this.preloaderLogo, {
      autoAlpha: 0,
      duration: 0,
    });
    gsap.to(this.navLogo, {
      autoAlpha: 1,
      duration: 0,
    });
  }

  setMesh() {
    let noiseAmp;
    if (isMobileDevice()) {
      noiseAmp = 1.5;
    } else {
      noiseAmp = 4.0;
    }

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
        uNoiseAmp: {
          value: noiseAmp,
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
