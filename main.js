document.addEventListener("DOMContentLoaded", () => {
    // Check if GSAP is loaded
    if (typeof gsap !== 'undefined') {
        // Register GSAP plugins (optional but good practice)
        // Note: Only register if you have actual plugins. Empty registerPlugin() call removed.
        
        // Create a timeline for sequencing
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Animate the Title
        tl.from(".mep-hero__title", {
            y: 50,          // Move from 50px down
            opacity: 0,     // Start invisible
            duration: 1,    // Animation length
            delay: 0.2      // Slight wait after page load
        })
        
        // 2. Animate the Description (starts 0.4s before title ends)
        .from(".mep-hero__description", {
            y: 30,
            opacity: 0,
            duration: 0.8
        }, "-=0.4") // Start 0.4 seconds before the previous animation ends

        // 3. Animate the Button (Pop effect - starts 0.2s before description ends)
        .from(".mep-hero__btn", {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.7)" // Adds a slight bounce effect
        }, "-=0.2"); // Start 0.2 seconds before the previous animation ends
    } else {
        console.error("GSAP is not loaded. Please include GSAP library.");
    }
});

// ===========
/* --- About Us Animations --- */

// Animate Main Title
if (typeof gsap !== 'undefined') {
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
        x: -50,          // Start 50px to the left
        opacity: 0,      // Fade in
        duration: 1,
        ease: "power3.out"
    });

    // Animate Text Content (Slide in from Right)
    gsap.from(".about-text-box", {
        scrollTrigger: {
            trigger: "#about-us",
            start: "top 70%",
        },
        x: 50,           // Start 50px to the right
        opacity: 0,
        duration: 1,
        delay: 0.2,      // Slight delay so it follows the image
        ease: "power3.out"
    });
}

