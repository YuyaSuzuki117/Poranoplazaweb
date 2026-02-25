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
  const slideshow = document.querySelector(".hero-slideshow");
  if (slideshow) {
    const slides = slideshow.querySelectorAll(".hero-slide");
    const dots = slideshow.querySelectorAll(".hero-dot");
    const progressBar = slideshow.querySelector(".hero-progress");
    const INTERVAL = 5000; // 5s per slide
    const TICK = 50;
    let current = 0;
    let elapsed = 0;
    let timer = null;
    let paused = false;

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      dots[current].setAttribute("aria-selected", "false");

      current = index;
      elapsed = 0;

      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
      dots[current].setAttribute("aria-selected", "true");

      if (progressBar) progressBar.style.width = "0%";
    }

    function tick() {
      if (paused) return;
      elapsed += TICK;
      if (progressBar) {
        progressBar.style.width = (elapsed / INTERVAL * 100) + "%";
      }
      if (elapsed >= INTERVAL) {
        goTo((current + 1) % slides.length);
      }
    }

    // Dot clicks
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (i !== current) goTo(i);
      });
    });

    // Pause on hover / focus
    slideshow.addEventListener("mouseenter", function () { paused = true; });
    slideshow.addEventListener("mouseleave", function () { paused = false; });
    slideshow.addEventListener("focusin", function () { paused = true; });
    slideshow.addEventListener("focusout", function () { paused = false; });

    // Pause when off-screen
    var slideshowObserver = new IntersectionObserver(function (entries) {
      paused = !entries[0].isIntersecting;
    }, { threshold: 0.2 });
    slideshowObserver.observe(slideshow);

    // Respect reduced motion
    var prefersRM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersRM) {
      timer = setInterval(tick, TICK);
    }
  }

  /* ========================================
     Current Year in Footer
     ======================================== */
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
