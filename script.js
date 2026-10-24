/* =======================================================================
   ПРОФИ РЕМОНТ — script.js
   Без внешних зависимостей. Разделы:
   1. Шапка при скролле
   2. Мобильное меню
   3. Анимации появления (IntersectionObserver)
   4. Галерея и лайтбокс
   5. Аккордеон FAQ
   6. Калькулятор стоимости
   7. Кнопки услуг → калькулятор/форма
   8. Валидация и отправка формы заявки
   ======================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initHeaderScroll();
  initMobileMenu();
  initRevealAnimations();
  initGalleryLightbox();
  initFaqAccordion();
  initCalculator();
  initServiceButtons();
  initContactForm();
});

/* ---------- 1. Шапка при скролле ---------- */
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const toggle = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/* ---------- 2. Мобильное меню ---------- */
function initMobileMenu() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".mobile-nav");
  const closeBtn = document.querySelector(".mobile-nav-close");
  if (!burger || !nav) return;

  const openMenu = () => {
    nav.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const firstLink = nav.querySelector("a");
    if (firstLink) firstLink.focus();
  };

  const closeMenu = () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    burger.focus();
  };

  burger.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

/* ---------- 3. Анимации появления ---------- */
function initRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- 4. Галерея и лайтбокс ---------- */
function initGalleryLightbox() {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("lightbox");
  if (!items.length || !lightbox) return;

  const img = lightbox.querySelector("img");
  const caption = lightbox.querySelector("figcaption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  let currentIndex = 0;
  let lastFocused = null;

  const show = (index) => {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const fullSrc = item.dataset.full || item.querySelector("img").src;
    img.src = fullSrc;
    img.alt = item.querySelector("img").alt;
    caption.textContent = item.dataset.caption || "";
  };

  const open = (index) => {
    lastFocused = document.activeElement;
    show(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  items.forEach((item, index) => {
    item.addEventListener("click", () => open(index));
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(currentIndex - 1));
  nextBtn.addEventListener("click", () => show(currentIndex + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(currentIndex + 1);
    if (e.key === "ArrowLeft") show(currentIndex - 1);
  });
}

/* ---------- 5. Аккордеон FAQ ---------- */
function initFaqAccordion() {
  const questions = document.querySelectorAll(".faq-question");
  if (!questions.length) return;

  questions.forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      questions.forEach((other) => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          const otherPanel = document.getElementById(other.getAttribute("aria-controls"));
          if (otherPanel) otherPanel.style.maxHeight = null;
        }
      });

      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
    });
  });
}

/* ---------- 6. Калькулятор стоимости ----------
   ВАЖНО: коэффициенты ниже условные и предназначены только
   для демонстрации работы калькулятора. Реальная стоимость
   определяется после выезда специалиста на объект. */
function initCalculator() {
  const form = document.getElementById("calc-form");
  const resultBox = document.getElementById("calc-result");
  if (!form || !resultBox) return;

  const RATE_BY_REPAIR_TYPE = {
    cosmetic: 8000,
    capital: 15000,
    turnkey: 20000,
  };

  const MULTIPLIER_BY_PLACE = {
    flat: 1,
    house: 1.15,
    commercial: 0.9,
  };

  const formatMoney = (value) =>
    Math.round(value / 1000) * 1000 === 0
      ? "0"
      : new Intl.NumberFormat("ru-RU").format(Math.round(value / 1000) * 1000);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const placeType = form.elements["place-type"].value;
    const repairType = form.elements["repair-type"].value;
    const area = parseFloat(form.elements["area"].value);
    const scopeBoxes = form.querySelectorAll('input[name="scope"]:checked');

    if (!placeType || !repairType || !area || area <= 0) {
      resultBox.innerHTML =
        '<p class="calc-empty">Заполните тип помещения, тип ремонта и площадь, чтобы увидеть предварительный ориентир.</p>';
      return;
    }

    const scopeCount = scopeBoxes.length;
    const scopeMultiplier = 0.6 + (scopeCount / 4) * 0.4;

    const ratePerMeter = RATE_BY_REPAIR_TYPE[repairType] * MULTIPLIER_BY_PLACE[placeType] * scopeMultiplier;
    const total = ratePerMeter * area;
    const low = total * 0.9;
    const high = total * 1.15;

    const placeLabel = form.elements["place-type"].options[form.elements["place-type"].selectedIndex].text;
    const repairLabel = form.elements["repair-type"].options[form.elements["repair-type"].selectedIndex].text;
    const scopeLabels = Array.from(scopeBoxes).map((box) => box.dataset.label).join(", ") || "объём работ не отмечен";

    resultBox.innerHTML = `
      <p class="calc-result-label">Предварительный ориентир для демонстрации</p>
      <p class="calc-result-value">${formatMoney(low)} – ${formatMoney(high)} ₽
        <span>за ${area} м², ${placeLabel.toLowerCase()}, ${repairLabel.toLowerCase()}</span>
      </p>
      <p>Это не коммерческое предложение. Точная стоимость определяется после выезда специалиста и согласовывается с заказчиком в договоре.</p>
      <div class="calc-breakdown">
        <div><span>Тип помещения</span><span>${placeLabel}</span></div>
        <div><span>Тип ремонта</span><span>${repairLabel}</span></div>
        <div><span>Площадь</span><span>${area} м²</span></div>
        <div><span>Состав работ</span><span>${scopeLabels}</span></div>
      </div>
      <button type="button" class="btn btn-outline--light btn-full" id="calc-to-request">Оставить заявку на основе расчёта</button>
    `;

    const toRequestBtn = document.getElementById("calc-to-request");
    if (toRequestBtn) {
      toRequestBtn.addEventListener("click", () => {
        prefillRequestForm({
          repairType: repairLabel,
          area,
          comment: `Интересует: ${repairLabel.toLowerCase()}, ${placeLabel.toLowerCase()}, ${area} м². Состав работ: ${scopeLabels}. Ориентир с калькулятора: ${formatMoney(
            low
          )}–${formatMoney(high)} ₽ (предварительно, для демонстрации).`,
        });
      });
    }
  });
}

