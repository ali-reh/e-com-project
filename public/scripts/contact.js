/**
 * Contact Form Handler
 * Submits contact form to API and shows feedback
 */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');
  
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnContent = submitBtn.innerHTML;
    
    // Get form data
    const formData = {
      name: form.querySelector('#name').value.trim(),
      email: form.querySelector('#email').value.trim(),
      subject: form.querySelector('#subject').value,
      message: form.querySelector('#message').value.trim()
    };

    // Validate
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span><i class="bi bi-hourglass-split"></i>';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success - update button immediately
        submitBtn.disabled = false;
        submitBtn.classList.add('success');
        submitBtn.innerHTML = '<span>Message Sent!</span><i class="bi bi-check-lg"></i>';
        showNotification('Your message has been sent successfully!', 'success');
        
        // Reset form after delay
        setTimeout(() => {
          form.reset();
          submitBtn.classList.remove('success');
          submitBtn.innerHTML = originalBtnContent;
        }, 3000);
      } else {
        throw new Error(result.error || result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
      showNotification(error.message || 'Failed to send message. Please try again.', 'error');
    }
  });

  /**
   * Show notification toast
   */
  function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.contact-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `contact-notification ${type}`;
    notification.innerHTML = `
      <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
});
