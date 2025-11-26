document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".main-nav .nav-link");
  const navSlider = document.querySelector(".main-nav .nav-slider");
  const pageSections = document.querySelectorAll(".page-section");
  const ctaLinks = document.querySelectorAll(".page-transition-link");
  const cursor = document.querySelector(".cursor");
  const copyEmailBtn = document.getElementById("copy-email-btn");
  const emailText = document.getElementById("email-text");
  const copyPhoneBtn = document.getElementById("copy-phone-btn");
  const phoneText = document.getElementById("phone-text");

  // --- CURSOR ANIMATION ---
  document.addEventListener("mousemove", (e) => {
    cursor.style.top = e.clientY + "px";
    cursor.style.left = e.clientX + "px";
  });

  document
    .querySelectorAll(
      "a, button, .project-card, .skill-item, .contact-option-card"
    )
    .forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });

  // --- COPY FUNCTIONS ---
  function setupCopyButton(button, textElement, successMessage = "Copié !") {
    if (button && textElement) {
      button.addEventListener("click", async () => {
        const text = textElement.textContent.trim();
        try {
          await navigator.clipboard.writeText(text);

          // Visual feedback
          button.classList.add("copied");
          const originalHTML = button.innerHTML;
          button.innerHTML = '<i data-feather="check"></i>';
          feather.replace();

          // Show temporary tooltip
          const tooltip = document.createElement("div");
          tooltip.textContent = successMessage;
          tooltip.style.cssText = `
                        position: absolute;
                        top: -35px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: var(--primary-color);
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        white-space: nowrap;
                        z-index: 1000;
                        opacity: 0;
                        transition: opacity 0.2s ease;
                    `;
          button.style.position = "relative";
          button.appendChild(tooltip);

          // Animate tooltip
          setTimeout(() => (tooltip.style.opacity = "1"), 10);

          // Reset after 2 seconds
          setTimeout(() => {
            button.classList.remove("copied");
            button.innerHTML = originalHTML;
            feather.replace();
            if (tooltip.parentNode) {
              tooltip.remove();
            }
          }, 2000);
        } catch (err) {
          console.error("Erreur lors de la copie:", err);
          // Fallback for older browsers
          textElement.select();
          document.execCommand("copy");
        }
      });
    }
  }

  // Setup copy buttons
  setupCopyButton(copyEmailBtn, emailText, "Email copié !");
  setupCopyButton(copyPhoneBtn, phoneText, "Numéro copié !");

  // --- MAGNETIC EFFECT ---
  const magneticElements = document.querySelectorAll("[data-magnetic]");
  magneticElements.forEach((el) => {
    const strength = 40;
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const { left, top, width, height } = rect;
      const x = e.clientX - left;
      const y = e.clientY - top;
      const moveX = ((x - width / 2) / width) * strength;
      const moveY = ((y - height / 2) / height) * strength;
      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });

  // --- NAVIGATION LOGIC ---
  function moveSlider(targetLink) {
    if (!targetLink) return;
    const nav = targetLink.parentElement;
    const targetRect = targetLink.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    navSlider.style.width = `${targetRect.width}px`;
    navSlider.style.left = `${targetRect.left - navRect.left}px`;
  }

  function switchPage(targetId) {
    const targetSection = document.getElementById(targetId);
    const activeSection = document.querySelector(".page-section.active");
    if (targetSection === activeSection) return;
    if (activeSection) {
      activeSection.classList.add("exit");
      activeSection.classList.remove("active");
    }
    targetSection.classList.add("active");
    setTimeout(() => {
      if (activeSection) {
        activeSection.classList.remove("exit");
      }
    }, 500);
  }

  const initialActiveLink = document.querySelector(
    ".main-nav .nav-link.active"
  );
  moveSlider(initialActiveLink);

  const allLinks = [...navLinks, ...ctaLinks];

  allLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetNavLink = document.querySelector(
        `.nav-link[href="#${targetId}"]`
      );

      if (targetNavLink) {
        navLinks.forEach((l) => l.classList.remove("active"));
        targetNavLink.classList.add("active");
        moveSlider(targetNavLink);
        switchPage(targetId);
        history.pushState(null, null, `#${targetId}`);
      }
    });
  });

  window.addEventListener("popstate", () => {
    const hash = window.location.hash.substring(1) || "accueil";
    const targetLink = document.querySelector(`.nav-link[href="#${hash}"]`);
    if (targetLink) {
      navLinks.forEach((l) => l.classList.remove("active"));
      targetLink.classList.add("active");
      moveSlider(targetLink);
      switchPage(hash);
    }
  });

  // Re-run Feather Icons replacement after page change
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.attributeName === "class" &&
        mutation.target.classList.contains("active")
      ) {
        feather.replace();
      }
    });
  });
  pageSections.forEach((section) => {
    observer.observe(section, { attributes: true });
  });

  // --- TYPING ANIMATION FOR HERO H1 ---
  (function () {
    const typedEl = document.getElementById("typed-text");
    if (!typedEl) return;

    const roles = ["Monteur Vidéo", "3D Artist", "Motion Designer", "Graphiste", "Web designer"];
    const typingSpeed = 120;
    const erasingSpeed = 40;
    const pauseBetween = 1400;

    let roleIndex = 0;
    let charIndex = 0;

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

   
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      typedEl.textContent = roles[0];
      return;
    }

    async function typeLoop() {
      while (true) {
        const current = roles[roleIndex];

        // type
        while (charIndex < current.length) {
          typedEl.textContent += current.charAt(charIndex);
          charIndex++;
          await wait(typingSpeed);
        }

        await wait(pauseBetween);


        while (charIndex > 0) {
          typedEl.textContent = current.substring(0, charIndex - 1);
          charIndex--;
          await wait(erasingSpeed);
        }

  
        roleIndex = (roleIndex + 1) % roles.length;
        await wait(300);
      }
    }


    typeLoop().catch((err) => console.error("Typing error:", err));
  })();