//====================================================================================
document.addEventListener("DOMContentLoaded", function () {
    /**
     * Services Carousel (Improved Version)
     */
    
    // Find all the carousel elements
    const carouselTrack = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const prevBtn = document.querySelector('.carousel-btn.prev');

    // Check if we are on a page with the services carousel
    if (carouselTrack && dotsContainer) {
        
        // NEW: Function to load data and build the carousel
        async function loadServiceCarousel() {
            try {
                const response = await fetch('Home-services-data.json');
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
                        <h4>${service.title}</h4>
                        <p>${service.homePageDescription}</p>
                        <a href="services.html#${service.id}" class="btn-small">Read More</a>
                        </div>
                    `;
                    carouselTrack.appendChild(card);
                });

                // --- All the original carousel logic starts here ---
                const originalCards = Array.from(carouselTrack.children);
                const totalOriginalCards = originalCards.length;
                let currentIndex = 0;
                let autoPlayInterval;

                // Clone cards for infinite loop
                originalCards.forEach(card => {
                    const clone = card.cloneNode(true);
                    carouselTrack.appendChild(clone);
                });

                // Clear and create dots
                dotsContainer.innerHTML = '';
                for (let i = 0; i < totalOriginalCards; i++) {
                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    dot.dataset.index = i;
                    dotsContainer.appendChild(dot);
                }
                const carouselDots = dotsContainer.querySelectorAll('.dot');

                const updateCarousel = (animate = true) => {
                    // Check if there are cards
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
                    }, 50); // Small delay to ensure transition applies
                };

                const startAutoplay = () => {
                    stopAutoplay(); // Clear existing interval
                    autoPlayInterval = setInterval(handleNext, 3000);
                };

                const stopAutoplay = () => {
                    clearInterval(autoPlayInterval);
                };

                // Event Listeners
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        handleNext();
                        startAutoplay(); // Reset autoplay timer on manual navigation
                    });
                }

                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        handlePrev();
                        startAutoplay(); // Reset autoplay timer
                    });
                }

                carouselTrack.addEventListener('mouseenter', stopAutoplay);
                carouselTrack.addEventListener('mouseleave', startAutoplay);

                dotsContainer.addEventListener('click', e => {
                    if (e.target.classList.contains('dot')) {
                        currentIndex = parseInt(e.target.dataset.index);
                        updateCarousel();
                        startAutoplay(); // Reset autoplay timer
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
                    const threshold = 50; // Minimum swipe distance
                    if (touchEndX < touchStartX - threshold) {
                        handleNext(); // Swipe left
                    } else if (touchEndX > touchStartX + threshold) {
                        handlePrev(); // Swipe right
                    }
                }

                // Initialize
                updateCarousel(false);
                startAutoplay();

                window.addEventListener('resize', () => updateCarousel(false));

            } catch (error) {
                console.error('Failed to load services carousel:', error);
                carouselTrack.innerHTML = '<p style="text-align: center; color: red;">Error loading services.</p>';
            }
        }

        // Call the new function to start everything
        loadServiceCarousel();
    }
});

// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP is available
    if (typeof gsap !== 'undefined') {
        // GSAP animation for the section title
        gsap.from(".section-title-unique", {
            opacity: 0,
            y: -50,
            duration: 1,
            ease: "power3.out"
        });

        // GSAP animation for testimonial cards on load
        gsap.from(".testimonial-card-unique", {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.2, // Stagger the animation for each card
            delay: 0.5 // Delay the start of card animations slightly
        });

        // Example of a hover effect using GSAP
        document.querySelectorAll('.testimonial-card-unique').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { scale: 1.02, duration: 0.2, ease: "power1.out" });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { scale: 1, duration: 0.2, ease: "power1.out" });
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Animate service boxes when they come into view
    const serviceBoxes = document.querySelectorAll('.service-box');
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 &&
            rect.bottom >= 0
        );
    }
    
    // Function to handle scroll events
    function checkBoxes() {
        serviceBoxes.forEach(box => {
            if (isInViewport(box)) {
                box.classList.add('animate-in');
            }
        });
    }
    
    // Initial check in case boxes are already in view
    checkBoxes();
    
    // Check on scroll
    window.addEventListener('scroll', checkBoxes);
    
    // For browsers that don't support Intersection Observer
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        serviceBoxes.forEach(box => {
            observer.observe(box);
        });
    }
});

// script.js

// This file is ready for any future JavaScript-based interactivity.
// For example, you could add event listeners to the logos.

document.addEventListener('DOMContentLoaded', () => {
    const logos = document.querySelectorAll('.slide img');

    logos.forEach(logo => {
        logo.addEventListener('click', () => {
            // Example: Get the alt text of the clicked logo
            const clientName = logo.alt.replace(' Logo', '');
            console.log(`You clicked on the ${clientName} logo.`);
            
            // You can replace the console.log with any action,
            // such as opening a new page or displaying a modal.
            // window.open('https://example.com/clients/' + clientName, '_blank');
        });
    });

    console.log("Trusted Clients section is interactive.");
});

// Wait for the document content to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Select the paragraph element containing the quote
    const quoteTextElement = document.querySelector('.quote-text');

    // If the element doesn't exist on the page, stop the script
    if (!quoteTextElement) {
        return;
    }

    // --- 1. Prepare the text for animation ---
    // This splits the quote into individual character `<span>` elements,
    // but keeps them hidden initially by not adding the 'visible' class.
    const text = quoteTextElement.textContent;
    quoteTextElement.textContent = ''; // Clear original text
    
    text.split('').forEach(char => {
        const span = document.createElement('span');
        // Use a non-breaking space for space characters to ensure they take up space
        span.textContent = char === ' ' ? '\u00A0' : char;
        quoteTextElement.appendChild(span);
    });

    // --- 2. Create the function that runs the animation ---
    const startAnimation = () => {
        const charSpans = quoteTextElement.querySelectorAll('span');
        charSpans.forEach((span, index) => {
            // Set a timeout to add the 'visible' class sequentially, creating the effect
            setTimeout(() => {
                span.classList.add('visible');
            }, index * 50); // 50ms delay between each character
        });
    };
    
    // --- 3. Set up the Intersection Observer ---
    // This will watch the quote element and trigger a function when it enters the viewport.
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if the element is intersecting (i.e., visible on screen)
            if (entry.isIntersecting) {
                startAnimation(); // If it is, run our animation
                observer.unobserve(entry.target); // Then, stop observing to ensure it only runs once
            }
        });
    }, {
        // Options for the observer
        root: null, // null means it observes in relation to the main browser viewport
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    // --- 4. Start observing the quote element ---
    observer.observe(quoteTextElement);
});