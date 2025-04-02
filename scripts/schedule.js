document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons and content
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add click event to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Handle booking actions
    const viewButtons = document.querySelectorAll('.view-btn');
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    const reviewButtons = document.querySelectorAll('.review-btn');
    const bookAgainButtons = document.querySelectorAll('.book-again-btn');
    const rescheduleButtons = document.querySelectorAll('.reschedule-btn');
    
    // View booking details
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingCard = this.closest('.booking-card');
            const bookingTitle = bookingCard.querySelector('.booking-title').textContent;
            alert(`Viewing details for: ${bookingTitle}`);
            // In a real application, this would open a modal with booking details
        });
    });
    
    // Cancel booking
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingCard = this.closest('.booking-card');
            const bookingTitle = bookingCard.querySelector('.booking-title').textContent;
            
            if (confirm(`Are you sure you want to cancel your booking for ${bookingTitle}?`)) {
                // In a real application, this would send a cancellation request to the server
                alert('Booking cancelled successfully');
                
                // Update UI to show cancelled status
                const statusElement = bookingCard.querySelector('.booking-status');
                statusElement.className = 'booking-status cancelled';
                statusElement.textContent = 'Cancelled';
                
                // Remove cancel button and add book again button
                this.remove();
                
                const actionsDiv = bookingCard.querySelector('.booking-actions');
                const bookAgainBtn = document.createElement('button');
                bookAgainBtn.className = 'action-btn book-again-btn';
                bookAgainBtn.textContent = 'Book Again';
                actionsDiv.appendChild(bookAgainBtn);
                
                // Add event listener to new button
                bookAgainBtn.addEventListener('click', function() {
                    window.location.href = 'book.html';
                });
            }
        });
    });
    
    // Write review
    reviewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingCard = this.closest('.booking-card');
            const bookingTitle = bookingCard.querySelector('.booking-title').textContent;
            
            // In a real application, this would open a review form
            const rating = prompt(`Please rate your experience with ${bookingTitle} (1-5 stars):`);
            
            if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
                const feedback = prompt('Please share your feedback:');
                
                if (feedback) {
                    alert('Thank you for your review!');
                    // In a real application, this would submit the review to the server
                    
                    // Update UI to show review submitted
                    this.textContent = 'Review Submitted';
                    this.disabled = true;
                    this.style.opacity = '0.5';
                }
            }
        });
    });
    
    // Book again
    bookAgainButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = 'book.html';
        });
    });
    
    // Reschedule
    rescheduleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingCard = this.closest('.booking-card');
            const bookingTitle = bookingCard.querySelector('.booking-title').textContent;
            
            // In a real application, this would open a reschedule form
            alert(`Reschedule form for ${bookingTitle} would open here`);
        });
    });
    
    // Check if user is logged in
    const isLoggedIn = checkLoginStatus();
    
    if (!isLoggedIn) {
        // If not logged in, show login prompt
        document.querySelector('.schedule-container').innerHTML = `
            <div class="login-prompt">
                <h2>Please Log In</h2>
                <p>You need to be logged in to view your schedule.</p>
                <a href="login.html?redirect=schedule.html" class="login-btn">Log In</a>
                <a href="signup.html?redirect=schedule.html" class="signup-btn">Sign Up</a>
            </div>
        `;
    }
    
    // Function to check login status
    function checkLoginStatus() {
        // In a real application, this would check session/cookies
        // For demo purposes, we'll assume the user is logged in
        return true;
    }
});