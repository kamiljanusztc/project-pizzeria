import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart { // zajmuje sie calym koszykie, jego funkcjonalnosciami
  constructor(element) {
    const thisCart = this;

    thisCart.products = []; // tablica dla produktow dodanych do koszyka

    thisCart.getElements(element);

    thisCart.initActions();

    //console.log('new Cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {}; // chowamy referencje elementow DOM do tego obiektu

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.formAddress = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.formPhone = thisCart.dom.wrapper.querySelector(select.cart.phone);

  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function() { //nasluchujemy na liste produktow. dzieki BUBBLES uslyszymy go na tej liscie
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) { // metoda ta otrzyma odwolanie (referencje) do instancji klasy cart
    // const thisCart = this;
    const thisCart = this;

    console.log('adding product', menuProduct);

    const generatedHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); // zapis obiektu do tablicy, jednoczesnie tworzymy nowa instancje klasy new CartProduct i dodamy ja do tablicy thisCart.Products
    // dzieki powyzszej linijce bedziemy mieli staly dostep do instancji wszystkich produktow

    this.update();

    //console.log('thisCart.products', thisCart.products);
  }

  update() {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;

    thisCart.subtotalPrice = 0;

    for(let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    if(thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
    }

    console.log(thisCart.deliveryFee);
    console.log(thisCart.totalNumber);
    console.log(thisCart.subtotalPrice);
    console.log(thisCart.totalPrice);

    for(let price of thisCart.dom.totalPrice) {
      price.innerHTML = thisCart.totalPrice;
    }

    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    //aktualizacja w koszyku
  }

  remove(CartProduct) {
    const thisCart = this;

    // usuniecie reprezentacji produktu z htmla
    CartProduct.dom.wrapper.remove();

    // usuniecie info o danym produkcie z tablicy thisCart.products
    const indexOfProduct = thisCart.products.indexOf(CartProduct);
    console.log(indexOfProduct);

    const removedValues = thisCart.products.splice(indexOfProduct, 1);
    console.log(removedValues);
    console.log(thisCart.products);

    //wywyolanie metody update w celu przeliczenia sum po usunieciu produktu
    thisCart.update();

  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order; //adres endpointu

    const payload = {
      address: thisCart.dom.formAddress.value,
      phone: thisCart.dom.formPhone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    console.log('playload:', payload);

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData()); //dodajemy obiekty podsumowania
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Cart;
