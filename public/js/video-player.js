// video-player.js – Custom video player that disables forward seeking

import { render } from './app.js';

export function initVideoPlayer(videoId, courseId) {
  // Fetch video details (placeholder – you would fetch from API)
  const videoUrl = `/uploads/${videoId}`; // adjust as needed

  render(`
    <div class="video-player" id="videoContainer">
      <video id="eduVideo" src="${videoUrl}" controls></video>
      <div class="video-controls">
        <button id="playPauseBtn">▶️</button>
      </div>
    </div>
  `);

  const video = document.getElementById('eduVideo');
  const playPauseBtn = document.getElementById('playPauseBtn');

  // Load saved position from localStorage (key per user+course+video)
  const storageKey = `progress_${courseId}_${videoId}`;
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const { lastPosition } = JSON.parse(saved);
    video.currentTime = lastPosition;
  }

  // Play/Pause toggle
  playPauseBtn.addEventListener('click', () => {
    if (video.paused) video.play();
    else video.pause();
  });

  // Update button icon based on state
  video.addEventListener('play', () => (playPauseBtn.textContent = '⏸️'));
  video.addEventListener('pause', () => (playPauseBtn.textContent = '▶️'));

  // Prevent forward seeking – allow only backward or pause
  video.addEventListener('seeking', e => {
    const target = video.currentTime;
    const allowed = video.lastTime || 0; // last known position (or 0)
    if (target > allowed) {
      // Block forward seek
      video.currentTime = allowed;
    }
  });

  // Keep track of last known position (max watched)
  video.addEventListener('timeupdate', () => {
    const current = video.currentTime;
    const last = video.lastTime || 0;
    if (current > last) video.lastTime = current;
    // Save progress locally every 5 seconds
    if (Math.floor(current) % 5 === 0) {
      const data = {
        lastPosition: video.lastTime,
        watchedDuration: video.lastTime,
        totalDuration: video.duration,
        completed: video.lastTime >= video.duration
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  });

  // When video ends, mark as completed and send to server
  video.addEventListener('ended', async () => {
    const token = localStorage.getItem('token');
    const payload = {
      courseId,
      videoId,
      watchedDuration: video.duration,
      totalDuration: video.duration,
      lastPosition: video.duration,
      completed: true
    };
    await fetch('/api/progress/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    // Remove saved progress (optional)
    localStorage.removeItem(storageKey);
  });
}
