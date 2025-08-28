// Make sure DOM is fully loaded before running code
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');
    
    if (hamburger && navbar) {
        hamburger.addEventListener('click', function() {
            navbar.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a menu item
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('active');
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

    // Video Sound Control (hover pause removed)
    projectCards.forEach(card => {
        const video = card.querySelector('video');
        if (video) {
            video.muted = true;
            video.autoplay = true;
            video.play().catch(e => console.log("Auto-play prevented:", e));
            
            const soundButton = document.createElement('button');
            soundButton.className = 'video-sound-btn';
            soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            card.appendChild(soundButton);
            
            soundButton.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                soundButton.innerHTML = video.muted ? 
                    '<i class="fas fa-volume-mute"></i>' : 
                    '<i class="fas fa-volume-up"></i>';
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
    
    // Sticky Header
    window.addEventListener('scroll', () => {
        document.querySelector('header').classList.toggle('sticky', window.scrollY > 0);
    });

    // Slideshow functionality (for main grid)
    const slideshowContainers = document.querySelectorAll('.project-card .slideshow-container');
    slideshowContainers.forEach(container => {
        const slides = container.querySelectorAll('.slide');
        if (slides.length > 0) {
            slides[0].classList.add('active');
            slides[0].classList.add('zoom-effect');
            
            let slideIndex = 0;
            setInterval(() => {
                if (container.closest('.project-card:hover')) return;
                slides[slideIndex].classList.remove('active', 'zoom-effect');
                slideIndex = (slideIndex + 1) % slides.length;
                slides[slideIndex].classList.add('active', 'zoom-effect');
            }, 2000);
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
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Initialize Parallax Hover Effect
    initParallaxEffect();
});

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
            
            const heartIcon = document.createElement('i');
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
                heartIcon.className = isNowLiked ? 'fas fa-heart' : 'far fa-heart';
                
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

// Refined Parallax Effect Function
function initParallaxEffect() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        const maxTilt = 5; // Max tilt in degrees

        card.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            
            const x = e.clientX - left;
            const y = e.clientY - top;
            const centerX = width / 2;
            const centerY = height / 2;
            
            const deltaX = x - centerX;
            const deltaY = y - centerY;
            
            const rotateX = (deltaY / centerY) * -maxTilt;
            const rotateY = (deltaX / centerX) * maxTilt;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}