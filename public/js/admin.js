import { render, showModal, showConfirm, showLoading, getUser, api, getToken } from './app.js';

const CATEGORIES = [
  'Artificial Intelligence and Technologies',
  'Programming and Data Processing',
  'Digital Marketing and Content Creation',
  'Design (Visual)'
];

export async function showAdminPanel(section = 'stats') {
  const token = localStorage.getItem('token');
  const user = getUser();
  if (!token) { window.location.hash = '#/'; return; }
  if (user?.role !== 'admin') {
    try {
      const me = await api('/api/auth/me');
      if (!me.success || me.user.role !== 'admin') {
        showModal('Faqat admin uchun', true);
        window.location.hash = '#/role';
        return;
      }
    } catch {
      window.location.hash = '#/';
      return;
    }
  }

  render(`
    <div class="admin-layout">
      <div class="admin-sidebar">
        <div style="padding:20px 24px;border-bottom:1px solid var(--glass-border);margin-bottom:12px">
          <div class="brand" style="font-size:20px;font-weight:800"><span style="color:#6C63FF">Edu</span><span style="color:#00D2FF">MOOC</span></div>
          <div style="font-size:12px;color:var(--text-dim);margin-top:4px">Admin panel</div>
        </div>
        <a class="menu-item ${section === 'stats' ? 'active' : ''}" data-section="stats">📊 Statistika</a>
        <a class="menu-item ${section === 'users' ? 'active' : ''}" data-section="users">👥 Foydalanuvchilar</a>
        <a class="menu-item ${section === 'courses' ? 'active' : ''}" data-section="courses">📚 Kurslar</a>
        <a class="menu-item ${section === 'manage-videos' ? 'active' : ''}" data-section="manage-videos">🎬 Videolar boshqaruvi</a>
        <a class="menu-item ${section === 'add-course' ? 'active' : ''}" data-section="add-course">➕ Yangi kurs</a>
        <a class="menu-item ${section === 'add-video' ? 'active' : ''}" data-section="add-video">📹 Video qo'shish</a>
        <a class="menu-item ${section === 'add-test' ? 'active' : ''}" data-section="add-test">📝 Test qo'shish</a>
        <div style="border-top:1px solid var(--glass-border);margin-top:20px;padding-top:12px">
          <a class="menu-item" id="backToSite">← Saytga qaytish</a>
          <a class="menu-item" id="adminLogout">🚪 Chiqish</a>
        </div>
      </div>
      <div class="admin-main" id="adminContent">
        ${showLoading()}
      </div>
    </div>
  `);

  document.querySelectorAll('.menu-item[data-section]').forEach(el => {
    el.addEventListener('click', () => {
      const sec = el.dataset.section;
      window.location.hash = `#/admin/${sec}`;
    });
  });
  document.getElementById('backToSite').addEventListener('click', () => window.location.hash = '#/role');
  document.getElementById('adminLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.hash = '#/';
  });

  if (section === 'stats') renderStats();
  else if (section === 'users') renderUsers();
  else if (section === 'courses') renderCourses();
  else if (section === 'add-course') renderAddCourse();
  else if (section === 'add-video') renderAddVideo();
  else if (section === 'add-test') renderAddTest();
  else if (section === 'manage-videos') renderManageVideos();
}

