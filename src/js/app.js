import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {
  initPages: function () { // uruchamiana w momencie odswiezenia strony
    const thisApp = this;

    // wszystkie dzieci kontenera stron - id other i booking z index html
    thisApp.pages = document.querySelector(select.containerOf.pages).children; //do przechowania kontenerow podstron, ktore wyszukamy w DOM - dzieki children znajdziemy wszystkie dzieci
    thisApp.navLinks = document.querySelectorAll(select.nav.links); // find links

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id; //kiedy adres hash nie pasuje do id zadnej podstrony to aktywuje sie pierwsza z nich

    // find subpage with id
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break; // nie zostana wykonane kolejne iteracje petli
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        console.log('navLink clicked');
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', ''); // w stalej id zapisujemy atrybut href kliknietego el., w ktorym zamienimy # na pusty ciag znakow czyli order lub booking

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id); // wywolanie metody activate Page podajac jej wydobyte z hrefu id
        /* change URL hash-koncowka adresu strony */
        window.location.hash = '#/' + id; // slash dodajemy aby strona automatycznie nie przewijala sie w dol
      });
    }
  },

  activatePage: function (pageId) { //aktywowanie podstrony
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      // if(page.id == pageId) {
      //   page.classList.add(classNames.pages.active);
      // } else {
      //   page.classList.remove(classNames.pages.active);
      // }
      page.classList.toggle(classNames.pages.active, page.id == pageId); //ostatni argument koontroluje czy klasa zostanie nadana czy nie
    }
    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) { // for all links in nave links
      link.classList.toggle( //we want add or remove
        classNames.nav.active, // class in className.nav.active
        link.getAttribute('href') == '#' + pageId //if link href of this link = '#' and pageId
      );
    }
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url) // wysylamy  zapytanie na podany adres endopointu
      .then(function (rawResponse) { // funkcja uruchomi sie wtedy gdy request sie zakonczy, a serwer zwroci odpowiedz / konwertuje dane do obiektu js
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        //console.log('parsedResponse', parsedResponse); //po otrzymaniu odpowiedzi wyswietla ja w konsoli

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();

      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initMenu: function () {
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  init: function () {
    const thisApp = this;
    /* console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates); */

    thisApp.initPages();

    thisApp.initData();

    thisApp.initCart();

    thisApp.initBooking();

    thisApp.initHome();

  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    // dla naszej aplikacj tworzymy wlasciwosc productList, ktora bedzie el DOM
    thisApp.productList = document.querySelector(select.containerOf.menu); // nasluchiwanie na event z product.addToCart

    thisApp.productList.addEventListener('add-to-cart', function (event) { // (event, handler)
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function () {
    const thisApp = this;

    const bookingWidget = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWidget); // tworzymy nowa instancje
  },

  initHome: function () {
    const thisApp = this;

    const homeWidget = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(homeWidget);

    thisApp.initPages();
  },
};

app.init();

