import { render, showModal, getUser, api } from './app.js';

export async function showTeacherDashboard() {
  const user = getUser();
  const token = localStorage.getItem('token');
  if (!token || !user) {
    window.location.hash = '#/';
    return;
  }
  if (user.role !== 'teacher' && user.role !== 'admin') {
    showModal('Bu bo\'lim faqat o\'qituvchilar uchun', true);
    window.location.hash = '#/role';
    return;
  }

  try {
    const coursesRes = await api('/api/courses');
    const courses = coursesRes.courses || [];
    render(`
      <div class="dashboard">
        <div class="navbar">
          <div class="navbar-inner">
            <div class="brand"><span>Edu</span><span>MOOC</span></div>
            <div class="nav-right">
              <span class="user-info"><strong>${user.firstName || ''}</strong> | O'qituvchi</span>
              <button class="btn btn-sm btn-outline" id="backToRole">← Asosiy</button>
              <button class="btn btn-sm btn-outline" id="logoutBtn">Chiqish</button>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="dashboard-header">
            <h2>👨‍🏫 O'qituvchi panellari</h2>
            <p>O'quv kurslari va talabalar faoliyatini kuzatish</p>
          </div>
          <div style="margin-top:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px">
            <div class="course-card" onclick="window.location.hash='#/student'" style="cursor:pointer">
              <div class="card-top"><div class="course-icon">📚</div></div>
              <div class="card-body">
                <h3>Barcha kurslar (${courses.length})</h3>
                <p>Platformadagi barcha kurslarni ko'rish</p>
              </div>
            </div>
            <div class="course-card" onclick="window.location.hash='#/admin'" style="cursor:pointer">
              <div class="card-top"><div class="course-icon">⚙️</div></div>
              <div class="card-body">
                <h3>Admin panel</h3>
                <p>Kurslar, videolar va testlarni boshqarish</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
    document.getElementById('backToRole').addEventListener('click', () => window.location.hash = '#/role');
    document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); window.location.hash = '#/'; });
  } catch (err) {
    console.error(err);
    showModal('Xatolik yuz berdi', true);
  }
}
