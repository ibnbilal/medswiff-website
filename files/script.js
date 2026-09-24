// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// Use case tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// Form validation + submission
const form = document.getElementById('demoForm');
const formSuccess = document.getElementById('formSuccess');
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let valid = true;

  const checks = [
    { field: 'name', test: () => form.name.value.trim().length > 0 },
    { field: 'email', test: () => emailRe.test(form.email.value.trim()) },
    { field: 'clinic', test: () => form.clinic.value.trim().length > 0 },
    { field: 'type', test: () => form.type.value !== '' },
    { field: 'bottleneck', test: () => form.bottleneck.value !== '' },
  ];

  checks.forEach(({ field, test }) => {
    const wrap = form.querySelector('[data-field="' + field + '"]');
    if (!test()) {
      wrap.classList.add('error');
      valid = false;
    } else {
      wrap.classList.remove('error');
    }
  });

  if (!valid) return;

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    clinic: form.clinic.value.trim(),
    type: form.type.value,
    system: form.system.value.trim(),
    bottleneck: form.bottleneck.value,
  };

  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  try {
    const res = await fetch('/api/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      const data = await res.json().catch(() => ({}));
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      alert(data.message || "We already have a recent request from this email.");
      return;
    }

    if (!res.ok) throw new Error('Request failed');

    form.style.display = 'none';
    formSuccess.classList.add('show');
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
    alert("Something went wrong sending your request — please try again in a moment.");
  }
});

// Missed-call cost estimator
const calcCalls = document.getElementById('calcCalls');
const calcValue = document.getElementById('calcValue');
if (calcCalls && calcValue) {
  const calcCallsVal = document.getElementById('calcCallsVal');
  const calcValueVal = document.getElementById('calcValueVal');
  const calcResult = document.getElementById('calcResult');
  const bdCalls = document.getElementById('bdCalls');
  const bdYear = document.getElementById('bdYear');
  const bdBookings = document.getElementById('bdBookings');
  const bdValue = document.getElementById('bdValue');
  const BOOKING_RATE = 0.25; // assumes ~1 in 4 missed callers would have booked

  function updateCalc() {
    const calls = parseInt(calcCalls.value, 10);
    const value = parseInt(calcValue.value, 10);
    const perYear = calls * 52;
    const bookingsLost = Math.round(perYear * BOOKING_RATE);
    const annualLoss = bookingsLost * value;

    calcCallsVal.textContent = calls;
    calcValueVal.textContent = '$' + value;
    bdCalls.textContent = calls;
    bdYear.textContent = perYear.toLocaleString();
    bdBookings.textContent = bookingsLost.toLocaleString();
    bdValue.textContent = '$' + value;
    calcResult.textContent = '$' + annualLoss.toLocaleString();
  }

  calcCalls.addEventListener('input', updateCalc);
  calcValue.addEventListener('input', updateCalc);
  updateCalc();

  const calcForm = document.getElementById('calcForm');
  const calcSuccess = document.getElementById('calcSuccess');
  calcForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Placeholder for now — not yet wired to a backend endpoint.
    // Swap this for a fetch('/api/estimate', ...) call once that's built.
    calcForm.style.display = 'none';
    calcSuccess.classList.add('show');
  });
}
