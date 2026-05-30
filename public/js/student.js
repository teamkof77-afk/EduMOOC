import { render, showModal, showLoading, showConfetti, getToken, getUser, api } from './app.js';
import { initVideoPlayer } from './video-player.js';

export function showRoleSelect() {
  const user = getUser();
  render(`
    <div class="role-select">
      <div style="text-align:center;position:relative;z-index:1;width:100%">
        <div style="margin-bottom:40px">
          <h2 style="font-size:28px">Xush kelibsiz, ${user?.firstName || 'Foydalanuvchi'}!</h2>
          <p style="color:var(--text-dim)">Qaysi bo'limga o'tmoqchisiz?</p>
        </div>
        <div class="role-grid" style="margin:0 auto">
          <div class="role-card" id="goStudent">
            <div class="icon">🎓</div>
            <h3>Talaba</h3>
            <p>Kurslarni o'rganing, videolarni tomosha qiling va sertifikat oling</p>
            <button class="btn">Kirish</button>
          </div>
          <div class="role-card" id="goTeacher" style="${user?.role === 'teacher' || user?.role === 'admin' ? '' : 'opacity:0.5;pointer-events:none'}">
            <div class="icon">👨‍🏫</div>
            <h3>O'qituvchi</h3>
            <p>Kurslaringizni boshqaring va talabalarni kuzating</p>
            <button class="btn btn-outline">Kirish</button>
          </div>
        </div>
      </div>
    </div>
  `);
  document.getElementById('goStudent').addEventListener('click', () => window.location.hash = '#/student');
  const goTeacher = document.getElementById('goTeacher');
  if (goTeacher) goTeacher.addEventListener('click', () => window.location.hash = '#/teacher');
}

