import { render, showModal, api, setAuth, clearAuth } from './app.js';

export async function showLanding() {
  const token = localStorage.getItem('token');
  if (token) {
    const me = await api('/api/auth/me');
    if (me.success) {
      setAuth(token, me.user.role, me.user);
      if (me.user.role === 'admin') { window.location.hash = '#/admin'; return; }
      if (me.user.role === 'teacher') { window.location.hash = '#/teacher'; return; }
      window.location.hash = '#/student'; return;
    } else {
      clearAuth();
    }
  }

  render(`
    <div class="landing-page">
      <!-- NAVBAR -->
      <nav class="landing-nav" id="landingNav">
        <div class="landing-nav-inner">
          <a class="landing-brand" href="#/">
            <span class="brand-edu">Edu</span><span class="brand-mooc">MOOC</span>
          </a>
          <div class="landing-nav-links" id="navLinks">
            <a href="#features" class="nav-link" onclick="document.getElementById('featuresSection').scrollIntoView({behavior:'smooth'});return false">Imkoniyatlar</a>
            <a href="#courses" class="nav-link" onclick="document.getElementById('coursesSection').scrollIntoView({behavior:'smooth'});return false">Kurslar</a>
            <a href="#stats" class="nav-link" onclick="document.getElementById('statsSection').scrollIntoView({behavior:'smooth'});return false">Statistika</a>
          </div>
          <div class="landing-nav-actions">
            <button class="btn btn-outline btn-sm" id="goLogin">Kirish</button>
            <button class="btn btn-sm" id="goRegister">Boshlash →</button>
          </div>
          <button class="nav-hamburger" id="hamburger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
        <!-- Mobile menu -->
        <div class="mobile-menu" id="mobileMenu">
          <a class="mobile-link" onclick="document.getElementById('featuresSection').scrollIntoView({behavior:'smooth'});document.getElementById('mobileMenu').classList.remove('open')">Imkoniyatlar</a>
          <a class="mobile-link" onclick="document.getElementById('coursesSection').scrollIntoView({behavior:'smooth'});document.getElementById('mobileMenu').classList.remove('open')">Kurslar</a>
          <a class="mobile-link" onclick="document.getElementById('statsSection').scrollIntoView({behavior:'smooth'});document.getElementById('mobileMenu').classList.remove('open')">Statistika</a>
          <button class="btn btn-outline btn-sm" style="margin-top:8px" id="mobileLogin">Kirish</button>
          <button class="btn btn-sm" style="margin-top:8px" id="mobileRegister">Ro'yxatdan o'tish</button>
        </div>
      </nav>

      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-bg-orbs">
          <div class="orb orb1"></div>
          <div class="orb orb2"></div>
          <div class="orb orb3"></div>
        </div>
        <div class="hero-content">
          <div class="hero-badge">🚀 O'zbekistondagi #1 Online Ta'lim Platformasi</div>
          <h1 class="hero-title">
            Kelajak uchun<br>
            <span class="hero-gradient">bilim oling</span><br>
            hozirdanoq
          </h1>
          <p class="hero-desc">
            Sun'iy intellekt, dasturlash, marketing va dizayn yo'nalishlari bo'yicha sertifikatli professional kurslar. O'z sur'atingizda o'rganing, karyerangizni rivojlantiring.
          </p>
          <div class="hero-actions">
            <button class="btn btn-lg hero-cta" id="heroCta">Bepul boshlash →</button>
            <button class="btn btn-lg btn-outline" id="heroLogin">Kirish</button>
          </div>
          <div class="hero-trust">
            <div class="trust-item"><span class="trust-num">10,000+</span><span class="trust-label">Talabalar</span></div>
            <div class="trust-divider"></div>
            <div class="trust-item"><span class="trust-num">50+</span><span class="trust-label">Kurslar</span></div>
            <div class="trust-divider"></div>
            <div class="trust-item"><span class="trust-num">95%</span><span class="trust-label">Muvaffaqiyat</span></div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card-float">
            <div class="float-card fc1">
              <span class="fc-icon">🤖</span>
              <div><strong>AI & Machine Learning</strong><span>42 dars</span></div>
            </div>
            <div class="float-card fc2">
              <span class="fc-icon">💻</span>
              <div><strong>Web Dasturlash</strong><span>67 dars</span></div>
            </div>
            <div class="float-card fc3">
              <span class="fc-icon">🎨</span>
              <div><strong>UI/UX Dizayn</strong><span>38 dars</span></div>
            </div>
            <div class="float-card fc4">
              <span class="fc-icon">📊</span>
              <div><strong>Digital Marketing</strong><span>55 dars</span></div>
            </div>
            <div class="hero-center-badge">
              <div class="center-ring"></div>
              <span>📚</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES SECTION -->
      <section class="features-section" id="featuresSection">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">✨ Nima uchun EduMOOC?</div>
            <h2 class="section-title">Professional ta'limning yangi standartlari</h2>
            <p class="section-sub">Biz faqat kurs emas, kelajagingizni yaratishga yordam beramiz</p>
          </div>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon-wrap" style="background:linear-gradient(135deg,#6C63FF22,#6C63FF11)">
                <span class="feature-icon">🎯</span>
              </div>
              <h3>Amaliy bilim</h3>
              <p>Faqat nazariya emas — real loyihalar va amaliy topshiriqlar orqali chuqur o'rganing</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap" style="background:linear-gradient(135deg,#00D2FF22,#00D2FF11)">
                <span class="feature-icon">🏆</span>
              </div>
              <h3>Rasmiy sertifikat</h3>
              <p>Kursni yakunlagach sertifikat oling va ish beruvchilarga isbotlang</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap" style="background:linear-gradient(135deg,#FF6B6B22,#FF6B6B11)">
                <span class="feature-icon">⚡</span>
              </div>
              <h3>O'z sur'atingizda</h3>
              <p>istalgan vaqt, istalgan joyda — mobil, planshet yoki kompyuterda o'rganing</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap" style="background:linear-gradient(135deg,#FFD93D22,#FFD93D11)">
                <span class="feature-icon">🤝</span>
              </div>
              <h3>Ekspert o'qituvchilar</h3>
              <p>Soha mutaxassislari tomonidan tayyorlangan, doim yangilanib turadigan kontentlar</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap" style="background:linear-gradient(135deg,#00d2a022,#00d2a011)">
                <span class="feature-icon">🔒</span>
              </div>
              <h3>Himoyalangan kontent</h3>
              <p>Videolarni yuklab olish va oldinga o'tkazish cheklangan — bilim esteticil o'zlashtiriladi</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap" style="background:linear-gradient(135deg,#ff6b9d22,#ff6b9d11)">
                <span class="feature-icon">📊</span>
              </div>
              <h3>Progress kuzatuv</h3>
              <p>Har bir dars va testdagi natijalaringiz real vaqtda kuzatib boriladi</p>
            </div>
          </div>
        </div>
      </section>

      <!-- COURSES SECTION -->
      <section class="courses-preview-section" id="coursesSection">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">📚 Yo'nalishlar</div>
            <h2 class="section-title">Qaysi sohani o'rganmoqchisiz?</h2>
            <p class="section-sub">4 ta asosiy yo'nalish bo'yicha professional kurslar</p>
          </div>
          <div class="courses-preview-grid">
            <div class="cp-card" style="--cp-color:#6C63FF">
              <div class="cp-top">
                <span class="cp-icon">🤖</span>
                <div class="cp-badge">Ommabop</div>
              </div>
              <h3>Sun'iy Intellekt</h3>
              <p>Machine Learning, Deep Learning, NLP va AI texnologiyalari asoslari</p>
              <div class="cp-footer">
                <span>📹 Video darslar</span>
                <span>📝 Testlar</span>
              </div>
            </div>
            <div class="cp-card" style="--cp-color:#00D2FF">
              <div class="cp-top">
                <span class="cp-icon">💻</span>
                <div class="cp-badge cp-badge-blue">Yangi</div>
              </div>
              <h3>Dasturlash</h3>
              <p>Web, mobil dasturlash, ma'lumotlar tahlili va baza boshqaruvi</p>
              <div class="cp-footer">
                <span>📹 Video darslar</span>
                <span>📝 Testlar</span>
              </div>
            </div>
            <div class="cp-card" style="--cp-color:#FF6B6B">
              <div class="cp-top">
                <span class="cp-icon">📊</span>
              </div>
              <h3>Digital Marketing</h3>
              <p>SEO, SMM, kontent marketing, branding va reklama strategiyalari</p>
              <div class="cp-footer">
                <span>📹 Video darslar</span>
                <span>📝 Testlar</span>
              </div>
            </div>
            <div class="cp-card" style="--cp-color:#FFD93D">
              <div class="cp-top">
                <span class="cp-icon">🎨</span>
              </div>
              <h3>Dizayn</h3>
              <p>UI/UX dizayn, grafik dizayn, motion va web dizayn yo'nalishlari</p>
              <div class="cp-footer">
                <span>📹 Video darslar</span>
                <span>📝 Testlar</span>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-top:40px">
            <button class="btn btn-lg" id="ctaAllCourses">Barcha kurslarni ko'rish →</button>
          </div>
        </div>
      </section>

      <!-- STATS SECTION -->
      <section class="stats-section" id="statsSection">
        <div class="section-container">
          <div class="stats-banner">
            <div class="stat-item">
              <div class="stat-num" data-target="10000">0</div>
              <div class="stat-lbl">Faol talabalar</div>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <div class="stat-num" data-target="50">0</div>
              <div class="stat-lbl">Professional kurslar</div>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <div class="stat-num" data-target="500">0</div>
              <div class="stat-lbl">Video darslar</div>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <div class="stat-num" data-target="95">0</div>
              <div class="stat-lbl">Muvaffaqiyat foizi %</div>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="how-section">
        <div class="section-container">
          <div class="section-header">
            <div class="section-tag">🗺️ Jarayon</div>
            <h2 class="section-title">Qanday ishlaydi?</h2>
          </div>
          <div class="how-grid">
            <div class="how-step">
              <div class="how-num">01</div>
              <h3>Ro'yxatdan o'ting</h3>
              <p>Bepul hisob yarating va platformaga kirish huquqiga ega bo'ling</p>
            </div>
            <div class="how-arrow">→</div>
            <div class="how-step">
              <div class="how-num">02</div>
              <h3>Kurs tanlang</h3>
              <p>O'zingizga mosini tanlang — 4 ta yo'nalishdan birini boshlang</p>
            </div>
            <div class="how-arrow">→</div>
            <div class="how-step">
              <div class="how-num">03</div>
              <h3>O'rganing</h3>
              <p>Video darslarni ko'ring, testlardan o'ting va bilimingizni mustahkamlang</p>
            </div>
            <div class="how-arrow">→</div>
            <div class="how-step">
              <div class="how-num">04</div>
              <h3>Sertifikat oling</h3>
              <p>Kursni tugatib, rasmiy sertifikatga ega bo'ling</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA SECTION -->
      <section class="cta-section">
        <div class="section-container">
          <div class="cta-box">
            <div class="cta-orb1"></div>
            <div class="cta-orb2"></div>
            <h2>Kelajagingizni bugun boshlang</h2>
            <p>Bepul ro'yxatdan o'ting va birinchi darsni hoziroq ko'ring</p>
            <div class="cta-actions">
              <button class="btn btn-lg cta-btn-white" id="ctaRegister">Bepul boshlash →</button>
              <button class="btn btn-lg btn-outline cta-btn-outline" id="ctaLogin">Tizimga kirish</button>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="landing-footer">
        <div class="section-container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="footer-logo"><span class="brand-edu">Edu</span><span class="brand-mooc">MOOC</span></div>
              <p>O'zbekistondagi zamonaviy online ta'lim platformasi. Professional kurslar va sertifikatlar.</p>
            </div>
            <div class="footer-links-col">
              <h4>Platforma</h4>
              <a>Kurslar</a>
              <a>Sertifikatlar</a>
              <a>O'qituvchilar</a>
            </div>
            <div class="footer-links-col">
              <h4>Yo'nalishlar</h4>
              <a>Sun'iy Intellekt</a>
              <a>Dasturlash</a>
              <a>Marketing</a>
              <a>Dizayn</a>
            </div>
            <div class="footer-links-col">
              <h4>Bog'lanish</h4>
              <a>info@edumooc.uz</a>
              <a>+998 90 000 00 00</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2025 EduMOOC. Barcha huquqlar himoyalangan.</span>
          </div>
        </div>
      </footer>
    </div>
  `);

  // Nav scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('landingNav');
    if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger menu
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('open');
  });

  // Buttons
  const goLogin = () => window.location.hash = '#/login';
  const goRegister = () => window.location.hash = '#/register';

  document.getElementById('goLogin').addEventListener('click', goLogin);
  document.getElementById('goRegister').addEventListener('click', goRegister);
  document.getElementById('heroLogin').addEventListener('click', goLogin);
  document.getElementById('heroCta').addEventListener('click', goRegister);
  document.getElementById('ctaAllCourses').addEventListener('click', goRegister);
  document.getElementById('ctaRegister').addEventListener('click', goRegister);
  document.getElementById('ctaLogin').addEventListener('click', goLogin);
  document.getElementById('mobileLogin').addEventListener('click', goLogin);
  document.getElementById('mobileRegister').addEventListener('click', goRegister);

  // Animated counters
  const animateCounter = (el, target) => {
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = start.toLocaleString();
      if (start >= target) clearInterval(timer);
    }, 16);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-num').forEach(el => {
          animateCounter(el, parseInt(el.dataset.target));
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('statsSection');
  if (statsSection) observer.observe(statsSection);
}

