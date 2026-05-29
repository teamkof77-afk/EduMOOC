import { showLanding, showLogin, showRegister } from './auth.js';
import { showRoleSelect, showStudentDashboard, showCourseDetail, showVideoPlayer, showTestPage, showCertificates } from './student.js';
import { showTeacherDashboard } from './teacher.js';
import { showAdminPanel } from './admin.js';

export function render(html) {
  document.getElementById('app').innerHTML = html;
}

export function showLoading(container) {
  if (container) {
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  } else {
    render('<div class="loading" style="min-height:100vh;display:flex;align-items:center;justify-content:center"><div class="spinner"></div></div>');
  }
}

export function showModal(message, isError = false, onClose) {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  const icon = isError ? '❌' : '✅';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">${icon}</div>
      <h3 style="text-align:center;color:${isError ? '#ff6b6b' : '#4cafaf'}">${isError ? 'Xatolik' : 'Muvaffaqiyatli'}</h3>
      <p style="text-align:center">${message}</p>
      <button class="btn" style="width:100%" id="modalCloseBtn">Yopish</button>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('modalCloseBtn').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
    if (onClose) onClose();
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
      if (onClose) onClose();
    }
  });
}

export function showConfirm(title, message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">⚠️</div>
      <h3 style="text-align:center">${title}</h3>
      <p style="text-align:center">${message}</p>
      <div style="display:flex;gap:12px;margin-top:20px">
        <button class="btn btn-outline" style="flex:1" id="confirmNo">Bekor qilish</button>
        <button class="btn btn-danger" style="flex:1" id="confirmYes">Tasdiqlash</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('confirmNo').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  });
  document.getElementById('confirmYes').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
    if (onConfirm) onConfirm();
  });
}

export function showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  const colors = ['#6C63FF', '#00D2FF', '#FF6B6B', '#FFD93D', '#00d2a0', '#ff6b9d'];
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (Math.random() * 8 + 4) + 'px';
    piece.style.height = (Math.random() * 8 + 4) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
    piece.style.animationDelay = (Math.random() * 2) + 's';
    container.appendChild(piece);
  }
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 5000);
}

export function getToken() { return localStorage.getItem('token'); }
export function getRole() { return localStorage.getItem('role'); }
export function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}
export function setAuth(token, role, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  if (user) localStorage.setItem('user', JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  if (!data.success && res.status === 401 && path !== '/api/auth/me') {
    clearAuth();
    window.location.hash = '#/';
    showModal('Sessiya tugadi. Iltimos, qaytadan kiring.', true);
  }
  return data;
}

function router() {
  const hash = window.location.hash.replace(/^#\/?/, '') || '/';
  const parts = hash.split('/');
  const base = parts[0];

  if (base === 'login') { showLogin(); return; }
  if (base === 'register') { showRegister(); return; }
  if (base === 'role') { showRoleSelect(); return; }
  if (base === 'student') {
    if (parts[1] === 'course' && parts[2]) { showCourseDetail(parts[2]); return; }
    if (parts[1] === 'video' && parts[2]) { showVideoPlayer(parts[2], parts[3]); return; }
    if (parts[1] === 'test' && parts[2]) { showTestPage(parts[2], parts[3]); return; }
    if (parts[1] === 'certificates') { showCertificates(); return; }
    showStudentDashboard(); return;
  }
  if (base === 'teacher') { showTeacherDashboard(); return; }
  if (base === 'admin') { showAdminPanel(parts[1] || 'stats'); return; }

  const token = getToken();
  if (token) {
    const role = getRole();
    if (role === 'admin') { window.location.hash = '#/admin'; return; }
    if (role === 'teacher') { window.location.hash = '#/teacher'; return; }
    window.location.hash = '#/student'; return;
  }
  showLanding();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
