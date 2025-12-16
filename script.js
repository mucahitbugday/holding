// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

// Ensure menu is closed on page load
document.addEventListener('DOMContentLoaded', () => {
    if (navMenu) {
        navMenu.classList.remove('active');
    }
    if (mobileMenuToggle) {
        mobileMenuToggle.classList.remove('active');
    }
    body.classList.remove('menu-open');
});

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = navMenu.classList.contains('active');
        
        if (isActive) {
            // Close menu
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            body.classList.remove('menu-open');
        } else {
            // Open menu
            navMenu.classList.add('active');
            mobileMenuToggle.classList.add('active');
            body.classList.add('menu-open');
        }
    });
}

// Close mobile menu when clicking outside or on a link
document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
            body.classList.remove('menu-open');
        }
    }
});

// Mobile submenu toggle - Use capture phase to handle before smooth scroll
if (navMenu) {
    navMenu.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        // Only handle in mobile view
        if (window.innerWidth > 968) return;
        
        // Check if this is a submenu link (inside .submenu)
        const isSubmenuLink = link.closest('.submenu') !== null;
        const listItem = link.parentElement;
        const hasSubmenu = listItem.classList.contains('has-submenu');
        
        // If it's a submenu link (alt menü), close menu and navigate
        if (isSubmenuLink) {
            // Close menu when submenu link is clicked
            // Don't prevent default, let smooth scroll handle navigation
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
            body.classList.remove('menu-open');
            return; // Allow default navigation and smooth scroll
        }
        
        // If it's a main menu item with submenu, toggle submenu (don't close main menu)
        if (hasSubmenu) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close other submenus
            document.querySelectorAll('.nav-menu > li.has-submenu').forEach(item => {
                if (item !== listItem) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle current submenu
            listItem.classList.toggle('active');
        } else if (!hasSubmenu) {
            // If it's a regular main menu link (no submenu), close menu and navigate
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
            body.classList.remove('menu-open');
        }
    }, true); // Use capture phase
}

// Close menu on window resize if it becomes desktop view
window.addEventListener('resize', () => {
    if (window.innerWidth > 968) {
        navMenu.classList.remove('active');
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
        }
        body.classList.remove('menu-open');
    }
});

// Hero Slider - Load images dynamically
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    slides.forEach(slide => {
        const bgImage = slide.getAttribute('data-bg');
        if (bgImage) {
            const img = new Image();
            img.onload = () => {
                slide.style.backgroundImage = `url('${bgImage}')`;
                // Remove no-image attribute to hide gradient
                slide.removeAttribute('data-no-image');
            };
            img.onerror = () => {
                // If image doesn't exist, use gradient fallback
                slide.style.backgroundImage = '';
                slide.setAttribute('data-no-image', 'true');
            };
            img.src = bgImage;
        } else {
            // No image specified, show gradient
            slide.setAttribute('data-no-image', 'true');
        }
    });
});

// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;

function showSlide(index) {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Auto-play slider
setInterval(nextSlide, 5000);

// Navigation buttons
const heroNext = document.getElementById('heroNext');
const heroPrev = document.getElementById('heroPrev');

if (heroNext) {
    heroNext.addEventListener('click', nextSlide);
}

if (heroPrev) {
    heroPrev.addEventListener('click', prevSlide);
}

// Dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});

// Smooth scrolling for anchor links with full screen snap
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            // Check if this is a main menu link with submenu (don't close menu for these)
            const listItem = this.parentElement;
            const hasSubmenu = listItem.classList.contains('has-submenu');
            const isSubmenuLink = this.closest('.submenu') !== null;
            
            // If it's a main menu item with submenu, don't handle scroll here (let submenu toggle handle it)
            if (hasSubmenu && !isSubmenuLink && window.innerWidth <= 968) {
                return; // Let the submenu toggle handler deal with it
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Scroll to section with snap
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu only if it's a submenu link or regular link (not main menu with submenu)
                if (isSubmenuLink || (!hasSubmenu && window.innerWidth <= 968)) {
                    navMenu.classList.remove('active');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.classList.remove('active');
                    }
                    body.classList.remove('menu-open');
                }
            }
        }
    });
});

// Keyboard navigation for full-screen sections
let isScrolling = false;
window.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    
    const sections = document.querySelectorAll('section');
    const currentScroll = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    if (e.deltaY > 0) {
        // Scrolling down
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (currentScroll >= sectionTop - 100 && currentScroll < sectionBottom - 100) {
                isScrolling = true;
                if (sections[index + 1]) {
                    sections[index + 1].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    setTimeout(() => { isScrolling = false; }, 1000);
                }
            }
        });
    } else {
        // Scrolling up
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (currentScroll > sectionTop && currentScroll <= sectionBottom) {
                isScrolling = true;
                if (sections[index - 1]) {
                    sections[index - 1].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    setTimeout(() => { isScrolling = false; }, 1000);
                }
            }
        });
    }
}, { passive: true });

// Newsletter Form
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        // Here you would typically send the email to your backend
        alert(`E-bülten kaydınız alındı! Teşekkürler: ${email}`);
        newsletterForm.reset();
    });
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.about-card, .service-card, .news-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(el);
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

