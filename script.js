document.addEventListener('DOMContentLoaded', () => {
    // Set placeholder images - logo, badge, and app icon removed
    // document.getElementById('gp-logo').src = window.placeholderImages.googlePlayLogo;
    // document.getElementById('dev-badge').src = window.placeholderImages.topDeveloperBadge;
    // document.getElementById('app-icon').src = window.placeholderImages.appIcon;
    // Promo images are now directly set in HTML with placeholder.com URLs
    
    // Carousel functionality
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    const prevButton = document.querySelector('.nav-btn.prev');
    const nextButton = document.querySelector('.nav-btn.next');
    
    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth + 12; // Including margin
    const totalItems = items.length;
    const indicatorsToShow = 3; // We want to show only 3 indicators
    
    // Clear any existing indicators
    indicatorsContainer.innerHTML = '';
    
    // Create only 3 indicators
    for (let i = 0; i < indicatorsToShow; i++) {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (i === 0) indicator.classList.add('active');
        indicatorsContainer.appendChild(indicator);
        
        indicator.addEventListener('click', () => {
            // Map the 3 indicators to 5 slides
            let targetIndex;
            if (i === 0) targetIndex = 0; // First indicator -> First slide
            else if (i === 1) targetIndex = Math.floor(totalItems / 2); // Middle indicator -> Middle slide
            else targetIndex = totalItems - 1; // Last indicator -> Last slide
            
            goToSlide(targetIndex);
        });
    }
    
    const indicators = document.querySelectorAll('.indicator');
    
    // Initialize buttons
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        } else {
            goToSlide(totalItems - 1); // Go to last slide
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (currentIndex < totalItems - 1) {
            goToSlide(currentIndex + 1);
        } else {
            goToSlide(0); // Go to first slide
        }
    });
    
    function goToSlide(index) {
        track.scrollTo({
            left: itemWidth * index,
            behavior: 'smooth'
        });
        currentIndex = index;
        updateIndicators();
    }
    
    function updateIndicators() {
        // Update which indicator should be active based on current slide
        let activeIndicator;
        if (currentIndex === 0) activeIndicator = 0; // First slide -> First indicator
        else if (currentIndex === totalItems - 1) activeIndicator = indicatorsToShow - 1; // Last slide -> Last indicator
        else activeIndicator = 1; // All middle slides -> Middle indicator
        
        indicators.forEach((indicator, index) => {
            if (index === activeIndicator) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Handle scroll events to update indicators
    track.addEventListener('scroll', () => {
        const scrollPosition = track.scrollLeft;
        const newIndex = Math.round(scrollPosition / itemWidth);
        
        if (newIndex !== currentIndex) {
            currentIndex = newIndex;
            updateIndicators();
        }
    });
    
    // Navigation tabs
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
        });
    });
    
    // Device selector
    const deviceButtons = document.querySelectorAll('.device-btn');
    
    deviceButtons.forEach(button => {
        button.addEventListener('click', () => {
            deviceButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Section headers expandable
    const sectionHeaders = document.querySelectorAll('.section-header');
    
    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            const content = Array.from(section.children).filter(el => !el.classList.contains('section-header'));
            
            // Toggle visibility of content
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                content.forEach(el => el.style.display = 'none');
                header.setAttribute('aria-expanded', 'false');
                header.querySelector('i').classList.remove('fa-chevron-down');
                header.querySelector('i').classList.add('fa-chevron-right');
            } else {
                content.forEach(el => el.style.display = '');
                header.setAttribute('aria-expanded', 'true');
                header.querySelector('i').classList.remove('fa-chevron-right');
                header.querySelector('i').classList.add('fa-chevron-down');
            }
        });
        
        // Initialize state
        header.setAttribute('aria-expanded', 'true');
    });
    
    // More options buttons
    const moreOptionsButtons = document.querySelectorAll('.more-options-btn');
    
    moreOptionsButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            // Here you would typically show a dropdown menu
            alert('More options clicked');
        });
    });
    
    // Action buttons
    const shareBtn = document.querySelector('.share-btn');
    const wishlistBtn = document.querySelector('.wishlist-btn');
    
    shareBtn.addEventListener('click', () => {
        // Share functionality would typically integrate with Web Share API
        alert('Share feature clicked');
    });
    
    wishlistBtn.addEventListener('click', () => {
        const icon = wishlistBtn.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            wishlistBtn.style.color = '#f44336';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            wishlistBtn.style.color = '#018786';
        }
    });
}); 