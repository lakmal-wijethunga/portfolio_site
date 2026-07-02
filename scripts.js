// Make sure DOM is fully loaded before running code
document.addEventListener('DOMContentLoaded', function() {
    // Build project cards from projects-data.js BEFORE any code queries them.
    renderProjects();

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');
    
    if (hamburger && navbar) {
        const toggleMenu = () => {
            const isOpen = navbar.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        };
        hamburger.addEventListener('click', toggleMenu);
        // Keyboard support: the hamburger is a role="button" div
        hamburger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
    }

    // Close mobile menu when clicking a menu item
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('active');
            if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Portfolio Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Project Modal Logic
    const modal = document.getElementById('project-modal');
    if (modal) {
        const closeModalBtn = modal.querySelector('.modal-close');
        const modalMediaContainer = modal.querySelector('.modal-media-container');
        const modalTitle = modal.querySelector('.modal-title');
        const modalLikeBtn = modal.querySelector('.modal-like-btn');
        const modalLikeIcon = modalLikeBtn.querySelector('i');
        const modalLikeCount = modalLikeBtn.querySelector('.modal-like-count');
        const modalDescription = modal.querySelector('.modal-description');
        const modalToolsContainer = modal.querySelector('.modal-tools-container');
        const modalButtons = modal.querySelector('.modal-buttons');

        projectCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.card-like-btn, .video-sound-btn, a, .prev, .next')) {
                    return;
                }

                const projectId = card.id;
                const originalLikeBtn = card.querySelector('.card-like-btn');
                const originalLikeCount = originalLikeBtn?.querySelector('.card-like-count').textContent;

                if (originalLikeBtn) {
                    modalLikeBtn.dataset.projectId = projectId;
                    modalLikeCount.textContent = originalLikeCount;
                    if (originalLikeBtn.classList.contains('liked')) {
                        modalLikeBtn.classList.add('liked');
                        modalLikeIcon.className = 'fas fa-heart';
                    } else {
                        modalLikeBtn.classList.remove('liked');
                        modalLikeIcon.className = 'far fa-heart';
                    }
                }

                const mediaElement = card.querySelector('img, video, .slideshow-container');
                const title = card.querySelector('.project-overlay h3')?.textContent || 'Project Details';
                const description = card.querySelector('.project-overlay p')?.textContent || 'No description available.';
                const buttons = card.querySelector('.project-buttons');
                const toolsString = card.dataset.tools || '';

                modalMediaContainer.innerHTML = '';
                modalToolsContainer.innerHTML = '';
                modalButtons.innerHTML = '';

                if (mediaElement) {
                    const clonedMedia = mediaElement.cloneNode(true);
                    if (clonedMedia.tagName === 'VIDEO') {
                        clonedMedia.muted = false;
                        clonedMedia.controls = true;
                        clonedMedia.autoplay = true;
                    }
                    modalMediaContainer.appendChild(clonedMedia);
                }
                modalTitle.textContent = title;
                modalDescription.textContent = description;

                if (toolsString) {
                    const toolsArray = toolsString.split(',').map(tool => tool.trim());
                    const toolsTitle = document.createElement('h4');
                    toolsTitle.textContent = 'Tools Used';
                    modalToolsContainer.appendChild(toolsTitle);
                    const tagsWrapper = document.createElement('div');
                    tagsWrapper.className = 'modal-tools-tags';
                    toolsArray.forEach(toolName => {
                        const toolTag = document.createElement('span');
                        toolTag.className = 'modal-tool-tag';
                        toolTag.textContent = toolName;
                        tagsWrapper.appendChild(toolTag);
                    });
                    modalToolsContainer.appendChild(tagsWrapper);
                }
                if (buttons) {
                    modalButtons.innerHTML = buttons.innerHTML;
                }

                document.body.classList.add('modal-open');
                modal.classList.add('active');
            });
        });
        
        modalLikeBtn.addEventListener('click', function() {
            const projectId = this.dataset.projectId;
            const originalCard = document.getElementById(projectId);
            if (originalCard) {
                originalCard.querySelector('.card-like-btn')?.click();
            }
        });

        const closeModal = () => {
            const video = modal.querySelector('video');
            if (video) video.pause();
            document.body.classList.remove('modal-open');
            modal.classList.remove('active');
        };

        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // Play videos ONLY while they're on screen. Off-screen videos stay paused
    // (and, with preload="metadata"/poster, barely download) — instead of all
    // videos downloading + decoding at once on page load.
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const v = entry.target;
            if (entry.isIntersecting) {
                v.play().catch(() => {});
            } else {
                v.pause();
            }
        });
    }, { threshold: 0.25 });

    // Video sound control + lazy playback wiring
    projectCards.forEach(card => {
        const video = card.querySelector('video');
        if (video) {
            video.muted = true;
            videoObserver.observe(video);

            const soundButton = document.createElement('button');
            soundButton.className = 'video-sound-btn';
            soundButton.setAttribute('aria-label', 'Unmute video');
            soundButton.innerHTML = '<i class="fas fa-volume-mute" aria-hidden="true"></i>';
            card.appendChild(soundButton);

            soundButton.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                soundButton.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
                soundButton.innerHTML = video.muted ?
                    '<i class="fas fa-volume-mute" aria-hidden="true"></i>' :
                    '<i class="fas fa-volume-up" aria-hidden="true"></i>';
            });
        }
    });
    
    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
                navbar.classList.remove('active');
            }
        });
    });
    
    // Scroll progress bar + back-to-top button (created once)
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);

    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(backToTop);
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const header = document.querySelector('header');
    // Sticky header + progress + back-to-top, all in one scroll listener
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (header) header.classList.toggle('sticky', scrollY > 0);

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';

        backToTop.classList.toggle('show', scrollY > 500);
    }, { passive: true });

    // Slideshow functionality (for main grid)
    const slideshowContainers = document.querySelectorAll('.project-card .slideshow-container');
    slideshowContainers.forEach(container => {
        const slides = container.querySelectorAll('.slide');
        if (slides.length > 0) {
            slides[0].classList.add('active');
            slides[0].classList.add('zoom-effect');

            // Only advance while the slideshow is actually on screen
            let onScreen = false;
            const visibilityObserver = new IntersectionObserver(([entry]) => {
                onScreen = entry.isIntersecting;
            }, { threshold: 0.2 });
            visibilityObserver.observe(container);

            let slideIndex = 0;
            setInterval(() => {
                if (!onScreen || container.closest('.project-card:hover')) return;
                slides[slideIndex].classList.remove('active', 'zoom-effect');
                slideIndex = (slideIndex + 1) % slides.length;
                slides[slideIndex].classList.add('active', 'zoom-effect');
            }, 3200);
        }
    });

    // Initialize like system
    initLikeSystem();

    // Reveal on Scroll Logic
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserverOptions = {
        root: null,
        threshold: 0.1,
    };
    const revealObserver = new IntersectionObserver((entries, observer) => {
        // Stagger elements that enter the viewport together (e.g. a row of cards)
        let batchIndex = 0;
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = batchIndex * 90;
            batchIndex++;

            el.style.transitionDelay = `${delay}ms`;
            el.classList.add('visible');
            observer.unobserve(el);

            // Once the entrance finishes, drop the reveal classes entirely.
            // Their final state matches the default state, and keeping the
            // 0.8s transform transition around would fight the hover tilt.
            setTimeout(() => {
                el.classList.remove('reveal', 'visible');
                el.style.transitionDelay = '';
            }, 850 + delay);
        });
    }, revealObserverOptions);
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Initialize Parallax Hover Effect
    initParallaxEffect();
});

