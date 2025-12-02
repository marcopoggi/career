// Application state
let currentLanguage = 'en';
let portfolioData = null;

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

// Load portfolio data from JSON
async function loadPortfolioData() {
    const response = await fetch('./data.json');
    portfolioData = await response.json();
    return portfolioData;
}

// Initialize all app features
function initializeApp() {
    renderContent();
    initializeLanguageSwitcher();
    initializeSmoothScrolling();
    initializeScrollReveal();
    initializeScrollSpy();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
}

// Initialize basic features without JSON data
function initializeBasicFeatures() {
    initializeLanguageSwitcher();
    initializeSmoothScrolling();
    initializeScrollReveal();
}

// Render all content from JSON data
function renderContent() {
    if (!portfolioData) return;
    
    renderHeroSection();
    renderOverviewSection();
    renderProjectsSection();
    renderSkillsSection();
    renderContactSection();
}

// Render hero section
function renderHeroSection() {
    const data = portfolioData.personal;
    
    // Update title and description
    updateElement('[data-hero-title]', data.name);
    updateBilingualElement('[data-hero-subtitle]', data.title);
    updateBilingualElement('[data-hero-description]', data.description);
    
    // Update stats
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
    
    // Update title
    updateBilingualElement('[data-overview-title]', data.title);
    
    // Render overview cards
    const cardsContainer = document.querySelector('[data-overview-cards]');
    if (cardsContainer && data.cards) {
        cardsContainer.innerHTML = data.cards.map(card => `
            <div class="overview-card">
                <div class="card-icon">${card.icon}</div>
                <h3 data-text='${JSON.stringify(card.title)}'>${getText(card.title)}</h3>
                <p data-text='${JSON.stringify(card.description)}'>${getText(card.description)}</p>
            </div>
        `).join('');
    }
}

// Render projects section
function renderProjectsSection() {
    const data = portfolioData.projects;
    
    // Update title
    updateBilingualElement('[data-projects-title]', data.title);
    
    // Render project cards
    const projectsContainer = document.querySelector('[data-projects-list]');
    if (projectsContainer && data.list) {
        projectsContainer.innerHTML = data.list.map(project => `
            <div class="project-card ${project.featured ? 'featured' : ''}">
                <div class="project-header">
                    <h3>${project.name}</h3>
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
            </div>
        `).join('');
    }
}

// Render skills section
function renderSkillsSection() {
    const data = portfolioData.skills;
    
    // Update title
    updateBilingualElement('[data-skills-title]', data.title);
    
    // Render skill categories
    const skillsContainer = document.querySelector('[data-skills-list]');
    if (skillsContainer && data.categories) {
        skillsContainer.innerHTML = data.categories.map(category => `
            <div class="skill-category">
                <h3 data-text='${JSON.stringify(category.title)}'>${getText(category.title)}</h3>
                <div class="skills-list">
                    ${category.skills.map(skill => 
                        `<span class="skill ${skill.level}">${skill.name}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }
}

// Render contact section
function renderContactSection() {
    const contactData = portfolioData.contact;
    const personalData = portfolioData.personal.contact;
    
    // Update title and description
    updateBilingualElement('[data-contact-title]', contactData.title);
    updateBilingualElement('[data-contact-description]', contactData.description);
    
    // Update contact info
    const contactInfo = document.querySelector('[data-contact-info]');
    if (contactInfo) {
        contactInfo.innerHTML = `
            <div class="contact-item">
                <span class="contact-label">Email:</span>
                <a href="mailto:${personalData.email}">${personalData.email}</a>
            </div>
            <div class="contact-item">
                <span class="contact-label">Location:</span>
                <span data-text='${JSON.stringify(personalData.location)}'>${getText(personalData.location)}</span>
            </div>
            <div class="contact-item">
                <span class="contact-label">Timezone:</span>
                <span>${personalData.timezone}</span>
            </div>
            <div class="contact-item">
                <span class="contact-label" data-text='${JSON.stringify(portfolioData.navigation.labels.availability)}'>${getText(portfolioData.navigation.labels.availability)}</span>
                <span data-text='${JSON.stringify(personalData.availability)}'>${getText(personalData.availability)}</span>
            </div>
        `;
    }
    
    // Update contact links
    const contactLinks = document.querySelector('[data-contact-links]');
    if (contactLinks) {
        contactLinks.innerHTML = `
            <a href="${personalData.linkedin}" target="_blank" class="contact-link">
                <span data-text='${JSON.stringify(portfolioData.navigation.contact_links.linkedin)}'>${getText(portfolioData.navigation.contact_links.linkedin)}</span>
            </a>
            <a href="${personalData.github}" target="_blank" class="contact-link">
                <span data-text='${JSON.stringify(portfolioData.navigation.contact_links.github)}'>${getText(portfolioData.navigation.contact_links.github)}</span>
            </a>
        `;
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
                // Update button states
                langButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Update language
                currentLanguage = selectedLang;
                updateLanguage(selectedLang);
                
                // Update document language
                document.documentElement.lang = selectedLang;
                
                // Add smooth transition effect
                document.body.style.opacity = '0.8';
                setTimeout(() => {
                    document.body.style.opacity = '1';
                }, 200);
            }
        });
    });
}

