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

if (header) {
  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

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

if (parallaxHero && !reduceMotion) {
  const parallaxBg = parallaxHero.querySelector(".parallax-bg");
  if (parallaxBg) {
    window.addEventListener("scroll", () => {
      const translateY = -window.scrollY * 0.3;
      parallaxBg.style.transform = `translateY(${translateY}px)`;
    }, { passive: true });
  }
}

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