// Escape text so project data can't inject markup
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Build a lazy, optimized <img> — uses a WebP source when one is provided,
// falls back to the original. loading/decoding keep it off the critical path.
function imgTag(m, alt) {
    const img = `<img src="${escapeHtml(m.src)}" alt="${alt}" loading="lazy" decoding="async">`;
    if (m.webp) {
        return `<picture><source srcset="${escapeHtml(m.webp)}" type="image/webp">${img}</picture>`;
    }
    return img;
}

// Build a <video> that plays only when scrolled into view (see videoObserver).
// A poster (if provided) avoids downloading any video bytes until playback;
// otherwise preload="metadata" fetches just the first frame, not the whole file.
function videoTag(m, extraClass) {
    const poster = m.poster ? ` poster="${escapeHtml(m.poster)}"` : '';
    const preload = m.poster ? 'none' : 'metadata';
    return `<video class="lazy-video${extraClass || ''}" muted loop playsinline preload="${preload}"${poster}>
                <source src="${escapeHtml(m.src)}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
}

// Build the media block (video / single image / slideshow) for a project
function buildMediaHtml(project) {
    const media = project.media || [];
    if (media.length === 0) return '';

    if (media.length === 1 && media[0].type === 'video') {
        return videoTag(media[0]);
    }

    if (media.length === 1) {
        return imgTag(media[0], escapeHtml(project.title));
    }

    // Multiple items -> slideshow
    const slides = media.map((m, i) => {
        const alt = `${escapeHtml(project.title)} ${i + 1}`;
        const inner = m.type === 'video' ? videoTag(m) : imgTag(m, alt);
        return `<div class="slide fade">${inner}</div>`;
    }).join('');

    return `<div class="slideshow-container">
                ${slides}
                <a class="prev" onclick="changeSlide(-1, this, event)">&#10094;</a>
                <a class="next" onclick="changeSlide(1, this, event)">&#10095;</a>
            </div>`;
}

// Render all project cards from the PROJECTS data array
function renderProjects() {
    const grid = document.getElementById('project-grid');
    if (!grid || typeof PROJECTS === 'undefined') return;

    grid.innerHTML = PROJECTS.map(project => {
        const tools = (project.tools || []).join(', ');
        const links = (project.links || [])
            .map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener" class="project-btn">${escapeHtml(link.label)}</a>`)
            .join('');
        const buttonsHtml = links ? `<div class="project-buttons">${links}</div>` : '';

        return `<div class="project-card reveal" id="${escapeHtml(project.id)}" data-category="${escapeHtml(project.category)}" data-tools="${escapeHtml(tools)}">
                    ${buildMediaHtml(project)}
                    <div class="project-overlay">
                        <h3>${escapeHtml(project.title)}</h3>
                        <p>${escapeHtml(project.description)}</p>
                        ${buttonsHtml}
                    </div>
                </div>`;
    }).join('');
}

