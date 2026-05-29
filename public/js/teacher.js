import { render } from './app.js';

export function showTeacherDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.hash = '#/login';
    return;
  }
  const role = localStorage.getItem('role');
  if (role !== 'teacher' && role !== 'admin') {
    window.location.hash = '#/student';
    return;
  }

  render(`
    <div class="card" style="max-width:800px;margin:auto;">
      <h2>O'qituvchi Paneli</h2>
      <p>Bu yerda kurslarni boshqarish imkoniyati mavjud.</p>
      <button class="btn" id="logoutBtn">Chiqish</button>
    </div>
  `);

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.hash = '#/';
  });
}
