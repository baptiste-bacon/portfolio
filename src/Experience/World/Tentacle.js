import * as THREE from "three";
import halftoneVertexShader from "../../shaders/halftone/vertex.glsl";
import halftoneFragmentShader from "../../shaders/halftone/fragment.glsl";

import { lerp } from "three/src/math/MathUtils.js";

export default class Tentacle {
  constructor(experience) {
    this.experience = experience;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.time = this.experience.time;
    this.sizes = this.experience.sizes;

    this.debug = this.experience.debug;

    this.cursor = { x: 0, y: 0 };
    this.initialPosition = { x: 0, y: -16, z: 0 };
    this.initialScale = { x: 1, y: 1, z: 1 };
    this.initialRotation = { x: 0, y: Math.PI / 6, z: 0 };

    // Scroll
    this.scroll = this.experience.scroll;
    this.animationScripts = [];

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("tentacle");
    }

    // Setup
    this.resource = this.resources.items.tentacleModel;
    this.setModel();
    this.initEvents();
    this.setAnimation();
    this.setAnimationsScript();
  }

  initEvents() {
    window.addEventListener("mousemove", (event) => {
      this.cursor.x = event.clientX / this.sizes.width;
      this.cursor.y = event.clientY / this.sizes.height;
    });
  }

  setModel() {
    this.model = this.resource.scene;
    this.model.position.set(
      this.initialPosition.x,
      this.initialPosition.y,
      this.initialPosition.z
    );
    this.model.rotation.y = this.initialRotation.y;
    this.scene.add(this.model);

    this.boxHelper = new THREE.BoxHelper(this.model, 0xffff00);
    // this.scene.add(this.boxHelper);

    const materialParameters = {};
    materialParameters.color = "#2D0037";
    materialParameters.shadowColor = "#6F008A";
    materialParameters.lightColor = "#E099F1";

    this.material = new THREE.ShaderMaterial({
      vertexShader: halftoneVertexShader,
      fragmentShader: halftoneFragmentShader,
      uniforms: {
        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
        uShadeColor: new THREE.Uniform(
          new THREE.Color(materialParameters.shadeColor)
        ),
        uResolution: new THREE.Uniform(
          new THREE.Vector2(
            this.sizes.width * this.sizes.pixelRatio,
            this.sizes.height * this.sizes.pixelRatio
          )
        ),
        uShadowRepetitions: new THREE.Uniform(55),
        uShadowColor: new THREE.Uniform(
          new THREE.Color(materialParameters.shadowColor)
        ),
        uLightRepetitions: new THREE.Uniform(55),
        uLightColor: new THREE.Uniform(
          new THREE.Color(materialParameters.lightColor)
        ),
      },
    });

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = this.material;
        // child.castShadow = true;
      }
    });

    // Debug
    if (this.debug.active) {
      this.debugFolder
        .add(this.initialPosition, "x", -100, 100)
        .onChange((value) => {
          this.model.position.x = value;
          // this.boxHelper.update();
        });
      this.debugFolder
        .add(this.initialPosition, "y", -100, 100)
        .onChange((value) => {
          this.model.position.y = value;
          // this.boxHelper.update();
        });
      this.debugFolder
        .add(this.initialPosition, "z", -100, 100)
        .onChange((value) => {
          this.model.position.z = value;
          // this.boxHelper.update();
        });

      // this.debugFolder.add(this.initialRotation, "y");

      this.debugFolder
        .add(this.material.uniforms.uLightRepetitions, "value")
        .min(1)
        .max(300)
        .step(1)
        .name("lightPixels");
      this.debugFolder
        .addColor(materialParameters, "lightColor")
        .onChange(() => {
          this.material.uniforms.uLightColor.value.set(
            materialParameters.lightColor
          );
        });

      this.debugFolder
        .add(this.material.uniforms.uShadowRepetitions, "value")
        .min(1)
        .max(300)
        .step(1)
        .name("shadowPixel");

      this.debugFolder
        .addColor(materialParameters, "shadowColor")
        .onChange(() => {
          this.material.uniforms.uShadowColor.value.set(
            materialParameters.shadowColor
          );
        });
    }
  }

  setAnimation() {}

  update() {
    if (this.scroll) {
      this.playScrollAnimations();
    }

    const parallaxX = this.cursor.x;
    const parallaxY = -this.cursor.y;
    this.model.position.x += (parallaxX - this.model.position.x) * this.time.delta * 0.0025;
    this.model.position.y += (parallaxY + this.model.position.y) *  0.05;
  }

  setAnimationsScript() {
    this.animationScripts.push({
      start: 0,
      end: 100,
      func: () => {
        this.model.rotation.y = -lerp(
          this.initialRotation.y,
          // 360deg
          2 * Math.PI + Math.PI,
          this.scroll.scalePercent(0, 100)
        );
      },
    });
    this.animationScripts.push({
      start: 0,
      end: 100,
      func: () => {
        this.model.position.y = lerp(
          this.initialPosition.y,
          -15,
          this.scroll.scalePercent(0, 100)
        );
      },
    });
  }

  playScrollAnimations() {
    this.animationScripts.forEach((a) => {
      if (
        this.scroll.scrollPercent >= a.start &&
        this.scroll.scrollPercent <= a.end
      ) {
        a.func();
      }
    });
  }
}