/* ---------- 7. Кнопки услуг → калькулятор/форма ---------- */
function initServiceButtons() {
  const buttons = document.querySelectorAll("[data-service-request]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const serviceName = btn.dataset.serviceRequest;
      prefillRequestForm({ repairTypeText: serviceName, comment: `Интересует услуга: ${serviceName}.` });
    });
  });
}

/* Сопоставление подписей (из калькулятора и карточек услуг) со значениями
   в select формы заявки. Явная карта — надёжнее нечёткого сравнения строк,
   когда несколько вариантов начинаются с одного и того же слова "Ремонт". */
const REPAIR_LABEL_TO_FORM_VALUE = {
  "косметический": "cosmetic",
  "косметический ремонт": "cosmetic",
  "капитальный": "capital",
  "капитальный ремонт": "capital",
  "под ключ": "turnkey",
  "ремонт под ключ": "turnkey",
  "ремонт новостроек": "newbuild",
  "ремонт ванных комнат": "bathroom",
  "ремонт коммерческих помещений": "commercial",
};

/* Общая функция предзаполнения формы заявки по данным из калькулятора/карточек услуг */
function prefillRequestForm({ repairType, repairTypeText, area, comment }) {
  const form = document.getElementById("request-form");
  if (!form) return;

  const repairSelect = form.elements["repair-type"];
  if (repairSelect) {
    const key = (repairType || repairTypeText || "").trim().toLowerCase();
    const value = REPAIR_LABEL_TO_FORM_VALUE[key];
    if (value) {
      repairSelect.value = value;
    }
  }

  if (area && form.elements["area"]) {
    form.elements["area"].value = area;
  }

  if (comment && form.elements["comment"]) {
    form.elements["comment"].value = comment;
  }

  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  const nameField = form.elements["name"];
  if (nameField) {
    window.setTimeout(() => nameField.focus(), 450);
  }
}

/* ---------- 8. Валидация и отправка формы заявки ---------- */
function initContactForm() {
  const form = document.getElementById("request-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  const fields = {
    name: { validate: (v) => v.trim().length >= 2, message: "Укажите имя (минимум 2 символа)." },
    contact: { validate: (v) => v.trim().length >= 5, message: "Укажите телефон или удобный способ связи." },
    "repair-type": { validate: (v) => v !== "", message: "Выберите тип ремонта." },
    area: {
      validate: (v) => v === "" || (parseFloat(v) > 0 && parseFloat(v) < 5000),
      message: "Укажите реальную площадь в м² или оставьте поле пустым.",
    },
  };

  const showError = (name, message) => {
    const field = form.elements[name];
    const wrapper = field.closest(".field");
    const errorEl = wrapper.querySelector(".field-error");
    if (message) {
      wrapper.classList.add("has-error");
      errorEl.textContent = message;
    } else {
      wrapper.classList.remove("has-error");
      errorEl.textContent = "";
    }
  };

  Object.keys(fields).forEach((name) => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener("blur", () => {
      const { validate, message } = fields[name];
      showError(name, validate(field.value) ? "" : message);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.classList.remove("is-visible");

    let isValid = true;
    Object.keys(fields).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      const { validate, message } = fields[name];
      const fieldValid = validate(field.value);
      showError(name, fieldValid ? "" : message);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      const firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
      if (firstError) firstError.focus();
      return;
    }

    /* Реальной отправки на сервер здесь нет — см. README о подключении
       формы к Telegram-боту, email-сервису или своему бэкенду. */
    status.textContent =
      "Заявка оформлена в демо-режиме. Это демонстрационная форма — чтобы заявки реально приходили вам, подключите её к Telegram-боту, email-сервису или бэкенду (см. README проекта).";
    status.classList.add("is-visible");
    status.setAttribute("tabindex", "-1");
    status.focus();
    form.reset();
  });
}
