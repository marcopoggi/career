// Application state
let currentLanguage = 'en';
let portfolioData = null;

// Inline SVG icons for overview cards (keyed by data.json "icon" field)
const ICONS = {
    backend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0-.42-8.98 6 6 0 1 0-11.05 3.1A3.5 3.5 0 0 0 6.5 19h11z"/></svg>',
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><rect x="5" y="6" width="14" height="12" rx="3"/><circle cx="9.5" cy="12" r="1"/><circle cx="14.5" cy="12" r="1"/><path d="M2 12h3M19 12h3"/></svg>'
};

// Inline SVG cover art for project cards (keyed by data.json "art" field).
// Each piece is abstract line-art in the project's brand hue on the dark theme.
const COVERS = {
    // SequenceStack — their logo icon: rounded square holding two stacked
    // rects swapped by arrows, repeated at falling opacity (violet)
    workflow: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="cvw" cx="25%" cy="10%" r="90%"><stop offset="0%" stop-color="#8b7cf6" stop-opacity=".18"/><stop offset="100%" stop-color="#8b7cf6" stop-opacity="0"/></radialGradient></defs>
        <rect width="400" height="140" fill="url(#cvw)"/>
        <g stroke="#a78bfa" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".8">
            <path d="M36 70h16M112 70h20M200 70h16v-26h14M200 70h16v26h14M292 44h16v22M292 96h16v-22"/>
            <rect x="52" y="54" width="60" height="32" rx="8"/>
            <rect x="140" y="54" width="60" height="32" rx="8"/>
            <rect x="232" y="28" width="60" height="32" rx="8"/>
            <rect x="232" y="80" width="60" height="32" rx="8"/>
            <path d="M126 66l7 4-7 4M224 40l7 4-7 4M224 92l7 4-7 4"/>
        </g>
        <circle cx="30" cy="70" r="5" fill="#a78bfa" fill-opacity=".9"/>
        <circle cx="330" cy="70" r="7" fill="none" stroke="#a78bfa" stroke-width="2" stroke-opacity=".8"/>
        <circle cx="330" cy="70" r="2.5" fill="#a78bfa"/>
    </svg>`,

    // Clavalo — their circular wing badge over faint pitch lines (teal)
    pitch: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="cvp" cx="25%" cy="20%" r="90%"><stop offset="0%" stop-color="#2dd4bf" stop-opacity=".16"/><stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient></defs>
        <rect width="400" height="140" fill="url(#cvp)"/>
        <g stroke="#2dd4bf" stroke-opacity=".22" fill="none" stroke-width="1.3">
            <path d="M280 12v116"/>
            <circle cx="280" cy="70" r="30"/>
            <rect x="330" y="34" width="70" height="72"/>
        </g>
        <g transform="translate(96 70)">
            <circle r="40" fill="none" stroke="#2dd4bf" stroke-opacity=".85" stroke-width="2"/>
            <polygon points="0,-15 14.3,-4.6 8.8,12.1 -8.8,12.1 -14.3,-4.6" fill="#2dd4bf" fill-opacity=".85"/>
            <g stroke="#2dd4bf" stroke-opacity=".7" stroke-width="2">
                <path d="M0 -15V-40M14.3 -4.6L38.1 -12.4M8.8 12.1L23.5 32.4M-8.8 12.1L-23.5 32.4M-14.3 -4.6L-38.1 -12.4"/>
            </g>
        </g>
    </svg>`,

    // ShadowLytics — their connected-dots network mark, scaled into a
    // constellation across the banner (amber/orange)
    geo: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="cvg" cx="60%" cy="0%" r="90%"><stop offset="0%" stop-color="#f59e0b" stop-opacity=".16"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs>
        <rect width="400" height="140" fill="url(#cvg)"/>
        <g stroke="#f59e0b" stroke-width="2" stroke-opacity=".55">
            <path d="M56 96 108 52M108 52l52 34M160 86l56-40M216 46l54 42M270 88l52-30M322 58l40 20" fill="none"/>
        </g>
        <g fill="#f59e0b">
            <circle cx="56" cy="96" r="7"/>
            <circle cx="108" cy="52" r="10"/>
            <circle cx="160" cy="86" r="6"/>
            <circle cx="216" cy="46" r="9"/>
            <circle cx="270" cy="88" r="7"/>
            <circle cx="322" cy="58" r="10"/>
            <circle cx="362" cy="78" r="5" fill-opacity=".6"/>
        </g>
        <g fill="none" stroke="#f59e0b" stroke-opacity=".3" stroke-width="1.5">
            <circle cx="108" cy="52" r="16"/>
            <circle cx="322" cy="58" r="16"/>
        </g>
    </svg>`,

    // Everlast — coaching chat over messaging, teal base with the warm
    // cream of their favicon for the human side
    chat: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="cvc" cx="30%" cy="0%" r="90%"><stop offset="0%" stop-color="#2dd4bf" stop-opacity=".14"/><stop offset="100%" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient></defs>
        <rect width="400" height="140" fill="url(#cvc)"/>
        <rect x="60" y="34" width="130" height="38" rx="19" fill="#2dd4bf" fill-opacity=".14" stroke="#2dd4bf" stroke-opacity=".7" stroke-width="1.5"/>
        <g fill="#2dd4bf" fill-opacity=".85">
            <circle cx="105" cy="53" r="4"/>
            <circle cx="125" cy="53" r="4"/>
            <circle cx="145" cy="53" r="4"/>
        </g>
        <rect x="210" y="72" width="130" height="38" rx="19" fill="#fde68a" fill-opacity=".1" stroke="#fde68a" stroke-opacity=".6" stroke-width="1.5"/>
        <path d="M275 101c-8-6-13-10-13-16a7 7 0 0 1 13-3.5A7 7 0 0 1 288 85c0 6-5 10-13 16z" fill="#fde68a" fill-opacity=".8"/>
    </svg>`,

    // Patriotlink — their flag-shield mark: stars column + stripes,
    // with waving stripe lines behind (blue + red)
    flag: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="cvf" cx="25%" cy="0%" r="90%"><stop offset="0%" stop-color="#60a5fa" stop-opacity=".16"/><stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/></radialGradient></defs>
        <rect width="400" height="140" fill="url(#cvf)"/>
        <g fill="none" stroke-width="1.5">
            <path d="M150 44c60-16 120 22 250 4" stroke="#e5484d" stroke-opacity=".4"/>
            <path d="M150 70c60-16 120 22 250 4" stroke="#60a5fa" stroke-opacity=".45"/>
            <path d="M150 96c60-16 120 22 250 4" stroke="#e5484d" stroke-opacity=".3"/>
        </g>
        <g transform="translate(58 22)">
            <path d="M40 0 80 10v42c0 26-17 42-40 52C17 94 0 78 0 52V10z" fill="none" stroke="#60a5fa" stroke-opacity=".85" stroke-width="2"/>
            <g fill="#60a5fa" fill-opacity=".9">
                <path d="m22 22 2 4.2 4.6.6-3.3 3.2.8 4.6-4.1-2.2-4.1 2.2.8-4.6-3.3-3.2 4.6-.6z"/>
                <path d="m58 22 2 4.2 4.6.6-3.3 3.2.8 4.6-4.1-2.2-4.1 2.2.8-4.6-3.3-3.2 4.6-.6z"/>
                <path d="m40 42 2 4.2 4.6.6-3.3 3.2.8 4.6-4.1-2.2-4.1 2.2.8-4.6-3.3-3.2 4.6-.6z"/>
            </g>
            <g stroke="#e5484d" stroke-opacity=".7" stroke-width="2" fill="none">
                <path d="M14 66h52M18 76h44M24 86h32"/>
            </g>
        </g>
    </svg>`,

    // IBIDS — the ibiDs.io robot head with its green antenna dot, plus
    // the green tracking bars from their dashboard
    bids: `<svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="cvb" cx="30%" cy="0%" r="90%"><stop offset="0%" stop-color="#4ade80" stop-opacity=".15"/><stop offset="100%" stop-color="#4ade80" stop-opacity="0"/></radialGradient></defs>
        <rect width="400" height="140" fill="url(#cvb)"/>
        <g transform="translate(70 24)">
            <path d="M30 30v-16" stroke="#4ade80" stroke-opacity=".8" stroke-width="2"/>
            <circle cx="30" cy="10" r="6" fill="#4ade80"/>
            <circle cx="30" cy="10" r="11" fill="none" stroke="#4ade80" stroke-opacity=".35" stroke-width="1.5"/>
            <rect x="-10" y="30" width="80" height="58" rx="14" fill="none" stroke="#4ade80" stroke-opacity=".85" stroke-width="2"/>
            <rect x="-20" y="46" width="10" height="24" rx="4" fill="none" stroke="#4ade80" stroke-opacity=".5" stroke-width="1.6"/>
            <rect x="70" y="46" width="10" height="24" rx="4" fill="none" stroke="#4ade80" stroke-opacity=".5" stroke-width="1.6"/>
            <circle cx="12" cy="54" r="6" fill="#4ade80" fill-opacity=".9"/>
            <circle cx="48" cy="54" r="6" fill="#4ade80" fill-opacity=".9"/>
            <path d="M16 74h28" stroke="#4ade80" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"/>
        </g>
        <g fill="#4ade80">
            <rect x="220" y="88" width="18" height="38" rx="3" fill-opacity=".3"/>
            <rect x="252" y="68" width="18" height="58" rx="3" fill-opacity=".45"/>
            <rect x="284" y="82" width="18" height="44" rx="3" fill-opacity=".35"/>
            <rect x="316" y="52" width="18" height="74" rx="3" fill-opacity=".6"/>
            <rect x="348" y="72" width="18" height="54" rx="3" fill-opacity=".4"/>
        </g>
        <path d="M229 82 261 60l32 12 32-26 32 14" stroke="#4ade80" stroke-opacity=".85" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};

