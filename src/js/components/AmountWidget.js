import {select, settings} from '../settings.js';

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

export default AmountWidget;