export async function showStudentDashboard() {
  showLoading();
  try {
    const [catRes, courseRes, progressRes] = await Promise.all([
      api('/api/courses/categories'),
      api('/api/courses'),
      api('/api/progress/my')
    ]);
    const categories = catRes.categories || [];
    const courses = courseRes.courses || [];
    const progressList = progressRes.progress || [];
    const user = getUser();

    const categoryMap = {
      ai: 'Artificial Intelligence and Technologies',
      programming: 'Programming and Data Processing',
      marketing: 'Digital Marketing and Content Creation',
      design: 'Design (Visual)'
    };

    let catsHtml = categories.map(cat => {
      const engCat = categoryMap[cat.id] || cat.title;
      const catCourses = courses.filter(c => c.category === engCat);
      const count = catCourses.length;
      return `
        <div class="category-card" onclick="window.location.hash='#/student/course/${encodeURIComponent(engCat)}'">
          <div class="cat-icon">${cat.icon}</div>
          <h3>${cat.title}</h3>
          <p>${cat.desc}</p>
          <span class="course-count">${count} ta kurs</span>
        </div>
      `;
    }).join('');

    let progressHtml = '';
    if (progressList.length > 0) {
      progressHtml = progressList.slice(0, 3).map(p => {
        const course = courses.find(c => c._id === (p.courseId?._id || p.courseId));
        if (!course) return '';
        return `
          <div class="course-card" onclick="window.location.hash='#/student/course/${course._id}'" style="cursor:pointer">
            <div class="card-body">
              <h3>${course.title}</h3>
              <div class="progress-bar"><div class="fill" style="width:${p.overallProgress || 0}%"></div></div>
              <p style="font-size:13px;color:var(--text-dim);margin-top:4px">${p.overallProgress || 0}% tugallangan</p>
            </div>
          </div>
        `;
      }).filter(Boolean).join('');
    }

    render(`
      <div class="dashboard">
        <!-- NAVBAR -->
        <div class="navbar">
          <div class="navbar-inner">
            <a class="brand" href="#/student" style="text-decoration:none"><span>Edu</span><span>MOOC</span></a>
            <div class="sd-nav-links">
              <a class="sd-nav-link active" href="#/student">Bosh sahifa</a>
              <a class="sd-nav-link" onclick="document.getElementById('sdCourses').scrollIntoView({behavior:'smooth'})">Kurslar</a>
              <a class="sd-nav-link" onclick="document.getElementById('sdBlog').scrollIntoView({behavior:'smooth'})">Blog</a>
              <a class="sd-nav-link" onclick="document.getElementById('sdAbout').scrollIntoView({behavior:'smooth'})">Biz haqimizda</a>
            </div>
            <div class="nav-right">
              <span class="user-info"><strong>${user?.firstName || ''}</strong> | Talaba</span>
              <button class="btn btn-sm btn-outline" id="certificatesBtn">🏆 Sertifikatlar</button>
              <button class="btn btn-sm btn-outline" id="logoutBtn">Chiqish</button>
            </div>
          </div>
        </div>

        <!-- SECTION 1: HERO BANNER -->
        <section class="sd-hero">
          <div class="sd-hero-overlay"></div>
          <div class="sd-hero-content">
            <div class="sd-hero-badge">🎓 O'zbekistondagi #1 Onlayn Ta'lim Platformasi</div>
            <h1>ZAMONAVIY KASBLARNI<br>O'RGANING —<br><span class="sd-hero-accent">KELAJAKNI QURING</span></h1>
            <p>Sun'iy intellekt, dasturlash, marketing va dizayn yo'nalishlari bo'yicha professional kurslar. Real loyihalar, sertifikatlar va karyera imkoniyatlari.</p>
            <div class="sd-hero-actions">
              <button class="btn btn-lg sd-hero-btn" onclick="document.getElementById('sdCourses').scrollIntoView({behavior:'smooth'})">Kurslarni ko'rish →</button>
              <button class="btn btn-lg btn-outline" id="heroAboutBtn">Biz haqimizda</button>
            </div>
            <div class="sd-hero-stats">
              <div class="sd-hs"><span class="sd-hs-num">10,000+</span><span class="sd-hs-label">Talabalar</span></div>
              <div class="sd-hs-sep"></div>
              <div class="sd-hs"><span class="sd-hs-num">50+</span><span class="sd-hs-label">Kurslar</span></div>
              <div class="sd-hs-sep"></div>
              <div class="sd-hs"><span class="sd-hs-num">4</span><span class="sd-hs-label">Yo'nalish</span></div>
              <div class="sd-hs-sep"></div>
              <div class="sd-hs"><span class="sd-hs-num">95%</span><span class="sd-hs-label">Muvaffaqiyat</span></div>
            </div>
          </div>
          <div class="sd-hero-visual">
            <div class="sd-hero-orb sd-orb1"></div>
            <div class="sd-hero-orb sd-orb2"></div>
            <div class="sd-hero-float-cards">
              <div class="sd-fc sd-fc1"><span>🤖</span> AI & ML</div>
              <div class="sd-fc sd-fc2"><span>💻</span> Dasturlash</div>
              <div class="sd-fc sd-fc3"><span>📊</span> Marketing</div>
              <div class="sd-fc sd-fc4"><span>🎨</span> Dizayn</div>
            </div>
          </div>
        </section>

        <!-- SECTION 2: KURSLAR (Courses) -->
        <section class="sd-section" id="sdCourses">
          <div class="container">
            <div class="sd-section-header">
              <div class="sd-section-tag">📚 Yo'nalishlar</div>
              <h2 class="sd-section-title">Kurslar yo'nalishlari</h2>
              <p class="sd-section-sub">Qaysi sohani o'rganmoqchisiz? Yo'nalishni tanlang va bilim olishni boshlang</p>
            </div>
            <div class="categories-grid">${catsHtml || '<p style="color:var(--text-dim);text-align:center">Hozircha kurslar mavjud emas</p>'}</div>
            ${progressHtml ? `
              <div class="sd-section-header" style="padding-top:40px">
                <div class="sd-section-tag">📊 Jarayondagi</div>
                <h2 class="sd-section-title">Davom etayotgan kurslar</h2>
              </div>
              <div class="courses-grid">${progressHtml}</div>
            ` : ''}
          </div>
        </section>

        <!-- SECTION 3: BLOG / YANGILIKLAR -->
        <section class="sd-section sd-section-alt" id="sdBlog">
          <div class="container">
            <div class="sd-section-header">
              <div class="sd-section-tag">📰 Blog</div>
              <h2 class="sd-section-title">Yangiliklar va maqolalar</h2>
              <p class="sd-section-sub">IT sohasidagi eng so'nggi yangiliklar va foydali maqolalar</p>
            </div>
            <div class="sd-blog-grid">
              <div class="sd-blog-card">
                <div class="sd-blog-img" style="background:linear-gradient(135deg,rgba(108,99,255,0.3),rgba(0,210,255,0.2))">
                  <div class="sd-blog-img-icon">🤖</div>
                </div>
                <div class="sd-blog-body">
                  <div class="sd-blog-meta">
                    <span class="sd-blog-tag">Yangiliklar</span>
                    <span class="sd-blog-date">📅 28-may, 2025</span>
                    <span class="sd-blog-views">👁 146</span>
                  </div>
                  <h3>Sun'iy intellekt: SI gallyutsinatsiyasi nima va undan qanday qochish kerak?</h3>
                  <p>ChatGPT va boshqa SI tizimlari nega noto'g'ri ma'lumot beradi? Real misollar va xatolarni kamaytirish usullari...</p>
                  <span class="sd-blog-link">Batafsil →</span>
                </div>
              </div>
              <div class="sd-blog-card">
                <div class="sd-blog-img" style="background:linear-gradient(135deg,rgba(255,107,107,0.3),rgba(255,217,61,0.2))">
                  <div class="sd-blog-img-icon">🎨</div>
                </div>
                <div class="sd-blog-body">
                  <div class="sd-blog-meta">
                    <span class="sd-blog-tag sd-tag-design">Dizayn</span>
                    <span class="sd-blog-date">📅 23-may, 2025</span>
                    <span class="sd-blog-views">👁 55</span>
                  </div>
                  <h3>Sun'iy intellekt davrida grafik dizayn holati qanday?</h3>
                  <p>SI grafik dizaynni yo'q qilyaptimi yoki yangi imkoniyat yaratyaptimi? Grafik dizayn kelajagi...</p>
                  <span class="sd-blog-link">Batafsil →</span>
                </div>
              </div>
              <div class="sd-blog-card">
                <div class="sd-blog-img" style="background:linear-gradient(135deg,rgba(0,210,160,0.3),rgba(108,99,255,0.2))">
                  <div class="sd-blog-img-icon">💻</div>
                </div>
                <div class="sd-blog-body">
                  <div class="sd-blog-meta">
                    <span class="sd-blog-tag sd-tag-prog">Dasturlash</span>
                    <span class="sd-blog-date">📅 20-may, 2025</span>
                    <span class="sd-blog-views">👁 89</span>
                  </div>
                  <h3>To'g'ri prompt yozish: SI'dan samarali foydalanish qo'llanmasi</h3>
                  <p>To'g'ri prompt orqali SI'dan samarali foydalanib, ish unumdorligini oshirish yo'llari...</p>
                  <span class="sd-blog-link">Batafsil →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 4: BIZ HAQIMIZDA -->
        <section class="sd-section" id="sdAbout">
          <div class="container">
            <div class="sd-section-header">
              <div class="sd-section-tag">🏢 Biz haqimizda</div>
              <h2 class="sd-section-title">"EduMOOC" bu —</h2>
            </div>
            <div class="sd-about-grid">
              <div class="sd-about-card">
                <div class="sd-about-icon" style="background:linear-gradient(135deg,#6C63FF22,#6C63FF44)">🏛️</div>
                <p>Dasturlash, dizayn va marketing kabi zamonaviy kasblarni o'rgatiladigan <strong>innovatsion ta'lim platformasi</strong>.</p>
              </div>
              <div class="sd-about-card">
                <div class="sd-about-icon" style="background:linear-gradient(135deg,#00D2FF22,#00D2FF44)">🏠</div>
                <p>Zamonaviy kasblar yordamida insonlar hayotini yaxshilovchi va <strong>kelajakka bo'lgan ishonchni mustahkamlovchi</strong> maskan.</p>
              </div>
              <div class="sd-about-card">
                <div class="sd-about-icon" style="background:linear-gradient(135deg,#FF6B6B22,#FF6B6B44)">👥</div>
                <p>Bir vaqtning o'zida <strong>10,000 dan ortiq o'quvchilar</strong> va 50 dan ortiq katta jamoani bir maskanga yig'a olgan ta'lim va innovatsiya markazi.</p>
              </div>
            </div>
            <!-- Photo Gallery -->
            <div class="sd-gallery">
              <div class="sd-gallery-item" style="background:linear-gradient(135deg,rgba(108,99,255,0.2),rgba(0,210,255,0.15))">
                <div class="sd-gallery-placeholder">🎓<br><span>Ta'lim jarayoni</span></div>
              </div>
              <div class="sd-gallery-item" style="background:linear-gradient(135deg,rgba(0,210,255,0.2),rgba(0,210,160,0.15))">
                <div class="sd-gallery-placeholder">💻<br><span>Amaliy mashg'ulotlar</span></div>
              </div>
              <div class="sd-gallery-item" style="background:linear-gradient(135deg,rgba(255,107,107,0.2),rgba(255,217,61,0.15))">
                <div class="sd-gallery-placeholder">🏆<br><span>Sertifikat topshiriq</span></div>
              </div>
              <div class="sd-gallery-item" style="background:linear-gradient(135deg,rgba(255,107,157,0.2),rgba(108,99,255,0.15))">
                <div class="sd-gallery-placeholder">🤝<br><span>Jamoa ishlari</span></div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 5: NEGA BIZDA O'QISH KERAK -->
        <section class="sd-section sd-section-alt" id="sdFeatures">
          <div class="container">
            <div class="sd-section-header">
              <div class="sd-section-tag">✨ Afzalliklar</div>
              <h2 class="sd-section-title">Nima uchun "EduMOOC"da o'qish kerak?</h2>
            </div>
            <div class="sd-features-grid">
              <div class="sd-feature-card">
                <div class="sd-feature-icon" style="background:linear-gradient(135deg,#6C63FF,#8B5CF6)">🖥️</div>
                <h3>Bepul platforma</h3>
                <p>Barcha kurslardan foydalanish bepul. 24/7 formatda istalgan qurilmadan kiring va o'rganing.</p>
              </div>
              <div class="sd-feature-card">
                <div class="sd-feature-icon" style="background:linear-gradient(135deg,#00D2FF,#00B4D8)">⭐</div>
                <h3>Sifatli ta'lim</h3>
                <p>Doimiy yangilanib boradigan kurslar va katta tajribaga ega ustozlar. Real loyihalar asosida o'rganasiz.</p>
              </div>
              <div class="sd-feature-card">
                <div class="sd-feature-icon" style="background:linear-gradient(135deg,#00d2a0,#00b894)">⚡</div>
                <h3>Doimiy musobaqalar</h3>
                <p>Dasturlash, dizayn va marketing sohalari bo'yicha haftalik sovrinli musobaqalar va hackathonlar.</p>
              </div>
              <div class="sd-feature-card">
                <div class="sd-feature-icon" style="background:linear-gradient(135deg,#FF6B6B,#ee5a24)">🎯</div>
                <h3>Bepul mahorat darslari</h3>
                <p>Soha mutaxassislari bilan doimiy o'tkaziladigan bepul master-klasslar va ochiq darslar.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 6: FOOTER -->
        <footer class="sd-footer">
          <div class="container">
            <div class="sd-footer-grid">
              <div class="sd-footer-brand">
                <div class="sd-footer-logo"><span style="color:var(--primary)">Edu</span><span style="color:var(--secondary)">MOOC</span></div>
                <p>O'zbekistondagi zamonaviy online ta'lim platformasi. Professional kurslar, sertifikatlar va karyera imkoniyatlari.</p>
              </div>
              <div class="sd-footer-col">
                <h4>Platforma</h4>
                <a onclick="document.getElementById('sdCourses').scrollIntoView({behavior:'smooth'})">Kurslar</a>
                <a onclick="window.location.hash='#/student/certificates'">Sertifikatlar</a>
                <a onclick="document.getElementById('sdBlog').scrollIntoView({behavior:'smooth'})">Blog</a>
              </div>
              <div class="sd-footer-col">
                <h4>Yo'nalishlar</h4>
                <a>Sun'iy Intellekt</a>
                <a>Dasturlash</a>
                <a>Marketing</a>
                <a>Dizayn</a>
              </div>
              <div class="sd-footer-col">
                <h4>Bog'lanish</h4>
                <a>📧 info@edumooc.uz</a>
                <a>📞 +998 90 000 00 00</a>
                <a>📍 Toshkent, O'zbekiston</a>
              </div>
            </div>
            <div class="sd-footer-bottom">
              <span>© 2025 EduMOOC. Barcha huquqlar himoyalangan.</span>
            </div>
          </div>
        </footer>
      </div>
    `);

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.clear();
      window.location.hash = '#/';
    });
    const certBtn = document.getElementById('certificatesBtn');
    if (certBtn) certBtn.addEventListener('click', () => window.location.hash = '#/student/certificates');
    const heroAboutBtn = document.getElementById('heroAboutBtn');
    if (heroAboutBtn) heroAboutBtn.addEventListener('click', () => {
      document.getElementById('sdAbout').scrollIntoView({behavior:'smooth'});
    });
  } catch (err) {
    console.error(err);
    render('<p style="text-align:center;padding:60px;color:red">Xatolik yuz berdi</p>');
  }
}

