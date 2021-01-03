import { select } from '../settings';

class Carousel {
  constructor(element) {
    const thisCarousel = this;

    thisCarousel.render(element);
    thisCarousel.initPlugin();
  }

  render(element) {
    const thisCarousel = this;

    thisCarousel.dom.wrapper = element;
  }

  initPlugin() {
    const thisCarousel = this;

    const elem = document.querySelector(select.home.carousel);
    thisCarousel.flkty = new Flickity( elem, {
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
    });
  }
}

export default Carousel;
