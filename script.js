document.addEventListener('DOMContentLoaded', () => {

    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const navSlider = document.querySelector('.main-nav .nav-slider');
    const pageSections = document.querySelectorAll('.page-section');
    const ctaLinks = document.querySelectorAll('.page-transition-link');
    const cursor = document.querySelector('.cursor');
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('email-text');
    const copyPhoneBtn = document.getElementById('copy-phone-btn');
    const phoneText = document.getElementById('phone-text');

    // --- CURSOR ANIMATION ---
    document.addEventListener('mousemove', e => {
        cursor.style.top = e.clientY + 'px';
        cursor.style.left = e.clientX + 'px';
    });

    document.querySelectorAll('a, button, .project-card, .skill-item, .contact-option-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    
    // --- COPY FUNCTIONS ---
    function setupCopyButton(button, textElement, successMessage = 'Copié !') {
        if(button && textElement) {
            button.addEventListener('click', async () => {
                const text = textElement.textContent.trim();
                try {
                    await navigator.clipboard.writeText(text);
                    
                    // Visual feedback
                    button.classList.add('copied');
                    const originalHTML = button.innerHTML;
                    button.innerHTML = '<i data-feather="check"></i>';
                    feather.replace();
                    
                    // Show temporary tooltip
                    const tooltip = document.createElement('div');
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
                    button.style.position = 'relative';
                    button.appendChild(tooltip);
                    
                    // Animate tooltip
                    setTimeout(() => tooltip.style.opacity = '1', 10);
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.classList.remove('copied');
                        button.innerHTML = originalHTML;
                        feather.replace();
                        if(tooltip.parentNode) {
                            tooltip.remove();
                        }
                    }, 2000);
                    
                } catch (err) {
                    console.error('Erreur lors de la copie:', err);
                    // Fallback for older browsers
                    textElement.select();
                    document.execCommand('copy');
                }
            });
        }
    }

    // Setup copy buttons
    setupCopyButton(copyEmailBtn, emailText, 'Email copié !');
    setupCopyButton(copyPhoneBtn, phoneText, 'Numéro copié !');

    // --- MAGNETIC EFFECT ---
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(el => {
        const strength = 40;
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const { left, top, width, height } = rect;
            const x = e.clientX - left;
            const y = e.clientY - top;
            const moveX = (x - width / 2) / width * strength;
            const moveY = (y - height / 2) / height * strength;
            el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
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

    // --- TYPING ANIMATION FOR HERO H1 ---
    (function() {
        const typedEl = document.getElementById('typed-text');
        if (!typedEl) return;

    const roles = ['Monteur Vidéo', '3D artist', 'Web designer', 'Graphiste'];
        const typingSpeed = 120; 
        const erasingSpeed = 40;
        const pauseBetween = 1400; 

        let roleIndex = 0;
        let charIndex = 0;

        const wait = (ms) => new Promise(res => setTimeout(res, ms));

        // Respect user's reduced-motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

                // erase
                while (charIndex > 0) {
                    typedEl.textContent = current.substring(0, charIndex - 1);
                    charIndex--;
                    await wait(erasingSpeed);
                }

                // next role
                roleIndex = (roleIndex + 1) % roles.length;
                await wait(300);
            }
        }

        // start when DOM is ready
        typeLoop().catch(err => console.error('Typing error:', err));
    })();
});