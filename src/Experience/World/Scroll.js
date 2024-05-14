import EventEmitter from "../Utils/EventEmitter";

export default class Scroll extends EventEmitter {
  constructor() {
    super();
    this.scrollPercent = 0;

    this.initEventListeners();
  }

  scalePercent(start, end) {
    return (this.scrollPercent - start) / (end - start);
  }

  initEventListeners() {
    document.body.onscroll = () => {
      //calculate the current scroll progress as a percentage
      this.scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
          ((document.documentElement.scrollHeight ||
            document.body.scrollHeight) -
            document.documentElement.clientHeight)) *
        100;
      // this.trigger("scroll");
    };
  }
}
