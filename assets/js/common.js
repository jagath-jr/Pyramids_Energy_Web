document.addEventListener("DOMContentLoaded", function () {

  // 1. Fetch the Header
  fetch("components/header.html")
    .then((response) => {
      if (!response.ok) throw new Error("Header file not found!");
      return response.text();
    })
    .then((data) => {
      // 2. Inject HTML
      const placeholder = document.getElementById("header-placeholder");
      if (placeholder) {
        placeholder.innerHTML = data;
      } else {
        console.error("Error: <div id='header-placeholder'></div> is missing.");
        return;
      }

      // 3. Define Elements (After injection)
      const menuBtn = document.getElementById("menuBtn");
      const navMenu = document.getElementById("navMenu");
      const headerWrapper = document.getElementById("headerWrapper");

      // 4. Toggle Menu Logic (Mobile)
      if (menuBtn && navMenu) {
        menuBtn.addEventListener("click", function (e) {
          e.stopPropagation(); // Prevent immediate closing
          navMenu.classList.toggle("active");
          
          // Toggle icon between ☰ and ✕ (Optional visual cue)
          if (navMenu.classList.contains("active")) {
            menuBtn.innerHTML = "✕"; 
          } else {
            menuBtn.innerHTML = "☰";
          }
        });

        // Close menu when clicking anywhere else on body
        document.addEventListener("click", function (e) {
          if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            navMenu.classList.remove("active");
            menuBtn.innerHTML = "☰";
          }
        });
      }

      // 5. Scroll Logic (Hide Header)
      let lastScrollTop = 0;
      window.addEventListener("scroll", function () {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (headerWrapper) {
          if (scrollTop > lastScrollTop && scrollTop > 50) {
            // Scrolling Down -> Hide Header
            headerWrapper.classList.add("hide-header");
            // Also close mobile menu if open
            if (navMenu) {
              navMenu.classList.remove("active");
              if (menuBtn) menuBtn.innerHTML = "☰";
            }
          } else {
            // Scrolling Up -> Show Header
            headerWrapper.classList.remove("hide-header");
          }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      });

    })
    .catch((error) => console.error("Error loading header:", error));
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
            
            // Correct path logic:
            const footerPath = isServicesPage ? '../components/footer.html' : 'components/footer.html';
            
            console.log('Attempting to load footer from:', footerPath);
            
            const response = await fetch(footerPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            footerContainer.innerHTML = html;

        } catch (err) {
            console.error('Error loading footer, using fallback:', err);
            // Fallback content
            const isServicesPage = window.location.pathname.includes('/services/');
            const basePath = isServicesPage ? '../' : './';

            footerContainer.innerHTML = `
                <div class="footer-fallback" style="text-align: center; padding: 20px;">
                    <h4>QUICK LINKS</h4>
                    <p><a href="${basePath}index.html">Home</a> | <a href="${basePath}services/services.html">Services</a></p>
                    <p class="copyright">© ${new Date().getFullYear()} Pyramids Energy.</p>
                </div>
            `;
        } finally {
            // 1. Initialize Animations
            initializeFooterAnimations();
            
            // 2. IMPORTANT: Refresh ScrollTrigger
            // We use a small timeout to ensure the DOM has fully repainted
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }
    };

    // Initialize animations after footer content is in the DOM
    const initializeFooterAnimations = () => {
        const select = selector => document.querySelector(selector);
        
        // 1. Footer Container (Matches your HTML: class="ec-footer site-footer")
        const siteFooter = select('.ec-footer'); 
        
        if (!siteFooter) {
            console.warn("Warning: '.ec-footer' class not found. Animation skipped.");
            return;
        }

        // --- UPDATED SELECTORS TO MATCH YOUR HTML ---
        
        // Matches: <div class="ec-footer__col ...">
        const footerColumns = gsap.utils.toArray('.ec-footer__col');
        
        // Matches: <img ... class="ec-footer__logo-img">
        const footerLogo = select('.ec-footer__logo-img');
        
        // Matches: <div class="ec-footer__socials">
        const socialIconsContainer = select('.ec-footer__socials');
        
        // Matches: <a ... class="ec-footer__social-link">
        const socialIcons = gsap.utils.toArray('.ec-footer__social-link');


        // --- ANIMATIONS ---

        // 1. Columns Slide In
        if (footerColumns.length > 0) {
            footerColumns.forEach((column, index) => {
                const direction = index % 2 === 0 ? -30 : 30; 
                gsap.fromTo(column,
                    { x: direction, opacity: 0 },
                    {
                        x: 0, opacity: 1, duration: 0.8, ease: "power2.out",
                        scrollTrigger: {
                            trigger: column,
                            start: "top 85%", 
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });
        }

        // 2. Logo Scale
        if (footerLogo) {
            gsap.fromTo(footerLogo,
                { scale: 0.5, opacity: 0 },
                {
                    scale: 1, opacity: 1, duration: 1.6, ease: "elastic.out(1, 0.75)",
                    scrollTrigger: {
                        trigger: footerLogo,
                        start: "top 90%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }

        // 3. Social Icons Stagger
        if (socialIconsContainer && socialIcons.length) {
            gsap.fromTo(socialIcons,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
                    scrollTrigger: {
                        trigger: socialIconsContainer,
                        start: "top 95%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }
    };

    // Start
    loadFooter();
});