async function renderStats() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  try {
    const res = await api('/api/admin/stats');
    const s = res.stats || {};
    container.innerHTML = `
      <h2>📊 Statistika</h2>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-value">${s.usersCount || 0}</div><div class="stat-label">Foydalanuvchilar</div></div>
        <div class="stat-card"><div class="stat-icon">🎓</div><div class="stat-value">${s.studentsCount || 0}</div><div class="stat-label">Talabalar</div></div>
        <div class="stat-card"><div class="stat-icon">👨‍🏫</div><div class="stat-value">${s.teachersCount || 0}</div><div class="stat-label">O'qituvchilar</div></div>
        <div class="stat-card"><div class="stat-icon">📚</div><div class="stat-value">${s.coursesCount || 0}</div><div class="stat-label">Kurslar</div></div>
        <div class="stat-card"><div class="stat-icon">🎬</div><div class="stat-value">${s.videosCount || 0}</div><div class="stat-label">Videolar</div></div>
        <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-value">${s.testsCount || 0}</div><div class="stat-label">Testlar</div></div>
        <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-value">${s.certificatesCount || 0}</div><div class="stat-label">Sertifikatlar</div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-value">${s.progressCount || 0}</div><div class="stat-label">Kurs yakunlaganlar</div></div>
      </div>
      <div style="margin-top:30px">
        <h3 style="margin-bottom:16px">📈 Qisqacha tahlil</h3>
        <div class="settings-section">
          <p style="color:var(--text-dim);line-height:1.8">Platformada jami <strong style="color:var(--text)">${s.usersCount || 0}</strong> ta foydalanuvchi, shundan <strong style="color:var(--text)">${s.studentsCount || 0}</strong> ta talaba va <strong style="color:var(--text)">${s.teachersCount || 0}</strong> ta o'qituvchi mavjud.<br>
          <strong style="color:var(--text)">${s.coursesCount || 0}</strong> ta kurs, <strong style="color:var(--text)">${s.videosCount || 0}</strong> ta video va <strong style="color:var(--text)">${s.testsCount || 0}</strong> ta test mavjud.<br>
          <strong style="color:var(--text)">${s.certificatesCount || 0}</strong> ta sertifikat berilgan.</p>
        </div>
      </div>
    `;
  } catch {
    container.innerHTML = '<p style="color:red">Statistika yuklanmadi</p>';
  }
}

async function renderUsers() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  container.innerHTML = '<h2>👥 Foydalanuvchilar</h2><div class="loading"><div class="spinner"></div></div>';
  try {
    const res = await api('/api/admin/users');
    const users = res.users || [];
    container.innerHTML = `
      <h2>👥 Foydalanuvchilar <span style="font-size:14px;color:var(--text-dim)">(${users.length} ta)</span></h2>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr>
            <th>Ism</th><th>Familiya</th><th>Email</th><th>Telefon</th><th>Rol</th><th>Qo'shilgan</th><th>Amallar</th>
          </tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.firstName}</strong></td>
                <td>${u.lastName}</td>
                <td>${u.email}</td>
                <td>${u.phone || '-'}</td>
                <td><select class="roleSelect" data-id="${u._id}" style="width:auto;padding:6px 12px;font-size:13px;border-radius:12px;background:rgba(255,255,255,0.05)">
                  <option value="student" ${u.role === 'student' ? 'selected' : ''}>Talaba</option>
                  <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>O'qituvchi</option>
                  <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select></td>
                <td style="font-size:13px;color:var(--text-dim)">${new Date(u.createdAt).toLocaleDateString('uz-UZ')}</td>
                <td>
                  <div class="actions">
                    ${u.email !== 'admin@gmail.com' ? `<button class="btn btn-sm btn-danger deleteUser" data-id="${u._id}">O'chirish</button>` : '<span style="font-size:12px;color:var(--primary);font-weight:600">Asosiy admin</span>'}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    document.querySelectorAll('.roleSelect').forEach(sel => {
      sel.addEventListener('change', async () => {
        const res = await api(`/api/admin/users/${sel.dataset.id}/role`, {
          method: 'PUT', body: JSON.stringify({ role: sel.value })
        });
        if (res.success) showModal('Rol muvaffaqiyatli o\'zgartirildi');
        else showModal('Xatolik yuz berdi', true);
      });
    });
    document.querySelectorAll('.deleteUser').forEach(btn => {
      btn.addEventListener('click', () => {
        showConfirm('Foydalanuvchini o\'chirish', 'Bu amalni ortga qaytarib bo\'lmaydi!', async () => {
          const res = await api(`/api/admin/users/${btn.dataset.id}`, { method: 'DELETE' });
          if (res.success) { showModal('Foydalanuvchi o\'chirildi'); renderUsers(); }
          else showModal('Xatolik yuz berdi', true);
        });
      });
    });
  } catch {
    container.innerHTML = '<p style="color:red">Foydalanuvchilar yuklanmadi</p>';
  }
}