export function showLogin() {
  const token = localStorage.getItem('token');
  if (token) { window.location.hash = '#/student'; return; }
  render(`
    <div class="auth-page">
      <div class="auth-card">
        <div class="logo">
          <h1><span style="color:#6C63FF">Edu</span><span style="color:#00D2FF">MOOC</span></h1>
          <p>Tizimga kirish</p>
        </div>
        <h2>Kirish</h2>
        <form id="loginForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" id="loginEmail" placeholder="Email manzilingiz" required />
          </div>
          <div class="form-group">
            <label>Parol</label>
            <div class="password-wrap">
              <input type="password" name="password" id="loginPassword" placeholder="Parolingiz" required />
              <button type="button" class="toggle-pass" id="toggleLoginPass" aria-label="Parolni ko'rsatish">
                <svg id="eyeIconLogin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>CAPTCHA</label>
            <div class="captcha-box" id="captchaContainer"></div>
            <input type="text" name="captcha" placeholder="CAPTCHA kodini kiriting" required style="margin-top:8px" />
            <span class="captcha-refresh" id="refreshCaptcha">🔄 Yangi kod</span>
          </div>
          <button class="btn" style="width:100%;margin-top:8px" type="submit" id="loginBtn">Kirish</button>
        </form>
        <div class="auth-links">Hisobingiz yo'qmi? <a href="#/register" onclick="window.location.hash='#/register';return false">Ro'yxatdan o'tish</a></div>
        <div class="auth-links" style="margin-top:8px"><a href="#/" onclick="window.location.hash='#/';return false">← Bosh sahifaga qaytish</a></div>
      </div>
    </div>
  `);
  loadCaptcha();
  document.getElementById('refreshCaptcha').addEventListener('click', loadCaptcha);

  // Password toggle
  document.getElementById('toggleLoginPass').addEventListener('click', () => {
    const inp = document.getElementById('loginPassword');
    const svg = document.getElementById('eyeIconLogin');
    if (inp.type === 'password') {
      inp.type = 'text';
      svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
      inp.type = 'password';
      svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
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
        else if (result.role === 'teacher') window.location.hash = '#/teacher';
        else window.location.hash = '#/student';
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
  if (token) { window.location.hash = '#/student'; return; }
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
            <div class="password-wrap">
              <input type="password" name="password" id="regPassword" placeholder="Parolingiz (kamida 6 belgi)" minlength="6" required />
              <button type="button" class="toggle-pass" id="toggleRegPass" aria-label="Parolni ko'rsatish">
                <svg id="eyeIconReg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>CAPTCHA</label>
            <div class="captcha-box" id="captchaContainer"></div>
            <input type="text" name="captcha" placeholder="CAPTCHA kodini kiriting" required style="margin-top:8px" />
            <span class="captcha-refresh" id="refreshCaptcha">🔄 Yangi kod</span>
          </div>
          <button class="btn" style="width:100%;margin-top:8px" type="submit" id="regBtn">Ro'yxatdan o'tish</button>
        </form>
        <div class="auth-links">Hisobingiz bormi? <a href="#/login" onclick="window.location.hash='#/login';return false">Kirish</a></div>
        <div class="auth-links" style="margin-top:8px"><a href="#/" onclick="window.location.hash='#/';return false">← Bosh sahifaga qaytish</a></div>
      </div>
    </div>
  `);
  loadCaptcha();
  document.getElementById('refreshCaptcha').addEventListener('click', loadCaptcha);

  // Password toggle
  document.getElementById('toggleRegPass').addEventListener('click', () => {
    const inp = document.getElementById('regPassword');
    const svg = document.getElementById('eyeIconReg');
    if (inp.type === 'password') {
      inp.type = 'text';
      svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
      inp.type = 'password';
      svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  });

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('regBtn');
    btn.disabled = true; btn.textContent = 'Yuborilmoqda...';
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      showModal(result.message || "Muvaffaqiyatli ro'yxatdan o'tdingiz!", false, () => {
        window.location.hash = '#/login';
      });
    } else {
      showModal(result.message || 'Xatolik yuz berdi', true);
      loadCaptcha();
      btn.disabled = false; btn.textContent = "Ro'yxatdan o'tish";
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
