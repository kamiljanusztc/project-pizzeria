class BaseWidget {
  constructor(wrapperElement, initialValue) {   //wrapperElement - el. dom, wktorym jest ten widget, initialValue - poczarkowa wartosc widgetu
    const thisWidget = this;

    thisWidget.dom = {}; // all dom elements for our app
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value() { // metoda wykonywana przy kazdej probie odczytania wlasciwosci value
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) {   // wykonywana przy probie ustawienia nowej wartosci wlasciwosci value
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); //parseInt zadba o konwersje '10' na liczbe 10 (poniewz kazdy input zwraca wartosc tekstowa)

    if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue; //wartosc przekazanego argumentu po przekonwertowaniu go na liczbe
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value; // zostanie wykonany setter, ktory ustawi nowa wartosc tylko jesli jest poprawna
  }

  parseValue(value) { // przeksztalci wartosc na odpowiedni typ lub format
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue() { //biezaca wartosc widgetu bedzie wyswietlana na stronie
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value; // bedzie nadpisywal zawartosc wrappera tego widgetu
  }

  announce() { //metoda tworzaca instancje klasy event - wbudowanej w silnik js / przegladarke
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true    //wlaczamy wlasciwosc bubbles - event bedzie emitowany na tym elemencie, rodzicu itp az do body, document, window
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