export async function showCourseDetail(courseIdOrCategoryEncoded) {
  showLoading();
  try {
    const courseIdOrCategory = decodeURIComponent(courseIdOrCategoryEncoded);
    let courses, categoryTitle;
    const allCourses = await api('/api/courses');
    if (!allCourses.success) { showModal('Kurslarni yuklashda xatolik', true); return; }

    const isCategory = courseIdOrCategory.includes('Intelligence') || courseIdOrCategory.includes('Programming') ||
      courseIdOrCategory.includes('Marketing') || courseIdOrCategory.includes('Design');

    if (isCategory) {
      courses = allCourses.courses.filter(c => c.category === courseIdOrCategory);
      categoryTitle = courseIdOrCategory;
    } else {
      const course = allCourses.courses.find(c => c._id === courseIdOrCategory);
      if (course) { courses = [course]; categoryTitle = course.title; }
      else { courses = allCourses.courses; categoryTitle = 'Barcha kurslar'; }
    }

    const progressRes = await api('/api/progress/my');
    const progressList = progressRes.progress || [];

    const user = getUser();
    render(`
      <div class="dashboard">
        <div class="navbar">
          <div class="navbar-inner">
            <div class="brand"><span>Edu</span><span>MOOC</span></div>
            <div class="nav-right">
              <span class="user-info"><strong>${user?.firstName || ''}</strong> | Talaba</span>
              <button class="btn btn-sm btn-outline" id="backBtn">← Orqaga</button>
              <button class="btn btn-sm btn-outline" id="logoutBtn2">Chiqish</button>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="dashboard-header">
            <h2>${categoryTitle || 'Kurslar'}</h2>
            <p>${isCategory ? 'Ushbu yo\'nalishdagi barcha kurslar' : ''}</p>
          </div>
          ${courses.length === 0 ? '<div class="empty-state"><div class="empty-icon">📭</div><h3>Hozircha kurslar yo\'q</h3><p>Tez orada yangi kurslar qo\'shiladi</p></div>' : `
          <div class="courses-grid">
            ${courses.map(course => {
              const prog = progressList.find(p => (p.courseId?._id || p.courseId) === course._id);
              const pct = prog ? prog.overallProgress || 0 : 0;
              const vidCount = course.videos?.length || 0;
              const iconMap = {
                'Artificial Intelligence and Technologies': '🤖',
                'Programming and Data Processing': '💻',
                'Digital Marketing and Content Creation': '📊',
                'Design (Visual)': '🎨',
                'ai': '🤖', 'programming': '💻', 'marketing': '📊', 'design': '🎨'
              };
              return `
                <div class="course-card" onclick="window.location.hash='#/student/video/${course._id}'">
                  <div class="card-top">
                    <div class="course-icon">${iconMap[course.category] || '📚'}</div>
                  </div>
                  <div class="card-body">
                    <h3>${course.title}</h3>
                    <p>${course.description || 'Kurs haqida batafsil ma\'lumot'}</p>
                    ${pct > 0 ? `<div class="progress-bar" style="margin-top:12px"><div class="fill" style="width:${pct}%"></div></div>` : ''}
                  </div>
                  <div class="card-footer">
                    <span class="badge">${course.category?.split(' ').slice(0, 2).join(' ') || 'Kurs'}</span>
                    <span class="video-count">📹 ${vidCount} ta video ${pct > 0 ? `| ${pct}%` : ''}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>`}
        </div>
      </div>
    `);
    document.getElementById('backBtn').addEventListener('click', () => window.location.hash = '#/student');
    document.getElementById('logoutBtn2').addEventListener('click', () => { localStorage.clear(); window.location.hash = '#/'; });
  } catch (err) {
    console.error(err);
    showModal('Xatolik yuz berdi', true);
  }
}

export async function showVideoPlayer(courseId, videoId) {
  showLoading();
  try {
    const [courseRes, progressRes] = await Promise.all([
      api(`/api/courses/${courseId}`),
      api(`/api/progress/course/${courseId}`)
    ]);
    if (!courseRes.success) { showModal('Kurs topilmadi', true); return; }

    const course = courseRes.course;
    const videos = course.videos || [];
    const tests = courseRes.tests || [];
    const progress = progressRes.progress || { videosWatched: [], testsCompleted: [] };
    const user = getUser();

    if (videos.length === 0) {
      render(`<div style="padding-top:90px;text-align:center"><p>Bu kursda hali videolar mavjud emas</p><button class="btn" onclick="window.location.hash='#/student'">Orqaga</button></div>`);
      return;
    }

    const currentVideoId = videoId || videos[0]._id;
    const currentVideo = videos.find(v => v._id === currentVideoId) || videos[0];
    const currentIndex = videos.findIndex(v => v._id === currentVideo._id);
    const vidProgress = progress.videosWatched.find(v => (v.videoId?._id || v.videoId) === currentVideo._id);
    const testForVideo = tests.filter(t => t.videoId?.toString() === currentVideo._id.toString() || t.videoId === currentVideo._id);
    const testPassed = testForVideo.length > 0 ? progress.testsCompleted.some(t => {
      const tid = t.testId?._id || t.testId;
      return testForVideo.some(tf => tf._id.toString() === tid.toString()) && t.passed;
    }) : true;

    render(`
      <div class="navbar">
        <div class="navbar-inner">
          <div class="brand"><span>Edu</span><span>MOOC</span></div>
          <div class="nav-right">
            <span class="user-info"><strong>${user?.firstName || ''}</strong> | ${course.title}</span>
            <button class="btn btn-sm btn-outline" id="backToCourse">← Kursga qaytish</button>
            <button class="btn btn-sm btn-outline" id="logoutBtn3">Chiqish</button>
          </div>
        </div>
      </div>
      <div class="video-page">
        <div class="video-main">
          <div class="video-player-wrapper">
            <video id="eduVideo" src="${currentVideo.videoUrl?.startsWith('http') ? currentVideo.videoUrl : `/api/videos/stream/${currentVideo._id}`}" controls></video>
          </div>
          <div class="video-info">
            <h2>${currentVideo.title || 'Video dars'}</h2>
            <p>${currentVideo.description || ''}</p>
            <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
              ${currentIndex > 0 ? `<button class="btn btn-sm btn-outline" id="prevVideoBtn">← Oldingi dars</button>` : ''}
              ${currentIndex < videos.length - 1 ? `<button class="btn btn-sm" id="nextVideoBtn">Keyingi dars →</button>` : ''}
              ${testForVideo.length > 0 ? `<button class="btn btn-sm ${testPassed ? 'btn-success' : ''}" id="takeTestBtn">${testPassed ? '✅ Test topshirilgan' : '📝 Test topshirish'}</button>` : ''}
            </div>
          </div>
        </div>
        <div class="playlist">
          <h3>📋 Darslar ro'yxati</h3>
          ${videos.map((v, i) => {
            const vp = progress.videosWatched.find(p => (p.videoId?._id || p.videoId) === v._id);
            const isActive = v._id === currentVideo._id;
            const isCompleted = vp?.completed;
            const vidTests = tests.filter(t => t.videoId?.toString() === v._id.toString());
            const testOk = vidTests.length > 0 ? progress.testsCompleted.some(t => {
              const tid = t.testId?._id || t.testId;
              return vidTests.some(vt => vt._id.toString() === tid.toString()) && t.passed;
            }) : true;
            const done = isCompleted && testOk;
            return `
              <div class="playlist-item ${isActive ? 'active' : ''}" data-videoid="${v._id}">
                <div class="pl-num">${i + 1}</div>
                <div class="pl-info">
                  <h4>${v.title || `Dars ${i + 1}`}</h4>
                  <span>${done ? '✅ Tugallangan' : (vp ? `${Math.round((vp.watchedDuration / vp.totalDuration) * 100) || 0}%` : 'Ko\'rilmagan')}</span>
                </div>
                ${done ? '<span class="pl-check">✅</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `);
    document.getElementById('backToCourse').addEventListener('click', () => window.location.hash = '#/student');
    document.getElementById('logoutBtn3').addEventListener('click', () => { localStorage.clear(); window.location.hash = '#/'; });

    document.querySelectorAll('.playlist-item').forEach(el => {
      el.addEventListener('click', () => {
        window.location.hash = `#/student/video/${courseId}/${el.dataset.videoid}`;
      });
    });

    const prevBtn = document.getElementById('prevVideoBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => window.location.hash = `#/student/video/${courseId}/${videos[currentIndex - 1]._id}`);
    const nextBtn = document.getElementById('nextVideoBtn');
    if (nextBtn) nextBtn.addEventListener('click', () => window.location.hash = `#/student/video/${courseId}/${videos[currentIndex + 1]._id}`);
    const testBtn = document.getElementById('takeTestBtn');
    if (testBtn && !testPassed) testBtn.addEventListener('click', () => window.location.hash = `#/student/test/${courseId}/${testForVideo[0]._id}`);

    initVideoPlayer(currentVideo, courseId, progress);
  } catch (err) {
    console.error(err);
    showModal('Video yuklashda xatolik', true);
  }
}

export async function showTestPage(courseId, testId) {
  showLoading();
  try {
    const [testRes, courseRes, progressRes] = await Promise.all([
      api(`/api/tests/${testId}`),
      api(`/api/courses/${courseId}`),
      api(`/api/progress/course/${courseId}`)
    ]);
    if (!testRes.success) { showModal('Test topilmadi', true); return; }
    const test = testRes.test;
    const course = courseRes.course;
    const progress = progressRes.progress;
    const user = getUser();

    const existingTest = progress?.testsCompleted?.find(t => {
      const tid = t.testId?._id || t.testId;
      return tid?.toString() === testId;
    });

    if (existingTest?.passed) {
      showModal('Siz bu testni allaqachon topshirgansiz!', false, () => {
        window.location.hash = `#/student/video/${courseId}`;
      });
      return;
    }

    render(`
      <div class="navbar">
        <div class="navbar-inner">
          <div class="brand"><span>Edu</span><span>MOOC</span></div>
          <div class="nav-right">
            <span class="user-info"><strong>${user?.firstName || ''}</strong> | Test</span>
            <button class="btn btn-sm btn-outline" id="backFromTest">← Orqaga</button>
            <button class="btn btn-sm btn-outline" id="logoutBtn4">Chiqish</button>
          </div>
        </div>
      </div>
      <div class="test-page">
        <div class="test-header">
          <h2>📝 Test: ${course?.title || ''}</h2>
          <p>${test.questions?.length || 0} ta savol | 70% to'plash kerak</p>
        </div>
        <form id="testForm">
          ${(test.questions || []).map((q, i) => `
            <div class="test-question">
              <h4><span class="q-num">${i + 1}.</span> ${q.question}</h4>
              ${q.options.map((opt, oi) => `
                <label class="test-option">
                  <input type="radio" name="q_${i}" value="${oi}" required />
                  <span>${opt}</span>
                </label>
              `).join('')}
            </div>
          `).join('')}
          <button class="btn btn-lg" style="width:100%" type="submit" id="submitTestBtn">✅ Testni yakunlash</button>
        </form>
      </div>
    `);
    document.getElementById('backFromTest').addEventListener('click', () => window.location.hash = `#/student/video/${courseId}`);
    document.getElementById('logoutBtn4').addEventListener('click', () => { localStorage.clear(); window.location.hash = '#/'; });

    document.querySelectorAll('.test-option').forEach(el => {
      el.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        this.closest('.test-question').querySelectorAll('.test-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
      });
    });

    document.getElementById('testForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitTestBtn');
      btn.disabled = true; btn.textContent = 'Tekshirilmoqda...';
      const formData = new FormData(e.target);
      const answers = {};
      test.questions.forEach((_, i) => {
        const val = formData.get(`q_${i}`);
        if (val !== null) answers[i] = parseInt(val);
      });
      const res = await api('/api/tests/check', {
        method: 'POST', body: JSON.stringify({ testId, answers })
      });
      if (res.success) {
        await api('/api/progress/test', {
          method: 'POST', body: JSON.stringify({ courseId, testId, score: res.score })
        });
        const passed = res.passed;
        if (passed) {
          showConfetti();
          const msg = `🎉 Tabriklaymiz! Testdan muvaffaqiyatli o'tdingiz!\n\nTo'g'ri javoblar: ${res.correct}/${res.total}\nNatija: ${res.score}%`;
          showModal(msg, false, () => window.location.hash = `#/student/video/${courseId}`);
        } else {
          showModal(`Testdan o'ta olmadingiz.\nTo'g'ri javoblar: ${res.correct}/${res.total}\nNatija: ${res.score}%\n\n70% to'plash kerak. Qayta urinib ko'ring!`, true, () => {
            window.location.hash = `#/student/video/${courseId}`;
          });
        }
      } else {
        showModal('Testni tekshirishda xatolik', true);
        btn.disabled = false; btn.textContent = '✅ Testni yakunlash';
      }
    });
  } catch (err) {
    console.error(err);
    showModal('Xatolik yuz berdi', true);
  }
}

export async function showCertificates() {
  showLoading();
  try {
    const res = await api('/api/certificates/my');
    const certs = res.certificates || [];
    const user = getUser();
    render(`
      <div class="dashboard">
        <div class="navbar">
          <div class="navbar-inner">
            <div class="brand"><span>Edu</span><span>MOOC</span></div>
            <div class="nav-right">
              <span class="user-info"><strong>${user?.firstName || ''}</strong> | Sertifikatlar</span>
              <button class="btn btn-sm btn-outline" id="backBtn2">← Orqaga</button>
              <button class="btn btn-sm btn-outline" id="logoutBtn5">Chiqish</button>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="dashboard-header">
            <h2>🏆 Mening Sertifikatlarim</h2>
            <p>Kurslarni muvaffaqiyatli yakunlaganingiz uchun sertifikatlar</p>
          </div>
          ${certs.length === 0 ? '<div class="empty-state"><div class="empty-icon">🏆</div><h3>Sertifikatlar mavjud emas</h3><p>Kurslarni yakunlab, sertifikatga ega bo\'ling!</p></div>' : `
          <div class="courses-grid">
            ${certs.map(cert => `
              <div class="cert-card">
                <div class="cert-badge">🏆</div>
                <h3>${cert.courseId?.title || 'Kurs'}</h3>
                <p>Sertifikat raqami: ${cert.certificateNumber?.slice(0, 8) + '...' || 'N/A'}</p>
                <p style="font-size:12px">Berilgan sana: ${new Date(cert.issuedAt).toLocaleDateString('uz-UZ')}</p>
                <div style="display:flex;gap:12px;justify-content:center;margin-top:16px">
                  <button class="btn btn-sm downloadCert" data-courseid="${cert.courseId?._id || cert.courseId}">📥 Yuklab olish</button>
                </div>
              </div>
            `).join('')}
          </div>`}
        </div>
      </div>
    `);
    document.getElementById('backBtn2').addEventListener('click', () => window.location.hash = '#/student');
    document.getElementById('logoutBtn5').addEventListener('click', () => { localStorage.clear(); window.location.hash = '#/'; });
    document.querySelectorAll('.downloadCert').forEach(btn => {
      btn.addEventListener('click', async () => {
        const token = getToken();
        window.open(`/api/certificates/download/${btn.dataset.courseid}?token=${token}`, '_blank');
      });
    });
  } catch (err) {
    console.error(err);
    showModal('Xatolik yuz berdi', true);
  }
}
