import fragment from "../shaders/dom2Gl/fragment.glsl";
import vertex from "../shaders/dom2Gl/vertex.glsl";

import Dom2Gl from "./Dom2Gl";

export default class ProjectNoise extends Dom2Gl {
  constructor(canvas, currentDOM, lenis) {
    super(canvas, currentDOM, lenis);
    this.fragment = fragment;
    this.vertex = vertex;

    this.hover = true;

    // this.addObjects()
    this.getImages();
    this.addObjects();
  }

  // initEvents() {

  // }

  // handleHover(hover) {
  //   if (hover) {
  //     return gsap.to(this.material.uniforms.uProgress, {
  //       duration: 0.5,
  //       ease: "power1.out",
  //       value: 1,
  //     });
  //   } else {
  //     return gsap.to(this.material.uniforms.uProgress, {
  //       duration: 0.5,
  //       ease: "power1.in",
  //       value: 0,
  //     });
  //   }
  // }
}