// Load data and initialize application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadPortfolioData();
        initializeApp();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        // Fallback to static content if JSON fails to load
        initializeBasicFeatures();
    }
});

// Load portfolio data — embedded js/data.js works over file:// and HTTP alike;
// fetch of data.json is the fallback if the script tag was removed.
async function loadPortfolioData() {
    if (window.PORTFOLIO_DATA) {
        portfolioData = window.PORTFOLIO_DATA;
    } else {
        const response = await fetch('./data.json');
        portfolioData = await response.json();
    }
    return portfolioData;
}

// Initialize all app features
function initializeApp() {
    renderContent();
    initializeLanguageSwitcher();
    initializeSmoothScrolling();
    initializeScrollReveal();
    initializeScrollSpy();
    initializeScrollProgress();
    initializeTypewriter();
    initializeCounters();
    initializeCardSpotlight();
    initializeLocalClock();
    updateFooterYear();
}

// Live HH:MM clock for Buenos Aires (UTC-3) in the timezone card
function initializeLocalClock() {
    const clock = document.querySelector('[data-clock]');
    if (!clock) return;

    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    function update() {
        clock.textContent = formatter.format(new Date());
    }

    update();
    setInterval(update, 15000);
}

// Cards get a radial glow that follows the cursor (via --mx/--my CSS vars)
function initializeCardSpotlight() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.overview-card, .project-card, .skill-category');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }, { passive: true });
}

