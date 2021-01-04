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

    thisHome.order = document.querySelector(select.containerOf.order);
    thisHome.book = document.querySelector(select.containerOf.book);
    thisHome.homePage = document.querySelector(select.containerOf.homePage);
    thisHome.navLinks = document.querySelectorAll(select.nav.links);

    thisHome.homeLink = document.querySelector(select.containerOf.homePage);
    thisHome.orderLink = document.querySelector(select.containerOf.order);
    thisHome.bookingLink = document.querySelector(select.containerOf.book);
  }

  initWidgets() {
    const thisHome = this;

    thisHome.carousel = new Carousel(thisHome.dom.carousel);

    thisHome.dom.orderBox.addEventListener('click', function(event) {
      console.log('order online clicked');
      event.preventDefault();

      thisHome.homePage.classList.remove(classNames.pages.active);
      // thisHome.homeLink.classList.remove(classNames.nav.active);
      thisHome.order.classList.add(classNames.pages.active);


    });

    thisHome.dom.bookBox.addEventListener('click', function(event) {
      console.log('order online clicked');
      event.preventDefault();

      thisHome.homePage.classList.remove(classNames.pages.active);

      thisHome.book.classList.add(classNames.pages.active);

    });

  }

}

export default Home;
