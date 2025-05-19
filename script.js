// Advanced country and device cloaker with anti-detection features
function advancedCloaker() {
    // Configuration
    const config = {
        // Allowed countries (country codes) - Empty array means allow all countries
        allowedCountries: [],
        
        // Target only mobile devices (true) or allow all devices (false)
        mobileOnly: true,
        
        // URLs to redirect different traffic to
        redirectUrls: {
            desktop: 'https://popmel-oficial.github.io/Oficial/',
            nonTargetCountry: 'https://popmel-oficial.github.io/Oficial/',
            bot: 'https://popmel-oficial.github.io/Oficial/'
        },
        
        // Cache duration in milliseconds (24 hours)
        cacheDuration: 24 * 60 * 60 * 1000,
        
        // Referrer whitelist (leave empty to allow all)
        // If not empty, users coming from other sources will be redirected
        allowedReferrers: [],
        
        // Anti-detection mode
        antiDetection: true,
        
        // Admin bypass settings
        adminBypass: {
            enabled: true,
            // Secret token (change this to something complex)
            secretToken: 'a7x9z2p5q8r3t6y1w4',
            // Parameter name that will be used in URL
            paramName: 'access',
            // How long the bypass should last (in milliseconds) - 1 day
            bypassDuration: 24 * 60 * 60 * 1000
        },
        
        // Facebook Pixel Event Tracking
        facebookPixel: {
            enabled: true,
            pixelId: '2826187250894174'
        }
    };
    
    // Initialize Facebook Pixel tracking
    function initFacebookPixelTracking() {
        if (config.facebookPixel.enabled && typeof fbq !== 'undefined') {
            console.log('Facebook Pixel tracking initialized');
            // Page view already tracked in base code
            
            // Track page engagement
            setTimeout(function() {
                fbq('trackCustom', 'PageEngagement', {time: '10s'});
            }, 10000);
            
            // Track scroll depth
            let scrollDepthTracked = {
                '25': false,
                '50': false, 
                '75': false,
                '100': false
            };
            
            window.addEventListener('scroll', function() {
                const scrollPosition = window.scrollY;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;
                
                if (scrollPercentage >= 25 && !scrollDepthTracked['25']) {
                    fbq('trackCustom', 'ScrollDepth', {depth: '25%'});
                    scrollDepthTracked['25'] = true;
                }
                if (scrollPercentage >= 50 && !scrollDepthTracked['50']) {
                    fbq('trackCustom', 'ScrollDepth', {depth: '50%'});
                    scrollDepthTracked['50'] = true;
                }
                if (scrollPercentage >= 75 && !scrollDepthTracked['75']) {
                    fbq('trackCustom', 'ScrollDepth', {depth: '75%'});
                    scrollDepthTracked['75'] = true;
                }
                if (scrollPercentage >= 100 && !scrollDepthTracked['100']) {
                    fbq('trackCustom', 'ScrollDepth', {depth: '100%'});
                    scrollDepthTracked['100'] = true;
                }
            });
        }
    }
    
    // Check for admin bypass first
    function checkAdminBypass() {
        // If admin bypass is not enabled, return false
        if (!config.adminBypass.enabled) {
            return false;
        }
        
        // Check if bypass is stored in localStorage
        const bypassData = localStorage.getItem('admin_bypass');
        if (bypassData) {
            try {
                const data = JSON.parse(bypassData);
                const now = new Date().getTime();
                
                // Check if bypass is still valid
                if (now - data.timestamp < config.adminBypass.bypassDuration) {
                    // Bypass is valid
                    return true;
                } else {
                    // Bypass expired, remove it
                    localStorage.removeItem('admin_bypass');
                }
            } catch (e) {
                // Error parsing bypass data
                console.error('Error parsing admin bypass data:', e);
            }
        }
        
        // Check URL parameters for bypass token
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get(config.adminBypass.paramName);
        
        if (accessToken === config.adminBypass.secretToken) {
            // Valid access token, store bypass in localStorage
            localStorage.setItem('admin_bypass', JSON.stringify({
                timestamp: new Date().getTime()
            }));
            
            // Clean URL by removing the access parameter
            if (history.pushState) {
                const newUrl = window.location.pathname + 
                    window.location.search.replace(
                        new RegExp(`[?&]${config.adminBypass.paramName}=${config.adminBypass.secretToken}`), ''
                    ).replace(/^&/, '?') + 
                    window.location.hash;
                
                history.pushState({}, document.title, newUrl);
            }
            
            return true;
        }
        
        return false;
    }
    
    // Check if user is likely a bot
    function isLikelyBot() {
        // Check common bot indicators
        const botPatterns = [
            /bot/i, /spider/i, /crawl/i, /APIs-Google/i,
            /AdsBot/i, /Googlebot/i, /mediapartners/i, /Google Favicon/i,
            /FeedFetcher/i, /Yahoo! Slurp/i, /AOLBuild/i, /Googlebot/i,
            /Baiduspider/i, /BingBot/i, /Slurp/i, /YandexBot/i
        ];
        
        if (botPatterns.some(pattern => pattern.test(navigator.userAgent))) {
            return true;
        }
        
        // Headless browser detection
        if (
            !navigator.webdriver && 
            navigator.languages && 
            navigator.languages.length === 0
        ) {
            return true;
        }
        
        // Check if window.chrome exists in Chrome
        const isChrome = /Chrome/.test(navigator.userAgent);
        if (isChrome && !window.chrome) {
            return true;
        }
        
        return false;
    }
    
    // Check if user has debug tools open
    function detectDebugger() {
        // Disabled debugger detection to avoid false positives
        return false;
    }
    
    // Check if the referrer is allowed
    function checkReferrer() {
        // If no referrer restrictions, allow all
        if (config.allowedReferrers.length === 0) {
            return true;
        }
        
        // Get the referrer
        const referrer = document.referrer;
        
        // If no referrer and we have a whitelist, block
        if (!referrer) {
            return false;
        }
        
        // Check if referrer is in whitelist
        return config.allowedReferrers.some(allowed => referrer.includes(allowed));
    }
    
    // Redirect based on reason
    function redirectUser(reason) {
        let redirectUrl;
        
        switch (reason) {
            case 'desktop':
                redirectUrl = config.redirectUrls.desktop;
                break;
            case 'country':
                redirectUrl = config.redirectUrls.nonTargetCountry;
                break;
            case 'bot':
                redirectUrl = config.redirectUrls.bot;
                break;
            case 'debugger':
            case 'referrer':
                redirectUrl = config.redirectUrls.nonTargetCountry;
                break;
            default:
                redirectUrl = config.redirectUrls.nonTargetCountry;
        }
        
        // Use history.replaceState to hide the original URL
        if (config.antiDetection) {
            history.replaceState(null, document.title, redirectUrl);
        }
        
        // Redirect the user
        window.location.href = redirectUrl;
    }
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // If admin bypass is active, skip all checks
    if (checkAdminBypass()) {
        console.log('Access granted: Admin bypass active');
        return;
    }
    
    // Check for bot and debug tools if anti-detection is enabled
    if (config.antiDetection) {
        // Bot check
        if (isLikelyBot()) {
            console.log('Redirecting: Bot detected');
            redirectUser('bot');
            return;
        }
        
        // Debug tools check
        if (detectDebugger()) {
            console.log('Redirecting: Debugger detected');
            redirectUser('debugger');
            return;
        }
        
        // Referrer check
        if (!checkReferrer()) {
            console.log('Redirecting: Unauthorized referrer');
            redirectUser('referrer');
            return;
        }
    }
    
    // If mobile only and not on mobile, redirect immediately
    if (config.mobileOnly && !isMobile) {
        console.log('Redirecting: Not a mobile device');
        redirectUser('desktop');
        return;
    }
    
    // Check cache first
    const cachedData = localStorage.getItem('cloaker_data');
    if (cachedData) {
        try {
            const data = JSON.parse(cachedData);
            const now = new Date().getTime();
            
            // Check if cache is still valid
            if (now - data.timestamp < config.cacheDuration) {
                // Cache is valid, use it
                processUserData(data.countryCode);
                
                // Initialize Facebook Pixel tracking if user passed cloaking checks
                initFacebookPixelTracking();
                return;
            }
        } catch (e) {
            // Error parsing cache data
            console.error('Error parsing cache data:', e);
        }
    }
    
    // Fetch country data
    fetch('https://ipapi.co/json/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Cache the result
            localStorage.setItem('cloaker_data', JSON.stringify({
                countryCode: data.country_code,
                timestamp: new Date().getTime()
            }));
            
            // Process the data
            processUserData(data.country_code);
        })
        .catch(error => {
            console.error('Error detecting country:', error);
            // On error, default to allowing access
            // You can change this behavior if needed
        });
    
    function processUserData(countryCode) {
        // If country code is not provided, use empty string
        countryCode = countryCode || '';
        
        // Check if country is allowed
        const isCountryAllowed = config.allowedCountries.length === 0 || 
            config.allowedCountries.includes(countryCode);
            
        // If country is not allowed, redirect
        if (!isCountryAllowed) {
            console.log(`Redirecting: Country ${countryCode} not allowed`);
            redirectUser('country');
            return;
        }
        
        // User passed all checks, save data to cache
        localStorage.setItem('cloaker_data', JSON.stringify({
            countryCode: countryCode,
            timestamp: new Date().getTime()
        }));
        
        // Initialize Facebook Pixel tracking for allowed users
        initFacebookPixelTracking();
        
        console.log('User passed all checks, allowed to view the content');
    }
}