// Initialize basic features without JSON data
function initializeBasicFeatures() {
    initializeLanguageSwitcher();
    initializeSmoothScrolling();
    initializeScrollReveal();
    updateFooterYear();
}

// Render all content from JSON data
function renderContent() {
    if (!portfolioData) return;

    renderNavigation();
    renderHeroSection();
    renderOverviewSection();
    renderExperienceSection();
    renderProjectsSection();
    renderSkillsSection();
    renderContactSection();
}

// Render header navigation links
function renderNavigation() {
    const navContainer = document.querySelector('[data-nav-links]');
    const links = portfolioData.navigation.links;
    if (!navContainer || !links) return;

    navContainer.innerHTML = Object.entries(links).map(([sectionId, label]) => `
        <a href="#${sectionId}" class="nav-link" data-section="${sectionId}" data-text='${JSON.stringify(label)}'>${getText(label)}</a>
    `).join('');
}

// Render hero section
function renderHeroSection() {
    const data = portfolioData.personal;

    updateElement('[data-hero-title]', data.name);
    updateBilingualElement('[data-hero-subtitle]', data.title);
    updateBilingualElement('[data-hero-description]', data.description);

    const statsContainer = document.querySelector('[data-hero-stats]');
    if (statsContainer && portfolioData.stats) {
        statsContainer.innerHTML = portfolioData.stats.map(stat => `
            <div class="stat">
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label" data-text='${JSON.stringify(stat.label)}'>${getText(stat.label)}</span>
            </div>
        `).join('');
    }
}

// Render overview section
function renderOverviewSection() {
    const data = portfolioData.overview;

    updateBilingualElement('[data-overview-title]', data.title);

    const cardsContainer = document.querySelector('[data-overview-cards]');
    if (cardsContainer && data.cards) {
        cardsContainer.innerHTML = data.cards.map(card => `
            <div class="overview-card">
                <div class="card-icon">${ICONS[card.icon] || ''}</div>
                <h3 data-text='${JSON.stringify(card.title)}'>${getText(card.title)}</h3>
                <p data-text='${JSON.stringify(card.description)}'>${getText(card.description)}</p>
            </div>
        `).join('');
    }
}

