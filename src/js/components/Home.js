import { select, templates } from '../settings.js';
import Carousel from './Carousel.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.homePage();

    thisHome.dom = {};

    thisHome.dom.wrapper = element;

    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(select.widgets.home.carousel);
  }

  initWidgets() {
    const thisHome = this;

    thisHome.carousel = new Carousel(thisHome.dom.carousel);
  }
}

export default Home;
