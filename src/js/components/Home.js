import { classNames, select, templates } from '../settings.js';
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
    thisHome.dom.orderBox = thisHome.dom.wrapper.querySelector(select.widgets.home.orderBox);
    thisHome.dom.bookBox = thisHome.dom.wrapper.querySelector(select.widgets.home.bookBox);

    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navLinks = document.querySelectorAll(select.nav.links);

  }

  initWidgets() {
    const thisHome = this;

    thisHome.carousel = new Carousel(thisHome.dom.carousel);

    thisHome.dom.orderBox.addEventListener('click', function (event) {
      console.log('order online clicked');
      event.preventDefault();

      thisHome.pages[0].classList.remove(classNames.pages.active);
      thisHome.navLinks[0].classList.remove(classNames.nav.active);
      thisHome.pages[1].classList.add(classNames.pages.active);
      thisHome.navLinks[1].classList.add(classNames.nav.active);
      window.location.assign('http://localhost:3000/#/order');
    });

    thisHome.dom.bookBox.addEventListener('click', function (event) {
      console.log('order online clicked');
      event.preventDefault();

      thisHome.pages[0].classList.remove(classNames.pages.active);
      thisHome.navLinks[0].classList.remove(classNames.nav.active);
      thisHome.pages[2].classList.add(classNames.pages.active);
      thisHome.navLinks[2].classList.add(classNames.nav.active);
      window.location.assign('http://localhost:3000/#/booking');
    });
  }
}

export default Home;
