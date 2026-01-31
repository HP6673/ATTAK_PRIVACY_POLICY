// script.js — posts to your Apps Script and redirects on success
const FUNCTION_URL = 'https://script.google.com/macros/s/AKfycby1sXw-6PvA56mrqzOF2nyUNqmVwJu6dOzSVAnTaAQHXO46S4dJlT1yEkjVNhD-hlW3CQ/exec';
const SECRET = '2184';

const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const statusEl = document.getElementById('formStatus');

const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');

function setError(el, message) { el.textContent = message || ''; }
function setStatus(message, ok = true) {
  statusEl.textContent = message;
  statusEl.style.color = ok ? '' : 'red';
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  setError(nameError); setError(emailError); setError(messageError);
  setStatus('');

  const formData = new FormData(form);
  const data = {
    name: formData.get('name')?.trim(),
    email: formData.get('email')?.trim(),
    message: formData.get('message')?.trim(),
    wantsResponse: formData.get('wantsResponse') === 'yes',
    secret: SECRET
  };

  let hasError = false;
  if (!data.name || data.name.length < 2) { setError(nameError, 'Please enter your full name (at least 2 characters).'); hasError = true; }
  if (!data.email) { setError(emailError, 'Please enter your email address.'); hasError = true; }
  else { const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; if (!re.test(data.email)) { setError(emailError, 'Please enter a valid email address.'); hasError = true; } }
  if (!data.message || data.message.length < 10) { setError(messageError, 'Please enter a message (at least 10 characters).'); hasError = true; }
  if (hasError) return;

  try {
    submitBtn.disabled = true;
    setStatus('Sending…', true);

    const resp = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const text = await resp.text().catch(() => null);
    let json = null;
    try { json = JSON.parse(text); } catch (e) { /* not JSON */ }

    if (resp.ok) {
      // success -> thank you page
      window.location.href = 'thankyou.html';
    } else {
      const serverMsg = (json && (json.error || JSON.stringify(json))) || text || `HTTP ${resp.status}`;
      setStatus('Server error: ' + serverMsg, false);
      console.error('Server error:', resp.status, serverMsg);
    }
  } catch (err) {
    console.error('Network error:', err);
    setStatus('Network error. Please check your connection and try again.', false);
  } finally {
    submitBtn.disabled = false;
  }
});
