/**
 * Poranoplaza - Before/After Comparison Slider
 * Initializes img-comparison-slider Web Component
 */

(function () {
  "use strict";

  function initSliders() {
    const sliders = document.querySelectorAll("img-comparison-slider");

    sliders.forEach((slider) => {
      // Set initial position to 50%
      slider.value = 50;

      // Add keyboard instructions for screen readers
      const srInstructions = document.createElement("span");
      srInstructions.className = "sr-only";
      srInstructions.textContent =
        "左右の矢印キーでスライダーを操作し、施工前と施工後を比較できます";
      slider.parentElement.prepend(srInstructions);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSliders);
  } else {
    initSliders();
  }
})();
