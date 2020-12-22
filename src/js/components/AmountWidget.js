import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {  // to info, ze AmountWidget jest rozszerzeniem BaseWidget
  constructor(element) { // argument element jest referencja do elementu DOM (tego co thisProduct.amountWidgetElem)
    super(element, settings.amountWidget.defaultValue); // super - oznacza konstruktor klasy BaseWidget (konstruktora klasy nadrzednej)

    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions();

    // console.log('AmountWidget:', thisWidget);
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value) {
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin
    && value <= settings.amountWidget.defaultMax; // funkcja isNaN sprawdza czy przekazana wartosc jest Not a Number
  }

  renderValue() { //biezaca wartosc widgetu bedzie wyswietlana na stronie
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value; // aktualizuje wartosc samego inputu
  }

  // ponizej dodanie reakakcji na eventy
  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.value(thisWidget.dom.input.value); //handl, argument w nawiasie
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

}

export default AmountWidget;
