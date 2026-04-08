// Cart functionality
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

// Add to cart functionality
const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        cartCount++;
        cartCountElement.textContent = cartCount;
        
        // Visual feedback
        button.textContent = 'Added!';
        button.style.background = 'var(--accent)';
        button.style.color = 'white';
        button.style.borderColor = 'var(--accent)';
        
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.style.background = '';
            button.style.color = '';
            button.style.borderColor = '';
        }, 1500);
        
        // Animate cart icon
        cartCountElement.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCountElement.style.transform = 'scale(1)';
        }, 300);
    });
});

// Wishlist functionality
const wishlistButtons = document.querySelectorAll('.wishlist-btn');
wishlistButtons.forEach(button => {
    let isWishlisted = false;
    
    button.addEventListener('click', (e) => {
        e.preventDefault();
        isWishlisted = !isWishlisted;
        
        if (isWishlisted) {
            button.style.background = 'var(--accent)';
            button.style.color = 'white';
            button.querySelector('path').setAttribute('fill', 'currentColor');
        } else {
            button.style.background = 'white';
            button.style.color = '';
            button.querySelector('path').setAttribute('fill', 'none');
        }
    });
});

// Newsletter form
const newsletterForm = document.getElementById('newsletterForm');
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    const button = newsletterForm.querySelector('button');
    
    // Show success message
    const originalButtonText = button.textContent;
    button.textContent = 'Subscribed! ✓';
    button.style.background = 'var(--primary)';
    
    setTimeout(() => {
        button.textContent = originalButtonText;
        button.style.background = '';
        input.value = '';
    }, 3000);
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    
    // Animate hamburger menu
    const spans = mobileMenuBtn.querySelectorAll('span');
    if (navLinks.style.display === 'flex') {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Category cards hover effect
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        console.log(`Navigating to category: ${category}`);
        // Here you would typically navigate to the category page
        // window.location.href = `/category/${category}`;
    });
});

// Search button functionality
const searchBtn = document.querySelector('.search-btn');
searchBtn.addEventListener('click', () => {
    // You would typically open a search modal here
    console.log('Search clicked');
    alert('Search functionality would open here');
});

// Scroll animation for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for fade-in animation
const sections = document.querySelectorAll('.categories, .products, .impact, .testimonials, .newsletter');
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Parallax effect for hero badge
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) {
        heroBadge.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Product card image hover effect
const productImages = document.querySelectorAll('.product-image');
productImages.forEach(image => {
    image.addEventListener('mouseenter', () => {
        image.style.transform = 'scale(1.05)';
        image.style.transition = 'transform 0.4s ease';
    });
    
    image.addEventListener('mouseleave', () => {
        image.style.transform = 'scale(1)';
    });
});

// Add loading animation for page load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Stats counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target;
            const finalValue = statNumber.textContent;
            
            if (finalValue.includes('+')) {
                animateCounter(statNumber, parseInt(finalValue), '+');
            } else if (finalValue.includes('%')) {
                animateCounter(statNumber, parseInt(finalValue), '%');
            }
            
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

function animateCounter(element, target, suffix) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 30);
}

const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach(stat => statsObserver.observe(stat));

// Testimonial card entrance animation
const testimonialCards = document.querySelectorAll('.testimonial-card');
testimonialCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
});

const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.2 });

testimonialCards.forEach(card => testimonialObserver.observe(card));