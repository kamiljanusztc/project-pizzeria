import { select, templates, settings } from '../settings.js';
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
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'), // zawiera adres endpointu API, ktory zwroci liste rezerwacji
      // params.booking.join('&') - z obiektu params bierzemy wlasciwosc booking, jest to tablica, w ktorej wszystkie el. maja byc polaczone za pomoca &

      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'), // zwroci liste wydarzen jednorazowych

      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'), // liste wydarzen cyklicznych
    };

    Promise.all([
      fetch(urls.booking), // funkcja polaczy sie z API
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) { // wykonujemy funkcje z jednym argumentem
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(), // zwracamy jego (bookingResponse) wynik metody json
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) { //odpowiedz z serwera (po przetworzeniu formatu json na tbalice lub obiekt)
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat); // przekazujemy tablice do metody parseData
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) { // pokazuje zajetowsc stolikow na wybrany termin
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined') { //sprawdzamy czy

    }

    thisBooking.booked[date][hour].push(table); // znajdujemy klucz bedacy datą przekazana w 1 arg., nastepnie godzina i dodajemy nowy el czy wartosc arg table
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
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.HourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {

    });

    thisBooking.dom.hoursAmount.addEventListener('click', function () {

    });
  }

}

export default Booking;