async function renderCourses() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  container.innerHTML = '<h2>📚 Kurslar</h2><div class="loading"><div class="spinner"></div></div>';
  try {
    const res = await api('/api/admin/courses');
    const courses = res.courses || [];
    container.innerHTML = `
      <h2>📚 Kurslar <span style="font-size:14px;color:var(--text-dim)">(${courses.length} ta)</span></h2>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Nomi</th><th>Kategoriya</th><th>Videolar</th><th>Testlar</th><th>Qo'shilgan</th><th>Amallar</th></tr></thead>
          <tbody>
            ${courses.map(c => `
              <tr>
                <td><strong>${c.title}</strong></td>
                <td><span class="badge" style="padding:4px 12px;border-radius:12px;background:rgba(108,99,255,0.15);color:var(--primary);font-size:13px;font-weight:600">${c.category?.split(' ').slice(0, 2).join(' ') || 'N/A'}</span></td>
                <td><span style="display:inline-block;padding:2px 8px;background:rgba(255,255,255,0.05);border-radius:8px">${(c.videos || []).length} ta</span></td>
                <td><span style="display:inline-block;padding:2px 8px;background:rgba(255,255,255,0.05);border-radius:8px">${(c.tests || []).length} ta</span></td>
                <td style="font-size:13px;color:var(--text-dim)">${new Date(c.createdAt).toLocaleDateString('uz-UZ')}</td>
                <td><button class="btn btn-sm btn-danger deleteCourse" data-id="${c._id}">O'chirish</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    document.querySelectorAll('.deleteCourse').forEach(btn => {
      btn.addEventListener('click', () => {
        showConfirm('Kursni o\'chirish', 'Barcha videolar, testlar va talabalar natijalari o\'chiriladi!', async () => {
          const res = await api(`/api/admin/courses/${btn.dataset.id}`, { method: 'DELETE' });
          if (res.success) { showModal('Kurs o\'chirildi'); renderCourses(); }
          else showModal('Xatolik yuz berdi', true);
        });
      });
    });
  } catch {
    container.innerHTML = '<p style="color:red">Kurslar yuklanmadi</p>';
  }
}

function renderAddCourse() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  container.innerHTML = `
    <h2>➕ Yangi kurs qo'shish</h2>
    <div class="settings-section" style="max-width:600px">
      <form id="addCourseForm">
        <div class="form-group">
          <label>Kurs nomi</label>
          <input type="text" name="title" placeholder="Kurs nomini kiriting" required />
        </div>
        <div class="form-group">
          <label>Kurs haqida</label>
          <textarea name="description" placeholder="Kurs haqida qisqacha ma'lumot"></textarea>
        </div>
        <div class="form-group">
          <label>Yo'nalish (kategoriya)</label>
          <select name="category" required>
            <option value="">Yo'nalishni tanlang</option>
            ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Rasm URL (ixtiyoriy)</label>
          <input type="text" name="thumbnail" placeholder="https://example.com/image.jpg" />
        </div>
        <button class="btn" type="submit" style="width:100%;margin-top:16px">Kursni yaratish</button>
      </form>
    </div>
  `;
  document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Yaratilmoqda...';
    const data = Object.fromEntries(new FormData(e.target));
    const res = await api('/api/courses', { method: 'POST', body: JSON.stringify(data) });
    if (res.success) {
      showModal('Kurs muvaffaqiyatli yaratildi!', false, () => window.location.hash = '#/admin/courses');
    } else {
      showModal(res.message || 'Xatolik yuz berdi', true);
      btn.disabled = false; btn.textContent = 'Kursni yaratish';
    }
  });
}

