// script.js — sends contact form data to your Google Apps Script web app
// Replace FUNCTION_URL and SECRET if they change

const FUNCTION_URL = 'https://script.google.com/macros/s/AKfycbyyAx-ahZyx9ZWxNBTePLLm_w5TNVmx4rzEq41AqDb212xndnxPzgVWcP-3I2S7oIE96g/exec';
const SECRET = '2184'; // must match EXPECTED_SECRET in your Apps Script

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
  if (!data.name || data.name.length < 2) {
    setError(nameError, 'Please enter your full name (at least 2 characters).');
    hasError = true;
  }
  if (!data.email) {
    setError(emailError, 'Please enter your email address.');
    hasError = true;
  } else {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(data.email)) {
      setError(emailError, 'Please enter a valid email address.');
      hasError = true;
    }
  }
  if (!data.message || data.message.length < 10) {
    setError(messageError, 'Please enter a message (at least 10 characters).');
    hasError = true;
  }
  if (hasError) return;

  try {
    submitBtn.disabled = true;
    setStatus('Sending…', true);

    const resp = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    // Try parse JSON if possible
    let result = null;
    try { result = await resp.json(); } catch (e) { result = null; }

    if (resp.ok) {
      // Success: redirect to thank-you page
      window.location.href = 'thankyou.html';
    } else {
      console.error('Server error response', resp.status, result);
      setStatus((result && result.error) || 'Unable to send message. Try again later.', false);
    }
  } catch (err) {
    console.error('Network error', err);
    setStatus('Network error. Please check your connection and try again.', false);
  } finally {
    submitBtn.disabled = false;
  }
});
