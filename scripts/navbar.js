// Navbar functionality for Velo Rapido
// Update the section highlighting functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the navbar element
    const navbar = document.querySelector('.main-nav');
    
    // Add scroll event listener to change navbar appearance on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Highlight the current section in the navbar
        highlightCurrentSection();
    });
    
    // Function to highlight the current section
    function highlightCurrentSection() {
        // Get all sections that have an ID
        const sections = document.querySelectorAll('section[id]');
        
        // Get current scroll position
        const scrollPosition = window.scrollY + 100; // Adding offset for navbar height
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Find the current section and highlight its nav link
        let currentSection = null;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        if (currentSection) {
            const activeLink = document.querySelector(`.nav-links a[href="#${currentSection}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        } else {
            // If no section is active (top of page), highlight home
            const homeLink = document.querySelector('.nav-links a[href="index.html"]');
            if (homeLink && window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                homeLink.classList.add('active');
            }
        }
    }
    
    // Initial highlight check
    highlightCurrentSection();
    
    // Add active class to current page link
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage !== 'index.html' && linkPage.includes(currentPage))) {
            link.classList.add('active');
        }
    });
    
    // Mobile menu toggle for smaller screens
    const mobileMenuBtn = document.createElement('div');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
    
    const navContainer = document.querySelector('.nav-container');
    const navLinksContainer = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    // Only add mobile menu button for smaller screens
    function handleResize() {
        if (window.innerWidth <= 768) {
            if (!document.querySelector('.mobile-menu-btn')) {
                navContainer.insertBefore(mobileMenuBtn, navLinksContainer);
                navLinksContainer.classList.add('mobile');
                authButtons.classList.add('mobile');
            }
        } else {
            if (document.querySelector('.mobile-menu-btn')) {
                document.querySelector('.mobile-menu-btn').remove();
                navLinksContainer.classList.remove('mobile', 'active');
                authButtons.classList.remove('mobile', 'active');
            }
        }
    }
    
    // Initial check on page load
    handleResize();
    
    // Check on window resize
    window.addEventListener('resize', handleResize);
    
    // Toggle mobile menu
    document.addEventListener('click', function(e) {
        if (e.target.closest('.mobile-menu-btn')) {
            navLinksContainer.classList.toggle('active');
            authButtons.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (mobileMenuBtn.classList.contains('active')) {
                    navLinksContainer.classList.remove('active');
                    authButtons.classList.remove('active');
                    mobileMenuBtn.classList.remove('active');
                }
                
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
