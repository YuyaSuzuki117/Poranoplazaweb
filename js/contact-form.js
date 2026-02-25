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

  // Focus animation: add/remove is-focused class for CSS transitions
  Object.keys(fields).forEach((key) => {
    if (!fields[key].el) return;
    fields[key].el.addEventListener("focus", function () {
      this.parentElement.classList.add("is-focused");
    });
    fields[key].el.addEventListener("blur", function () {
      this.parentElement.classList.remove("is-focused");
      validateField(key);
    });
    fields[key].el.addEventListener("input", () => {
      if (fields[key].el.getAttribute("aria-invalid") === "true") {
        validateField(key);
      }
    });
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

    // Build mailto URL with form data
    const serviceLabels = {
      interior: "内装工事",
      aircon: "空調設備工事",
      electrical: "一般電気工事",
      fire: "消防設備工事",
      estimate: "お見積もり依頼",
      other: "その他",
    };

    const subject = encodeURIComponent(
      "【お問い合わせ】" + (serviceLabels[formData.service] || formData.service)
    );

    const bodyParts = [
      "お名前: " + formData.name,
      "会社名: " + formData.company,
      "メールアドレス: " + formData.email,
      formData.phone ? "電話番号: " + formData.phone : "",
      "ご相談内容: " + (serviceLabels[formData.service] || formData.service),
      "",
      "お問い合わせ内容:",
      formData.message,
    ]
      .filter(Boolean)
      .join("\n");

    const mailtoUrl =
      "mailto:info@poranoplaza.com?subject=" +
      subject +
      "&body=" +
      encodeURIComponent(bodyParts);

    // Show confirmation message with entrance animation
    form.innerHTML = `
      <div class="text-center py-12 success-message" style="opacity:0;transform:translateY(1rem);">
        <div class="size-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center success-icon" style="opacity:0;transform:scale(0.6);">
          <svg class="size-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 class="font-display text-fluid-2xl font-bold text-navy-900 mb-3">メールアプリが開きます</h3>
        <p class="text-navy-500 text-fluid-base mb-6">内容をご確認の上、送信してください。<br>メールアプリが開かない場合は、下のボタンをクリックしてください。</p>
        <a href="${mailtoUrl}" class="inline-flex items-center justify-center gap-2 px-8 py-3 bg-navy-600 hover:bg-navy-500 text-white font-display font-bold rounded-lg no-underline transition-colors duration-150 text-fluid-base">
          <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          メールアプリを開く
        </a>
      </div>
    `;

    // Animate success message entrance
    var successMsg = form.querySelector(".success-message");
    var successIcon = form.querySelector(".success-icon");
    if (successMsg) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          successIcon.style.transition = "opacity 0.4s ease-out, transform 0.4s ease-out";
          successIcon.style.opacity = "1";
          successIcon.style.transform = "scale(1)";
          setTimeout(function () {
            successMsg.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
            successMsg.style.opacity = "1";
            successMsg.style.transform = "translateY(0)";
          }, 200);
        });
      });
    }

    // Open mailto link
    window.location.href = mailtoUrl;
  });
})();
