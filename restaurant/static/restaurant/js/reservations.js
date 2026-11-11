(() => {
  const dateInput = document.querySelector('#filter-date');
  const clearButton = document.querySelector('#clear-filter');
  const list = document.querySelector('#reservations-list');
  const message = document.querySelector('#reservations-message');
  if (!dateInput || !clearButton || !list || !message) return;

  const setMessage = (text, kind = '') => {
    message.textContent = text;
    message.className = `message ${kind}`;
  };

  const render = (bookings) => {
    list.replaceChildren();
    if (!bookings.length) {
      setMessage('No reservations found for this date.', 'info');
      return;
    }
    setMessage(`${bookings.length} available reservation record${bookings.length === 1 ? '' : 's'} found.`, 'success');
    bookings.forEach((booking) => {
      const item = document.createElement('article');
      item.className = 'reservation-row';
      const details = document.createElement('div');
      const date = document.createElement('strong');
      date.textContent = booking.reservation_date;
      const label = document.createElement('span');
      label.textContent = 'Reserved time';
      const time = document.createElement('time');
      time.dateTime = booking.reservation_slot;
      time.textContent = booking.reservation_slot;
      details.append(date, label);
      item.append(details, time);
      list.appendChild(item);
    });
  };

  const load = async () => {
    try {
      const query = dateInput.value ? `?date=${encodeURIComponent(dateInput.value)}` : '';
      const response = await fetch(`/bookings${query}`);
      if (!response.ok) throw new Error('Unable to retrieve reservation availability.');
      render(await response.json());
    } catch (error) {
      list.replaceChildren();
      setMessage(error.message, 'error');
    }
  };

  dateInput.addEventListener('change', load);
  clearButton.addEventListener('click', () => {
    dateInput.value = '';
    load();
  });
  load();
})();
