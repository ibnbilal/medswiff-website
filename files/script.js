const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const year = $('#year');
if (year) year.textContent = new Date().getFullYear();

const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', mobileMenu).forEach(link => link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }));
}

const revealEls = $$('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  revealEls.forEach(element => observer.observe(element));
} else revealEls.forEach(element => element.classList.add('in'));

// Revenue opportunity calculator. The assumption is deliberately visible in the UI.
const calcCalls = $('#calcCalls');
const calcValue = $('#calcValue');
if (calcCalls && calcValue) {
  const callsLabel = $('#calcCallsVal');
  const valueLabel = $('#calcValueVal');
  const result = $('#calcResult');
  const breakdown = { calls: $('#bdCalls'), year: $('#bdYear'), bookings: $('#bdBookings'), value: $('#bdValue') };
  const BOOKING_RATE = 0.25;
  const money = amount => '$' + amount.toLocaleString('en-US');

  function updateCalculator() {
    const calls = Number(calcCalls.value);
    const value = Number(calcValue.value);
    const annualCalls = calls * 52;
    const bookings = Math.round(annualCalls * BOOKING_RATE);
    callsLabel.textContent = calls;
    valueLabel.textContent = money(value);
    breakdown.calls.textContent = calls;
    breakdown.year.textContent = annualCalls.toLocaleString('en-US');
    breakdown.bookings.textContent = bookings.toLocaleString('en-US');
    breakdown.value.textContent = money(value);
    result.textContent = money(bookings * value);
  }
  calcCalls.addEventListener('input', updateCalculator);
  calcValue.addEventListener('input', updateCalculator);
  updateCalculator();
}

const calcForm = $('#calcForm');
const calcSuccess = $('#calcSuccess');
if (calcForm && calcSuccess) {
  calcForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!calcForm.reportValidity()) return;
    // This is intentionally a clear placeholder until an email endpoint is available.
    calcForm.hidden = true;
    calcSuccess.classList.add('show');
  });
}

const form = $('#demoForm');
const formSuccess = $('#formSuccess');
if (form && formSuccess) {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const submit = $('button[type="submit"]', form);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const required = [
      ['name', () => form.name.value.trim().length > 0],
      ['email', () => emailRe.test(form.email.value.trim())],
      ['clinic', () => form.clinic.value.trim().length > 0],
      ['type', () => form.type.value !== ''],
      ['bottleneck', () => form.bottleneck.value !== '']
    ];
    let valid = true;
    required.forEach(([field, check]) => {
      const wrapper = $(`[data-field="${field}"]`, form);
      const passed = check();
      wrapper?.classList.toggle('error', !passed);
      valid = passed && valid;
    });
    if (!valid) return;
    const originalText = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch('/api/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.status === 409) throw new Error('We already have a recent request from this email.');
      if (!response.ok) throw new Error('Request failed');
      form.hidden = true;
      formSuccess.classList.add('show');
    } catch (error) {
      submit.disabled = false;
      submit.textContent = originalText;
      alert(error.message === 'We already have a recent request from this email.' ? error.message : 'Something went wrong sending your request — please try again in a moment.');
    }
  });
}
