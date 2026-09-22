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

    if (!res.ok) throw new Error('Request failed');

    form.style.display = 'none';
    formSuccess.classList.add('show');
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
    alert("Something went wrong sending your request — please try again in a moment.");
  }
});
