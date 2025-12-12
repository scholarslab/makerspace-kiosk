(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // Respect users who prefer less motion

  const canvas = document.getElementById('snow-canvas');
  const ctx = canvas.getContext('2d');

  // Configuration — tweak to taste
  const config = {
    maxFlakes: 150,           // Total snowflakes
    sizeMin: 1,               // Minimum radius
    sizeMax: 3,               // Maximum radius
    speedMin: 0.3,            // Minimum vertical speed (px/frame)
    speedMax: 1.2,            // Maximum vertical speed (px/frame)
    driftMax: 0.6,            // Horizontal drift magnitude
    alphaMin: 0.4,            // Minimum opacity
    alphaMax: 0.9,            // Maximum opacity
    color: '#ffffff',         // Snowflake color
    windChange: 0.0015,       // How quickly drift changes over time
    spawnBuffer: 0.1          // % of screen height to spawn above top for natural entry
  };

  let flakes = [];
  let running = true;
  let width = 0, height = 0, deviceScale = 1;
  let wind = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    // Handle HiDPI displays cleanly
    deviceScale = window.devicePixelRatio || 1;
    width = canvas.clientWidth = window.innerWidth;
    height = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(width * deviceScale);
    canvas.height = Math.floor(height * deviceScale);
    ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  }

  function createFlake(spawnAbove = false) {
    return {
      x: rand(0, width),
      y: spawnAbove ? rand(-height * config.spawnBuffer, 0) : rand(0, height),
      r: rand(config.sizeMin, config.sizeMax),
      speed: rand(config.speedMin, config.speedMax),
      drift: rand(-config.driftMax, config.driftMax),
      alpha: rand(config.alphaMin, config.alphaMax)
    };
  }

  function initFlakes() {
    flakes = [];
    for (let i = 0; i < config.maxFlakes; i++) {
      flakes.push(createFlake(false));
    }
  }

  function step() {
    if (!running) return;

    // Lightly vary wind for a natural sway
    wind += (Math.random() - 0.5) * config.windChange;
    wind = Math.max(-config.driftMax, Math.min(config.driftMax, wind));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = config.color;

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];

      // Update position
      f.y += f.speed;
      f.x += f.drift + wind * 0.7;

      // Wrap horizontally for continuous drift
      if (f.x < -10) f.x = width + 10;
      if (f.x > width + 10) f.x = -10;

      // Respawn at top if out of view
      if (f.y > height + 10) {
        flakes[i] = createFlake(true);
        continue;
      }

      // Draw snowflake (simple circle)
      ctx.globalAlpha = f.alpha;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  // Toggle control
  const toggleBtn = document.getElementById('snow-toggle');
  toggleBtn.addEventListener('click', () => {
    running = !running;
    toggleBtn.textContent = running ? 'Toggle Snow' : 'Snow Paused';
    if (running) requestAnimationFrame(step);
  });

  // Initialize
  resize();
  initFlakes();
  requestAnimationFrame(step);

  // Keep canvas sized to viewport
  window.addEventListener('resize', () => {
    resize();
    // Re-introduce flakes after resize for density consistency
    initFlakes();
  });

  // Optional: Pause when tab not visible (battery-friendly)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else {
      running = true;
      requestAnimationFrame(step);
    }
  });
})();