// Function to change slides
function changeSlide(n, el, e) {
    e = e || window.event;
    if (!el) return;
    
    const container = el.closest('.slideshow-container');
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    
    let currentIndex = 0;
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            currentIndex = index;
            slide.classList.remove('active', 'zoom-effect');
        }
    });
    
    let newIndex = currentIndex + n;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    
    slides[newIndex].classList.add('active', 'zoom-effect');
    
    if (e) e.stopPropagation();
}

// Initialize likes system
function initLikeSystem() {
    let userLikes = JSON.parse(localStorage.getItem('projectLikes')) || {};
    const modal = document.getElementById('project-modal');
    const modalLikeBtn = modal?.querySelector('.modal-like-btn');
    const modalLikeIcon = modalLikeBtn?.querySelector('i');
    const modalLikeCount = modal?.querySelector('.modal-like-count');

    document.querySelectorAll('.project-card').forEach((card, index) => {
        const projectId = card.id || `project-${index}`;
        if (!card.id) card.id = projectId;
        
        if (!card.querySelector('.card-like-btn')) {
            const likeBtn = document.createElement('button');
            likeBtn.className = 'card-like-btn';
            likeBtn.setAttribute('aria-label', 'Like this project');
            likeBtn.setAttribute('aria-pressed', userLikes[projectId] ? 'true' : 'false');

            const heartIcon = document.createElement('i');
            heartIcon.setAttribute('aria-hidden', 'true');
            likeBtn.appendChild(heartIcon);
            
            const likeCountSpan = document.createElement('span');
            likeCountSpan.className = 'card-like-count';
            likeBtn.appendChild(likeCountSpan);
            
            card.appendChild(likeBtn);

            if (userLikes[projectId]) {
                likeBtn.classList.add('liked');
                heartIcon.className = 'fas fa-heart';
            } else {
                likeBtn.classList.remove('liked');
                heartIcon.className = 'far fa-heart';
            }
            
            db.ref(`likes/${projectId}`).once('value').then(snapshot => {
                likeCountSpan.textContent = snapshot.val() || '0';
            });
            
            likeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const isNowLiked = !this.classList.contains('liked');
                this.classList.toggle('liked', isNowLiked);
                this.setAttribute('aria-pressed', isNowLiked ? 'true' : 'false');
                heartIcon.className = isNowLiked ? 'fas fa-heart' : 'far fa-heart';
                heartIcon.setAttribute('aria-hidden', 'true');
                
                if (isNowLiked) {
                    userLikes[projectId] = true;
                } else {
                    delete userLikes[projectId];
                }
                localStorage.setItem('projectLikes', JSON.stringify(userLikes));
                
                const likesRef = db.ref(`likes/${projectId}`);
                likesRef.transaction(currentLikes => {
                    return isNowLiked ? (currentLikes || 0) + 1 : Math.max(0, (currentLikes || 0) - 1);
                });
            });
            
            db.ref(`likes/${projectId}`).on('value', snapshot => {
                const count = snapshot.val() || 0;
                likeCountSpan.textContent = count;

                if (modal && modal.classList.contains('active') && modalLikeBtn.dataset.projectId === projectId) {
                    modalLikeCount.textContent = count;
                    modalLikeBtn.classList.toggle('liked', likeBtn.classList.contains('liked'));
                    modalLikeIcon.className = likeBtn.classList.contains('liked') ? 'fas fa-heart' : 'far fa-heart';
                }
            });
        }
    });
}

