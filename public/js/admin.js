import { render } from './app.js';

export function showAdminPanel() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.hash = '#/login';
    return;
  }
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    window.location.hash = '#/student';
    return;
  }

  render(`
    <div class="card" style="max-width:800px;margin:auto;">
      <h2>Admin Panel</h2>
      <p>Platforma statistikasi va to'liq boshqaruv.</p>
      <button class="btn" id="logoutBtn">Chiqish</button>
    </div>
  `);

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.hash = '#/';
  });
}
