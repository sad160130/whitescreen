/**
 * WhiteScreen.wiki - Main JavaScript
 * Handles fullscreen color mode, FAQ accordion, mobile navigation, and more.
 * Vanilla JS only - no dependencies.
 */

(function() {
    'use strict';

    // ==========================================================================
    // Constants & Configuration
    // ==========================================================================
    const STORAGE_KEY = 'whitescreen_last_color';
    const DARK_COLORS = ['#000000', '#1e90ff', '#ff4b4b'];

    // Color definitions for validation
    const VALID_COLORS = {
        white: '#ffffff',
        blue: '#1e90ff',
        green: '#32cd32',
        black: '#000000',
        red: '#ff4b4b',
        yellow: '#ffe600',
        pink: '#ffb6c1',
        cream: '#fffdd0',
        gray: '#f2f2f2'
    };

    // ==========================================================================
    // DOM Elements
    // ==========================================================================
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // ==========================================================================
    // Utility Functions
    // ==========================================================================

    /**
     * Check if a color should use light text
     * @param {string} hexColor - Hex color code
     * @returns {boolean}
     */
    function isDarkColor(hexColor) {
        return DARK_COLORS.includes(hexColor.toLowerCase());
    }

    /**
     * Save color preference to localStorage
     * @param {string} color - Hex color code
     */
    function saveColorPreference(color) {
        try {
            localStorage.setItem(STORAGE_KEY, color);
        } catch (e) {
            // localStorage not available, fail silently
        }
    }

    /**
     * Get saved color preference
     * @returns {string|null}
     */
    function getSavedColor() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    /**
     * Validate hex color
     * @param {string} color - Potential hex color
     * @returns {boolean}
     */
    function isValidHexColor(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    // ==========================================================================
    // Fullscreen Mode
    // ==========================================================================

    /**
     * Enter fullscreen color mode
     * @param {string} color - Hex color code
     */
    function enterFullscreenMode(color) {
        if (!fullscreenOverlay || !isValidHexColor(color)) return;

        // Set background color
        fullscreenOverlay.style.backgroundColor = color;

        // Toggle dark mode class for light text
        if (isDarkColor(color)) {
            fullscreenOverlay.classList.add('dark-mode');
        } else {
            fullscreenOverlay.classList.remove('dark-mode');
        }

        // Show overlay
        fullscreenOverlay.classList.add('active');
        fullscreenOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Try to enter browser fullscreen
        requestBrowserFullscreen();

        // Save preference
        saveColorPreference(color);

        // Update tip message
        updateFullscreenTip(color);
    }

    /**
     * Exit fullscreen color mode
     */
    function exitFullscreenMode() {
        if (!fullscreenOverlay) return;

        fullscreenOverlay.classList.remove('active');
        fullscreenOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Exit browser fullscreen if active
        exitBrowserFullscreen();
    }

    /**
     * Request browser fullscreen mode
     */
    function requestBrowserFullscreen() {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    /**
     * Exit browser fullscreen mode
     */
    function exitBrowserFullscreen() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    /**
     * Update the tip message based on color
     * @param {string} color - Hex color code
     */
    function updateFullscreenTip(color) {
        const tip = fullscreenOverlay.querySelector('.fullscreen-tip');
        if (!tip) return;

        const tips = {
            '#ffffff': 'Clear your mind. Start fresh.',
            '#1e90ff': 'Breathe deeply. Find your focus.',
            '#32cd32': 'Connect with calm. Stay balanced.',
            '#000000': 'Embrace stillness. Turn inward.',
            '#ff4b4b': 'Feel the energy. Take action.',
            '#ffe600': 'Spark creativity. Think bright.',
            '#ffb6c1': 'Nurture yourself. Create with heart.',
            '#fffdd0': 'Rest your eyes. Work in comfort.',
            '#f2f2f2': 'Think clearly. Stay neutral.'
        };

        tip.textContent = tips[color.toLowerCase()] || 'Take a deep breath. Focus on the present moment.';
    }

    // ==========================================================================
    // Event Handlers
    // ==========================================================================

    /**
     * Handle color button clicks
     * @param {Event} e - Click event
     */
    function handleColorClick(e) {
        const button = e.target.closest('[data-color]');
        if (!button) return;

        const color = button.getAttribute('data-color');
        if (color && isValidHexColor(color)) {
            enterFullscreenMode(color);
        }
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleKeyDown(e) {
        // Exit fullscreen on Escape
        if (e.key === 'Escape' && fullscreenOverlay.classList.contains('active')) {
            exitFullscreenMode();
        }
    }

    /**
     * Handle fullscreen change events (browser fullscreen)
     */
    function handleFullscreenChange() {
        // If browser exited fullscreen but our overlay is still active, keep overlay
        // User needs to click exit button or press ESC to fully exit
    }

    // ==========================================================================
    // Mobile Navigation
    // ==========================================================================

    /**
     * Toggle mobile menu
     */
    function toggleMobileMenu() {
        if (!mobileMenuToggle || !navLinks) return;

        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';

        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    }

    /**
     * Close mobile menu
     */
    function closeMobileMenu() {
        if (!mobileMenuToggle || !navLinks) return;

        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    }

    // ==========================================================================
    // FAQ Accordion
    // ==========================================================================

    /**
     * Initialize FAQ accordion functionality
     */
    function initFaqAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true';
                const answerId = this.getAttribute('aria-controls');
                const answer = document.getElementById(answerId);

                // Close all other answers
                faqQuestions.forEach(q => {
                    if (q !== this) {
                        q.setAttribute('aria-expanded', 'false');
                        const otherAnswerId = q.getAttribute('aria-controls');
                        const otherAnswer = document.getElementById(otherAnswerId);
                        if (otherAnswer) {
                            otherAnswer.hidden = true;
                        }
                    }
                });

                // Toggle current answer
                this.setAttribute('aria-expanded', !expanded);
                if (answer) {
                    answer.hidden = expanded;
                }
            });
        });
    }

    // ==========================================================================
    // Smooth Scroll
    // ==========================================================================

    /**
     * Initialize smooth scroll for anchor links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();

                    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });
    }

    // ==========================================================================
    // URL Hash Handler (for colors page)
    // ==========================================================================

    /**
     * Handle URL hash to auto-scroll or trigger color
     */
    function handleUrlHash() {
        const hash = window.location.hash.substring(1);
        if (!hash) return;

        // If hash matches a color name, scroll to it
        if (VALID_COLORS[hash]) {
            const colorElement = document.getElementById(hash) ||
                                  document.getElementById(`insight-${hash}`);

            if (colorElement) {
                setTimeout(() => {
                    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                    const elementPosition = colorElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    }

    // ==========================================================================
    // Contact Form
    // ==========================================================================

    /**
     * Initialize contact form handling
     */
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const successMessage = document.getElementById('form-success');

        if (!form) return;

        form.addEventListener('submit', function(e) {
            // For static site, we'll show success message
            // In production, this would be handled by form service

            // Check if using formspree or similar
            const action = form.getAttribute('action');
            if (action && action.includes('formspree')) {
                // Let formspree handle it
                return;
            }

            // For demo purposes, show success message
            e.preventDefault();

            // Simple validation
            const name = form.querySelector('#name').value.trim();
            const email = form.querySelector('#email').value.trim();
            const message = form.querySelector('#message').value.trim();

            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Show success message
            form.style.display = 'none';
            if (successMessage) {
                successMessage.hidden = false;
            }
        });
    }

    // ==========================================================================
    // Fade-in Animation on Scroll
    // ==========================================================================

    /**
     * Initialize scroll-triggered fade-in animations
     */
    function initScrollAnimations() {
        // Simple intersection observer for fade-in effects
        if (!('IntersectionObserver' in window)) return;

        const animatedElements = document.querySelectorAll(
            '.feature-card, .benefit-item, .tip-card, .testimonial, .insight-item, .topic-card'
        );

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    // ==========================================================================
    // Initialization
    // ==========================================================================

    /**
     * Initialize all functionality
     */
    function init() {
        // Color button click handlers
        document.addEventListener('click', handleColorClick);

        // Exit fullscreen button
        if (exitFullscreenBtn) {
            exitFullscreenBtn.addEventListener('click', exitFullscreenMode);
        }

        // Keyboard events
        document.addEventListener('keydown', handleKeyDown);

        // Fullscreen change events
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        // Mobile menu toggle
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        }

        // Close mobile menu when clicking nav links
        if (navLinks) {
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }

        // Close mobile menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        // Initialize FAQ accordion
        initFaqAccordion();

        // Initialize smooth scroll
        initSmoothScroll();

        // Handle URL hash
        handleUrlHash();

        // Initialize contact form
        initContactForm();

        // Initialize scroll animations
        initScrollAnimations();

        // Click outside to close overlay (on the overlay itself, not content)
        if (fullscreenOverlay) {
            fullscreenOverlay.addEventListener('click', function(e) {
                if (e.target === fullscreenOverlay) {
                    exitFullscreenMode();
                }
            });
        }
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
