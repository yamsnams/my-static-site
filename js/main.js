/**
 * Main Theme JavaScript
 *
 * Handles:
 * - Diary page scroll-snap navigation dots
 * - Keyboard navigation for diary entries
 *
 * @package MyTheme
 */

(function () {
    'use strict';

    /* =========================================================================
       Data Fetching & Rendering
       ========================================================================= */

    async function fetchSettings() {
        try {
            const response = await fetch('data/settings.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn('Unable to fetch settings (likely local file protocol). Using defaults.', error);
            return {
                "site_title": "Diary Collective",
                "footer_copy": "© 2026 Diary Collective",
                "terms_link": "#"
            };
        }
    }

    function applySettings(settings) {
        if (!settings) return;

        // Update page <title> using page-specific or site title
        const path = window.location.pathname;
        if (settings.site_title) {
            if (path.includes('diary') && settings.diary_title) {
                document.title = settings.diary_title;
            } else if (path.includes('submit') && settings.submit_title) {
                document.title = settings.submit_title;
            } else if (path.includes('success') && settings.submit_title) {
                document.title = settings.submit_title.replace('Submit', 'Success');
            } else if (settings.hero_title) {
                document.title = settings.hero_title;
            } else {
                document.title = settings.site_title;
            }
        }

        // Update brand logo alt text
        const branding = document.querySelector('.brand-logo');
        if (branding && settings.site_title) branding.alt = settings.site_title;

        // Update Footer copyright
        const copyright = document.querySelector('.footer-left span');
        if (copyright && settings.footer_copy) copyright.textContent = settings.footer_copy;

        // Update Terms link
        const terms = document.querySelector('.footer-right a');
        if (terms) {
            if (settings.terms_link) terms.href = settings.terms_link;
            if (settings.terms_label) terms.textContent = settings.terms_label;
        }

        // Update Social Icons
        const socialWrap = document.querySelector('.social-icons');
        if (socialWrap && settings.social_links && settings.social_links.length > 0) {
            socialWrap.innerHTML = '';
            settings.social_links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url || '#';
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.setAttribute('aria-label', link.name || 'Social Link');
                a.innerHTML = `<img src="${link.icon}" alt="${link.name}">`;
                socialWrap.appendChild(a);
            });
        }
    }

    async function fetchDiaryEntries() {
        try {
            const response = await fetch('data/entries.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            // CMS File Collection returns an object with an 'entries' array
            return data.entries || [];
        } catch (error) {
            console.warn('Unable to fetch diary entries (likely local file protocol). Using fallback content.', error);
            // Fallback content for local file:// usage
            return [
                {
                    "author": "Anonymous Soul",
                    "text": "The fog settled over the valley this morning like a heavy velvet blanket...",
                    "image": "assets/illustration-left.svg"
                },
                {
                    "author": "The Midnight Wanderer",
                    "text": "Found a pressed wildflower between the pages of a book I haven't opened in years...",
                    "image": "assets/illustration-right.svg"
                }
            ];
        }
    }

    function renderDiaryEntries(entries) {
        const container = document.getElementById('diary-container');
        const nav = document.querySelector('.diary-nav');
        if (!container || !nav) return;

        container.innerHTML = '';
        nav.innerHTML = '';

        if (!Array.isArray(entries) || entries.length === 0) {
            container.innerHTML = '<div class="diary-empty"><p>No entries found. If you are viewing this locally, please use a local server (e.g., Live Server) to see dynamic content.</p></div>';
            return;
        }

        entries.forEach((entry, index) => {
            // Render Entry
            const entryEl = document.createElement('div');
            entryEl.className = 'diary-entry';
            entryEl.setAttribute('data-entry', index);
            entryEl.innerHTML = `
                <img class="diary-entry__image" src="${entry.image}" alt="Diary Image ${index + 1}">
                <div class="diary-entry__text">${entry.text}</div>
                <div class="diary-entry__author">&mdash; ${entry.author}</div>
            `;
            container.appendChild(entryEl);

            // Render Nav Dot
            const dot = document.createElement('button');
            dot.className = index === 0 ? 'diary-nav__dot is-active' : 'diary-nav__dot';
            dot.setAttribute('data-target', index);
            dot.setAttribute('aria-label', `Go to entry ${index + 1}`);
            nav.appendChild(dot);
        });
    }

    /* =========================================================================
       Diary Page: Scroll-Snap Navigation Dots
       ========================================================================= */

    async function initDiaryNav() {
        const entriesData = await fetchDiaryEntries();
        renderDiaryEntries(entriesData);

        const container = document.getElementById('diary-container');
        const dots = document.querySelectorAll('.diary-nav__dot');
        const entries = document.querySelectorAll('.diary-entry');

        if (!container || dots.length === 0 || entries.length === 0) return;

        // Click on dot → scroll to entry
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const targetIndex = parseInt(this.getAttribute('data-target'), 10);
                const targetEntry = entries[targetIndex];
                if (targetEntry) {
                    targetEntry.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Observe which entry is in view → highlight dot
        const observerOptions = {
            root: container,
            rootMargin: '0px',
            threshold: 0.6,
        };

        const observer = new IntersectionObserver(function (observerEntries) {
            observerEntries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-entry'), 10);
                    dots.forEach(function (d) { d.classList.remove('is-active'); });
                    if (dots[index]) {
                        dots[index].classList.add('is-active');
                    }
                }
            });
        }, observerOptions);

        entries.forEach(function (entry) {
            observer.observe(entry);
        });

        // Keyboard navigation (up/down arrows)
        let currentEntry = 0;
        document.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                if (currentEntry < entries.length - 1) {
                    currentEntry++;
                    entries[currentEntry].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                if (currentEntry > 0) {
                    currentEntry--;
                    entries[currentEntry].scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Sync currentEntry with scroll position
        const scrollObserver = new IntersectionObserver(function (observerEntries) {
            observerEntries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    currentEntry = parseInt(entry.target.getAttribute('data-entry'), 10);
                }
            });
        }, { root: container, threshold: 0.6 });

        entries.forEach(function (entry) {
            scrollObserver.observe(entry);
        });
    }

    /* =========================================================================
       Init on DOM Ready
       ========================================================================= */

    document.addEventListener('DOMContentLoaded', async function () {
        const settings = await fetchSettings();
        applySettings(settings);

        // Only init diary if on diary page
        if (document.getElementById('diary-container')) {
            initDiaryNav();
        }
    });

})();
