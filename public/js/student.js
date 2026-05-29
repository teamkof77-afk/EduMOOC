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
        <div class="navbar">
          <div class="navbar-inner">
            <div class="brand"><span>Edu</span><span>MOOC</span></div>
            <div class="nav-right">
              <span class="user-info"><strong>${user?.firstName || ''}</strong> | Talaba</span>
              <button class="btn btn-sm btn-outline" id="certificatesBtn">🏆 Sertifikatlar</button>
              <button class="btn btn-sm btn-outline" id="logoutBtn">Chiqish</button>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="dashboard-header">
            <h2>📚 Kurslar</h2>
            <p>Yo'nalishni tanlang va bilim olishni boshlang</p>
          </div>
          <div class="categories-grid">${catsHtml || '<p style="color:var(--text-dim);text-align:center">Hozircha kurslar mavjud emas</p>'}</div>
          ${progressHtml ? `<div class="dashboard-header" style="padding-top:20px"><h2>📊 Davom etayotgan kurslar</h2></div><div class="courses-grid">${progressHtml}</div>` : ''}
        </div>
      </div>
    `);
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.clear();
      window.location.hash = '#/';
    });
    const certBtn = document.getElementById('certificatesBtn');
    if (certBtn) certBtn.addEventListener('click', () => window.location.hash = '#/student/certificates');
  } catch (err) {
    console.error(err);
    render('<p style="text-align:center;padding:60px;color:red">Xatolik yuz berdi</p>');
  }
}

export async function showCourseDetail(courseIdOrCategory) {
  showLoading();
  try {
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
            <video id="eduVideo" src="/api/videos/stream/${currentVideo._id}" controls></video>
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
