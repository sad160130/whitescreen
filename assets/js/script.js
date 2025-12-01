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
    const BRIGHTNESS_KEY = 'whitescreen_brightness';
    const DARK_COLORS = ['#000000', '#1e90ff', '#ff4b4b', '#cc0000', '#228b22', '#1a472a'];

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
        gray: '#808080'
    };

    // Base colors for each screen (used for brightness adjustment)
    const BASE_COLORS = {
        '#ffffff': { h: 0, s: 0, l: 100 },      // White
        '#000000': { h: 0, s: 0, l: 0 },        // Black
        '#1e90ff': { h: 210, s: 100, l: 56 },   // Blue
        '#0066cc': { h: 210, s: 100, l: 40 },   // Blue alt
        '#32cd32': { h: 120, s: 61, l: 50 },    // Green
        '#228b22': { h: 120, s: 61, l: 34 },    // Forest Green
        '#ff4b4b': { h: 0, s: 100, l: 65 },     // Red
        '#cc0000': { h: 0, s: 100, l: 40 },     // Dark Red
        '#ffe600': { h: 54, s: 100, l: 50 },    // Yellow
        '#ffb6c1': { h: 351, s: 100, l: 86 },   // Pink
        '#fffdd0': { h: 55, s: 100, l: 91 },    // Cream
        '#808080': { h: 0, s: 0, l: 50 },       // Gray
        '#f2f2f2': { h: 0, s: 0, l: 95 }        // Light Gray
    };

    // Current state
    let currentBaseColor = null;
    let currentBrightness = 100;

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
        // Check against known dark colors
        if (DARK_COLORS.includes(hexColor.toLowerCase())) return true;

        // Calculate luminance for dynamic colors
        const rgb = hexToRgb(hexColor);
        if (rgb) {
            const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
            return luminance < 0.5;
        }
        return false;
    }

    /**
     * Convert hex to RGB
     * @param {string} hex - Hex color code
     * @returns {object|null}
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert HSL to Hex
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {string}
     */
    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    /**
     * Adjust color brightness
     * @param {string} baseColor - Base hex color
     * @param {number} brightness - Brightness percentage (0-100)
     * @returns {string}
     */
    function adjustColorBrightness(baseColor, brightness) {
        const base = BASE_COLORS[baseColor.toLowerCase()];
        if (!base) return baseColor;

        // For black, we adjust lightness from 0 towards gray
        if (baseColor.toLowerCase() === '#000000') {
            const newL = Math.min(30, (brightness / 100) * 30);
            return hslToHex(base.h, base.s, newL);
        }

        // For white, we adjust lightness from 100 downwards
        if (baseColor.toLowerCase() === '#ffffff') {
            const newL = Math.max(50, 50 + (brightness / 100) * 50);
            return hslToHex(base.h, base.s, newL);
        }

        // For other colors, adjust lightness proportionally
        const minL = Math.max(10, base.l - 40);
        const maxL = Math.min(95, base.l + 30);
        const range = maxL - minL;
        const newL = minL + (brightness / 100) * range;

        return hslToHex(base.h, base.s, newL);
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
     * Save brightness preference to localStorage
     * @param {number} brightness - Brightness value
     */
    function saveBrightnessPreference(brightness) {
        try {
            localStorage.setItem(BRIGHTNESS_KEY, brightness.toString());
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
     * Get saved brightness preference
     * @returns {number}
     */
    function getSavedBrightness() {
        try {
            const saved = localStorage.getItem(BRIGHTNESS_KEY);
            return saved ? parseInt(saved, 10) : 100;
        } catch (e) {
            return 100;
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
     * @param {number} brightness - Brightness level (optional)
     */
    function enterFullscreenMode(color, brightness) {
        if (!fullscreenOverlay || !isValidHexColor(color)) return;

        // Store base color
        currentBaseColor = color;
        currentBrightness = brightness !== undefined ? brightness : getSavedBrightness();

        // Calculate adjusted color
        const adjustedColor = adjustColorBrightness(color, currentBrightness);

        // Set background color
        fullscreenOverlay.style.backgroundColor = adjustedColor;

        // Toggle dark mode class for light text
        if (isDarkColor(adjustedColor)) {
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
        saveBrightnessPreference(currentBrightness);

        // Update tip message
        updateFullscreenTip(color);
    }

    /**
     * Update fullscreen color based on brightness change
     * @param {number} brightness - New brightness value
     */
    function updateFullscreenBrightness(brightness) {
        if (!fullscreenOverlay || !currentBaseColor) return;

        currentBrightness = brightness;
        const adjustedColor = adjustColorBrightness(currentBaseColor, brightness);
        fullscreenOverlay.style.backgroundColor = adjustedColor;

        // Toggle dark mode class based on new color
        if (isDarkColor(adjustedColor)) {
            fullscreenOverlay.classList.add('dark-mode');
        } else {
            fullscreenOverlay.classList.remove('dark-mode');
        }

        saveBrightnessPreference(brightness);
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
    // Interactive Color Preview Panel
    // ==========================================================================

    /**
     * Initialize interactive color preview panel
     */
    function initInteractivePreview() {
        const previewPanel = document.querySelector('.interactive-preview-panel');
        if (!previewPanel) return;

        const colorPreview = previewPanel.querySelector('.color-preview-display');
        const brightnessSlider = previewPanel.querySelector('.brightness-slider');
        const brightnessValue = previewPanel.querySelector('.brightness-value');
        const fullscreenBtn = previewPanel.querySelector('.preview-fullscreen-btn');
        const baseColor = previewPanel.dataset.baseColor;

        if (!baseColor) return;

        // Set initial brightness from saved preference or default
        let currentPreviewBrightness = getSavedBrightness();
        if (brightnessSlider) {
            brightnessSlider.value = currentPreviewBrightness;
        }
        if (brightnessValue) {
            brightnessValue.textContent = currentPreviewBrightness + '%';
        }

        // Set initial preview color
        updatePreviewColor(colorPreview, baseColor, currentPreviewBrightness);

        // Handle brightness slider changes
        if (brightnessSlider) {
            brightnessSlider.addEventListener('input', function() {
                currentPreviewBrightness = parseInt(this.value, 10);
                if (brightnessValue) {
                    brightnessValue.textContent = currentPreviewBrightness + '%';
                }
                updatePreviewColor(colorPreview, baseColor, currentPreviewBrightness);

                // If fullscreen is active, update it too
                if (fullscreenOverlay && fullscreenOverlay.classList.contains('active')) {
                    updateFullscreenBrightness(currentPreviewBrightness);
                }
            });
        }

        // Handle fullscreen button click (only the button triggers fullscreen, not the entire preview area)
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                enterFullscreenMode(baseColor, currentPreviewBrightness);
            });
        }

        // Handle preset shade buttons
        const shadePresets = previewPanel.querySelectorAll('.shade-preset');
        shadePresets.forEach(preset => {
            preset.addEventListener('click', function() {
                const shadeValue = parseInt(this.dataset.shade, 10);
                currentPreviewBrightness = shadeValue;

                if (brightnessSlider) {
                    brightnessSlider.value = shadeValue;
                }
                if (brightnessValue) {
                    brightnessValue.textContent = shadeValue + '%';
                }
                updatePreviewColor(colorPreview, baseColor, shadeValue);

                // Update active state
                shadePresets.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    /**
     * Update preview color display
     * @param {HTMLElement} element - Preview element
     * @param {string} baseColor - Base hex color
     * @param {number} brightness - Brightness percentage
     */
    function updatePreviewColor(element, baseColor, brightness) {
        if (!element) return;

        const adjustedColor = adjustColorBrightness(baseColor, brightness);
        element.style.backgroundColor = adjustedColor;

        // Update the hex display if present
        const hexDisplay = element.querySelector('.current-hex');
        if (hexDisplay) {
            hexDisplay.textContent = adjustedColor.toUpperCase();
        }

        // Toggle dark mode for text visibility
        if (isDarkColor(adjustedColor)) {
            element.classList.add('dark-preview');
        } else {
            element.classList.remove('dark-preview');
        }
    }

    // ==========================================================================
    // Initialization
    // ==========================================================================

    /**
     * Initialize all functionality
     */
    function init() {
        // Ensure fullscreen overlay is hidden on page load
        if (fullscreenOverlay) {
            fullscreenOverlay.classList.remove('active');
            fullscreenOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

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

        // Initialize interactive preview panel
        initInteractivePreview();

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
