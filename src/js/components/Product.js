import { select, classNames, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from './../utils.js';

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

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    thisProduct.price = thisProduct.priceTotal;

    //app.cart.add(thisProduct.prepareCartProduct()); // przekazuje do koszyka dane produktu

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,      // drugim arg jest obiekt zawierajacy ustawienia, babelkowanie (przekazywanie w gore)
      detail: {
        product: thisProduct,     // pod kluczem produkt bedzie produkt, ktory zostal dodany do koszyka
      },
    });

    thisProduct.element.dispatchEvent(event);     // dispatch - wywolanie eventu.  wyebieramy el, na ktorym chcemy eten event wywolac
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

export default Product;
