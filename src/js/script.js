/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu(); //the constructor will run this function after creating the instance

      thisProduct.getElements();

      thisProduct.initAccordion(); // wywolanie metody initAccordion

      thisProduct.initOrderForm();

      thisProduct.initAmountWidget();

      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);
    } // klasa product za pomoca metody renderInMenu bierze dane zrodlowe produktu i wyrzuca je do szablonu - tak powstaje kod html pojedynczego produktu

    //metoda renderInMenu szykuje nam wlasciwosc thisProduct.element
    renderInMenu() {
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    // w getElement korzystamy z thisProduct.element dzieki metodzie renderInMenu
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() { // deklaracja metody
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      //clickableTrigger.addEventListener('click', function(event) {
      thisProduct.accordionTrigger.addEventListener('click', function(event) {

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        for(let activeProduct of activeProducts) {
          if(activeProduct != thisProduct.element) {
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

      });
    }

    initOrderForm() { // metoda odpowiedzialna za dodanie listenerow eventow do formularza, jego kontrolek i guzika dodania do koszyka
      const thisProduct = this;
      //console.log(this.initOrderForm);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder(); // handler
        thisProduct.addToCart();
      });

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
    }

    processOrder() {
      const thisProduct = this;
      //console.log(this.processOrder);

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)) {

            // check if the option is not default
            if(!option.default == true) {

              // add option price to price variable
              price += option.price;
            }
          } else {
            // check if the option is default
            if((option.default == true)) {

              // reduce price variable
              price -= option.price;
            }
          }
          // find image
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          // check if found image
          if(optionImage !== null) {

            // check if the option is selected
            if(formData[paramId] && formData[paramId].includes(optionId)) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle = price;

      /* multiply price by amount */
      price *= thisProduct.amountWidget.value; // dzieki temu przed wyswietleniem ceny pomnozymy ja przez ilosc szt

      thisProduct.priceTotal = price;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem); //utworzenie nowej instancji klasy Amount Widget

      thisProduct.amountWidgetElem.addEventListener('updated', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    addToCart() { // metoda przekazuje cala instancje jako argument metody app.cart.add
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct()); // przekazuje do koszuka dane produktu
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceTotal,
        params: thisProduct.prepareCartProductParams()
      };

      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form); // dostep do formularza

      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {

        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {

          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected) {

            //option is selected!
            params[paramId].options[optionId] = option.label; //
          }
        }
      }

      return params;
    }
  }


  class AmountWidget {
    constructor(element) { // argument element jest referencja do elementu DOM (tego co thisProduct.amountWidgetElem)
      const thisWidget = this;

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);

      thisWidget.getElements(element);

      thisWidget.setValue(settings.amountWidget.defaultValue);

      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {  // funkcja odpowiada za dodawana wartosc
      const thisWidget = this;

      const newValue = parseInt(value); //parseInt zadba o konwersje '10' na liczbe 10 (poniewz kazdy input zwraca wartosc tekstowa)

      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= 1 && newValue <= 10) {
        thisWidget.value = newValue; //wartosc przekazanego argumentu po przekonwertowaniu go na liczbe
      }

      thisWidget.input.value = thisWidget.value; // aktualizuje wartosc samego inputu
      thisWidget.announce();
    }

    // ponizej dodanie reakakcji na eventy
    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value); //handl, argument w nawiasie
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() { //metoda tworzaca instancje klasy event - wbudowanej w silnik js / przegladarke
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true    //wlaczamy wlasciwosc bubbles - event bedzie emitowany na tym elemencie, rodzicu itp az do body, document, window
      });

      thisWidget.element.dispatchEvent(event);
    }
  }

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

    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function() { //nasluchujemy na liste produktow. dzieki BUBBLES uslyszymy go na tej liscie
        thisCart.update();
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

      const deliveryFee = settings.cart.defaultDeliveryFee;

      let totalNumber = 0;

      let subtotalPrice = 0;

      for(let product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      if(totalNumber > 0) {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      } else {
        thisCart.totalPrice = 0;
        deliveryFee = 0;
      }

      console.log(deliveryFee);
      console.log(totalNumber);
      console.log(subtotalPrice);
      console.log(thisCart.totalPrice);

      for(let price of thisCart.dom.totalPrice) {
        price.innerHTML = thisCart.totalPrice;
      }

      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      //aktualizacja w koszyku
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {   // pierwszy argument przyjmuje referencje do obiektu podsumowania, drugi do utworzonego dla niego produktu elementu HTML (generatedDOM)
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      //console.log(thisCartProduct);
    }

    getElements(element) { //aby przygotowac referencje do elementow HTML
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget); //utworzenie nowej instancji klasy Amount Widget

      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {  // info do handlera eventu - co dokladnie trzeba usunac
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function() {
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function() {
        event.preventDefault();

        thisCartProduct.remove();
      });
    }
  }

  const app = {
    initData: function() {
      const thisApp = this;
      thisApp.data = dataSource; //reference (address) to data
    },

    initMenu: function() {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
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

      thisApp.initMenu();

      thisApp.initCart();
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();

}
