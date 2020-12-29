import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData(); // pobiera dane z API uzywajac adresow z parametrami filtrujacymi wyniki

  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate); // data poczatkowa minDate, utils.dateToStr - konwertuje date jako text
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking
        + '?' + params.booking.join('&'), // zawiera adres endpointu API, ktory zwroci liste rezerwacji
      // params.booking.join('&') - z obiektu params bierzemy wlasciwosc booking, jest to tablica, w ktorej wszystkie el. maja byc polaczone za pomoca &

      eventsCurrent: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsCurrent.join('&'), // zwroci liste wydarzen jednorazowych

      eventsRepeat: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsRepeat.join('&'), // liste wydarzen cyklicznych
    };

    Promise.all([
      fetch(urls.booking), // funkcja polaczy sie z API
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) { // wykonujemy funkcje z jednym argumentem
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(), // zwracamy jego (bookingResponse) wynik metody json
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) { //odpowiedz z serwera (po przetworzeniu formatu json na tbalice lub obiekt)
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat); // przekazujemy tablice do metody parseData
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) { // pokazuje zajetowsc stolikow na wybrany termin
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) { // dla kazdego wydarzenia dostepnego w zmiennej item zapiszemy zajetosc stolika w obiekci thisBooking.booked
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') { // warunek, ktory sprawdzi czy to wyrazenie ma walsciwosc repeat o wartosci daily
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) { // interuje po datach, a po kazdej iteracji zmieniamy date o jeden dzien
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.upadteDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') { //sprawdzamy czy mamy wpis w thisBooking.booked dla kontretnej daty
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour); // konwertujemy aby godziny byly zpaisywane jako liczby

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) { // petla for z iteratorem, wyswietla wszystkie polgodzinne bloki rezerwacji
      // console.log('loop', index);                                 // po kazdej iteracji zwiekszamy wartosc o 0.5

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table); // znajdujemy klucz bedacy datą przekazana w 1 arg., nastepnie godzina i dodajemy nowy el czy wartosc arg table
    } // przypisanie stolika do danej godziny
  }

  upadteDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' // dla tej daty nie ma obiektu
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined' // dla tej daty i godizny nie istnieje tablica
    ) {
      allAvailable = true; // tego dnia i o tej godzinie wszystkie stoliki sa dostepne
    }

    for (let table of thisBooking.dom.tables) { // iteruje przez stoliki widoczne na mapie na stronie booking
      let tableId = table.getAttribute(settings.booking.tableIdAttribute); // pobieramy id aktualnego stolika
      if (!isNaN(tableId)) { // jesli tableId jest liczba
        tableId = parseInt(tableId);
      }

      if ( // czy ktorys stolik jest zajety
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) // includes sprawdza czy el. tableId znajduje sie w tablicy thisBooking.booked[thisBooking.date][thisBooking.hour]
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;

    // generate HTML
    const generatedHTML = templates.bookingWidget();

    // create empty object
    thisBooking.dom = {};

    // add wrapper to object
    thisBooking.dom.wrapper = element;

    // change wrapper content to generated HTML
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount); // tbd
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.HourPicker = document.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.HourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.upadteDOM();
    });

    thisBooking.dom.hoursAmount.addEventListener('click', function () {

    });
  }

  initActions() {
    const thisBooking = this;

    // add listener to clicked table
    thisBooking.table.addEventListener('click', function (event) {
      event.preventDefault();

      const clickedElement = this;  // this wskazuje na thisBooking.table

      // check if the table is free
      if(!clickedElement.classList.contains('booked')) {
        thisBooking.table; // tbd
      }
    });
  }

}

export default Booking;