// Execute the advanced cloaker immediately when the page loads
advancedCloaker();

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

// Facebook Pixel Enhanced Tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track scrolling depth
    let scrollDepthTracked = {
        '25': false,
        '50': false,
        '75': false,
        '100': false
    };
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;
        
        if (scrollPercentage >= 25 && !scrollDepthTracked['25']) {
            fbq('trackCustom', 'ScrollDepth', {'depth': '25%'});
            scrollDepthTracked['25'] = true;
        }
        if (scrollPercentage >= 50 && !scrollDepthTracked['50']) {
            fbq('trackCustom', 'ScrollDepth', {'depth': '50%'});
            scrollDepthTracked['50'] = true;
        }
        if (scrollPercentage >= 75 && !scrollDepthTracked['75']) {
            fbq('trackCustom', 'ScrollDepth', {'depth': '75%'});
            scrollDepthTracked['75'] = true;
        }
        if (scrollPercentage >= 100 && !scrollDepthTracked['100']) {
            fbq('trackCustom', 'ScrollDepth', {'depth': '100%'});
            scrollDepthTracked['100'] = true;
        }
    });
    
    // Track time spent on page
    setTimeout(function() {
        fbq('trackCustom', 'TimeOnPage', {'duration': '30 seconds'});
    }, 30000);
    
    setTimeout(function() {
        fbq('trackCustom', 'TimeOnPage', {'duration': '60 seconds'});
    }, 60000);
    
    // Track clicks on review items
    document.querySelectorAll('.review').forEach(function(review) {
        review.addEventListener('click', function() {
            fbq('trackCustom', 'ReviewClick', {'reviewer': this.querySelector('h3').textContent});
        });
    });
});

// Enhanced Facebook Pixel conversion tracking
document.addEventListener('DOMContentLoaded', function() {
    if (typeof fbq !== 'undefined') {
        // Track outbound link clicks as conversions
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.href.includes('popmel33.com')) {
                    fbq('track', 'Lead', {
                        content_name: 'App Installation Link',
                        content_category: 'App Download',
                        value: 1,
                        currency: 'BRL'
                    });
                }
            });
        });
        
        // Track time spent on page
        const timeIntervals = [30, 60, 90, 120];
        timeIntervals.forEach(seconds => {
            setTimeout(() => {
                fbq('trackCustom', 'TimeOnPage', {
                    seconds: seconds,
                    page: window.location.pathname
                });
            }, seconds * 1000);
        });
        
        // Track app value proposition views
        const observers = {};
        document.querySelectorAll('.bonus-item').forEach((element, index) => {
            observers[`bonus${index}`] = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        fbq('trackCustom', 'ValuePropositionView', {
                            proposition_text: entry.target.innerText.trim(),
                            index: index
                        });
                        // Unobserve after first view
                        observers[`bonus${index}`].unobserve(entry.target);
                    }
                });
            }, {threshold: 0.7});
            
            observers[`bonus${index}`].observe(element);
        });
    }
}); 