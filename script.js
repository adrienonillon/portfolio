document.addEventListener('DOMContentLoaded', () => {

    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const navSlider = document.querySelector('.main-nav .nav-slider');
    const pageSections = document.querySelectorAll('.page-section');
    const ctaLinks = document.querySelectorAll('.page-transition-link');
    const cursor = document.querySelector('.cursor');
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('email-text');

    // --- CURSOR ANIMATION ---
    document.addEventListener('mousemove', e => {
        cursor.style.top = e.clientY + 'px';
        cursor.style.left = e.clientX + 'px';
    });

    document.querySelectorAll('a, button, .project-card, .skill-item').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    
    // --- EMAIL COPY FUNCTION ---
    if(copyEmailBtn && emailText) {
        copyEmailBtn.addEventListener('click', () => {
            const email = emailText.textContent;
            navigator.clipboard.writeText(email).then(() => {
                copyEmailBtn.innerHTML = '<i data-feather="check"></i> Copié !';
                feather.replace();
                setTimeout(() => {
                    copyEmailBtn.innerHTML = '<i data-feather="copy"></i> Copier l\'adresse';
                    feather.replace();
                }, 2000);
            });
        });
    }


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
        const activeSection = document.querySelector('.page-section.active');
        if (targetSection === activeSection) return;
        if (activeSection) {
            activeSection.classList.add('exit');
            activeSection.classList.remove('active');
        }
        targetSection.classList.add('active');
        setTimeout(() => {
            if (activeSection) {
                activeSection.classList.remove('exit');
            }
        }, 500);
    }

    const initialActiveLink = document.querySelector('.main-nav .nav-link.active');
    moveSlider(initialActiveLink);
    
    const allLinks = [...navLinks, ...ctaLinks];

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetNavLink = document.querySelector(`.nav-link[href="#${targetId}"]`);

            if(targetNavLink) {
                navLinks.forEach(l => l.classList.remove('active'));
                targetNavLink.classList.add('active');
                moveSlider(targetNavLink);
                switchPage(targetId);
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });

    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1) || 'accueil';
        const targetLink = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (targetLink) {
             navLinks.forEach(l => l.classList.remove('active'));
             targetLink.classList.add('active');
             moveSlider(targetLink);
             switchPage(hash);
        }
    });

    // Re-run Feather Icons replacement after page change
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && mutation.target.classList.contains('active')) {
                feather.replace();
            }
        });
    });
    pageSections.forEach(section => {
        observer.observe(section, { attributes: true });
    });
});