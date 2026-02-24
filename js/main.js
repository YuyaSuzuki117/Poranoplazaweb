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
  const revealElements = document.querySelectorAll(".reveal");

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
     Testimonial Dot Navigation
     ======================================== */
  const testimonialScroll = document.querySelector(".testimonial-scroll");
  const dots = document.querySelectorAll(".dot-nav button");

  if (testimonialScroll && dots.length > 0) {
    // Click dot to scroll
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        const cards = testimonialScroll.querySelectorAll(".testimonial-card");
        if (cards[index]) {
          cards[index].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
          });
        }
      });
    });

    // Update active dot on scroll
    const updateDots = () => {
      const cards = testimonialScroll.querySelectorAll(".testimonial-card");
      const scrollLeft = testimonialScroll.scrollLeft;
      const containerWidth = testimonialScroll.offsetWidth;
      let activeIndex = 0;

      cards.forEach((card, index) => {
        const cardLeft = card.offsetLeft - testimonialScroll.offsetLeft;
        if (cardLeft <= scrollLeft + containerWidth * 0.3) {
          activeIndex = index;
        }
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
        dot.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
      });
    };

    testimonialScroll.addEventListener("scroll", updateDots, { passive: true });
  }

  /* ========================================
     Current Year in Footer
     ======================================== */
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
