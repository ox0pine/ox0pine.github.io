'use strict';

/* Drifting ginkgo leaves behind the home cover.
   Small canvas, few shapes: the whole point is a quiet, slow fall that only
   becomes legible when the white veil over it lightens on hover. Motion is
   frame-rate independent and stops when the cover scrolls away or the tab is
   hidden; reduced-motion visitors get a single static scatter. */
(function () {
  const canvas = document.querySelector('#leaf-field');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const LEAF = 'M32 47 Q 21 44 16 35 A 21 21 0 0 1 31 25 L32 31 L33 25 A 21 21 0 0 1 48 35 Q 43 44 32 47 Z';
  const STEM = 'M32 47 Q 30 52 33 57';
  const leafPath = new Path2D(LEAF);
  const stemPath = new Path2D(STEM);
  const OCHRE = '200, 128, 47';
  const INK = '47, 44, 40';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let leaves = [];
  let frameId = null;
  let last = 0;

  function makeLeaf(spawnAbove) {
    const size = 0.42 + Math.random() * 0.5;
    return {
      x: Math.random(),
      y: spawnAbove ? -Math.random() * 120 : Math.random() * (height || 600),
      size,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.5,
      speed: 14 + Math.random() * 26,
      sway: 8 + Math.random() * 26,
      swaySpeed: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      ochre: Math.random() < 0.72,
      alpha: 0.3 + Math.random() * 0.4
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.max(7, Math.min(16, Math.round((width * height) / 78000)));
    if (leaves.length < target) {
      while (leaves.length < target) leaves.push(makeLeaf(false));
    } else {
      leaves.length = target;
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    for (const leaf of leaves) {
      const sway = Math.sin(time * leaf.swaySpeed + leaf.phase) * leaf.sway;
      ctx.save();
      ctx.translate(leaf.x * width + sway, leaf.y);
      ctx.rotate(leaf.rot);
      ctx.scale(leaf.size, leaf.size);
      ctx.translate(-32, -32);

      const rgb = leaf.ochre ? OCHRE : INK;
      ctx.fillStyle = `rgba(${rgb}, ${leaf.alpha})`;
      ctx.fill(leafPath);
      ctx.strokeStyle = `rgba(${rgb}, ${leaf.alpha})`;
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.stroke(stemPath);
      ctx.restore();
    }
  }

  function step(now) {
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;

    for (const leaf of leaves) {
      leaf.y += leaf.speed * dt;
      leaf.rot += leaf.spin * dt;
      if (leaf.y > height + 80) {
        leaf.y = -80;
        leaf.x = Math.random();
      }
    }

    draw(now / 1000);
    frameId = window.requestAnimationFrame(step);
  }

  function start() {
    if (frameId !== null || reducedMotion.matches) return;
    last = 0;
    frameId = window.requestAnimationFrame(step);
  }

  function stop() {
    if (frameId === null) return;
    window.cancelAnimationFrame(frameId);
    frameId = null;
  }

  resize();
  draw(0);

  if (reducedMotion.matches) return;

  let visible = true;
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    }, { threshold: 0 })
    : null;

  if (io) io.observe(canvas);
  else start();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible) start();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resize();
      draw(performance.now() / 1000);
    }, 150);
  });
})();
