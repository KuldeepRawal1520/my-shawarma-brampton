(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (window.innerWidth <= 700 && nav.classList.contains("open") &&
          !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Replace failed external images with a lightweight, self-contained fallback.
  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#36281f"/><stop offset="1" stop-color="#a44a32"/></linearGradient></defs>
    <rect width="900" height="600" fill="url(#bg)"/>
    <circle cx="450" cy="260" r="145" fill="#f6eee1" opacity=".96"/>
    <circle cx="450" cy="260" r="123" fill="#e7d8c5"/>
    <g fill="#90633e"><circle cx="400" cy="225" r="34"/><circle cx="480" cy="208" r="33"/><circle cx="510" cy="272" r="34"/><circle cx="428" cy="291" r="36"/><circle cx="360" cy="276" r="28"/></g>
    <g fill="#50804b"><ellipse cx="370" cy="211" rx="16" ry="7" transform="rotate(-35 370 211)"/><ellipse cx="483" cy="305" rx="20" ry="8" transform="rotate(25 483 305)"/><ellipse cx="534" cy="219" rx="18" ry="8" transform="rotate(-20 534 219)"/></g>
    <text x="450" y="470" fill="#fff6ea" font-family="Arial,sans-serif" font-size="30" text-anchor="middle" letter-spacing="5">MY SHAWARMA</text>
    <text x="450" y="508" fill="#ffcec1" font-family="Arial,sans-serif" font-size="17" text-anchor="middle" letter-spacing="3">MEDITERRANEAN FAVOURITES</text>
  </svg>`;
  const fallbackUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(fallbackSvg);
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied === "true") return;
      img.dataset.fallbackApplied = "true";
      img.classList.add("image-fallback");
      img.src = fallbackUrl;
    });
  });

  // Active section indicator for the main navigation.
  const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === "#" + visible.target.id) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-20% 0px -62% 0px", threshold: [0, 0.15, 0.35, 0.6] });
    observedSections.forEach((section) => observer.observe(section));
  }

  // Keyboard-accessible gallery lightbox.
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.querySelector(".lightbox-close");

  if (lightbox && lightboxImage && lightboxCaption) {
    document.querySelectorAll(".gallery-item").forEach((item) => {
      item.addEventListener("click", () => {
        const image = item.querySelector("img");
        if (!image) return;
        lightboxImage.src = item.dataset.full || image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = item.dataset.caption || image.alt;
        if (typeof lightbox.showModal === "function") lightbox.showModal();
        document.body.classList.add("lightbox-open");
        if (lightboxClose) lightboxClose.focus();
      });
    });

    const closeLightbox = () => {
      if (lightbox.open) lightbox.close();
      document.body.classList.remove("lightbox-open");
    };
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
  }

  // This form deliberately prepares an SMS draft; it does not send anything by itself.
  const contactForm = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");
  if (contactForm && formNote) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const message = String(formData.get("message") || "").trim();
      const body = `Hi My Shawarma, my name is ${name}. ${message}`;
      const smsUrl = "sms:+19057942400?body=" + encodeURIComponent(body);

      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = smsUrl;
        formNote.textContent = "Your text draft is opening. Please review it and tap Send in your messaging app.";
        return;
      }

      try {
        await navigator.clipboard.writeText(body);
        formNote.textContent = "Message copied to your clipboard. Please text it to (905) 794-2400 or call the restaurant.";
      } catch {
        formNote.textContent = "Please text your message to (905) 794-2400 or call the restaurant. This form does not send messages directly.";
      }
    });
  }
})();