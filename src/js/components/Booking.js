import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();

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
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount =  new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.wrapper.addEventListener('updated', function() {


    });

    thisBooking.dom.hoursAmount.addEventListener('click', function() {


    });
  }

}

export default Booking;
