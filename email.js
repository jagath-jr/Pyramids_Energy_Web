// This function runs once the entire HTML document is loaded
document.addEventListener('DOMContentLoaded', function () {

    // Initialize EmailJS with your Public Key
    // Find this in your EmailJS account under Account > API Keys
    emailjs.init({
        publicKey: '1VaS0kVeLjg7B0Xzo',
    });

    // Add an event listener to the form's submit button
    document.getElementById('contactForm').addEventListener('submit', function (event) {
        
        // Prevent the default form submission (which would reload the page)
        event.preventDefault();

        // --- Your EmailJS Credentials ---
        // Find these in your EmailJS account
        const serviceID = 'service_4ryc02q';
        const templateID = 'template_3azhfkt';

        // Get the submit button to provide user feedback
        const submitBtn = this.querySelector('.submit-btn');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Gather the form data using the element IDs
        const templateParams = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            services: document.getElementById('services').value,
            message: document.getElementById('message').value
        };

        // Send the email using EmailJS
        emailjs.send(serviceID, templateID, templateParams)
            .then((response) => {
                console.log('SUCCESS!', response.status, response.text);
                alert('Message sent successfully!');
                
                // Reset button and form
                submitBtn.textContent = 'Submit';
                submitBtn.disabled = false;
                document.getElementById('contactForm').reset();

            }, (error) => {
                console.log('FAILED...', error);
                alert('Failed to send message. Please try again.');
                
                // Reset button
                submitBtn.textContent = 'Submit';
                submitBtn.disabled = false;
            });
    });
});