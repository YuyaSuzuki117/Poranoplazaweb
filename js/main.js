/**
 * Poranoplaza - Main JavaScript
 * Navigation, scroll reveal, header behavior
 */

(function () {
  "use strict";

  /* ========================================
     Sticky Header
     ======================================== */
  const header = document.querySelector(".site-header");
  let lastScroll = 0;
  const SCROLL_THRESHOLD = 50;

  function handleHeaderScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > SCROLL_THRESHOLD) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
    lastScroll = currentScroll;
  }

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

  /* ========================================
     Sticky Phone CTA
     ======================================== */
  const stickyCta = document.getElementById("sticky-cta");
  if (stickyCta) {
    function handleStickyCta() {
      if (window.scrollY > window.innerHeight * 0.8) {
        stickyCta.style.opacity = "1";
        stickyCta.style.pointerEvents = "auto";
        stickyCta.style.transform = "translateY(0)";
      } else {
        stickyCta.style.opacity = "0";
        stickyCta.style.pointerEvents = "none";
        stickyCta.style.transform = "translateY(1rem)";
      }
    }
    window.addEventListener("scroll", handleStickyCta, { passive: true });
  }

  /* ========================================
     Mobile Menu
     ======================================== */
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuLinks = mobileMenu
    ? mobileMenu.querySelectorAll("a")
    : [];
  let previousFocus = null;

  function openMenu() {
    previousFocus = document.activeElement;
    mobileMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";

    // Focus the close button
    requestAnimationFrame(() => {
      menuClose.focus();
    });

    // Add focus trap
    document.addEventListener("keydown", trapFocus);
  }

  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";

    // Restore focus
    if (previousFocus) {
      previousFocus.focus();
    }

    // Remove focus trap
    document.removeEventListener("keydown", trapFocus);
  }

  function trapFocus(e) {
    if (e.key === "Escape") {
      closeMenu();
      return;
    }

    if (e.key !== "Tab") return;

    const focusable = mobileMenu.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", openMenu);
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }

  // Close menu on link click
  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  /* ========================================
     Scroll Reveal (IntersectionObserver)
     ======================================== */
  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-scale");

  if (revealElements.length > 0) {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Show all elements immediately
      revealElements.forEach((el) => {
        el.classList.add("is-visible");
      });
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      revealElements.forEach((el) => {
        revealObserver.observe(el);
      });
    }
  }

  /* ========================================
     Smooth Scroll for Anchor Links
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition =
          target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  /* ========================================
     Hero Cinematic Slideshow
     ======================================== */
  var heroEl = document.querySelector(".hero-slideshow");
  if (heroEl) {
    (function initHeroSlideshow() {
      var slides = heroEl.querySelectorAll(".hero-slide");
      // Collect ALL dots (desktop + mobile)
      var allDots = heroEl.querySelectorAll(".hero-dot");
      var counterEl = heroEl.querySelector("[data-counter]");
      var fillEl = heroEl.querySelector(".hero-counter-fill");
      var DURATION = 5500;
      var TICK = 40;
      var current = 0;
      var elapsed = 0;
      var paused = false;
      var transitioning = false;
      var prefersRM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Transition durations (CSS)
      var FADE_IN = 1200;
      var FADE_OUT = 800;
      var KEN_BURNS = 6000;

      // Apply CSS transitions dynamically (so first paint is instant)
      function applyTransitions() {
        if (prefersRM) return;
        for (var i = 0; i < slides.length; i++) {
          slides[i].style.transition = "opacity " + FADE_IN + "ms cubic-bezier(0.4, 0, 0.2, 1)";
          var img = slides[i].querySelector(".hero-slide-img");
          if (img) img.style.transition = "transform " + KEN_BURNS + "ms cubic-bezier(0.25, 0, 0.3, 1)";
        }
        // Progress fill
        if (fillEl) fillEl.style.transition = "transform " + DURATION + "ms linear";
        // Dot fills
        for (var d = 0; d < allDots.length; d++) {
          var after = allDots[d].querySelector("::after"); // can't target pseudo, use transition in CSS
        }
      }

      function updateDots(index) {
        for (var d = 0; d < allDots.length; d++) {
          var dotIndex = d % slides.length;
          if (dotIndex === index) {
            allDots[d].classList.add("is-active");
            allDots[d].setAttribute("aria-selected", "true");
          } else {
            allDots[d].classList.remove("is-active");
            allDots[d].setAttribute("aria-selected", "false");
          }
        }
      }

      function updateCounter(index) {
        if (counterEl) {
          counterEl.textContent = String(index + 1).padStart(2, "0");
        }
      }

      function startProgress() {
        if (fillEl) {
          fillEl.style.transition = "none";
          fillEl.style.transform = "scaleX(0)";
          // Force reflow
          fillEl.offsetWidth;
          fillEl.style.transition = "transform " + DURATION + "ms linear";
          fillEl.style.transform = "scaleX(1)";
        }
        // Active dot fill animation via CSS transition
        for (var d = 0; d < allDots.length; d++) {
          var style = allDots[d].style;
          // Reset all dot ::after via class toggle is in CSS, no JS needed
        }
      }

      function goTo(index) {
        if (transitioning || index === current) return;
        transitioning = true;

        var leaving = slides[current];
        var entering = slides[index];

        // Leaving slide: fade out with slight scale
        leaving.classList.remove("is-active");
        leaving.classList.add("is-leaving");
        leaving.style.transition = "opacity " + FADE_OUT + "ms cubic-bezier(0.4, 0, 0.2, 1)";

        // Entering slide: fade in
        entering.classList.add("is-active");
        entering.style.transition = "opacity " + FADE_IN + "ms cubic-bezier(0.4, 0, 0.2, 1)";

        current = index;
        elapsed = 0;
        updateDots(current);
        updateCounter(current);
        startProgress();

        setTimeout(function () {
          leaving.classList.remove("is-leaving");
          transitioning = false;
        }, FADE_IN);
      }

      var lastTime = 0;
      function tick(timestamp) {
        if (!lastTime) lastTime = timestamp;
        var delta = timestamp - lastTime;
        lastTime = timestamp;

        if (!paused && !transitioning) {
          elapsed += delta;
          if (elapsed >= DURATION) {
            goTo((current + 1) % slides.length);
          }
        }
        requestAnimationFrame(tick);
      }

      // Dot click handlers
      for (var d = 0; d < allDots.length; d++) {
        (function (idx) {
          allDots[idx].addEventListener("click", function () {
            var targetSlide = idx % slides.length;
            if (targetSlide !== current) goTo(targetSlide);
          });
        })(d);
      }

      // Pause on hover/focus
      heroEl.addEventListener("mouseenter", function () { paused = true; });
      heroEl.addEventListener("mouseleave", function () { paused = false; });
      heroEl.addEventListener("focusin", function () { paused = true; });
      heroEl.addEventListener("focusout", function () { paused = false; });

      // Pause when off-screen
      var heroObserver = new IntersectionObserver(function (entries) {
        paused = !entries[0].isIntersecting;
      }, { threshold: 0.15 });
      heroObserver.observe(heroEl);

      // Init
      applyTransitions();
      updateDots(0);
      updateCounter(0);
      startProgress();

      if (!prefersRM) {
        requestAnimationFrame(tick);
      }
    })();
  }

  /* ========================================
     Before/After Toggle (Portfolio)
     ======================================== */
  var baToggles = document.querySelectorAll(".ba-toggle");
  baToggles.forEach(function (el) {
    function toggle() {
      var state = el.getAttribute("data-state");
      var next = state === "after" ? "before" : "after";
      el.setAttribute("data-state", next);
      var label = el.querySelector("[data-ba-label]");
      if (label) label.textContent = next === "after" ? "Before" : "After";
    }
    var btn = el.querySelector(".ba-btn");
    if (btn) btn.addEventListener("click", toggle);
    // Keyboard support
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ========================================
     Current Year in Footer
     ======================================== */
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
