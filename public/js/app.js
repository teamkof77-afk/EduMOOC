// app.js – Simple SPA router

import { showLanding } from './auth.js';
import { showStudentDashboard } from './student.js';
import { showTeacherDashboard } from './teacher.js';
import { showAdminPanel } from './admin.js';

const routes = {
  '/': showLanding,
  '/student': showStudentDashboard,
  '/teacher': showTeacherDashboard,
  '/admin': showAdminPanel,
};

function router() {
  const path = window.location.hash.replace('#', '') || '/';
  const view = routes[path] || showLanding;
  view();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Global helper to set innerHTML safely
export function render(html) {
  const app = document.getElementById('app');
  app.innerHTML = html;
}
