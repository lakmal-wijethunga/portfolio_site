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

    // Video Pause on Hover
    projectCards.forEach(card => {
        const video = card.querySelector('video');
        if (video) {
            video.autoplay = true;
            video.play();
            
            card.addEventListener('mouseenter', () => {
                video.pause();
            });
            card.addEventListener('mouseleave', () => {
                video.play();
            });
        }
    });

    // Video sound control
    projectCards.forEach(card => {
        const video = card.querySelector('video');
        if (video) {
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
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
            navbar.classList.remove('active');
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
                slides[slideIndex].classList.remove('active');
                slides[slideIndex].classList.remove('zoom-effect');
                slideIndex = (slideIndex + 1) % slides.length;
                slides[slideIndex].classList.add('active');
                slides[slideIndex].classList.add('zoom-effect');
            }, 2000);
        }
    });

    // Skills animation
    const skillSection = document.querySelector('.about');
    const skillTags = document.querySelectorAll('.skill-tag');
    
    skillTags.forEach(tag => {
        tag.style.opacity = "0";
        tag.style.transform = "translateY(10px)";
    });
    
    function isInViewport(element) {
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
                
                // More subtle effect values
                const tiltX = distY * strength * 0.08;
                const tiltY = -distX * strength * 0.08;
                const lift = strength * 2;
                
                // Apply with better performance
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
                tag.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
                tag.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
                
                // Remove the transition after it completes
                setTimeout(() => {
                    tag.style.transition = '';
                }, 600);
            });
        });
    }
});

// Function to change slides
function changeSlide(n, el, e) {
    e = e || window.event;
    
    const container = el.closest('.slideshow-container');
    const slides = container.querySelectorAll('.slide');
    
    let currentIndex = 0;
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            currentIndex = index;
            slide.classList.remove('active');
            slide.classList.remove('zoom-effect');
        }
    });
    
    let newIndex = currentIndex + n;
    if (newIndex >= slides.length) {newIndex = 0}
    if (newIndex < 0) {newIndex = slides.length - 1}
    
    slides[newIndex].classList.add('active');
    slides[newIndex].classList.add('zoom-effect');
    
    if (e) e.stopPropagation();
}