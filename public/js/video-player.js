import { getToken, api } from './app.js';

export function initVideoPlayer(video, courseId, progress) {
  const videoEl = document.getElementById('eduVideo');
  if (!videoEl) return;

  const videoId = video._id;
  const storageKey = `edumooc_${courseId}_${videoId}`;
  let maxWatched = 0;
  let saveTimer = null;

  const saved = localStorage.getItem(storageKey);
  let resumeTime = 0;
  if (saved) {
    try { resumeTime = JSON.parse(saved).lastPosition || 0; } catch {}
  } else if (progress?.videosWatched) {
    const vp = progress.videosWatched.find(v =>
      (v.videoId?._id || v.videoId)?.toString() === videoId
    );
    if (vp) resumeTime = vp.lastPosition || 0;
  }
  if (resumeTime > 0) maxWatched = resumeTime;

  videoEl.removeAttribute('controls');
  videoEl.controls = false;

  const controlsHtml = `
    <div class="video-controls-bar" style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.8));padding:40px 16px 12px;z-index:10">
      <div style="display:flex;align-items:center;gap:12px">
        <button id="ppBtn" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background 0.3s">▶</button>
        <div style="flex:1;position:relative;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;cursor:pointer" id="progressBar">
          <div id="progressFill" style="height:100%;width:0%;background:linear-gradient(90deg,#6C63FF,#00D2FF);border-radius:2px;transition:width 0.1s linear"></div>
          <div id="progressThumb" style="position:absolute;top:50%;width:14px;height:14px;background:#fff;border-radius:50%;transform:translate(-50%,-50%);left:0%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:none"></div>
        </div>
        <span id="timeDisplay" style="color:#fff;font-size:12px;font-family:monospace;min-width:100px;text-align:center">0:00 / 0:00</span>
        <button id="fullscreenBtn" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:4px 8px">⛶</button>
      </div>
    </div>
  `;
  const controlsDiv = document.createElement('div');
  controlsDiv.innerHTML = controlsHtml;
  videoEl.parentElement.appendChild(controlsDiv);

  const ppBtn = document.getElementById('ppBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');
  const timeDisplay = document.getElementById('timeDisplay');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function updateUI() {
    if (!videoEl.duration) return;
    const pct = (videoEl.currentTime / videoEl.duration) * 100;
    progressFill.style.width = pct + '%';
    progressThumb.style.left = pct + '%';
    progressThumb.style.display = 'block';
    timeDisplay.textContent = `${formatTime(videoEl.currentTime)} / ${formatTime(videoEl.duration)}`;
  }

  function saveProgress(completed) {
    const data = {
      lastPosition: videoEl.currentTime,
      watchedDuration: maxWatched,
      totalDuration: videoEl.duration || 0,
      completed: completed || (videoEl.duration > 0 && videoEl.currentTime >= videoEl.duration - 0.5)
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    if (getToken()) {
      api('/api/progress/video', {
        method: 'POST',
        body: JSON.stringify({
          videoId, courseId,
          watchedDuration: maxWatched,
          totalDuration: videoEl.duration || 0,
          lastPosition: videoEl.currentTime,
          completed: data.completed
        })
      }).catch(() => {});
    }
  }

  function safeSeek(time) {
    if (time <= maxWatched + 0.5 || time >= videoEl.duration - 0.5) {
      videoEl.currentTime = time;
      return true;
    }
    return false;
  }

  videoEl.addEventListener('loadedmetadata', () => {
    if (resumeTime > 0 && resumeTime < videoEl.duration) {
      videoEl.currentTime = resumeTime;
    }
    maxWatched = Math.max(maxWatched, videoEl.currentTime || 0);
    updateUI();
  });

  videoEl.addEventListener('play', () => { ppBtn.textContent = '\u23F8'; });
  videoEl.addEventListener('pause', () => { ppBtn.textContent = '\u25B6'; saveProgress(); });

  ppBtn.addEventListener('click', () => {
    if (videoEl.paused) videoEl.play().catch(() => {});
    else videoEl.pause();
  });

  let suppressNextCheck = false;

  videoEl.addEventListener('timeupdate', () => {
    if (suppressNextCheck) { suppressNextCheck = false; return; }
    if (videoEl.currentTime > maxWatched + 0.5 && videoEl.duration - videoEl.currentTime > 0.5) {
      videoEl.currentTime = maxWatched;
      suppressNextCheck = true;
      return;
    }
    if (videoEl.currentTime > maxWatched) {
      maxWatched = videoEl.currentTime;
    }
    updateUI();
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveProgress(), 2000);
  });

  progressBar.addEventListener('click', (e) => {
    if (!videoEl.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pct * videoEl.duration;
    if (!safeSeek(targetTime)) {
      const flash = document.createElement('div');
      flash.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(255,68,68,0.9);color:#fff;padding:8px 20px;border-radius:8px;font-size:14px;z-index:20;pointer-events:none;transition:opacity 0.5s';
      flash.textContent = '\u26A0\uFE0F Faqat ko\'rilgan qismga qaytishingiz mumkin';
      videoEl.parentElement.appendChild(flash);
      setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 500); }, 2000);
    }
  });

  fullscreenBtn.addEventListener('click', () => {
    const wrapper = videoEl.parentElement;
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapper.requestFullscreen().catch(() => {});
  });

  videoEl.addEventListener('ended', () => {
    ppBtn.textContent = '\u25B6';
    saveProgress(true);
    maxWatched = videoEl.duration;
    localStorage.removeItem(storageKey);
    // UI Unlock
    const testBtn = document.getElementById('takeTestBtn');
    if (testBtn) {
      testBtn.style.opacity = '1';
      testBtn.style.pointerEvents = 'auto';
      testBtn.title = '';
      testBtn.classList.add('btn-primary');
    }
  });

  videoEl.addEventListener('error', () => {
    timeDisplay.textContent = 'Video yuklanmadi';
  });

  setTimeout(() => { if (videoEl) videoEl.play().catch(() => {}); }, 500);
}