// Update page language
function updateLanguage(lang) {
    // Update all elements with data-text attribute
    const elements = document.querySelectorAll('[data-text]');
    
    elements.forEach(element => {
        try {
            const textData = JSON.parse(element.getAttribute('data-text'));
            const translation = getText(textData);
            
            if (translation) {
                // Add fade effect for text changes
                element.style.opacity = '0.7';
                setTimeout(() => {
                    element.textContent = translation;
                    element.style.opacity = '1';
                }, 100);
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
                // Calculate offset for better positioning
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll reveal animation
function initializeScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add staggered animation for cards
                if (entry.target.classList.contains('overview-card') || 
                    entry.target.classList.contains('project-card') ||
                    entry.target.classList.contains('skill-category')) {
                    const cards = entry.target.parentElement.children;
                    Array.from(cards).forEach((card, index) => {
                        if (card === entry.target) return;
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
    
    // Observe cards for individual animation
    const animatedElements = document.querySelectorAll('.overview-card, .project-card, .skill-category, .contact-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Scroll spy for navigation highlighting
function initializeScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log(`Currently viewing: ${entry.target.id}`);
            }
        });
    }, {
        threshold: 0.6,
        rootMargin: '-20% 0px -20% 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Performance optimization - throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Parallax effect for hero section
function initializeParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        hero.style.transform = `translateY(${rate}px)`;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Mouse movement parallax for background elements
function initializeMouseParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xPos = (clientX / innerWidth) - 0.5;
        const yPos = (clientY / innerHeight) - 0.5;
        
        hero.style.backgroundPosition = `${50 + xPos * 10}% ${50 + yPos * 10}%`;
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    // Add subtle parallax effect
    if (window.innerWidth > 768) {
        initializeParallax();
        initializeMouseParallax();
    }
});

// Handle window resize
window.addEventListener('resize', throttle(() => {
    // Disable parallax on mobile for better performance
    if (window.innerWidth <= 768) {
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = '';
            hero.style.backgroundPosition = '';
        }
    }
}, 250));

// Error handling
window.addEventListener('error', function(e) {
    console.error('Portfolio error:', e.error);
});

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
    
    // Section navigation with arrow keys
    if (e.altKey) {
        const sections = ['hero', 'overview', 'projects', 'skills', 'contact'];
        const currentSection = getCurrentSection();
        const currentIndex = sections.indexOf(currentSection);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < sections.length - 1) {
                    document.getElementById(sections[currentIndex + 1]).scrollIntoView({
                        behavior: 'smooth'
                    });
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    document.getElementById(sections[currentIndex - 1]).scrollIntoView({
                        behavior: 'smooth'
                    });
                }
                break;
        }
    }
});

// Helper function to get current section
function getCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = 'hero';
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section.id;
        }
    });
    
    return currentSection;
}