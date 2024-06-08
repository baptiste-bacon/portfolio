import fragment from "../shaders/dom2Gl/fragment.glsl";
import vertex from "../shaders/dom2Gl/vertex.glsl";

import imagesLoaded from "imagesloaded";
import * as THREE from "three";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Debug from "./Utils/Debug.js";

import Camera from "./Camera.js";
import Renderer from "./Renderer.js";

import Item from "./Item.js";

export default class Dom2Gl {
  constructor(canvas, currentDOM, lenis) {
    this.canvas = canvas;
    this.currentDOM = currentDOM;
    this.lenis = lenis;

    this.items = [];
    this.debugObject = {};
    // Colors
    this.debugObject.depthColor = "#9100B4";
    this.images = [];

    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("D");
    }

    this.initCamera();
    this.initRenderer();

    this.initEvents();
  }

  getImages() {
    // Preload images
    const preloadImages = new Promise((resolve, reject) => {
      imagesLoaded(
        this.currentDOM.querySelectorAll("img"),
        { background: true },
        resolve
      );
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

  createItems() {
    this.images.forEach((image) => {
      if (image.img.hasAttribute("data-img")) {
        image.img.style.opacity = "0";
        image.img.style.visibility = "hidden";

        const item = new Item(image, this);
        this.items.push(item);

        if (this.hover) {
          item.hoverEffect();
        }
      }
    });
  }

  showItems() {
    // this.createItems();
  }

  clearItems() {
    this.scene.traverse((object) => {
      if (object.geometry && object.geometry.type === "PlaneGeometry") {
        // Remove the object from its parent
        object.parent.remove(object);
        // Dispose of the geometry and material to free up memory
        object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
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

  initRenderer() {
    this.renderer = new Renderer(this);
    this.renderer.instance.setClearColor(0x000fff, 0);
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
        uShift: { type: "f", value: 0 },
        uTexture: { type: "t", value: null },
        uResolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
        uNoiseAmp: { value: 0.25 },
        uNoiseFreq: { value: 1.5 },
        uDepthColor: { value: new THREE.Color(this.debugObject.depthColor) },
        uColorOffset: { value: 0.25 },
        uColorMultiplier: { value: 2.0 },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: this.vertex,
      fragmentShader: this.fragment,
    });

  }

  // composerPass(vertexShader, fragmentShader) {
  //   this.composer = new EffectComposer(this.renderer.instance);
  //   this.renderPass = new RenderPass(this.scene, this.camera.instance);
  //   this.composer.addPass(this.renderPass);

  //   //custom shader pass
  //   let myEffect = {
  //     uniforms: {
  //       uTexture: { value: null },
  //       hasTexture: { value: 0 },
  //       uScale: { value: 0 },
  //       uShift: { value: 0 },
  //       uOpacity: { value: 1 },
  //       uColor: { value: new THREE.Uniform(new THREE.Color("#2D0037")) },
  //     },
  //     vertexShader: vertexShader,
  //     fragmentShader: fragmentShader,
  //   };

  //   this.customPass = new ShaderPass(myEffect);
  //   this.customPass.renderToScreen = true;
  //   this.composer.addPass(this.customPass);
  // }

  resize() {
    this.material.uniforms.uResolution.value.y =
      this.sizes.height / this.sizes.width;

    this.items.forEach((item) => {
      item.resize();
      item.update();
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

    this.targetSpeed *= 0.999;

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.update();
    }

    this.items.forEach((item) => {
      item.update();
    });
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