async function renderAddVideo() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  try {
    const coursesRes = await api('/api/courses');
    const courses = coursesRes.courses || [];
    container.innerHTML = `
      <h2>🎬 Video qo'shish</h2>
      <div class="settings-section" style="max-width:600px">
        <form id="addVideoForm">
          <div class="form-group">
            <label>Kursni tanlang</label>
            <select name="courseId" required>
              <option value="">Kursni tanlang</option>
              ${courses.map(c => `<option value="${c._id}">${c.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Video sarlavhasi</label>
            <input type="text" name="title" placeholder="Video sarlavhasi" required />
          </div>
          <div class="form-group">
            <label>Video tavsifi</label>
            <textarea name="description" placeholder="Video haqida"></textarea>
          </div>
          <div class="form-group">
            <label>Video fayl</label>
            <input type="file" name="video" accept="video/mp4,video/webm,video/ogg" required style="padding:8px" />
          </div>
          <div class="form-group">
            <label>Tartib raqami</label>
            <input type="number" name="order" placeholder="1" value="1" min="1" />
          </div>
          <button class="btn" type="submit" style="width:100%;margin-top:16px">📤 Videoni yuklash</button>
        </form>
      </div>
    `;
    document.getElementById('addVideoForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Yuklanmoqda...';
      const formData = new FormData(e.target);
      const token = getToken();
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        showModal('Video muvaffaqiyatli yuklandi!');
        e.target.reset();
        btn.disabled = false; btn.textContent = '📤 Videoni yuklash';
      } else {
        showModal(result.message || 'Xatolik yuz berdi', true);
        btn.disabled = false; btn.textContent = '📤 Videoni yuklash';
      }
    });
  } catch {
    container.innerHTML = '<p style="color:red">Xatolik yuz berdi</p>';
  }
}

async function renderAddTest() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  try {
    const coursesRes = await api('/api/courses');
    const courses = coursesRes.courses || [];
    container.innerHTML = `
      <h2>📝 Test qo'shish</h2>
      <div class="settings-section" style="max-width:700px">
        <form id="addTestForm">
          <div class="form-group">
            <label>Kursni tanlang</label>
            <select name="courseId" id="testCourseSelect" required>
              <option value="">Kursni tanlang</option>
              ${courses.map(c => `<option value="${c._id}">${c.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Video (ixtiyoriy)</label>
            <select name="videoId" id="testVideoSelect">
              <option value="">Video tanlanmagan (kurs testi)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Test sarlavhasi</label>
            <input type="text" name="title" placeholder="Test sarlavhasi" />
          </div>
          <div class="form-group">
            <label>O'tish bali (%)</label>
            <input type="number" name="passingScore" value="70" min="0" max="100" />
          </div>
          <div id="questionsContainer">
            <label>Savollar</label>
            <div class="question-item" style="margin-bottom:16px;padding:16px;border:1px solid var(--glass-border);border-radius:var(--radius-sm)">
              <input type="text" name="q_text_0" placeholder="Savol matni" required style="margin-bottom:8px" />
              <input type="text" name="q_opt_0_0" placeholder="1-variant" required style="margin-bottom:4px" />
              <input type="text" name="q_opt_0_1" placeholder="2-variant" required style="margin-bottom:4px" />
              <input type="text" name="q_opt_0_2" placeholder="3-variant" style="margin-bottom:4px" />
              <input type="text" name="q_opt_0_3" placeholder="4-variant" style="margin-bottom:8px" />
              <label style="font-size:12px">To'g'ri javob (0-3):</label>
              <input type="number" name="q_correct_0" value="0" min="0" max="3" style="width:80px" />
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="addQuestionBtn" style="margin-bottom:16px">+ Savol qo'shish</button>
          <button class="btn" type="submit" style="width:100%">📝 Testni saqlash</button>
        </form>
      </div>
    `;
    let qCount = 1;
    document.getElementById('addQuestionBtn').addEventListener('click', () => {
      const container = document.getElementById('questionsContainer');
      const div = document.createElement('div');
      div.className = 'question-item';
      div.style.cssText = 'margin-bottom:16px;padding:16px;border:1px solid var(--glass-border);border-radius:var(--radius-sm)';
      div.innerHTML = `
        <input type="text" name="q_text_${qCount}" placeholder="Savol matni" required style="margin-bottom:8px" />
        <input type="text" name="q_opt_${qCount}_0" placeholder="1-variant" required style="margin-bottom:4px" />
        <input type="text" name="q_opt_${qCount}_1" placeholder="2-variant" required style="margin-bottom:4px" />
        <input type="text" name="q_opt_${qCount}_2" placeholder="3-variant" style="margin-bottom:4px" />
        <input type="text" name="q_opt_${qCount}_3" placeholder="4-variant" style="margin-bottom:8px" />
        <label style="font-size:12px">To'g'ri javob (0-3):</label>
        <input type="number" name="q_correct_${qCount}" value="0" min="0" max="3" style="width:80px" />
        <button type="button" class="btn btn-sm btn-danger removeQuestion" style="margin-top:8px">O'chirish</button>
      `;
      container.appendChild(div);
      div.querySelector('.removeQuestion').addEventListener('click', () => div.remove());
      qCount++;
    });
    document.getElementById('testCourseSelect').addEventListener('change', async (e) => {
      const courseId = e.target.value;
      const sel = document.getElementById('testVideoSelect');
      sel.innerHTML = '<option value="">Video tanlanmagan (kurs testi)</option>';
      if (courseId) {
        try {
          const res = await api(`/api/videos/course/${courseId}`);
          if (res.videos) {
            res.videos.forEach(v => {
              sel.innerHTML += `<option value="${v._id}">${v.title}</option>`;
            });
          }
        } catch {}
      }
    });
    document.getElementById('addTestForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Saqlanmoqda...';
      const formData = new FormData(e.target);
      const courseId = formData.get('courseId');
      const videoId = formData.get('videoId');
      const title = formData.get('title');
      const passingScore = parseInt(formData.get('passingScore')) || 70;
      const questions = [];
      for (let i = 0; ; i++) {
        const text = formData.get(`q_text_${i}`);
        if (!text) break;
        const options = [];
        for (let j = 0; j < 4; j++) {
          const opt = formData.get(`q_opt_${i}_${j}`);
          if (opt) options.push(opt);
        }
        if (options.length < 2) continue;
        const correct = parseInt(formData.get(`q_correct_${i}`)) || 0;
        questions.push({ question: text, options, correctAnswer: Math.min(correct, options.length - 1) });
      }
      if (questions.length === 0) {
        showModal("Kamida 1 ta savol qo'shing", true);
        btn.disabled = false; btn.textContent = '📝 Testni saqlash';
        return;
      }
      const res = await api('/api/tests', {
        method: 'POST',
        body: JSON.stringify({ title, videoId, courseId, questions, passingScore })
      });
      if (res.success) {
        showModal('Test muvaffaqiyatli qo\'shildi!', false, () => window.location.hash = '#/admin/courses');
      } else {
        showModal(res.message || 'Xatolik yuz berdi', true);
        btn.disabled = false; btn.textContent = '📝 Testni saqlash';
      }
    });
  } catch {
    container.innerHTML = '<p style="color:red">Xatolik yuz berdi</p>';
  }
}

async function renderManageVideos() {
  const container = document.getElementById('adminContent');
  if (!container) return;
  container.innerHTML = '<h2>🎬 Videolar boshqaruvi</h2><div class="loading"><div class="spinner"></div></div>';
  try {
    const res = await api('/api/admin/courses');
    const courses = res.courses || [];
    let allVideos = [];
    courses.forEach(c => {
      (c.videos || []).forEach(v => {
        allVideos.push({ ...v, courseTitle: c.title });
      });
    });

    container.innerHTML = `
      <h2>🎬 Videolar boshqaruvi <span style="font-size:14px;color:var(--text-dim)">(${allVideos.length} ta)</span></h2>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Sarlavha</th><th>Kurs</th><th>URL / Fayl</th><th>Amallar</th></tr></thead>
          <tbody>
            ${allVideos.map(v => `
              <tr>
                <td><strong>${v.title}</strong></td>
                <td><span style="font-size:13px">${v.courseTitle}</span></td>
                <td style="font-family:monospace;font-size:11px;color:var(--text-dim)">${v.videoUrl}</td>
                <td><button class="btn btn-sm btn-danger deleteVideo" data-id="${v._id}">O'chirish</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${allVideos.length === 0 ? '<p style="text-align:center;padding:40px;color:var(--text-dim)">Hozircha videolar yo\'q</p>' : ''}
    `;

    document.querySelectorAll('.deleteVideo').forEach(btn => {
      btn.addEventListener('click', () => {
        showConfirm('Videoni o\'chirish', 'Bu darsni butunlay o\'chirmoqchimisiz?', async () => {
          const res = await api(`/api/videos/${btn.dataset.id}`, { method: 'DELETE' });
          if (res.success) {
            showModal('Video o\'chirildi');
            renderManageVideos();
          } else {
            showModal(res.message || 'Xatolik yuz berdi', true);
          }
        });
      });
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="color:red">Videolar yuklanmadi</p>';
  }
}