// Render experience section
function renderExperienceSection() {
    const data = portfolioData.experience;
    if (!data) return;

    updateBilingualElement('[data-experience-title]', data.title);

    const listContainer = document.querySelector('[data-experience-list]');
    if (listContainer && data.list) {
        listContainer.innerHTML = data.list.map(job => `
            <article class="experience-item">
                <div class="experience-meta">
                    <span class="period" data-text='${JSON.stringify(job.period)}'>${getText(job.period)}</span>
                    <span class="location" data-text='${JSON.stringify(job.location)}'>${getText(job.location)}</span>
                </div>
                <div class="experience-body">
                    <h3 data-text='${JSON.stringify(job.role)}'>${getText(job.role)}</h3>
                    <p class="company">${job.company}</p>
                    <ul>
                        ${job.highlights.map(item => `
                            <li data-text='${JSON.stringify(item)}'>${getText(item)}</li>
                        `).join('')}
                    </ul>
                </div>
            </article>
        `).join('');
    }
}

// Render projects section
function renderProjectsSection() {
    const data = portfolioData.projects;

    updateBilingualElement('[data-projects-title]', data.title);

    const projectsContainer = document.querySelector('[data-projects-list]');
    if (projectsContainer && data.list) {
        const ordered = [...data.list].sort((a, b) => (a.grade ?? 99) - (b.grade ?? 99));
        projectsContainer.innerHTML = ordered.map(project => `
            <a class="project-card ${project.featured ? 'featured' : ''}" ${project.url ? `href="${project.url}" target="_blank" rel="noopener"` : ''}>
                ${COVERS[project.art] ? `<div class="project-cover" aria-hidden="true">${COVERS[project.art]}</div>` : ''}
                <div class="project-header">
                    <h3>${project.name}
                        <svg class="project-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>
                    </h3>
                    <span class="project-type" data-text='${JSON.stringify(project.type)}'>${getText(project.type)}</span>
                </div>
                <p class="project-description" data-text='${JSON.stringify(project.description)}'>${getText(project.description)}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-impact">
                    <strong data-text='${JSON.stringify(portfolioData.navigation.labels.impact)}'>${getText(portfolioData.navigation.labels.impact)}</strong>
                    <span data-text='${JSON.stringify(project.impact)}'>${getText(project.impact)}</span>
                </div>
            </a>
        `).join('');
    }
}

// Render skills section
function renderSkillsSection() {
    const data = portfolioData.skills;

    updateBilingualElement('[data-skills-title]', data.title);

    const skillsContainer = document.querySelector('[data-skills-list]');
    if (skillsContainer && data.categories) {
        skillsContainer.innerHTML = data.categories.map(category => `
            <div class="skill-category">
                <h3 data-text='${JSON.stringify(category.title)}'>${getText(category.title)}</h3>
                <div class="skills-list">
                    ${category.skills.map(skill => `
                        <span class="skill ${skill.level}">
                            ${skill.name}
                            <span class="skill-level" aria-label="${skill.level}"><i></i><i></i><i></i></span>
                        </span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
}

// Render contact section
function renderContactSection() {
    const contactData = portfolioData.contact;
    const personalData = portfolioData.personal.contact;

    updateBilingualElement('[data-contact-title]', contactData.title);
    updateBilingualElement('[data-contact-description]', contactData.description);

    const contactInfo = document.querySelector('[data-contact-info]');
    if (contactInfo) {
        contactInfo.innerHTML = `
            <div class="contact-item">
                <span class="contact-label">Email</span>
                <div class="contact-email">
                    <a href="mailto:${personalData.email}">${personalData.email}</a>
                    <button class="copy-btn" data-copy="${personalData.email}" data-text='{"en":"copy","es":"copiar"}'>copy</button>
                </div>
            </div>
            <div class="contact-item">
                <span class="contact-label" data-text='{"en":"Location","es":"Ubicación"}'>Location</span>
                <span data-text='${JSON.stringify(personalData.location)}'>${getText(personalData.location)}</span>
            </div>
            <div class="contact-item">
                <span class="contact-label" data-text='{"en":"Timezone","es":"Zona Horaria"}'>Timezone</span>
                <span>${personalData.timezone} · <span class="local-clock" data-clock>--:--</span></span>
            </div>
            <div class="contact-item">
                <span class="contact-label" data-text='{"en":"Availability","es":"Disponibilidad"}'>Availability</span>
                <span data-text='${JSON.stringify(personalData.availability)}'>${getText(personalData.availability)}</span>
            </div>
        `;
    }

    const contactLinks = document.querySelector('[data-contact-links]');
    if (contactLinks) {
        contactLinks.innerHTML = `
            <a href="${personalData.linkedin}" target="_blank" rel="noopener" class="button primary">
                <span data-text='${JSON.stringify(portfolioData.navigation.contact_links.linkedin)}'>${getText(portfolioData.navigation.contact_links.linkedin)}</span>
            </a>
            <a href="${personalData.github}" target="_blank" rel="noopener" class="button secondary">
                <span data-text='${JSON.stringify(portfolioData.navigation.contact_links.github)}'>${getText(portfolioData.navigation.contact_links.github)}</span>
            </a>
            <a href="cv.html" class="button secondary">
                <span data-text='{"en":"Download CV","es":"Descargar CV"}'>Download CV</span>
            </a>
        `;
    }
}

// Update footer year
function updateFooterYear() {
    const yearElement = document.querySelector('[data-year]');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Helper function to get text in current language
function getText(textObj) {
    if (typeof textObj === 'string') return textObj;
    return textObj[currentLanguage] || textObj['en'] || '';
}

// Helper function to update bilingual elements
function updateBilingualElement(selector, textObj) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = getText(textObj);
        element.setAttribute('data-text', JSON.stringify(textObj));
    }
}

// Helper function to update regular elements
function updateElement(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
}

// Language switcher functionality
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedLang = this.getAttribute('data-lang');

            if (selectedLang !== currentLanguage) {
                langButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                currentLanguage = selectedLang;
                updateLanguage(selectedLang);
                document.documentElement.lang = selectedLang;
            }
        });
    });
}