const projectDetails = {
  "proj-1": {
    title: "Prototype page behance",
    type: "image",
    url: "./assets/Behance.png",
    tags: ["Figma", "UI Design", "UX Research"],
    description: "",
    link: "https://www.figma.com/proto/YoBh7IDv461G4lTq2hMRQO/SAE-101?node-id=2209-374&t=wdg5WnOhF2okBX6L-0"
  },
  "proj-5": {
    title: "Start up fictive - Loc'sur",
    type: "web",
    url: "./assets/loc'sur.png", 
    tags: ["JS", "HTML", "CSS"],
    description: "",
    link: "https://www.a-onillon.mmi-limoges.fr/"
  },
  "proj-6": {
    title: "Applications de sport pour Héméra",
    type: "youtube",
    url: "https://www.youtube.com/embed/fVRYDqP8nDo?si=yQYyVubQmp1jb4ck",
    tags: ["Vidéo", "Réalisation", "Cadrage", "DaVinci Resolve", "Figma"],
    description: "",
    link: "https://www.youtube.com/watch?v=fVRYDqP8nDo"
  },
  "proj-7": {
    title: "Site de Streaming",
    type: "web",
    url: "./assets/site-streaming.png",
    tags: ["HTML", "CSS", "PHP", "JavaScript", "Back-end"],
    description: "",
    link: "https://onillon-sae203.mmi-limoges.fr/"
  },
  "proj-8": {
    title: "Olive Oil",
    type: "image",
    url: "./assets/olive-oil.png",
    tags: ["Figma", "UI Design", "UX Research"],
    description: "",
    link: ""
  },
};

// 2. Sélection des éléments de la page détail
const detailPage = document.getElementById('projet-detail');
const detailTitle = document.getElementById('detail-title');
const detailMedia = document.getElementById('detail-media');
const detailTags = document.getElementById('detail-tags');
const detailDescription = document.getElementById('detail-description');
const detailLink = document.getElementById('detail-link');
const backToProjectsBtn = document.getElementById('back-to-projets-btn');


// 3. Fonction pour afficher la page détail
function showProjectDetail(projectId) {
  const project = projectDetails[projectId];
  if (!project) return;

  // Remplir les données
  detailTitle.textContent = project.title;
  detailDescription.textContent = project.description;
  detailLink.href = project.link;

  // Gérer le média (Image, YouTube, Figma, etc.)
  detailMedia.innerHTML = ''; // Vider le conteneur
  if (project.type === 'youtube') {
    detailMedia.innerHTML = `<iframe src="${project.url}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else if (project.type === 'figma') {
    // Crée l'URL d'embed Figma
    const figmaEmbedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(project.url)}`;
    detailMedia.innerHTML = `<iframe src="${figmaEmbedUrl}" allowfullscreen></iframe>`;
  } else {
    // 'web' ou 'image' (on affiche une image/screenshot)
    detailMedia.innerHTML = `<img src="${project.url}" alt="${project.title}">`;
  }

  // Gérer le lien "À venir"
  if (project.link === "#") {
    detailLink.style.display = 'none';
  } else {
    detailLink.style.display = 'inline-flex';
  }

  // Vider et remplir les tags
  detailTags.innerHTML = '';
  project.tags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.textContent = tag;
    detailTags.appendChild(tagElement);
  });

  // Remplacer les icônes feather
  feather.replace(); 

  // --- C'est la partie importante ---
  // On utilise votre fonction existante pour changer de page !
  switchPage('projet-detail');
  
  // On met à jour l'URL (bonus)
  history.pushState(null, null, `#projet-${projectId}`);
  
  // S'assurer que la page s'affiche en haut
  detailPage.scrollTo(0, 0);
}

// 4. Ajout des écouteurs d'événements
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault(); // Empêche tout comportement par défaut
    const projectId = card.dataset.projectId;
    showProjectDetail(projectId);
  });
});

// 5. Écouteur pour le bouton "Retour"
backToProjectsBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  // On utilise votre fonction existante pour revenir
  switchPage('projets');
  history.pushState(null, null, '#projets');
  
  // On "cache" la page détail pour la prochaine transition
  if (detailPage.classList.contains('active')) {
      detailPage.classList.add('exit');
      detailPage.classList.remove('active');
  }
});
});