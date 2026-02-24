/**
 * Poranoplaza - Contact Form Validation
 * Client-side validation with XSS prevention
 */

(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    name: {
      el: form.querySelector("#field-name"),
      error: form.querySelector("#error-name"),
      validate: (v) => v.trim().length > 0,
      message: "お名前を入力してください。",
    },
    company: {
      el: form.querySelector("#field-company"),
      error: form.querySelector("#error-company"),
      validate: (v) => v.trim().length > 0,
      message: "会社名を入力してください。",
    },
    email: {
      el: form.querySelector("#field-email"),
      error: form.querySelector("#error-email"),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "有効なメールアドレスを入力してください。",
    },
    phone: {
      el: form.querySelector("#field-phone"),
      error: form.querySelector("#error-phone"),
      validate: (v) => v.trim() === "" || /^[\d\-+() ]{7,20}$/.test(v.trim()),
      message: "有効な電話番号を入力してください。",
    },
    service: {
      el: form.querySelector("#field-service"),
      error: form.querySelector("#error-service"),
      validate: (v) => v !== "",
      message: "ご相談内容を選択してください。",
    },
    message: {
      el: form.querySelector("#field-message"),
      error: form.querySelector("#error-message"),
      validate: (v) => v.trim().length >= 10,
      message: "お問い合わせ内容を10文字以上入力してください。",
    },
  };

  /**
   * Sanitize input to prevent XSS
   */
  function sanitize(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Show error for a field
   */
  function showError(field) {
    field.el.setAttribute("aria-invalid", "true");
    field.error.textContent = field.message;
    field.error.hidden = false;
  }

  /**
   * Clear error for a field
   */
  function clearError(field) {
    field.el.removeAttribute("aria-invalid");
    field.error.textContent = "";
    field.error.hidden = true;
  }

  /**
   * Validate a single field
   */
  function validateField(key) {
    const field = fields[key];
    if (!field.el) return true;

    const value = field.el.value;
    if (!field.validate(value)) {
      showError(field);
      return false;
    }
    clearError(field);
    return true;
  }

  // Live validation on blur
  Object.keys(fields).forEach((key) => {
    if (fields[key].el) {
      fields[key].el.addEventListener("blur", () => validateField(key));
      // Clear error on input
      fields[key].el.addEventListener("input", () => {
        if (fields[key].el.getAttribute("aria-invalid") === "true") {
          validateField(key);
        }
      });
    }
  });

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;
    let firstInvalid = null;

    Object.keys(fields).forEach((key) => {
      if (!validateField(key)) {
        isValid = false;
        if (!firstInvalid && fields[key].el) {
          firstInvalid = fields[key].el;
        }
      }
    });

    if (!isValid) {
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    // Collect sanitized data
    const formData = {};
    Object.keys(fields).forEach((key) => {
      if (fields[key].el) {
        formData[key] = sanitize(fields[key].el.value.trim());
      }
    });

    // Show success state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<svg class="animate-spin size-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 送信中...';

    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
      // Success message
      form.innerHTML = `
        <div class="text-center py-12">
          <div class="size-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg class="size-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 class="font-display text-fluid-2xl font-bold text-white mb-3">送信完了</h3>
          <p class="text-white/60 text-fluid-base">お問い合わせありがとうございます。<br>担当者より2営業日以内にご連絡いたします。</p>
        </div>
      `;
    }, 1500);
  });
})();
