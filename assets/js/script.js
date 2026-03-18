// Sticky navbar functionality
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-lg');
    } else {
        navbar.classList.remove('shadow-lg');
    }
});

// Mobile menu toggle
document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

// Smooth scrolling for anchor links
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
        // Close mobile menu after clicking a link
        const mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });
});

// Phone number formatting
document.getElementById('phone').addEventListener('input', function(e) {
    // Remove any non-digit characters
    let value = e.target.value.replace(/\D/g, '');

    // Limit to 10 digits
    if (value.length > 10) {
        value = value.slice(0, 10);
    }

    e.target.value = value;
});

// Form validation feedback
document.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.classList.add('border-red-500');
            this.classList.remove('border-neon-green');
        } else {
            this.classList.remove('border-red-500');
            this.classList.add('border-neon-green');
        }
    });
});

// Form submission with Firestore
document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const queryType = document.getElementById('queryType').value;
    const preferredTime = document.getElementById('preferredTime').value;
    const message = document.getElementById('message').value.trim();

    // Get selected services
    const servicesCheckboxes = document.querySelectorAll('input[name="services"]:checked');
    const services = Array.from(servicesCheckboxes).map(cb => cb.value);

    // Validation
    if (!name) {
        alert('Please enter your name.');
        document.getElementById('name').focus();
        return;
    }

    if (!phone) {
        alert('Please enter your phone number.');
        document.getElementById('phone').focus();
        return;
    }

    // Basic phone validation (Indian mobile numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        alert('Please enter a valid 10-digit mobile number.');
        document.getElementById('phone').focus();
        return;
    }

    if (!queryType) {
        alert('Please select what you need help with.');
        document.getElementById('queryType').focus();
        return;
    }

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const docRef = await window.addDoc(window.collection(window.db, "bookings"), {
            name: name,
            phone: phone,
            email: email || null,
            queryType: queryType,
            preferredTime: preferredTime || null,
            services: services,
            message: message || null,
            timestamp: new Date(),
            status: 'pending'
        });

        // Success message based on query type
        let successMessage = 'Thank you for your inquiry! ';
        if (queryType === 'book-trial') {
            successMessage += 'We\'ll contact you soon to schedule your free trial.';
        } else {
            successMessage += 'We\'ll get back to you within 24 hours.';
        }

        alert(successMessage);
        this.reset();
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
        alert('There was an error submitting your form. Please try again or contact us directly.');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});