// Update page language
function updateLanguage(lang) {
    const elements = document.querySelectorAll('[data-text]');

    elements.forEach(element => {
        try {
            const textData = JSON.parse(element.getAttribute('data-text'));
            const translation = getText(textData);

            if (translation) {
                element.textContent = translation;
            }
        } catch (error) {
            console.warn('Error parsing translation data:', error);
        }
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Scroll reveal animation
function initializeScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    const animatedElements = document.querySelectorAll(
        '.overview-card, .project-card, .skill-category, .contact-item, .experience-item'
    );
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(16px)';
        element.style.transition = `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(index % 3) * 60}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(index % 3) * 60}ms`;
        observer.observe(element);
    });

    // Skill level bars fill when their category scrolls into view
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));
}

// Scroll progress bar under the header
function initializeScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
            ticking = false;
        });
    }, { passive: true });
}

// Typewriter effect cycling through roles in the hero subtitle
function initializeTypewriter() {
    const target = document.querySelector('[data-hero-subtitle]');
    const roles = portfolioData && portfolioData.personal.roles;
    if (!target || !roles) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const cursor = document.querySelector('.type-cursor');
        if (cursor) cursor.style.display = 'none';
        return;
    }

    // The typewriter owns this element — stop updateLanguage from resetting it
    target.removeAttribute('data-text');

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const list = roles[currentLanguage] || roles.en;
        const word = list[roleIndex % list.length];

        if (deleting) {
            charIndex--;
            target.textContent = word.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                roleIndex++;
                setTimeout(tick, 350);
                return;
            }
            setTimeout(tick, 35);
        } else {
            charIndex++;
            target.textContent = word.slice(0, charIndex);
            if (charIndex >= word.length) {
                deleting = true;
                setTimeout(tick, 2200);
                return;
            }
            setTimeout(tick, 65);
        }
    }

    tick();
}

// Count-up animation for hero stats (parses "4+", "10+", "100%")
function initializeCounters() {
    const numbers = document.querySelectorAll('.stat-number');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    numbers.forEach(el => {
        const raw = el.textContent;
        const match = raw.match(/^(\d+)(.*)$/);
        if (!match) return;

        const end = parseInt(match[1], 10);
        const suffix = match[2];
        const duration = 1000;
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * end) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }

        el.textContent = '0' + suffix;
        requestAnimationFrame(step);
    });
}

// Click-to-copy for the email address
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;

    navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(() => {
        btn.classList.add('copied');
        btn.textContent = currentLanguage === 'es' ? '¡copiado!' : 'copied!';
        clearTimeout(btn._copyTimer);
        btn._copyTimer = setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = currentLanguage === 'es' ? 'copiar' : 'copy';
        }, 1600);
    });
});

// Scroll spy — highlights the active section in the header nav
function initializeScrollSpy() {
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-section') === entry.target.id);
                });
            }
        });
    }, {
        threshold: 0.4,
        rootMargin: '-15% 0px -35% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Language switching with keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('[data-lang="en"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('[data-lang="es"]').click();
                break;
        }
    }
});
