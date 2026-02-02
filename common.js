document.addEventListener("DOMContentLoaded", function () {
  
  // --- 1. LOAD THE HEADER ---
  fetch("header.html")
    .then((response) => response.text())
    .then((data) => {
      // Inject the fetched HTML
      document.getElementById("header-placeholder").innerHTML = data;

      // --- 2. ADD HEADER-RELATED FUNCTIONALITY ---
      
      const headerWrapper = document.getElementById("headerWrapper");

      // Mobile menu toggle functionality
      window.toggleMenu = function () {
        const menu = document.getElementById("navMenu");
        if (menu) {
          menu.classList.toggle("show");
        }
      };

      // Header scroll-hide functionality
      if (headerWrapper) {
        let lastScrollTop = 0;
        
        window.addEventListener("scroll", function () {
          // Look up the menu freshly inside the scroll event
          const activeMenu = document.getElementById("navMenu");
          
          let scrollTop = window.scrollY || document.documentElement.scrollTop;
          
          // SCROLL DOWN BEHAVIOR
          if (scrollTop > lastScrollTop) {
            
            // 1. Hide the Header Bar
            headerWrapper.classList.add("hide-header");

            // 2. FORCE CLOSE THE MOBILE MENU
            // If the menu exists and is currently open, close it.
            if (activeMenu && activeMenu.classList.contains("show")) {
              activeMenu.classList.remove("show");
            }

          } 
          // SCROLL UP BEHAVIOR
          else {
            // Show the Header Bar
            headerWrapper.classList.remove("hide-header");
            
            // Note: We usually do NOT re-open the menu automatically 
            // when scrolling up, as that is annoying for users.
          }
          
          // Prevent negative scrolling values (bounce effect on mobile)
          lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
        });
      }
    })
    .catch((error) => console.error("Error loading the header:", error));
});







// Wait for DOM and GSAP to be ready
document.addEventListener("DOMContentLoaded", () => {
    // Early return if GSAP isn't available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not available');
        return;
    }

    const footerContainer = document.getElementById('common-footer');
    if (!footerContainer) {
        console.warn('Footer container element not found');
        return;
    }

    // Load footer dynamically with path resolution
    const loadFooter = async () => {
        try {
            // Determine correct path based on current location
            const isServicesPage = window.location.pathname.includes('/services/');
            const footerPath = isServicesPage ? '../footer.html' : 'footer.html';
            
            console.log('Attempting to load footer from:', footerPath);
            
            const response = await fetch(footerPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            footerContainer.innerHTML = html;

        } catch (err) {
            console.error('Error loading footer, using fallback:', err);
            // Fallback content if fetch fails
            const isServicesPage = window.location.pathname.includes('/services/');
            const basePath = isServicesPage ? '../' : './';

            footerContainer.innerHTML = `
                <div class="footer-fallback" style="text-align: center; padding: 20px;">
                    <h4>QUICK LINKS</h4>
                    <p><a href="${basePath}index.html">Home</a> | <a href="${basePath}services/services.html">Services</a></p>
                    <h4>CONTACT US</h4>
                    <p>123 Tech Street, Thiruvananthapuram</p>
                    <p class="copyright">© ${new Date().getFullYear()} Duvitra. All rights reserved.</p>
                </div>
            `;
        } finally {
            // This runs after either try or catch, ensuring animations always initialize
            initializeFooterAnimations();
        }
    };

    // Initialize animations after footer content is in the DOM
    const initializeFooterAnimations = () => {
        const select = selector => document.querySelector(selector);
        
        const siteFooter = select('.site-footer');
        if (!siteFooter) {
            console.warn("'.site-footer' not found, skipping animations.");
            return;
        }

        const backgroundText = select('.footer-background-text');
        const footerColumns = gsap.utils.toArray('.footer-column');
        const footerLogo = select('.footer-logo');
        const socialIconsContainer = select('.social-icons');
        const socialIcons = gsap.utils.toArray('.social-icons a');

        // --- 1. Fade In Background Text ---
        if (backgroundText) {
            gsap.fromTo(backgroundText,
                { opacity: 0, y: 50 },
                {
                    opacity: 0.2, y: 0, duration: 2, ease: "power2.out",
                    scrollTrigger: {
                        trigger: siteFooter,
                        start: "top 80%",
                        scrub: 0.5, // Scrub is good for this background effect
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }

        // --- 2. Slide In Footer Columns (FIXED) ---
        footerColumns.forEach((column, index) => {
            const direction = index % 2 === 0 ? -50 : 50;
            gsap.fromTo(column,
                { x: direction, opacity: 0 },
                {
                    x: 0, opacity: 1, duration: 0.8, ease: "power2.out",
                    scrollTrigger: {
                        trigger: column,
                        start: "top 90%",
                        toggleActions: "play none none none" // No scrub!
                    }
                }
            );
        });

        // --- 3. Scale Up Footer Logo ---
        if (footerLogo) {
            gsap.fromTo(footerLogo,
                { scale: 0.5, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 1.6, ease: "elastic.out(1, 0.75)",
                    scrollTrigger: {
                        trigger: footerLogo,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }

        // --- 4. Staggered Fade In for Social Icons ---
        if (socialIconsContainer && socialIcons.length) {
            gsap.fromTo(socialIcons,
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
                    scrollTrigger: {
                        trigger: socialIconsContainer,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }
    };

    // Start the entire process
    loadFooter();
});