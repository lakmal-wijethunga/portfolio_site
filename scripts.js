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

    // Video Pause and Sound Control
    projectCards.forEach(card => {
        const video = card.querySelector('video');
        if (video) {
            // Initialize video
            video.muted = true;
            video.autoplay = true;
            video.play().catch(e => console.log("Auto-play prevented:", e));
            
            // Add sound control button
            const soundButton = document.createElement('button');
            soundButton.className = 'video-sound-btn';
            soundButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            card.appendChild(soundButton);
            
            // Handle mouse events
            card.addEventListener('mouseenter', () => video.pause());
            card.addEventListener('mouseleave', () => video.play().catch(e => {}));
            
            // Sound toggle
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

    // Slideshow functionality
    const slideshowContainers = document.querySelectorAll('.slideshow-container');
    slideshowContainers.forEach(container => {
        const slides = container.querySelectorAll('.slide');
        if (slides.length > 0) {
            slides[0].classList.add('active');
            slides[0].classList.add('zoom-effect');
            
            let slideIndex = 0;
            setInterval(() => {
                slides[slideIndex].classList.remove('active', 'zoom-effect');
                slideIndex = (slideIndex + 1) % slides.length;
                slides[slideIndex].classList.add('active', 'zoom-effect');
            }, 2000);
        }
    });

    // Skills animation
    const skillSection = document.querySelector('.about');
    const skillTags = document.querySelectorAll('.skill-tag');
    
    if (skillTags.length > 0) {
        skillTags.forEach(tag => {
            tag.style.opacity = "0";
            tag.style.transform = "translateY(10px)";
        });
        
        function isInViewport(element) {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        }
        
        function animateSkills() {
            if (isInViewport(skillSection)) {
                skillTags.forEach((tag, index) => {
                    setTimeout(() => {
                        tag.style.opacity = "1";
                        tag.style.transform = "translateY(0)";
                    }, 100 * index);
                });
                window.removeEventListener('scroll', animateSkills);
            }
        }
        
        animateSkills();
        window.addEventListener('scroll', animateSkills);
        
        // Mouse interaction for skills
        const skillsContainer = document.querySelector('.skills');
        if (skillsContainer) {
            let mouseX = 0, mouseY = 0;
            let rafID = null;
            
            function updateSkillTags() {
                const { left, top } = skillsContainer.getBoundingClientRect();
                
                skillTags.forEach(tag => {
                    const tagRect = tag.getBoundingClientRect();
                    const tagCenterX = tagRect.left + tagRect.width/2 - left;
                    const tagCenterY = tagRect.top + tagRect.height/2 - top;
                    
                    const distX = mouseX - tagCenterX;
                    const distY = mouseY - tagCenterY;
                    const distance = Math.sqrt(distX * distX + distY * distY);
                    
                    const maxDist = 150;
                    const strength = Math.max(0, 1 - distance / maxDist);
                    
                    // Apply effect
                    const tiltX = distY * strength * 0.08;
                    const tiltY = -distX * strength * 0.08;
                    const lift = strength * 2;
                    
                    tag.style.transform = `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${lift}px)`;
                    tag.style.boxShadow = `0 ${2 + lift}px ${5 + lift * 2}px rgba(0, 0, 0, ${0.05 + strength * 0.05})`;
                });
                
                rafID = null;
            }
            
            skillsContainer.addEventListener('mousemove', function(e) {
                const { left, top } = this.getBoundingClientRect();
                mouseX = e.clientX - left;
                mouseY = e.clientY - top;
                
                if (!rafID) {
                    rafID = requestAnimationFrame(updateSkillTags);
                }
            });
            
            skillsContainer.addEventListener('mouseleave', function() {
                skillTags.forEach(tag => {
                    tag.style.transition = 'transform 0.6s ease, box-shadow 0.6s ease';
                    tag.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) translateZ(0)';
                    tag.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
                    
                    setTimeout(() => {
                        tag.style.transition = '';
                    }, 600);
                });
            });
        }
    }

    // Initialize like system
    initLikeSystem();
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
    // Get stored likes from localStorage (for this user only)
    let userLikes = JSON.parse(localStorage.getItem('projectLikes')) || {};
    
    // Add like buttons to all project cards
    document.querySelectorAll('.project-card').forEach((card, index) => {
        // Create unique ID for project if not exists
        const projectId = card.id || `project-${index}`;
        if (!card.id) card.id = projectId;
        
        // Get project title for tracking
        const projectTitle = card.querySelector('.project-overlay h3')?.textContent || projectId;
        
        // Add visible like button directly on the card (outside overlay)
        if (!card.querySelector('.card-like-btn')) {
            const likeBtn = document.createElement('button');
            likeBtn.className = 'card-like-btn';
            if (userLikes[projectId]) likeBtn.classList.add('liked');
            
            // Heart icon
            const heartIcon = document.createElement('i');
            heartIcon.className = userLikes[projectId] ? 'fas fa-heart' : 'far fa-heart';
            likeBtn.appendChild(heartIcon);
            
            // Like count
            const likeCount = document.createElement('span');
            likeCount.className = 'card-like-count';
            likeCount.textContent = '...';
            likeBtn.appendChild(likeCount);
            
            // Add button to card
            card.appendChild(likeBtn);
            
            // Get current like count from Firebase
            db.ref(`likes/${projectId}`).once('value').then(snapshot => {
                const totalLikes = snapshot.val() || 0;
                likeCount.textContent = totalLikes > 0 ? totalLikes : '0';
            }).catch(error => {
                console.error("Error getting likes:", error);
                likeCount.textContent = '0';
            });
            
            // Add click event listener for liking/unliking
            likeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Toggle like status
                const isLiked = likeBtn.classList.contains('liked');
                
                // Update UI first for responsive feel
                if (isLiked) {
                    // Unlike
                    likeBtn.classList.remove('liked');
                    heartIcon.className = 'far fa-heart';
                } else {
                    // Like
                    likeBtn.classList.add('liked');
                    heartIcon.className = 'fas fa-heart';
                }
                
                // Update localStorage
                if (isLiked) {
                    delete userLikes[projectId];
                } else {
                    userLikes[projectId] = true;
                }
                localStorage.setItem('projectLikes', JSON.stringify(userLikes));
                
                // Update Firebase
                const likesRef = db.ref(`likes/${projectId}`);
                likesRef.transaction(currentLikes => {
                    return isLiked ? Math.max(0, (currentLikes || 0) - 1) : (currentLikes || 0) + 1;
                }).then(result => {
                    const newCount = result.snapshot.val() || 0;
                    likeCount.textContent = newCount > 0 ? newCount : '0';
                });
            });
            
            // Listen for real-time updates from Firebase
            db.ref(`likes/${projectId}`).on('value', snapshot => {
                const count = snapshot.val() || 0;
                likeCount.textContent = count > 0 ? count : '0';
            });
        }
    });
    
    const mainLikeBtn = document.querySelector('.contact-content > .like-container > .like-btn');
    if (mainLikeBtn) {
        const mainLikeId = 'site-overall';
        
        if (userLikes[mainLikeId]) {
            mainLikeBtn.classList.add('liked');
            mainLikeBtn.querySelector('i').className = 'fas fa-heart';
        }
        
        db.ref(`likes/${mainLikeId}`).once('value').then(snapshot => {
            const totalLikes = snapshot.val() || 0;
            mainLikeBtn.querySelector('.like-count').textContent = totalLikes;
        }).catch(error => {
            console.error("Error getting main likes:", error);
        });
        
        mainLikeBtn.addEventListener('click', function() {
            const isLiked = mainLikeBtn.classList.contains('liked');
            
            if (isLiked) {
                mainLikeBtn.classList.remove('liked');
                mainLikeBtn.querySelector('i').className = 'far fa-heart';
            } else {
                mainLikeBtn.classList.add('liked');
                mainLikeBtn.querySelector('i').className = 'fas fa-heart';
            }
            
            if (isLiked) {
                delete userLikes[mainLikeId];
            } else {
                userLikes[mainLikeId] = true;
            }
            localStorage.setItem('projectLikes', JSON.stringify(userLikes));
            
            const likesRef = db.ref(`likes/${mainLikeId}`);
            likesRef.transaction(currentLikes => {
                return isLiked ? Math.max(0, (currentLikes || 0) - 1) : (currentLikes || 0) + 1;
            }).then(result => {
                mainLikeBtn.querySelector('.like-count').textContent = result.snapshot.val() || 0;
                
                const heart = mainLikeBtn.querySelector('i');
                heart.style.animation = 'none';
                setTimeout(() => {
                    heart.style.animation = '';
                }, 10);
            }).catch(error => {
                console.error("Error updating main likes:", error);
            });
        });
        
        db.ref(`likes/${mainLikeId}`).on('value', snapshot => {
            const count = snapshot.val() || 0;
            mainLikeBtn.querySelector('.like-count').textContent = count;
        });
    }

    // Remove like containers from project overlays
    document.querySelectorAll('.project-overlay .like-container').forEach(container => {
        container.remove();
    });
}