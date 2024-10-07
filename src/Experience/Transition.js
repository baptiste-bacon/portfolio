import preloaderFragmentShader from "../shaders/preloader/fragment.glsl";
import preloaderVertexShader from "../shaders/preloader/vertex.glsl";

import * as THREE from "three";
import { gsap } from "gsap";

import Renderer from "./Renderer";
import Camera from "./Camera";

import { isMobileDevice } from "../utils.js";

export default class Transition {
  constructor(time, sizes, resources, scroll) {
    this.resources = resources;
    this.isMobile = isMobileDevice();

    this.scroll = scroll
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

    this.animation = gsap.timeline();
    this.isFirstCall   = true;
    this.resources.on("progress", (progress) => {
      this.loadingAnimation(progress);
    });

    this.resources.on("ready", () => {
      this.animation.then(() => {
        this.loadedAnimation();
      });
    });
  }

  loadingAnimation(progress) {
    this.animation.to(".clipRect", {
      attr: {
        y: `${100 * (1 - progress)}%`,
      },
      duration:1,
      // ease: "power1.inOut",
      delay: () => {
        return this.isFirstCall ? 1 : 0;
      },
    },"<");
    this.isFirstCall = false;
  }

  loadedAnimation() {
    const logoPosition = {
      width: 4.5,
      left: this.isMobile ? 1.6 : 10,
      top: this.isMobile ? 2 : 4,
    };
    const { width, left, top } = logoPosition;

    this.logoTimeline = gsap.timeline();
    this.logoTimeline
      .to(this.preloaderLogo, {
        scale: 1.1,
        duration: 0.25,
        ease: "power3.out",
      })
      .to(this.preloaderLogo, {
        top: `${top}rem`,
        left: `${left}rem`,
        width: `${width}rem`,
        transform: "translate(0,0)",
        ease: "power2.inOut",
        duration: 0.8,
      })
      .then(() => {
        this.animateOut(1.5, 0).then(() => {
          this.logoAnimation();
          this.scroll.start()
        });
      });
  }

  logoAnimation() {
    this.logoTimeline.to(this.preloaderLogo, {
      autoAlpha: 0,
      duration: 0.5,
    });
    this.logoTimeline.to(
      this.navLogo,
      {
        autoAlpha: 1,
        duration: 0.5
      },
      "<"
    );
  }

  setMesh() {
    let noiseAmp;
    if (this.isMobile) {
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
