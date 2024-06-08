import * as THREE from "three";
import gsap from "gsap";

export default class Item {
  constructor(el, dom2Gl) {
    this.dom2Gl = dom2Gl;
    this.sizes = this.dom2Gl.sizes;
    this.debug = this.dom2Gl.debug

    this.defaultMaterial = this.dom2Gl.material;
    this.geometry = this.dom2Gl.geometry;

    this.DOM = {
      img: el.img,
      listElement: el.img.parentNode.parentNode.querySelector("span"),
    };

    this.currentScroll = this.dom2Gl.lenis.animatedScroll;
    this.positions = [];

    this.getSize();

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("Item");
    }

    this.mesh = this.createMesh({
      width: this.width,
      height: this.height,
      src: this.src,
      image: this.DOM.img,
      iWidth: this.DOM.img.width,
      iHeight: this.DOM.img.height,
    });

    // Add the mesh to the scene
    this.dom2Gl.scene.add(this.mesh);

    // use the IntersectionObserver API to check when the element is inside the viewport
    // only then the element translation will be updated
    // this.intersectionRatio;
    // let options = {
    //   root: null,
    //   rootMargin: "0px",
    //   threshold: [0, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    // };

    // this.observer = new IntersectionObserver((entries) => {
    //   entries.forEach((entry) => {
    //     this.positions.push(entry.boundingClientRect.y);
    //     let compareArray = this.positions.slice(
    //       this.positions.length - 2,
    //       this.positions.length
    //     );
    //     let down = compareArray[0] > compareArray[1] ? true : false;

    //     this.isVisible = entry.intersectionRatio > 0.0;

    //     this.shouldRollBack = false;
    //     this.shouldUnRoll = false;
    //     if (
    //       entry.intersectionRatio < 0.5 &&
    //       entry.boundingClientRect.y > -200 &&
    //       this.isVisible &&
    //       !down
    //     ) {
    //       this.shouldRollBack = true;
    //     }

    //     if (
    //       entry.intersectionRatio > 0.5 &&
    //       entry.boundingClientRect.y > -200 &&
    //       this.isVisible
    //     ) {
    //       this.shouldUnRoll = true;
    //     }
    //     // console.log(this.isVisible, "vis");
    //     this.mesh.visible = this.isVisible;
    //   });
    // }, options);
    // this.observer.observe(this.DOM.img);
    // // init/bind events
    // window.addEventListener("resize", () => this.resize());
    // this.update(0);
  }

  getSize() {
    // get all the sizes here, bounds and all
    const bounds = this.DOM.img.getBoundingClientRect();
    const fromTop = bounds.top;
    const windowHeight = window.innerHeight;
    const withoutHeight = fromTop - windowHeight;
    const withHeight = fromTop + bounds.height;
    this.insideTop = withoutHeight - this.currentScroll;
    this.insideRealTop = fromTop + this.currentScroll;
    this.insideBottom = withHeight - this.currentScroll + 50;
    this.width = bounds.width;
    this.height = bounds.height;
    this.left = bounds.left;
  }

  createMesh(o) {
    this.material = this.defaultMaterial.clone();
    let texture = new THREE.Texture(o.image);
    texture.needsUpdate = true;
    // image cover
    let imageAspect = o.iHeight / o.iWidth;
    let a1;
    let a2;
    if (o.height / o.width > imageAspect) {
      a1 = (o.width / o.height) * imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = o.height / o.width / imageAspect;
    }
    texture.minFilter = THREE.LinearFilter;
    this.material.uniforms.uResolution.value.x = o.width;
    this.material.uniforms.uResolution.value.y = o.height;
    this.material.uniforms.uResolution.value.z = a1;
    this.material.uniforms.uResolution.value.w = a2;

    this.material.uniforms.uProgress.value = 0;

    this.material.uniforms.uTexture.value = texture;
    this.material.uniforms.uTexture.value.needsUpdate = true;

    let mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.scale.set(o.width, o.height, o.width / 2);

    if(this.debug.active){
      this.debugFolder
      .add(this.material.uniforms.uColorOffset, "value")
      .min(0)
      .max(1)
      .step(0.001)
      .name("uColorOffset");
    this.debugFolder
      .add(this.material.uniforms.uColorMultiplier, "value")
      .min(0)
      .max(10)
      .step(0.001)
      .name("uColorMultiplier");
    }

    return mesh;
  }

  hoverEffect() {
    this.DOM.listElement.addEventListener("mouseover", (e) => {
      this.handleHover(true);
    });
    this.DOM.listElement.addEventListener("mouseleave", (e) => {
      this.handleHover(false);
    });
  }

  handleHover(hover) {
    if (hover) {
      return gsap.to(this.material.uniforms.uProgress, {
        duration: 0.5,
        ease: "power3.out",
        value: 1,
      });
    } else {
      return gsap.to(this.material.uniforms.uProgress, {
        duration: 0.5,
        ease: "power3.out",
        value: 0,
      });
    }
  }

  resize() {
    this.mesh.scale.set(this.width, this.height, 200);
  }

  update() {
    this.getSize();

    this.currentScroll = this.dom2Gl.lenis.animatedScroll;

    this.mesh.position.y =
      this.currentScroll +
      this.sizes.height / 2 -
      this.insideRealTop -
      this.height / 2;

    const parallaxX = 0 - this.sizes.width / 2 + this.left + this.width / 2;
    this.mesh.position.x += (parallaxX - this.mesh.position.x) * 0.08;

    this.material.uniforms.uShift.value =
      this.defaultMaterial.uniforms.uShift.value;
  }
}
