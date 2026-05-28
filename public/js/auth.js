// auth.js – Handles registration, login, and CAPTCHA UI

import { render } from './app.js';

function showModal(message, isError = false) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <p style="color:${isError ? '#ff6b6b' : '#4caf50'};">${message}</p>
      <button class="btn" id="closeModal">Yopish</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeModal').addEventListener('click', () => modal.remove());
}

async function fetchCaptcha() {
  const res = await fetch('/api/auth/captcha');
  const svg = await res.text();
  return svg;
}

function renderCaptcha(containerId) {
  const container = document.getElementById(containerId);
  fetchCaptcha().then(svg => {
    container.innerHTML = svg;
  });
}

function registerForm() {
  render(`
    <div class="card" style="max-width:400px;margin:auto;">
      <h2 class="text-center">Ro’yxatdan o’tish</h2>
      <form id="registerForm">
        <label>Ism</label>
        <input type="text" name="firstName" required />
        <label>Familiya</label>
        <input type="text" name="lastName" required />
        <label>Telefon</label>
        <input type="text" name="phone" required />
        <label>Email</label>
        <input type="email" name="email" required />
        <label>Parol</label>
        <input type="password" name="password" required />
        <label>CAPTCHA</label>
        <div id="captchaContainer"></div>
        <input type="text" name="captcha" placeholder="CAPTCHA ni kiriting" required />
        <button class="btn mt-4" type="submit">Ro’yxatdan o’tish</button>
        <p class="mt-4 text-center"><a href="#/login">Kirish</a></p>
      </form>
    </div>
  `);
  renderCaptcha('captchaContainer');
  document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      showModal('Ro’yxatdan o’tdingiz! Endi kirish mumkin.');
      setTimeout(() => window.location.hash = '#/login', 1500);
    } else {
      showModal(result.message || 'Xatolik yuz berdi', true);
      renderCaptcha('captchaContainer');
    }
  });
}

function loginForm() {
  render(`
    <div class="card" style="max-width:400px;margin:auto;">
      <h2 class="text-center">Kirish</h2>
      <form id="loginForm">
        <label>Email</label>
        <input type="email" name="email" required />
        <label>Parol</label>
        <input type="password" name="password" required />
        <label>CAPTCHA</label>
        <div id="captchaContainer"></div>
        <input type="text" name="captcha" placeholder="CAPTCHA ni kiriting" required />
        <button class="btn mt-4" type="submit">Kirish</button>
        <p class="mt-4 text-center"><a href="#/register">Ro’yxatdan o’tish</a></p>
      </form>
    </div>
  `);
  renderCaptcha('captchaContainer');
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role);
      // Navigate based on role
      if (result.role === 'admin') window.location.hash = '#/admin';
      else if (result.role === 'teacher') window.location.hash = '#/teacher';
      else window.location.hash = '#/student';
    } else {
      showModal(result.message || 'Kirishda xatolik', true);
      renderCaptcha('captchaContainer');
    }
  });
}

export function showLanding() {
  const token = localStorage.getItem('token');
  if (token) {
    const role = localStorage.getItem('role');
    if (role === 'admin') window.location.hash = '#/admin';
    else if (role === 'teacher') window.location.hash = '#/teacher';
    else window.location.hash = '#/student';
    return;
  }
  render(`
    <div class="card" style="max-width:400px;margin:auto;">
      <h2 class="text-center">EduMOOC</h2>
      <p class="text-center mt-4">Online kurslarga qo‘shiling</p>
      <div class="grid grid-2 mt-4">
        <button class="btn" id="loginBtn">Kirish</button>
        <button class="btn" id="registerBtn">Ro’yxatdan o’tish</button>
      </div>
    </div>
  `);
  document.getElementById('loginBtn').addEventListener('click', () => window.location.hash = '#/login');
  document.getElementById('registerBtn').addEventListener('click', () => window.location.hash = '#/register');
}

export function showLogin() { loginForm(); }
export function showRegister() { registerForm(); }
