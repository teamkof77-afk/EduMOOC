import { render } from './app.js';

export function showStudentDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.hash = '#/login';
    return;
  }
  
  render(`
    <div class="card" style="max-width:800px;margin:auto;">
      <h2>Talaba Paneli</h2>
      <p>Hush kelibsiz! Bu yerda sizning kurslaringiz va progresslaringiz ko'rsatiladi.</p>
      <button class="btn" id="logoutBtn">Chiqish</button>
    </div>
  `);

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.hash = '#/';
  });
}