// Parallax tilt — rAF-driven with lerp smoothing.
// Raw mousemove values snap the card around; instead we ease the current
// rotation toward a target every frame, giving the weighted, fluid feel of
// professional card interactions. Skipped for touch devices (no hover) and
// users who prefer reduced motion.
function initParallaxEffect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    const MAX_TILT = 4;       // degrees
    const HOVER_SCALE = 1.02; // subtle lift while hovered
    const EASE = 0.12;        // lerp factor per frame (lower = heavier feel)

    document.querySelectorAll('.project-card').forEach(card => {
        const current = { rx: 0, ry: 0, s: 1 };
        const target = { rx: 0, ry: 0, s: 1 };
        let rafId = null;

        const render = () => {
            current.rx += (target.rx - current.rx) * EASE;
            current.ry += (target.ry - current.ry) * EASE;
            current.s += (target.s - current.s) * EASE;

            const atRest = target.s === 1 &&
                Math.abs(current.rx) < 0.02 &&
                Math.abs(current.ry) < 0.02 &&
                Math.abs(current.s - 1) < 0.002;

            if (atRest) {
                // Fully settled: clear inline styles so CSS owns the card again
                card.style.transform = '';
                card.style.willChange = '';
                rafId = null;
                return;
            }

            card.style.transform =
                `perspective(900px) rotateX(${current.rx.toFixed(2)}deg) rotateY(${current.ry.toFixed(2)}deg) scale3d(${current.s.toFixed(3)}, ${current.s.toFixed(3)}, 1)`;
            rafId = requestAnimationFrame(render);
        };

        const wake = () => { if (rafId === null) rafId = requestAnimationFrame(render); };

        card.addEventListener('pointerenter', () => {
            card.style.willChange = 'transform';
            target.s = HOVER_SCALE;
            wake();
        });

        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 .. 0.5
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            target.rx = -py * MAX_TILT * 2;
            target.ry = px * MAX_TILT * 2;
            wake();
        });

        card.addEventListener('pointerleave', () => {
            target.rx = 0;
            target.ry = 0;
            target.s = 1;
            wake(); // eases back to rest, then releases the inline transform
        });
    });
}