/*global Flickity*/

class Carousel {
  constructor(element) {
    const thisCarousel = this;

    thisCarousel.render(element);
    thisCarousel.initPlugin();
  }

  render(element) {
    const thisCarousel = this;

    thisCarousel.wrapper = element;
  }

  initPlugin() {
    const thisCarousel = this;

    //const elem = thisCarousel.wrapper.querySelector(select.home.carousel);
    thisCarousel.flkty = new Flickity( thisCarousel.wrapper, {
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
      prevNextButtons: false,
    });
  }
}

export default Carousel;
