/* ============================================================
   RNIII Portfolio — Shared JavaScript
   ============================================================ */

(function () {
    'use strict';

    const { animate, stagger } = anime;

    // ── Theme ────────────────────────────────────────────────
    const THEME_KEY = 'rniii-theme';
    const html = document.documentElement;

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        applyTheme(saved || preferred);
    }

    function toggleTheme() {
        const current = html.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    // ── Nav active link ──────────────────────────────────────
    function setActiveNav() {
        const path = window.location.pathname.replace(/\/$/, '') || '/';
        document.querySelectorAll('.nav-links a').forEach(link => {
            const href = link.getAttribute('href').replace(/\/$/, '') || '/';
            const isActive = path.endsWith(href) ||
                (href === 'index.html' && (path === '/' || path === '')) ||
                (path === '/' && href === 'index.html');
            link.classList.toggle('active', isActive);
        });
    }

    // ── Mobile nav ───────────────────────────────────────────
    function initMobileNav() {
        const hamburger = document.querySelector('.nav-hamburger');
        const navLinks = document.querySelector('.nav-links');
        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', () => {
            const open = navLinks.style.display === 'flex';
            navLinks.style.display = open ? '' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '68px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'var(--bg-elev)';
            navLinks.style.padding = '1rem 5%';
            navLinks.style.borderBottom = '1px solid var(--border)';
            navLinks.style.gap = '0.25rem';
            if (open) navLinks.style.display = 'none';
        });
    }

    // ── Scroll reveal ────────────────────────────────────────
    function initScrollReveal() {
        if (!document.body.classList.contains('js-ready')) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);

                const el = entry.target;
                const delay = parseInt(el.dataset.delay || '0', 10);
                const isLeft = el.classList.contains('reveal-left');
                const isScale = el.classList.contains('reveal-scale');

                animate(el, {
                    opacity: [0, 1],
                    translateY: isLeft || isScale ? [0, 0] : [-32 * -1, 0], // from below
                    translateX: isLeft ? [-32, 0] : [0, 0],
                    scale: isScale ? [0.93, 1] : [1, 1],
                    duration: 750,
                    delay,
                    ease: 'outExpo',
                });
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal, .reveal-left, .reveal-scale')
            .forEach(el => observer.observe(el));
    }

    // ── Stagger groups ───────────────────────────────────────
    function initStaggerGroups() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                const items = entry.target.querySelectorAll(':scope > *');
                animate(items, {
                    opacity: [0, 1],
                    translateY: [40, 0],
                    delay: stagger(90),
                    duration: 700,
                    ease: 'outExpo',
                });
            });
        }, { threshold: 0.06 });

        document.querySelectorAll('.stagger-group').forEach(el => observer.observe(el));
    }

    // ── Counter animation ────────────────────────────────────
    function animateCounter(el) {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = (target % 1 !== 0) ? 1 : 0;
        animate({ val: 0 }, {
            val: target,
            duration: 1600,
            ease: 'outExpo',
            onUpdate: ({ val }) => {
                el.textContent = val.toFixed(decimals) + suffix;
            },
        });
    }

    function initCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.stats-grid').forEach(el => observer.observe(el));
    }

    // ── Init ─────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('js-ready');
        initTheme();
        setActiveNav();
        initMobileNav();
        initScrollReveal();
        initStaggerGroups();
        initCounters();

        // Theme toggle button
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', toggleTheme);
        });
    });
})();
