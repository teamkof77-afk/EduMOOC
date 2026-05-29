import { render, showModal, api, setAuth, clearAuth } from './app.js';

export async function showLanding() {
  const token = localStorage.getItem('token');
  if (token) {
    const me = await api('/api/auth/me');
    if (me.success) {
      setAuth(token, me.user.role, me.user);
      if (me.user.role === 'admin') { window.location.hash = '#/admin'; return; }
      window.location.hash = '#/role'; return;
    } else {
      clearAuth();
    }
  }
  render(`
    <div class="auth-page">
      <div class="auth-card" style="text-align:center;max-width:500px">
        <div class="logo">
          <h1><span style="color:#6C63FF">Edu</span><span style="color:#00D2FF">MOOC</span></h1>
          <p>Zamonaviy Onlayn Kurs Platformasi</p>
        </div>
        <div style="margin:40px 0">
          <div style="font-size:80px;margin-bottom:20px;animation:float 6s ease-in-out infinite">📚</div>
          <h2 style="font-size:28px;margin-bottom:12px">Bilim olishning eng zamonaviy usuli</h2>
          <p style="color:var(--text-dim);line-height:1.7">Sun'iy intellekt, dasturlash, marketing va dizayn yo'nalishlari bo'yicha professional kurslar</p>
        </div>
        <div style="display:flex;gap:16px">
          <button class="btn btn-lg" style="flex:1" id="goLogin">Kirish</button>
          <button class="btn btn-lg btn-outline" style="flex:1" id="goRegister">Ro'yxatdan o'tish</button>
        </div>
        <div style="margin-top:30px;display:flex;justify-content:center;gap:40px;flex-wrap:wrap">
          <div><span style="font-size:24px">🎯</span><p style="font-size:12px;color:var(--text-dim);margin-top:4px">Amaliy bilim</p></div>
          <div><span style="font-size:24px">🏆</span><p style="font-size:12px;color:var(--text-dim);margin-top:4px">Sertifikat</p></div>
          <div><span style="font-size:24px">🚀</span><p style="font-size:12px;color:var(--text-dim);margin-top:4px">Karyera</p></div>
        </div>
      </div>
    </div>
  `);
  document.getElementById('goLogin').addEventListener('click', () => window.location.hash = '#/login');
  document.getElementById('goRegister').addEventListener('click', () => window.location.hash = '#/register');
}

export function showLogin() {
  const token = localStorage.getItem('token');
  if (token) { window.location.hash = '#/role'; return; }
  render(`
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo"><h1><span style="color:#6C63FF">Edu</span><span style="color:#00D2FF">MOOC</span></h1><p>Tizimga kirish</p></div>
        <h2>Kirish</h2>
        <form id="loginForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="Email manzilingiz" required />
          </div>
          <div class="form-group">
            <label>Parol</label>
            <input type="password" name="password" placeholder="Parolingiz" required />
          </div>
          <div class="form-group">
            <label>CAPTCHA</label>
            <div class="captcha-box" id="captchaContainer"></div>
            <input type="text" name="captcha" placeholder="CAPTCHA kodini kiriting" required style="margin-top:8px" />
            <span class="captcha-refresh" id="refreshCaptcha">🔄 Yangi kod</span>
          </div>
          <button class="btn" style="width:100%;margin-top:8px" type="submit">Kirish</button>
        </form>
        <div class="auth-links">Hisobingiz yo'qmi? <a href="#/register">Ro'yxatdan o'tish</a></div>
      </div>
    </div>
  `);
  loadCaptcha();
  document.getElementById('refreshCaptcha').addEventListener('click', loadCaptcha);
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Kirish...';
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      setAuth(result.token, result.role, result.user);
      showModal('Tizimga muvaffaqiyatli kirdingiz!', false, () => {
        if (result.role === 'admin') window.location.hash = '#/admin';
        else window.location.hash = '#/role';
      });
    } else {
      showModal(result.message || 'Kirishda xatolik yuz berdi', true);
      loadCaptcha();
      btn.disabled = false; btn.textContent = 'Kirish';
    }
  });
}

export function showRegister() {
  const token = localStorage.getItem('token');
  if (token) { window.location.hash = '#/role'; return; }
  render(`
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo"><h1><span style="color:#6C63FF">Edu</span><span style="color:#00D2FF">MOOC</span></h1><p>Yangi hisob yaratish</p></div>
        <h2>Ro'yxatdan o'tish</h2>
        <form id="registerForm">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group">
              <label>Ism</label>
              <input type="text" name="firstName" placeholder="Ismingiz" required />
            </div>
            <div class="form-group">
              <label>Familiya</label>
              <input type="text" name="lastName" placeholder="Familiyangiz" required />
            </div>
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input type="text" name="phone" placeholder="Telefon raqamingiz" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="Email manzilingiz" required />
          </div>
          <div class="form-group">
            <label>Parol</label>
            <input type="password" name="password" placeholder="Parolingiz (kamida 6 belgi)" minlength="6" required />
          </div>
          <div class="form-group">
            <label>CAPTCHA</label>
            <div class="captcha-box" id="captchaContainer"></div>
            <input type="text" name="captcha" placeholder="CAPTCHA kodini kiriting" required style="margin-top:8px" />
            <span class="captcha-refresh" id="refreshCaptcha">🔄 Yangi kod</span>
          </div>
          <button class="btn" style="width:100%;margin-top:8px" type="submit">Ro'yxatdan o'tish</button>
        </form>
        <div class="auth-links">Hisobingiz bormi? <a href="#/login">Kirish</a></div>
      </div>
    </div>
  `);
  loadCaptcha();
  document.getElementById('refreshCaptcha').addEventListener('click', loadCaptcha);
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Yuborilmoqda...';
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      showModal(result.message || 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', false, () => {
        window.location.hash = '#/login';
      });
    } else {
      showModal(result.message || 'Xatolik yuz berdi', true);
      loadCaptcha();
      btn.disabled = false; btn.textContent = 'Ro\'yxatdan o\'tish';
    }
  });
}

async function loadCaptcha() {
  const container = document.getElementById('captchaContainer');
  if (!container) return;
  try {
    const res = await fetch('/api/auth/captcha');
    const svg = await res.text();
    container.innerHTML = svg;
  } catch { container.innerHTML = '<p style="color:var(--text-dim);font-size:12px">CAPTCHA yuklanmadi</p>'; }
}
