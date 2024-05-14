import fragment from "../shaders/dom2Gl/fragment.glsl";
import vertex from "../shaders/dom2Gl/vertex.glsl";

import postvertex from "../shaders/post/vertex.glsl";
import postfragment from "../shaders/post/fragment.glsl";

import imagesLoaded from "imagesloaded";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Debug from "./Utils/Debug.js";

import Camera from "./Camera.js";
import Renderer from "./Renderer.js";

import Item from "./Item.js";

export default class Dom2Gl {
  constructor(canvas, lenis) {
    this.canvas = canvas;
    this.lenis = lenis;

    this.items = [];
    this.debugObject = {};
    // Colors
    this.debugObject.depthColor = "#E099F1";
    this.images = document.querySelectorAll("img");

    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();

    this.renderer = new Renderer(this);
    this.renderer.instance.setClearColor(0x000fff, 0);

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("tentacle");
    }

    this.initCamera();
    this.initEvents();
    this.composerPass();

    /***********************************/
    /********** Preload stuff **********/
  }

  initCamera() {
    this.cameraDistance = 400;
    let cameraFov =
      2 *
      Math.atan(
        this.sizes.width /
          (this.sizes.width / this.sizes.height) /
          (2 * this.cameraDistance)
      ) *
      (180 / Math.PI); // in degrees
    this.camera = new Camera(this, cameraFov, 100, 1000);

    this.camera.instance.position.set(0, 0, this.cameraDistance);
    this.camera.instance.lookAt(0, 0, 0);

    this.camera.instance.updateProjectionMatrix();
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

  addObjects() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 80, 80);
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { type: "f", value: 0 },
        uProgress: { type: "f", value: 0 },
        uTexture1: { type: "t", value: null },
        uResolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
        uNoiseAmp: { value: 0.2 },
        uNoiseFreq: { value: 2.0 },
        uDepthColor: { value: new THREE.Color(this.debugObject.depthColor) },
        uColorOffset: { value: -0.35 },
        uColorMultiplier: { value: 2 },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    if (this.debug.active) {
      this.debugFolder
        .add(this.material.uniforms.uProgress, "value")
        .min(0)
        .max(1)
        .step(1)
        .name("uProgress")
        .onChange((value) => {
          this.items.forEach((item) => {
            item.material.uniforms.uProgress.value = value;
          });
        });

      this.debugFolder
        .add(this.material.uniforms.uNoiseAmp, "value")
        .min(-50)
        .max(50)
        .step(0.01)
        .name("uNoiseAmp")
        .onChange((value) => {
          this.items.forEach((item) => {
            item.material.uniforms.uNoiseAmp.value = value;
          });
        });
      this.debugFolder
        .add(this.material.uniforms.uNoiseFreq, "value")
        .min(-50)
        .max(50)
        .step(0.01)
        .name("uNoiseFreq")
        .onChange((value) => {
          this.items.forEach((item) => {
            item.material.uniforms.uNoiseFreq.value = value;
          });
        });
      this.debugFolder
        .add(this.material.uniforms.uColorOffset, "value")
        .min(-1)
        .max(1)
        .step(0.01)
        .name("uColorOffset")
        .onChange((value) => {
          this.items.forEach((item) => {
            item.material.uniforms.uColorOffset.value = value;
          });
        });
      this.debugFolder
        .add(this.material.uniforms.uColorMultiplier, "value")
        .min(-50)
        .max(50)
        .step(0.01)
        .name("uColorMultiplier")
        .onChange((value) => {
          this.items.forEach((item) => {
            item.material.uniforms.uColorMultiplier.value = value;
          });
        });
    }
  }

  composerPass() {
    this.composer = new EffectComposer(this.renderer.instance);
    this.renderPass = new RenderPass(this.scene, this.camera.instance);
    this.composer.addPass(this.renderPass);

    //custom shader pass
    let myEffect = {
      uniforms: {
        uTime: { value: 0 },
        tDiffuse: { value: null },
        uResolution: {
          value: new THREE.Vector2(1, window.innerHeight / window.innerWidth),
        },
        // Change uType value to change current effect
        uType: { value: 0 },
      },
      vertexShader: postvertex,
      fragmentShader: postfragment,
    };

    this.customPass = new ShaderPass(myEffect);
    this.customPass.renderToScreen = true;
    this.composer.addPass(this.customPass);
  }

  createItems() {
    this.images.forEach((image) => {
      if (image.img.hasAttribute("data-img")) {
        image.img.style.opacity = "0";

        this.items.push(new Item(image, this));
      }
    });
  }

  getImages(dom) {
    // Preload images
    const preloadImages = new Promise((resolve, reject) => {
      imagesLoaded(dom.querySelectorAll("img"), { background: true }, resolve);
    });

    preloadImages.then((images) => {
      this.images = images.images;
    });
    const preloadEverything = [preloadImages];

    // And then..
    Promise.all(preloadEverything).then(() => {
      this.createItems();
    });
  }

  resize() {
    this.customPass.uniforms.uResolution.value.y =
      this.sizes.height / this.sizes.width;

    this.items.forEach((item) => {
      item.resize();
    });

    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();

    this.scene.children.forEach((m) => {
      if (m.isMesh) {
        m.material.uniforms.uTime.value = this.time.elapsed;
      }
    });

    this.customPass.uniforms.uTime.value = this.time.elapsed;
    this.targetSpeed *= 0.999;

    if (this.composer) {
      this.composer.render();
    }

    this.items.forEach((item) => {
      item.update();
    });

    // this.renderer.update();
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
