'use strict';

/* Mark the table-of-contents entry of the section being read.
   A scroll listener is used instead of IntersectionObserver because several
   headings are on screen at once and the meaningful one is always the last
   whose top edge has passed the offset. */
(function () {
  const list = document.querySelector('.post-toc');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('.post-toc-link'))
    .map(link => {
      const href = link.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return null;
      const heading = document.getElementById(decodeURIComponent(href.slice(1)));
      return heading ? { link, heading } : null;
    })
    .filter(Boolean);

  if (!items.length) return;

  /* A heading becomes current once its top edge reaches this line. Keep it
     small: with a large offset the heading right below the one you just
     clicked would steal the marker, since anchors land their target at the
     very top of the viewport. */
  const OFFSET = 24;
  let active = null;
  let ticking = false;

  function setActive(item) {
    if (item === active) return;

    if (active) {
      active.link.classList.remove('is-active');
      active.link.removeAttribute('aria-current');
    }

    active = item;
    active.link.classList.add('is-active');
    active.link.setAttribute('aria-current', 'true');
  }

  function update() {
    ticking = false;

    let next = items[0];
    for (const item of items) {
      if (item.heading.getBoundingClientRect().top > OFFSET) break;
      next = item;
    }

    /* The last heading never reaches the offset on a page that ends just
       below it, so reaching the bottom selects it explicitly. */
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      next = items[items.length - 1];
    }

    setActive(next);
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
})();
