import "./index.scss";
import barba from "@barba/core";
import Lenis from "lenis";

import Transition from "./Experience/Transition.js";
import Dom2Gl from "./Experience/Dom2Gl.js";
import Experience from "./Experience/Experience";
import Time from "./Experience/Utils/Time.js";

barba.hooks.beforeEnter("home", (data) => {
  // Add your beforeEnter logic here
});

class App {
  constructor() {
    this.time = new Time();

    this.time.on("tick", () => {
      this.update();
    });
    this.initBarba();

    this.initLenis();
    this.initApp();
  }

  initApp() {
    this.experienceCanvas = document.querySelector("canvas.experience");
    this.dom2GlCanvas = document.querySelector("canvas.dom2Gl");

    this.experience = new Experience(this.experienceCanvas);
    this.transition = new Transition(this.experience);
    this.dom2Gl = new Dom2Gl(this.dom2GlCanvas, this.lenis);
  }

  initLenis() {
    this.lenis = new Lenis();

    this.lenis.on("scroll", (e) => {
      // this.dom2Gl.scroll(e);
    });
  }

  initBarba() {
    let that = this;
    barba.init({
      transitions: [
        {
          name: "default-transition",
          leave() {
            return new Promise((resolve) => {
              that.transition.animateIn().then(resolve);
            });
          },
          enter() {
            that.transition.animateOut();
          },
        },
      ],
      views: [
        {
          namespace: "home",
          beforeEnter() {
            // Add your beforeEnter logic for the homepage namespace

          },
          afterEnter(data) {
            // Add your afterEnter logic for the homepage namespace
              that.experience.play();
              console.log(data.next);
              that.dom2Gl.getImages(data.next.container);
              that.dom2Gl.addObjects()
          },
          beforeLeave() {
            // Add your beforeLeave logic for the homepage namespace
          },
          afterLeave() {
            // Add your afterLeave logic for the homepage namespace
          },
        },
        {
          namespace: "project",
          beforeEnter() {
            // Add your beforeEnter logic for the projectpage namespace
          },
          afterEnter(data) {
            // Add your afterEnter logic for the projectpage namespace
            that.experience.pause();
            // WIP
            // that.dom2Gl.getImages(data.next.container);
            // that.dom2Gl.addObjects()
          },
          beforeLeave() {
            // Add your beforeLeave logic for the projectpage namespace
          },
          afterLeave() {
            // Add your afterLeave logic for the projectpage namespace
          },
        },
      ],
    });
  }

  update() {
    if (this.lenis) {
      this.lenis.raf(this.time.elapsed);
    }
  }
}

new App();
