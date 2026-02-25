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
    (function () {
      var slides = heroEl.querySelectorAll(".hero-slide");
      var allDots = heroEl.querySelectorAll(".hero-dot");
      var counterEl = heroEl.querySelector("[data-counter]");
      var fillEl = heroEl.querySelector(".hero-counter-fill");
      var DURATION = 5500;
      var FADE = 1400;
      var current = 0;
      var offscreen = false;
      var prefersRM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function updateUI(index) {
        // Counter
        if (counterEl) counterEl.textContent = String(index + 1).padStart(2, "0");
        // Dots
        for (var d = 0; d < allDots.length; d++) {
          var di = d % slides.length;
          allDots[d].classList.toggle("is-active", di === index);
          allDots[d].setAttribute("aria-selected", di === index ? "true" : "false");
        }
        // Progress fill
        if (fillEl) {
          fillEl.style.transition = "none";
          fillEl.style.transform = "scaleX(0)";
          fillEl.offsetWidth; // reflow
          fillEl.style.transition = "transform " + DURATION + "ms linear";
          fillEl.style.transform = "scaleX(1)";
        }
      }

      function goTo(next) {
        if (next === current) return;
        var prev = current;
        current = next;

        // New slide fades in ON TOP of current (no gap)
        slides[next].classList.add("is-entering");

        updateUI(next);

        // After fade completes, swap classes
        setTimeout(function () {
          slides[prev].classList.remove("is-active");
          slides[next].classList.remove("is-entering");
          slides[next].classList.add("is-active");
        }, FADE);
      }

      // Auto-advance with rAF
      var elapsed = 0;
      var lastTS = 0;
      function loop(ts) {
        if (!lastTS) lastTS = ts;
        var dt = ts - lastTS;
        lastTS = ts;

        if (!offscreen && dt < 200) { // skip large gaps (tab switch etc)
          elapsed += dt;
          if (elapsed >= DURATION + FADE) {
            elapsed = 0;
            goTo((current + 1) % slides.length);
          }
        }
        requestAnimationFrame(loop);
      }

      // Dot clicks
      for (var d = 0; d < allDots.length; d++) {
        (function (i) {
          allDots[i].addEventListener("click", function () {
            var target = i % slides.length;
            if (target !== current) {
              elapsed = 0;
              goTo(target);
            }
          });
        })(d);
      }

      // Only pause when completely off-screen (not on hover)
      var obs = new IntersectionObserver(function (entries) {
        offscreen = !entries[0].isIntersecting;
      }, { threshold: 0.01 });
      obs.observe(heroEl);

      // Init
      updateUI(0);
      if (!prefersRM) requestAnimationFrame(loop);
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
