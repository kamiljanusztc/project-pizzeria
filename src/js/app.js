import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initData: function() {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url) // wysylamy  zapytanie na podany adres endopointu
      .then(function(rawResponse) { // funkcja uruchomi sie wtedy gdy request sie zakonczy, a serwer zwroci odpowiedz / konwertuje dane do obiektu js
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse', parsedResponse); //po otrzymaniu odpowiedzi wyswietla ja w konsoli

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();

      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initMenu: function() {
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  init: function(){
    const thisApp = this;
    /* console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates); */

    thisApp.initData();

    thisApp.initCart();
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    // dla naszej aplikacj tworzymy wlasciwosc productList, ktora bedzie el DOM
    thisApp.productList = document.querySelector(select.containerOf.menu); // nasluchiwanie na event z product.addToCart

    thisApp.productList.addEventListener('add-to-cart', function(event) { // (event, handler)
      app.cart.add(event.detail.product);
    });
  },
};

app.init();

