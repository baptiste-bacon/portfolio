import "./index.scss";

import barba from "@barba/core";
import Lenis from "lenis";

import sources from "./Experience/sources.js";
import Resources from "./Experience/Utils/Resources.js";

import Transition from "./Experience/Transition.js";
import Experience from "./Experience/Experience";
import Time from "./Experience/Utils/Time.js";

import ProjectDistortion from "./Experience/ProjectDistortion.js";
import ProjectNoise from "./Experience/ProjectNoise.js";
import Sizes from "./Experience/Utils/Sizes.js";

class App {
  constructor() {
    this.time = new Time();
    this.sizes = new Sizes();

    this.initBarba();
    this.initLenis();
    this.initApp();

    this.time.on("tick", () => {
      this.update();
    });
  }

  initApp() {
    this.nav = document.querySelector("nav.nav");
    this.resources = new Resources(sources);

    this.experienceCanvas = document.querySelector("canvas.experience");
    this.dom2GlCanvas = document.querySelector("canvas.dom2Gl");

    this.initHome();
    this.transition = new Transition(this.time, this.sizes, this.resources);
  }

  initHome() {
    this.experience = new Experience(this.experienceCanvas, this.resources);
  }

  initProjectNoise(currentDOM) {
    this.projectNoise = new ProjectNoise(
      this.dom2GlCanvas,
      currentDOM,
      this.lenis
    );
  }

  initProjectDistortion(currentDOM) {
    this.projectDistortion = new ProjectDistortion(
      this.dom2GlCanvas,
      currentDOM,
      this.lenis
    );
  }

  initLenis() {
    this.lenis = new Lenis();

    this.lenis.on("scroll", (e) => {
      // this.dom2Gl.scroll(e);
    });

    // fix for id links
    document.querySelectorAll('a[href^="#"]').forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const id = el.getAttribute("href")?.slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  toggleNav(state) {
    this.nav.classList[state ? "remove" : "add"]("-hidden");
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
            that.transition.animateOut(1.25);
          },
        },
      ],
      views: [
        {
          namespace: "home",
          afterEnter(data) {
            // Add your afterEnter logic for the homepage namespace
            that.lenis.scrollTo(0, { immediate: true });
            that.toggleNav(true);
            that.experience.play();
            that.initProjectNoise(data.next.container);
          },
          afterLeave() {
            // Add your afterLeave logic for the homepage namespace
            that.experience.pause();
            that.projectNoise.destroy();
          },
        },
        {
          namespace: "project",
          afterEnter(data) {
            // Add your afterEnter logic for the projectpage namespace
            that.lenis.scrollTo(0, { immediate: true });
            that.toggleNav(false);
            that.initProjectDistortion(data.next.container);
            // that.projectDistortion.addObjects
          },
          afterLeave() {
            // Add your afterLeave logic for the projectpage namespace
            that.projectDistortion.destroy();
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
