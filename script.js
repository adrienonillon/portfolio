document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(
    ".main-nav .nav-link[href^=\"#\"]"
  );
  const navSlider = document.querySelector(".main-nav .nav-slider");
  const pageSections = document.querySelectorAll(".page-section");
  const ctaLinks = document.querySelectorAll(".page-transition-link");
  const cursor = document.querySelector(".cursor");
  const copyEmailBtn = document.getElementById("copy-email-btn");
  const emailText = document.getElementById("email-text");
  const copyPhoneBtn = document.getElementById("copy-phone-btn");
  const phoneText = document.getElementById("phone-text");

  // --- MENU MOBILE ---
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const mainNav = document.querySelector(".main-nav");
  const mobileLinks = document.querySelectorAll(".main-nav .nav-link");

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      // Basculer la classe 'open' sur le menu
      mainNav.classList.toggle("open");
      // Basculer la classe 'active' sur le bouton (pour l'animation CSS)
      mobileMenuBtn.classList.toggle("active");
      
      // Bloquer le scroll
      if (mainNav.classList.contains("open")) {
        document.body.style.overflow = "hidden"; 
      } else {
        document.body.style.overflow = ""; 
      }
    });
  }

  // Fermer le menu quand on clique sur un lien
  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 1024) {
        mainNav.classList.remove("open");
        mobileMenuBtn.classList.remove("active"); // Enlever l'animation
        document.body.style.overflow = "";
      }
    });
  });

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
          const textArea = document.createElement("textarea");
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
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
    if(nav.offsetParent === null) return;
    
    const targetRect = targetLink.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    navSlider.style.width = `${targetRect.width}px`;
    navSlider.style.left = `${targetRect.left - navRect.left}px`;
  }

  // Fonction pour gérer le scroll intelligent (SANS BLOCAGE)
  function switchPage(targetId) {
    
    const targetSection = document.getElementById(targetId);
    const activeSection = document.querySelector(".page-section.active");

    // Si on clique sur la page déjà active, on remonte juste en haut
    if (targetSection === activeSection) {
        targetSection.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Animation d'entrée
    targetSection.classList.add("active");

    // Animation de sortie pour l'ancienne section
    if (activeSection) {
      activeSection.classList.add("exit");
      activeSection.classList.remove("active");
      
      // Nettoyage de la classe exit après l'animation CSS (0.5s)
      setTimeout(() => {
        activeSection.classList.remove("exit");
      }, 500);
    }

    // SCROLL INTELLIGENT :
    // Force le scroll en haut immédiatement pour les pages courtes
    if (targetId === 'a-propos' || targetId === 'contact' || targetId === 'accueil') {
        targetSection.scrollTo(0, 0);
    }
  }

  const initialActiveLink = document.querySelector(
    ".main-nav .nav-link.active"
  );
  // Premier calcul immédiat
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


/* --- DATA PROJETS (AVEC PLUSIEURS LIENS) --- */
const projectDetails = {

  "proj-bal": {
    title: "Médiation Vidéo - Musée des Beaux-Arts de Limoges",
    type: "image", 
    url: "./assets/vidéo-collection.png", 
    tags: ["After Effects", "Davinci Resolve", "Sound Design", "Motion Design"],
    duration: "2.5 jours",
    description: "Dans le cadre d'un projet de groupe pour le Musée des Beaux-Arts de Limoges, j'ai réalisé la partie Motion Design visant à présenter une œuvre aux visiteurs internationaux. J'ai conçu les maquettes animatiques, les écrans clés de la collection ainsi que l'animation finale. J'ai également géré l'intégralité du sound design sur DaVinci Resolve pour offrir une meilleur expérience aux touristes anglophones.",
    links: [
        { label: "Voir la vidéo", url: "https://youtube.com/shorts/1ZAJP-VxxQk" }
    ]
  },

  "proj-motion": {
    title: "Motion Design Showreel",
    type: "image",
    url: "./assets/affiche-motion.jpg", 
    tags: ["After Effects", "Motion Design", "Autonomie", "Créativité"],
    duration: "Environ 10 heures",
    description: "Animation d'une affiche statique en utilisant After Effects. C'était mon premier projet sur ce logiciel, l'objectif était de donner vie aux éléments graphiques avec une liberté créative totale. Réalisé en parallèle des cours en 2ème année.",
    links: [
        { label: "Voir la vidéo", url: "https://youtu.be/7pt2nna7VFY" }
    ]
  },
  "proj-dating": {
    title: "Application de rencontre UI/UX",
    type: "image", 
    url: "./assets/Mycrew.png", 
    tags: ["Figma", "UI Design", "UX Research", "Mobile First"],
    duration: "2 mois (en parallèle)",
    description: "Conception UI/UX complète d'une application de rencontre centrée sur le sport. Projet réalisé en 2ème année à partir d'une charte graphique et de logos imposés.",
    links: [
        { label: "Voir le prototype", url: "https://www.figma.com/proto/TPt8gRGQDhQzeZH6KdU9Cd/Adrien-Onillon---mycrew--Copy-?page-id=4005%3A5&node-id=4124-791&viewport=242%2C138%2C0.4&t=Yfl2GQe0PM9AqGMa-1&scaling=scale-down&content-scaling=fixed" }
    ]
  },
  "proj-5": {
    title: "Start up fictive - Loc'sur",
    type: "web",
    url: "./assets/loc'sur.png", 
    tags: ["HTML5", "CSS3", "JavaScript", "Intégration Web"],
    duration: "2 semaines",
    description: "Développement complet du site vitrine de 'Loc'sur', une start-up fictive. Premier projet d'envergure intégrant HTML, CSS et JavaScript.",
    links: [
        { label: "Visiter le site", url: "https://www.a-onillon.mmi-limoges.fr/" }
    ]
  },
  "proj-6": {
    title: "Applications de sport pour Héméra",
    type: "image",
    url: "./assets/SAE2.02.png",
    tags: ["Davinci Resolve", "Figma", "Tournage", "Travail d'équipe"],
    duration: "2 semaines",
    description: "Projet de groupe visant à inciter les coworkers d'Héméra à faire du sport. Réalisation d'un prototype d'application et d'une publicité vidéo.",
    links: [
        { label: "Voir la vidéo", url: "https://www.youtube.com/watch?v=fVRYDqP8nDo" },
        { label: "Voir le prototype Figma", url: "https://www.figma.com/proto/OyGiLCARjgZ28nqUMcIkJg/SAE202?page-id=96%3A3090&node-id=96-3157&viewport=-117%2C109%2C0.33&t=LALeDM5hbhSWASuB-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=96%3A3091" }
    ]
  },
  "proj-affiche": {
    title: "Affiche Créative - Fabio Quartararo",
    type: "image",
    url: "./assets/affiche-fabio.png",
    tags: ["Photoshop", "Illustrator", "Détourage", "Composition"],
    duration: "1 jour",
    description: "Création graphique mettant à l'honneur l'athlète Fabio Quartararo. La composition joue sur la dualité entre l'action (course) et la victoire.",
    links: []
  },
  "proj-podcast": {
    title: "Vignette Podcast Universitaire",
    type: "image",
    url: "./assets/vignette-podcast.png", 
    tags: ["Photoshop", "Identité Visuelle", "Storytelling", "Graphisme"],
    duration: "1 jour",
    description: "Conception de l'identité visuelle d'un podcast sur le thème de l'enquête et de la vérité.",
    links: []
  },
  "proj-7": {
    title: "Site de Streaming",
    type: "web",
    url: "./assets/site-streaming.png",
    tags: ["PHP", "MySQL", "HTML/CSS", "Base de données"],
    duration: "2 semaines",
    description: "Développement Back-End et Front-End d'une plateforme de streaming vidéo (1ère année). Gestion de base de données MySQL et PHP.",
    links: [
        { label: "Visiter le site", url: "https://onillon-sae203.mmi-limoges.fr/" }
    ]
  },
  "proj-1": {
    title: "Prototype page Behance",
    type: "image",
    url: "./assets/Behance.png",
    tags: ["Figma", "Web Design", "Pixel Perfect", "Analyse"],
    duration: "1 semaine",
    description: "Reproduction fidèle d'une page projet Behance (Pixel Perfect). Exercice pédagogique de 1ère année pour maîtriser l'interface de Figma.",
    links: [
        { label: "Voir le prototype", url: "https://www.figma.com/proto/YoBh7IDv461G4lTq2hMRQO/SAE-101?node-id=2209-374&t=wdg5WnOhF2okBX6L-0" }
    ]
  },
  "proj-8": {
    title: "Olive Oil - E-commerce",
    type: "image",
    url: "./assets/olive-oil.png",
    tags: ["Figma", "Auto-Layout", "E-commerce", "UI Design"],
    duration: "3 semaines",
    description: "Conception d'une maquette pour un site e-commerce d'huile d'olive haut de gamme. Projet axé sur l'apprentissage approfondi de l'Auto-Layout sur Figma.",
    links: [
        { label: "Version Mobile", url: "https://www.figma.com/proto/uiHQmV8bEWey9ryPOhwOgB/Adrien-Onillon---Olea--Copy-?page-id=2002%3A5&node-id=2291-144&viewport=1279%2C206%2C0.05&t=2OUxQWu9gaFnDHV3-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=2291%3A144" },
        { label: "Version Desktop", url: "https://www.figma.com/proto/uiHQmV8bEWey9ryPOhwOgB/Adrien-Onillon---Olea--Copy-?page-id=2563%3A81&node-id=2563-82&viewport=776%2C22%2C0.25&t=flpkExwG5cGBjZZo-1&scaling=scale-down&content-scaling=fixed" }
    ]
  }
};

const detailPage = document.getElementById('projet-detail');
const detailTitle = document.getElementById('detail-title');
const detailMedia = document.getElementById('detail-media');
const detailTags = document.getElementById('detail-tags');
const detailDescription = document.getElementById('detail-description');
const detailLinksWrapper = document.getElementById('detail-links-wrapper'); // Nouveau conteneur
const detailDuration = document.getElementById('detail-duration'); 
const backToProjectsBtn = document.getElementById('back-to-projets-btn');

function showProjectDetail(projectId) {
  const project = projectDetails[projectId];
  if (!project) return;

  detailTitle.textContent = project.title;
  detailDescription.textContent = project.description;
  detailDuration.textContent = project.duration; 

  // --- GESTION DES MEDIA (VIDEO/IMAGE/FIGMA) ---
  detailMedia.innerHTML = '';
  if (project.type === 'youtube') {
    detailMedia.innerHTML = `<iframe src="${project.url}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else if (project.type === 'figma') {
    // Si c'est un embed Figma
    detailMedia.innerHTML = `<iframe src="${project.url}" allowfullscreen></iframe>`;
  } else if (project.url.endsWith('.mov') || project.url.endsWith('.mp4')) {
    detailMedia.innerHTML = `<video controls src="${project.url}" style="width:100%; border-radius:12px;"></video>`;
  } else {
    // Cas par défaut : Image
    detailMedia.innerHTML = `<img src="${project.url}" alt="${project.title}">`;
  }

  // --- GESTION DES LIENS MULTIPLES ---
  detailLinksWrapper.innerHTML = ''; // On vide les anciens boutons
  if (project.links && project.links.length > 0) {
      project.links.forEach(linkObj => {
          const btn = document.createElement('a');
          btn.href = linkObj.url;
          btn.className = 'cta-button';
          btn.target = "_blank";
          btn.rel = "noopener noreferrer";
          btn.innerHTML = `${linkObj.label} <i data-feather="arrow-right"></i>`;
          detailLinksWrapper.appendChild(btn);
      });
  }

  // Tags
  detailTags.innerHTML = '';
  project.tags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.textContent = tag;
    detailTags.appendChild(tagElement);
  });

  feather.replace(); 
  switchPage('projet-detail');
  history.pushState(null, null, `#projet-${projectId}`);
  detailPage.scrollTo(0, 0);
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    const projectId = card.dataset.projectId;
    showProjectDetail(projectId);
  });
});

backToProjectsBtn.addEventListener('click', (e) => {
  e.preventDefault();
  switchPage('projets');
  history.pushState(null, null, '#projets');
  if (detailPage.classList.contains('active')) {
      detailPage.classList.add('exit');
      detailPage.classList.remove('active');
  }
});

window.addEventListener("load", () => {
    const activeLink = document.querySelector(".main-nav .nav-link.active");
    if(activeLink) {
        moveSlider(activeLink);
    }
    const hash = window.location.hash.substring(1);
    if(hash && hash.startsWith('projet-')) {
         const projectId = hash.replace('projet-', '');
         showProjectDetail(projectId);
    }
});
window.addEventListener("resize", () => {
    const activeLink = document.querySelector(".main-nav .nav-link.active");
    if(activeLink) {
        moveSlider(activeLink);
    }
});

});