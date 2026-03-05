// ===== NAVIGATION FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    if (navMenu) navMenu.classList.remove('active');
                }
            }
        });
    });

    // Active navigation link on scroll
    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav);
});

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===== HERO SECTION FUNCTIONS =====
function startLab() {
    // Scroll to modules section and highlight first module
    const modulesSection = document.querySelector('.modules');
    if (modulesSection) {
        modulesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function learnMore() {
    // Scroll to features section
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== EXPERIMENT HANDLERS =====
function openExperiment(experimentType) {
    switch(experimentType) {
        case 'isotopes':
            window.location.href = 'isotopes-and-atomic-mass_vi.html';
            break;
        case 'energy':
            window.location.href = 'energy-forms-and-changes_vi.html';
            break;
        default:
            console.log('Opening experiment:', experimentType);
    }
}

// ===== CARD ANIMATION =====
function observeCards() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    const cards = document.querySelectorAll('.module-card, .feature-card, .experiment-card');
    cards.forEach(function(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

window.addEventListener('DOMContentLoaded', observeCards);

// ===== USER DATA MANAGEMENT =====
class UserProgress {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem('chemcloud_user_progress');
        return stored ? JSON.parse(stored) : this.initializeData();
    }

    initializeData() {
        return {
            userId: this.generateId(),
            userName: 'Guest User',
            modules: {
                module1: { completed: false, progress: 0 },
                module2: { completed: false, progress: 0 },
                module3: { completed: false, progress: 0 },
                module4: { completed: false, progress: 0 },
                module5: { completed: false, progress: 0 },
                module6: { completed: false, progress: 0 },
                module7: { completed: false, progress: 0 },
                module8: { completed: false, progress: 0 },
                module9: { completed: false, progress: 0 },
            },
            lastAccessed: new Date().toISOString(),
            quizResults: [],
            experimentsCompleted: []
        };
    }

    generateId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    saveData() {
        localStorage.setItem('chemcloud_user_progress', JSON.stringify(this.data));
    }

    updateModuleProgress(moduleId, progress) {
        if (this.data.modules[moduleId]) {
            this.data.modules[moduleId].progress = Math.min(progress, 100);
            this.data.lastAccessed = new Date().toISOString();
            this.saveData();
        }
    }

    completeModule(moduleId) {
        if (this.data.modules[moduleId]) {
            this.data.modules[moduleId].completed = true;
            this.data.modules[moduleId].progress = 100;
            this.saveData();
        }
    }

    addQuizResult(quizId, score, total) {
        this.data.quizResults.push({
            quizId: quizId,
            score: score,
            total: total,
            percentage: (score / total) * 100,
            date: new Date().toISOString()
        });
        this.saveData();
    }

    addCompletedExperiment(experimentId) {
        if (!this.data.experimentsCompleted.includes(experimentId)) {
            this.data.experimentsCompleted.push({
                experimentId: experimentId,
                completedDate: new Date().toISOString()
            });
            this.saveData();
        }
    }

    getOverallProgress() {
        const modules = this.data.modules;
        const totalProgress = Object.values(modules).reduce((sum, mod) => sum + mod.progress, 0);
        return Math.round(totalProgress / Object.keys(modules).length);
    }
}

// Initialize user progress tracker
const userProgress = new UserProgress();

// ===== OFFLINE SUPPORT =====
if ('serviceWorker' in navigator && 'caches' in window) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('js/sw.js').then(function(registration) {
            console.log('Service Worker registered successfully:', registration);
        }).catch(function(err) {
            console.log('Service Worker registration failed:', err);
        });
    });
}

// Check online/offline status
window.addEventListener('online', function() {
    showNotification('You are back online!', 'success');
});

window.addEventListener('offline', function() {
    showNotification('You are now offline. Limited features available.', 'warning');
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    const bgColor = {
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'info': '#3b82f6'
    }[type] || '#3b82f6';

    notification.style.backgroundColor = bgColor;
    notification.style.color = 'white';
    notification.style.fontWeight = '600';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== ANALYTICS TRACKING =====
class Analytics {
    static trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        console.log('Event tracked:', event);
        
        // Store in localStorage for offline capability
        const events = JSON.parse(localStorage.getItem('chemcloud_events') || '[]');
        events.push(event);
        localStorage.setItem('chemcloud_events', JSON.stringify(events));
    }

    static trackModuleView(moduleId) {
        Analytics.trackEvent('module_view', { moduleId: moduleId });
    }

    static trackQuizStart(quizId) {
        Analytics.trackEvent('quiz_start', { quizId: quizId });
    }

    static trackExperimentStart(experimentId) {
        Analytics.trackEvent('experiment_start', { experimentId: experimentId });
    }

    static trackExperimentComplete(experimentId, duration) {
        Analytics.trackEvent('experiment_complete', {
            experimentId: experimentId,
            duration: duration
        });
    }
}

// Track page views
Analytics.trackEvent('page_view', { page: window.location.pathname });

// ===== SEARCH FUNCTIONALITY =====
function searchContent(query) {
    const modules = document.querySelectorAll('.module-card, .feature-card, .experiment-card');
    const results = [];
    
    query = query.toLowerCase();
    
    modules.forEach(module => {
        const text = module.innerText.toLowerCase();
        if (text.includes(query)) {
            results.push({
                title: module.querySelector('h3')?.innerText || 'Unknown',
                element: module
            });
        }
    });
    
    return results;
}

// ===== RESPONSIVE HELPERS =====
function isMobile() {
    return window.innerWidth <= 768;
}

function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

function isDesktop() {
    return window.innerWidth > 1024;
}

// Update on resize
window.addEventListener('resize', function() {
    // Add responsive behavior here if needed
});

// ===== EXPORT FOR MODULE USAGE =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UserProgress,
        Analytics,
        searchContent,
        showNotification,
        isMobile,
        isTablet,
        isDesktop
    };
}
