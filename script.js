import { initI18n, setLanguage, getCurrentLang, getAvailableLangs, t } from './i18n/index.js';

const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-menu-toggle]");
const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll("[data-reveal]");
const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
const trackedSections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const menuModal = document.querySelector("[data-menu-modal]");
const openMenuButton = document.querySelector("[data-open-menu]");
const closeMenuButtons = document.querySelectorAll("[data-close-menu]");
const dishAccordion = document.querySelector("[data-dish-accordion]");
const dishPanels = document.querySelectorAll("[data-dish-panel]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const parallaxHero = document.querySelector(".parallax-hero");

// --- Language switcher ---
const langToggle = document.querySelector("[data-lang-toggle]");
const langDropdown = document.querySelector("[data-lang-dropdown]");
const langButtons = document.querySelectorAll("[data-lang]");

if (langToggle && langDropdown) {
  // Toggle dropdown
  langToggle.addEventListener("click", () => {
    const isOpen = langDropdown.classList.toggle("is-open");
    langToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close dropdown on outside click
  document.addEventListener("click", (event) => {
    if (!langToggle.contains(event.target) && !langDropdown.contains(event.target)) {
      langDropdown.classList.remove("is-open");
      langToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      langDropdown.classList.remove("is-open");
      langToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Language selection
  langButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const lang = btn.getAttribute("data-lang");
      await setLanguage(lang);
      langDropdown.classList.remove("is-open");
      langToggle.setAttribute("aria-expanded", "false");
      updateActiveLang(lang);
    });
  });
}

function updateActiveLang(lang) {
  langButtons.forEach((btn) => {
    const code = btn.getAttribute("data-lang");
    btn.classList.toggle("is-active", code === lang);
  });
  // Update the label on the toggle button
  const labelSpan = langToggle.querySelector("span");
  if (labelSpan) {
    const activeBtn = document.querySelector(`[data-lang="${lang}"]`);
    labelSpan.textContent = activeBtn ? activeBtn.textContent : lang.toUpperCase();
  }
}

// --- Mobile nav ---
if (nav && toggle) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// --- Scroll header ---
if (header) {
  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

// --- Reveal observer ---
if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// --- Active nav section ---
if (trackedSections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-38% 0px -54% 0px", threshold: 0 }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

// --- Menu modal ---
if (menuModal && openMenuButton) {
  const openMenu = () => {
    menuModal.classList.add("is-open");
    menuModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-lock");
  };

  const closeMenu = () => {
    menuModal.classList.remove("is-open");
    menuModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-lock");
  };

  openMenuButton.addEventListener("click", openMenu);
  closeMenuButtons.forEach((button) => button.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuModal.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

// --- Parallax ---
if (parallaxHero && !reduceMotion) {
  const parallaxBg = parallaxHero.querySelector(".parallax-bg");
  if (parallaxBg) {
    window.addEventListener("scroll", () => {
      const translateY = -window.scrollY * 0.3;
      parallaxBg.style.transform = `translateY(${translateY}px)`;
    }, { passive: true });
  }
}

// --- Dish accordion ---
if (dishAccordion && dishPanels.length) {
  let activeDish = 0;
  let dishTimer;

  const setActiveDish = (index) => {
    activeDish = index;
    dishPanels.forEach((panel, panelIndex) => {
      panel.classList.toggle("is-active", panelIndex === activeDish);
    });
  };

  const startDishRotation = () => {
    dishTimer = window.setInterval(() => {
      setActiveDish((activeDish + 1) % dishPanels.length);
    }, 3600);
  };

  const restartDishRotation = () => {
    window.clearInterval(dishTimer);
    startDishRotation();
  };

  dishPanels.forEach((panel, index) => {
    panel.addEventListener("click", () => {
      setActiveDish(index);
      if (!reduceMotion) {
        restartDishRotation();
      }
    });

    panel.addEventListener("mouseenter", () => {
      setActiveDish(index);
      if (!reduceMotion) {
        window.clearInterval(dishTimer);
      }
    });
  });

  if (!reduceMotion) {
    dishAccordion.addEventListener("mouseleave", restartDishRotation);
    startDishRotation();
  }
}

// --- Legal modal ---
const legalModal = document.querySelector("[data-legal-modal]");
const legalOpen = document.querySelector("[data-legal-open]");
const legalCloseButtons = document.querySelectorAll("[data-legal-close]");
const legalContent = document.querySelector("[data-legal-content]");

/**
 * Load a JSON file and return its parsed content.
 */
async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/**
 * Get the legal text for the current language, loading es.json if needed.
 */
async function getLegalText(lang) {
  if (lang === "ca") {
    return t("legal.text");
  }
  if (lang === "es") {
    return t("legal.text");
  }
  // en, fr, ru: disclaimer + Spanish text
  const disclaimer = t("legal.disclaimer");
  const esTranslations = await loadJson("i18n/es.json");
  const esText = esTranslations.legal && esTranslations.legal.text;
  return `<em class="legal-disclaimer">${disclaimer}</em>${esText || ""}`;
}

async function openLegalModal() {
  const lang = getCurrentLang();
  let html;
  try {
    html = await getLegalText(lang);
  } catch {
    html = "<p>Error loading legal information.</p>";
  }
  if (legalContent) legalContent.innerHTML = html;
  if (legalModal) {
    legalModal.classList.add("is-open");
    legalModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-lock");
  }
}

function closeLegalModal() {
  if (legalModal) {
    legalModal.classList.remove("is-open");
    legalModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-lock");
  }
}

if (legalOpen) {
  legalOpen.addEventListener("click", openLegalModal);
}

legalCloseButtons.forEach((button) => button.addEventListener("click", closeLegalModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && legalModal && legalModal.classList.contains("is-open")) {
    closeLegalModal();
  }
});

// Refresh legal content when language changes
document.addEventListener("i18n:changed", () => {
  const legalBtn = document.querySelector("[data-legal-open]");
  if (legalBtn) {
    legalBtn.textContent = t("legal.button");
  }
  // If modal is open, refresh content
  if (legalModal && legalModal.classList.contains("is-open")) {
    openLegalModal();
  }
});

// --- Init i18n ---
(async () => {
  await initI18n();
  updateActiveLang(getCurrentLang());
})();
