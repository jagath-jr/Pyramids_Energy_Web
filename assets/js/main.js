/**
 * Main JavaScript File for Home Page
 * Contains all animations and carousel functionality
 */

document.addEventListener("DOMContentLoaded", () => {
    // ============================================
    // Hero Section Animations
    // ============================================
    if (typeof gsap !== 'undefined') {
        // Hero Section Timeline Animation
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Animate the Title
        tl.from(".mep-hero__title", {
            y: 50,
            opacity: 0,
            duration: 1,
            delay: 0.2
        })
        // 2. Animate the Description
        .from(".mep-hero__description", {
            y: 30,
            opacity: 0,
            duration: 0.8
        }, "-=0.4")
        // 3. Animate the Button
        .from(".mep-hero__btn", {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.7)"
        }, "-=0.2");
// ============================================
// Why Choose Us Section Animations
// ============================================
    // Animate Why Choose Us section
    gsap.from(".wcu-main-title", {
        scrollTrigger: {
            trigger: "#why-choose-us",
            start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
    });
    // Animate each card with stagger
    gsap.from(".wcu-card", {
        scrollTrigger: {
            trigger: "#why-choose-us",
            start: "top 70%",
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2, // Cards appear one after another
        delay: 0.3,
        ease: "power3.out"
    });

// ============================================
// About Us Section Animations
// ============================================
// Animate Main Title
        gsap.from(".about-main-title", {
            scrollTrigger: {
                trigger: "#about-us",
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });

        // Animate Image (Slide in from Left)
        gsap.from(".about-image-box", {
            scrollTrigger: {
                trigger: "#about-us",
                start: "top 70%",
            },
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        // Animate Text Content (Slide in from Right)
        gsap.from(".about-text-box", {
            scrollTrigger: {
                trigger: "#about-us",
                start: "top 70%",
            },
            x: 50,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            ease: "power3.out"
        });

        // ============================================
        // Contact Section Animations
        // ============================================
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            // 1. Header Animation
            gsap.from(".contact-section__main-title", {
                scrollTrigger: {
                    trigger: ".contact-section",
                    start: "top 85%",
                },
                y: -30,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });

            // 2. Map Animation
            gsap.from(".contact-section__map-frame", {
                scrollTrigger: {
                    trigger: ".contact-section",
                    start: "top 75%",
                },
                opacity: 0,
                y: 30,
                duration: 1,
                ease: "power2.out"
            });

            // 3. Form Card Animation
            gsap.from(".contact-section__card", {
                scrollTrigger: {
                    trigger: ".contact-section__form-column",
                    start: "top 80%",
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            });

            // 4. Input Fields Animation
            gsap.from(".contact-section__input-group, .contact-section__btn", {
                scrollTrigger: {
                    trigger: ".contact-section__form",
                    start: "top 90%",
                },
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.2,
                clearProps: "all"
            });
        }

    } else {
        console.warn("GSAP not loaded. Animations skipped.");
    }

    // ============================================
    // Services Carousel
    // ============================================
    initializeServicesCarousel();

    // ============================================
    // Additional Animations (if any elements exist)
    // ============================================
    initializeAdditionalAnimations();
});

/**
 * Services Carousel Initialization
 */
async function initializeServicesCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const prevBtn = document.querySelector('.carousel-btn.prev');

    if (!carouselTrack || !dotsContainer) return;

    try {
        const response = await fetch('data/services.json');
        if (!response.ok) throw new Error('Failed to fetch services data');
        const servicesData = await response.json();

        // Clear existing content
        carouselTrack.innerHTML = '';

        // Populate service cards from the fetched data
        servicesData.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <div class="image" style="background-image: url('${service.homePageImage}');"></div>
                <div class="content">
                    <h4>${service.mainService}</h4>
                    <p>${service.mainDescription}</p>
                    <a href="services.html#${service.id}" class="btn-small">Read More</a>
                </div>
            `;
            carouselTrack.appendChild(card);
        });

        // Initialize carousel functionality
        setupCarouselFunctionality(carouselTrack, dotsContainer, nextBtn, prevBtn, servicesData.length);

    } catch (error) {
        console.error('Failed to load services carousel:', error);
        carouselTrack.innerHTML = '<p style="text-align: center; color: red;">Error loading services.</p>';
    }
}

/**
 * Setup Carousel Functionality
 */
function setupCarouselFunctionality(carouselTrack, dotsContainer, nextBtn, prevBtn, totalOriginalCards) {
    const originalCards = Array.from(carouselTrack.children);
    
    // Clone cards for infinite loop
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        carouselTrack.appendChild(clone);
    });

    // Create dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalOriginalCards; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    }
    const carouselDots = dotsContainer.querySelectorAll('.dot');

    let currentIndex = 0;
    let autoPlayInterval;

    const updateCarousel = (animate = true) => {
        if (!carouselTrack.querySelector('.service-card')) return;

        const cardWidth = carouselTrack.querySelector('.service-card').offsetWidth;
        const cardMargin = parseInt(window.getComputedStyle(carouselTrack.querySelector('.service-card')).marginRight) +
            parseInt(window.getComputedStyle(carouselTrack.querySelector('.service-card')).marginLeft);
        const totalWidth = cardWidth + cardMargin;

        carouselTrack.style.transition = animate ? 'transform 0.7s ease-in-out' : 'none';
        carouselTrack.style.transform = `translateX(-${currentIndex * totalWidth}px)`;

        // Update active dot
        carouselDots.forEach(d => d.classList.remove('active'));
        if (carouselDots[currentIndex % totalOriginalCards]) {
            carouselDots[currentIndex % totalOriginalCards].classList.add('active');
        }
    };

    const handleNext = () => {
        currentIndex++;
        updateCarousel();

        if (currentIndex >= totalOriginalCards) {
            setTimeout(() => {
                carouselTrack.style.transition = 'none';
                currentIndex = 0;
                updateCarousel(false);
            }, 700);
        }
    };

    const handlePrev = () => {
        if (currentIndex === 0) {
            carouselTrack.style.transition = 'none';
            currentIndex = totalOriginalCards;
            updateCarousel(false);
        }
        setTimeout(() => {
            currentIndex--;
            updateCarousel(true);
        }, 50);
    };

    const startAutoplay = () => {
        stopAutoplay();
        autoPlayInterval = setInterval(handleNext, 3000);
    };

    const stopAutoplay = () => {
        clearInterval(autoPlayInterval);
    };

    // Event Listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            handleNext();
            startAutoplay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            handlePrev();
            startAutoplay();
        });
    }

    carouselTrack.addEventListener('mouseenter', stopAutoplay);
    carouselTrack.addEventListener('mouseleave', startAutoplay);

    dotsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('dot')) {
            currentIndex = parseInt(e.target.dataset.index);
            updateCarousel();
            startAutoplay();
        }
    });

    // Touch events for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            handleNext();
        } else if (touchEndX > touchStartX + threshold) {
            handlePrev();
        }
    }

    // Initialize
    updateCarousel(false);
    startAutoplay();

    window.addEventListener('resize', () => updateCarousel(false));
}

/**
 * Initialize Additional Animations
 */
function initializeAdditionalAnimations() {
    // Quote text animation
    const quoteTextElement = document.querySelector('.quote-text');
    if (quoteTextElement) {
        const text = quoteTextElement.textContent;
        quoteTextElement.textContent = '';

        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            quoteTextElement.appendChild(span);
        });

        const startAnimation = () => {
            const charSpans = quoteTextElement.querySelectorAll('span');
            charSpans.forEach((span, index) => {
                setTimeout(() => {
                    span.classList.add('visible');
                }, index * 50);
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAnimation();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(quoteTextElement);
    }

    // Service boxes animation
    const serviceBoxes = document.querySelectorAll('.service-box');
    if (serviceBoxes.length > 0) {
        function checkBoxes() {
            serviceBoxes.forEach(box => {
                const rect = box.getBoundingClientRect();
                const isInViewport = rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 &&
                    rect.bottom >= 0;
                
                if (isInViewport) {
                    box.classList.add('animate-in');
                }
            });
        }

        checkBoxes();
        window.addEventListener('scroll', checkBoxes);

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            serviceBoxes.forEach(box => {
                observer.observe(box);
            });
        }
    }

    // Logos interaction
    const logos = document.querySelectorAll('.slide img');
    logos.forEach(logo => {
        logo.addEventListener('click', () => {
            const clientName = logo.alt.replace(' Logo', '');
            console.log(`You clicked on the ${clientName} logo.`);
        });
    });
}