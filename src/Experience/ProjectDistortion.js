import { lerp } from "three/src/math/MathUtils.js";
import fragment from "../shaders/distortion/fragment.glsl";
import vertex from "../shaders/distortion/vertex.glsl";

import Dom2Gl from "./Dom2Gl";

export default class ProjectDistortion extends Dom2Gl {
  constructor(canvas, currentDOM, lenis) {
    super(canvas, currentDOM, lenis);
    this.fragment = fragment;
    this.vertex = vertex;

    this.lenis = lenis;

    this.getImages();
    this.addObjects();
  }

  // update() {
  //   super.update();

  // }

  initEvents() {
    super.initEvents();

    this.lenis.on("scroll", (e) => {
      this.material.uniforms.uShift.value = lerp(this.material.uniforms.uShift.value, e.velocity, 0.1);
    });
  }
}
