/**
 * Poranoplaza - Main JavaScript
 * Navigation, scroll reveal, hero slideshow, counters, marquee
 */

(function () {
  "use strict";

  let revealObserver, marqueeObserver, textRevealObserver;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ========================================
     Smart Sticky Header
     - transparent → solid on scroll
     - hide on scroll down, show on scroll up
     ======================================== */
  const header = document.querySelector(".site-header");
  const SCROLL_THRESHOLD = 80;
  const HIDE_THRESHOLD = 10;
  let lastScrollY = 0;
  let headerHidden = false;

  function handleHeaderScroll() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;

    // Background: transparent → solid
    if (currentScrollY > SCROLL_THRESHOLD) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
      // Always show header at top of page
      if (headerHidden) {
        header.classList.remove("is-hidden");
        headerHidden = false;
      }
    }

    // Smart hide/show (only after passing threshold)
    if (currentScrollY > SCROLL_THRESHOLD) {
      if (delta > HIDE_THRESHOLD && !headerHidden) {
        // Scrolling down — hide
        header.classList.add("is-hidden");
        headerHidden = true;
      } else if (delta < -HIDE_THRESHOLD && headerHidden) {
        // Scrolling up — show
        header.classList.remove("is-hidden");
        headerHidden = false;
      }
    }

    lastScrollY = currentScrollY;
  }

  /* ========================================
     Sticky Phone CTA
     ======================================== */
  const stickyCta = document.getElementById("sticky-cta");
  function handleStickyCta() {
    if (!stickyCta) return;
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

  /* ========================================
     Mobile Menu
     ======================================== */
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];
  let previousFocus = null;

  function openMenu() {
    previousFocus = document.activeElement;
    mobileMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      menuClose.focus();
    });
    document.addEventListener("keydown", trapFocus);
  }

  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (previousFocus) previousFocus.focus();
    document.removeEventListener("keydown", trapFocus);
  }

  function trapFocus(e) {
    if (e.key === "Escape") { closeMenu(); return; }
    if (e.key !== "Tab") return;
    const focusable = mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  if (menuToggle) menuToggle.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  menuLinks.forEach(function (link) { link.addEventListener("click", closeMenu); });

  /* ========================================
     Scroll Reveal (IntersectionObserver)
     ======================================== */
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-wipe"
  );

  if (revealElements.length > 0) {
    if (prefersReducedMotion) {
      revealElements.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
      revealElements.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ========================================
     Hero Text Entrance Animation
     ======================================== */
  const heroSlideshow = document.querySelector(".hero-slideshow");
  if (heroSlideshow) {
    // Trigger hero text animation after a brief delay
    if (prefersReducedMotion) {
      heroSlideshow.classList.add("hero-loaded");
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          heroSlideshow.classList.add("hero-loaded");
        });
      });
    }
  }

  /* ========================================
     Smooth Scroll for Anchor Links
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }
    });
  });

  /* ========================================
     Hero Cinematic Slideshow
     ======================================== */
  const heroEl = document.querySelector(".hero-slideshow");
  if (heroEl) {
    (function () {
      const slides = heroEl.querySelectorAll(".hero-slide");
      const allDots = heroEl.querySelectorAll(".hero-dot");
      const counterEl = heroEl.querySelector("[data-counter]");
      const fillEl = heroEl.querySelector(".hero-counter-fill");
      const DURATION = 5500;
      const FADE = 1400;
      let current = 0;
      let offscreen = false;

      function updateUI(index) {
        if (counterEl) counterEl.textContent = String(index + 1).padStart(2, "0");
        for (let d = 0; d < allDots.length; d++) {
          allDots[d].classList.remove("is-active");
          allDots[d].setAttribute("aria-selected", "false");
        }
        if (fillEl) {
          fillEl.style.transition = "none";
          fillEl.style.transform = "scaleX(0)";
        }
        const reflow = fillEl ? fillEl.offsetWidth : document.body.offsetWidth;
        for (let d = 0; d < allDots.length; d++) {
          const di = d % slides.length;
          if (di === index) {
            allDots[d].classList.add("is-active");
            allDots[d].setAttribute("aria-selected", "true");
          }
        }
        if (fillEl) {
          fillEl.style.transition = "transform " + DURATION + "ms linear";
          fillEl.style.transform = "scaleX(1)";
        }
      }

      function goTo(next) {
        if (next === current) return;
        const prev = current;
        current = next;
        slides[next].classList.add("is-entering");
        updateUI(next);
        setTimeout(function () {
          slides[prev].classList.remove("is-active");
          slides[next].classList.remove("is-entering");
          slides[next].classList.add("is-active");
        }, FADE);
      }

      let elapsed = 0;
      let lastTS = 0;
      function loop(ts) {
        if (!lastTS) lastTS = ts;
        const dt = ts - lastTS;
        lastTS = ts;
        if (!offscreen && dt < 200) {
          elapsed += dt;
          if (elapsed >= DURATION + FADE) {
            elapsed = 0;
            goTo((current + 1) % slides.length);
          }
        }
        requestAnimationFrame(loop);
      }

      for (let d = 0; d < allDots.length; d++) {
        (function (i) {
          allDots[i].addEventListener("click", function () {
            const target = i % slides.length;
            if (target !== current) { elapsed = 0; goTo(target); }
          });
        })(d);
      }

      const obs = new IntersectionObserver(function (entries) {
        offscreen = !entries[0].isIntersecting;
      }, { threshold: 0.01 });
      obs.observe(heroEl);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          updateUI(0);
          if (!prefersReducedMotion) requestAnimationFrame(loop);
        });
      });
    })();
  }

  /* ========================================
     Counter Animation
     ======================================== */
  const counterItems = document.querySelectorAll("[data-counter-target]");
  if (counterItems.length > 0) {
    let countersAnimated = false;

    function animateCounters() {
      if (countersAnimated) return;
      countersAnimated = true;

      counterItems.forEach(function (item) {
        const target = parseInt(item.getAttribute("data-counter-target"), 10);
        const valueEl = item.querySelector(".counter-value");
        if (!valueEl) return;

        let startTime = null;
        const duration = 1600;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.round(eased * target);
          valueEl.textContent = currentVal.toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        if (prefersReducedMotion) {
          valueEl.textContent = target.toLocaleString();
        } else {
          requestAnimationFrame(step);
        }
      });
    }

    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            counterObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    counterItems.forEach(function (item) {
      counterObserver.observe(item);
    });
  }

  /* ========================================
     Photo Marquee (pause when off-screen)
     ======================================== */
  const marqueeInner = document.querySelector(".marquee-inner");
  if (marqueeInner && !prefersReducedMotion) {
    marqueeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            marqueeInner.classList.remove("is-paused");
          } else {
            marqueeInner.classList.add("is-paused");
          }
        });
      },
      { threshold: 0.01 }
    );
    marqueeObserver.observe(marqueeInner);
  }
  // If reduced motion, pause marquee
  if (marqueeInner && prefersReducedMotion) {
    marqueeInner.classList.add("is-paused");
  }

  /* ========================================
     Before/After Toggle (Portfolio)
     ======================================== */
  const baToggles = document.querySelectorAll(".ba-toggle");
  baToggles.forEach(function (el) {
    function toggle() {
      const state = el.getAttribute("data-state");
      const next = state === "after" ? "before" : "after";
      el.setAttribute("data-state", next);
      const label = el.querySelector("[data-ba-label]");
      if (label) label.textContent = next === "after" ? "Before" : "After";
    }
    const btn = el.querySelector(".ba-btn");
    if (btn) btn.addEventListener("click", toggle);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  /* ========================================
     Category Filter (Works page)
     ======================================== */
  const filterBtns = document.querySelectorAll("[data-filter]");
  const filterItems = document.querySelectorAll("[data-category]");

  if (filterBtns.length > 0 && filterItems.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const cat = btn.getAttribute("data-filter");

        filterBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");

        filterItems.forEach(function (item) {
          const itemCat = item.getAttribute("data-category");
          if (cat === "all" || itemCat === cat) {
            item.style.display = "";
            item.removeAttribute("hidden");
          } else {
            item.style.display = "none";
            item.setAttribute("hidden", "");
          }
        });

        const resultCount = document.getElementById("filter-result-count");
        if (resultCount) {
          const visibleCount = Array.from(filterItems).filter(function (item) { return !item.hasAttribute("hidden"); }).length;
          const catName = btn.textContent.trim();
          resultCount.textContent = catName + "の施工実績 " + visibleCount + "件を表示中";
        }
      });
    });
  }

  /* ========================================
     Lightbox (Works page)
     ======================================== */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  const lightboxClose = lightbox ? lightbox.querySelector("[data-lightbox-close]") : null;
  let previousLightboxFocus = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    previousLightboxFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.removeAttribute("hidden");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () {
      lightbox.classList.add("is-active");
      if (lightboxClose) lightboxClose.focus();
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () {
      lightbox.setAttribute("hidden", "");
      lightboxImg.src = "";
      if (previousLightboxFocus) previousLightboxFocus.focus();
    }, 400);
  }

  if (lightbox) {
    // Close on backdrop click
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.hasAttribute("data-lightbox-close")) {
        closeLightbox();
      }
    });

    // Close on Escape, trap focus
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeLightbox(); return; }
      if (e.key !== "Tab") return;
      const focusable = lightbox.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Open on trigger click
    document.querySelectorAll("[data-lightbox-src]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openLightbox(trigger.getAttribute("data-lightbox-src"), trigger.getAttribute("alt") || trigger.getAttribute("aria-label") || "");
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(trigger.getAttribute("data-lightbox-src"), trigger.getAttribute("alt") || trigger.getAttribute("aria-label") || "");
        }
      });
    });
  }

  /* ========================================
     Scroll Progress Bar
     ======================================== */
  const progressBar = document.querySelector(".scroll-progress");
  function updateProgress() {
    if (!progressBar || prefersReducedMotion) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = "scaleX(" + Math.min(progress, 1) + ")";
  }

  /* ========================================
     Parallax Photos
     ======================================== */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  function updateParallax() {
    if (parallaxEls.length === 0 || prefersReducedMotion) return;
    const vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      const center = rect.top + rect.height / 2;
      const offset = (center - vh / 2) * speed;
      el.style.transform = "translateY(" + offset + "px)";
    });
  }

  /* ========================================
     Unified Scroll Handler
     ======================================== */
  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(function () {
      handleHeaderScroll();
      handleStickyCta();
      updateProgress();
      updateParallax();
      scrollTicking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  // Run once on load
  onScroll();

  /* ========================================
     Progressive Text Reveal
     ======================================== */
  const textRevealEls = document.querySelectorAll(".text-reveal");
  if (textRevealEls.length > 0 && !prefersReducedMotion) {
    textRevealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const lines = entry.target.querySelectorAll(".text-reveal-line");
            lines.forEach(function (line, i) {
              line.style.transitionDelay = (i * 120) + "ms";
              line.classList.add("is-visible");
            });
            textRevealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    textRevealEls.forEach(function (el) { textRevealObserver.observe(el); });
  }
  // Reduced motion: show immediately
  if (textRevealEls.length > 0 && prefersReducedMotion) {
    textRevealEls.forEach(function (el) {
      el.querySelectorAll(".text-reveal-line").forEach(function (line) {
        line.classList.add("is-visible");
      });
    });
  }

  /* ========================================
     Current Year in Footer
     ======================================== */
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ========================================
     Cleanup on page unload
     ======================================== */
  window.addEventListener("beforeunload", function () {
    if (typeof revealObserver !== "undefined" && revealObserver) revealObserver.disconnect();
    if (typeof marqueeObserver !== "undefined" && marqueeObserver) marqueeObserver.disconnect();
    if (typeof textRevealObserver !== "undefined" && textRevealObserver) textRevealObserver.disconnect();
  });
})();
