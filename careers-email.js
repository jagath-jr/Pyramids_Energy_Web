document.addEventListener('DOMContentLoaded', function () {

    // Initialize EmailJS with your Public Key
    // Find this in your EmailJS account under Account > API Keys
    emailjs.init({
        publicKey: '1VaS0kVeLjg7B0Xzo', // Your public key from email.j
    });

    const careersForm = document.getElementById('careersForm');
    if (careersForm) {
        careersForm.addEventListener('submit', function (event) {
            
            event.preventDefault();

            // --- Your EmailJS Credentials ---
            // You will need a NEW Template ID for this careers form
            const serviceID = 'service_4ryc02q'; // Your Service ID from email.j
            const templateID = 'template_pjnw4f6'; // <<< REPLACE THIS

            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Gather the form data using the element IDs
            // These MUST match the variables in your new EmailJS template
            const templateParams = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                position: document.getElementById('position').value,
                message: document.getElementById('message').value
            };

            // Send the email using EmailJS
            emailjs.send(serviceID, templateID, templateParams)
                .then((response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    alert('Application submitted successfully!\n\nPlease remember to email your resume to info@wenqurovision.ae.');
                    
                    // Reset button and form
                    submitBtn.textContent = 'Submit Application';
                    submitBtn.disabled = false;
                    careersForm.reset();

                }, (error) => {
                    console.log('FAILED...', error);
                    alert('Failed to send application. Please try again.');
                    
                    // Reset button
                    submitBtn.textContent = 'Submit Application';
                    submitBtn.disabled = false;
                });
        });
    }
});