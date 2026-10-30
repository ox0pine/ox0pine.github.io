(function () {
  const canvas = document.querySelector('#heart-curve')
  if (!canvas) return

  const SIZE = 400
  const SPEED = 0.4
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const ctx = canvas.getContext('2d')

  canvas.width = SIZE * dpr
  canvas.height = SIZE * dpr
  ctx.scale(dpr, dpr)
  ctx.translate(SIZE * 2 / 3, SIZE / 2)
  ctx.lineJoin = 'round'

  const w = SIZE
  const h = SIZE
  const a = w / 6.2

  let deg = 0
  let frameId = null

  function drawAxes() {
    ctx.lineWidth = 1
    ctx.strokeStyle = '#999'
    ctx.beginPath()
    ctx.moveTo(-w * 2 / 3, 0)
    ctx.lineTo(w / 3, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, -h * 0.48)
    ctx.lineTo(0, h * 0.48)
    ctx.stroke()
  }

  function drawCurve() {
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.strokeStyle = '#ff0000'
    for (let theta = 0; theta <= 2 * Math.PI; theta += Math.PI / 180) {
      const r = 2 * a * (1 - Math.cos(theta))
      ctx.lineTo(r * Math.cos(theta), r * Math.sin(theta))
    }
    ctx.stroke()
  }

  function draw(theta) {
    ctx.clearRect(-w * 2 / 3, -h / 2, w, h)
    drawAxes()
    ctx.lineWidth = 2
    drawCurve()

    ctx.strokeStyle = '#000'
    ctx.beginPath()
    ctx.arc(-a, 0, a, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(2 * a * Math.cos(theta) - a, 2 * a * Math.sin(theta), a, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    const r = 2 * a * (1 - Math.cos(theta))
    ctx.arc(r * Math.cos(theta), r * Math.sin(theta), 3, 0, 2 * Math.PI)
    ctx.fill()
  }

  function tick() {
    draw(deg / 180 * Math.PI)
    deg = (deg + SPEED) % 360
    frameId = window.requestAnimationFrame(tick)
  }

  function start() {
    if (frameId !== null) return
    frameId = window.requestAnimationFrame(tick)
  }

  function stop() {
    if (frameId === null) return
    window.cancelAnimationFrame(frameId)
    frameId = null
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const canHover = window.matchMedia('(hover: hover)')

  if (reducedMotion.matches) {
    draw(0)
    return
  }

  const wall = document.querySelector('#wall-main')
  if (canHover.matches && wall) {
    // Idle by default, animate only while the pointer is over the hero.
    draw(0)
    wall.addEventListener('mouseenter', start)
    wall.addEventListener('mouseleave', stop)
  } else {
    start()
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop()
  })

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting && !document.hidden && !canHover.matches) stop()
    }, { threshold: 0 }).observe(canvas)
  }
})()
