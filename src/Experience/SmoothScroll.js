import Item from "./Item.js";

// helper functions
const MathUtils = {
  // map number x from range [a, b] to [c, d]
  map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,
  // linear interpolation
  lerp: (a, b, n) => (1 - n) * a + n * b,
};

// SmoothScroll
export default class SmoothScroll {
  constructor(dom2Gl) {
    this.dom2Gl = dom2Gl;

    this.shouldRender = false;
    // the <main> element
    this.DOM = { main: document.querySelector("main") };
    // the scrollable element
    // we translate this element when scrolling (y-axis)
    this.DOM.scrollable = this.DOM.main.querySelector("div[data-scroll]");
    // the items on the page
    this.items = [];

    this.createItems();
    // this.listenMouse();

    // here we define which property will change as we scroll the page
    // in this case we will be translating on the y-axis
    // we interpolate between the previous and current value to achieve the smooth scrolling effect
    this.renderedStyles = {
      translationY: {
        // interpolated value
        previous: 0,
        // current value
        current: 0,
        // amount to interpolate
        ease: 0.1,
        // current value setter
        // in this case the value of the translation will be the same like the document scroll
        setValue: () => this.dom2Gl.docScroll,
      },
    };
    
    // set the initial values
    this.update();
    // the <main> element's style needs to be modified
    // this.style();
    // init/bind events
    // this.initEvents();

    // start the render loop
    requestAnimationFrame(() => this.render());
  }

  update() {
    // sets the initial value (no interpolation) - translate the scroll value
    for (const key in this.renderedStyles) {
      this.renderedStyles[key].current = this.renderedStyles[key].previous =
        this.renderedStyles[key].setValue();
    }
    // translate the scrollable element
    this.setPosition();
    this.shouldRender = true;
  }

  setPosition() {
    // translates the scrollable element
    // if (
    //   Math.round(this.renderedStyles.translationY.previous) !==
    //     Math.round(this.renderedStyles.translationY.current) ||
    //   this.renderedStyles.translationY.previous < 10
    // ) {
    //   this.shouldRender = true;
    //   this.DOM.scrollable.style.transform = `translate3d(0,${
    //     -1 * this.renderedStyles.translationY.previous
    //   }px,0)`;
    //   // console.log(this.items);
    //   for (const item of this.items) {
    //     // if the item is inside the viewport call it's render function
    //     // this will update the item's inner image translation, based on the document scroll value and the item's position on the viewport
    //     if (item.isVisible || item.isBeingAnimatedNow) {
    //       item.render(this.renderedStyles.translationY.previous);
    //     }
    //   }
    // }
    // if (this.dom2Gl.targetSpeed > 0.01) this.shouldRender = true;

    // if (this.shouldRender) {
    //   this.shouldRender = false;
    //   scene.render();
    // }
  }

  createItems() {
    this.dom2Gl.IMAGES.forEach((image) => {
      if (image.img.hasAttribute("data-img")) {
        this.items.push(new Item(image, this, this.dom2Gl));
      }
    });
  }

  resize() {
  }

  render() {
    // update the current and interpolated values
    for (const key in this.renderedStyles) {
      this.renderedStyles[key].current = this.renderedStyles[key].setValue();
      this.renderedStyles[key].previous = MathUtils.lerp(
        this.renderedStyles[key].previous,
        this.renderedStyles[key].current,
        this.renderedStyles[key].ease
      );
    }
    // and translate the scrollable element
    this.setPosition();

    // loop..
    requestAnimationFrame(() => this.render());
  }
}
