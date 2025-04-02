document.addEventListener('DOMContentLoaded', function() {
    // Get booking details from URL parameters or localStorage
    loadBookingDetails();
    
    // Add event listeners to action buttons
    const viewBookingsBtn = document.querySelector('.view-bookings-btn');
    const homeBtn = document.querySelector('.home-btn');
    
    if (viewBookingsBtn) {
        viewBookingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'schedule.html';
        });
    }
    
    if (homeBtn) {
        homeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
    
    // Function to load booking details
    function loadBookingDetails() {
        // In a real application, this would retrieve data from URL parameters, localStorage, or an API
        // For demo purposes, we'll use the hardcoded values in the HTML
        
        // Example of how to get data from URL parameters:
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('bookingId');
        
        if (bookingId) {
            // If we have a booking ID, we would fetch the booking details from an API
            // For demo purposes, we'll just update the booking ID in the HTML
            const bookingIdElement = document.querySelector('.detail-value:first-child');
            if (bookingIdElement) {
                bookingIdElement.textContent = bookingId;
            }
        }
        
        // Generate a random booking ID if none is provided
        if (!bookingId) {
            const randomId = generateBookingId();
            const bookingIdElement = document.querySelector('.detail-item:first-child .detail-value');
            if (bookingIdElement) {
                bookingIdElement.textContent = randomId;
            }
        }
        
        // Add the booking to localStorage for demo purposes
        saveBookingToLocalStorage();
    }
    
    // Function to generate a random booking ID
    function generateBookingId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Generate a random 4-digit number
        const random = Math.floor(1000 + Math.random() * 9000);
        
        return `VR-${year}-${month}-${day}-${random}`;
    }
    
    // Function to save booking to localStorage (for demo purposes)
    function saveBookingToLocalStorage() {
        // Get booking details from the page
        const bookingId = document.querySelector('.detail-item:nth-child(1) .detail-value').textContent;
        const vehicle = document.querySelector('.detail-item:nth-child(2) .detail-value').textContent;
        const dateTime = document.querySelector('.detail-item:nth-child(3) .detail-value').textContent;
        const location = document.querySelector('.detail-item:nth-child(4) .detail-value').textContent;
        const total = document.querySelector('.detail-item:nth-child(5) .detail-value').textContent;
        
        // Create booking object
        const booking = {
            id: bookingId,
            vehicle: vehicle,
            dateTime: dateTime,
            location: location,
            total: total,
            status: 'confirmed',
            created: new Date().toISOString()
        };
        
        // Get existing bookings from localStorage or initialize empty array
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        
        // Add new booking
        bookings.push(booking);
        
        // Save to localStorage
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }
    
    // Function to share booking details
    function shareBooking() {
        const bookingId = document.querySelector('.detail-item:first-child .detail-value').textContent;
        
        // Check if Web Share API is supported
        if (navigator.share) {
            navigator.share({
                title: 'My Velo Rapido Booking',
                text: `I've just booked a bike with Velo Rapido! Booking ID: ${bookingId}`,
                url: window.location.href
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing:', error));
        } else {
            // Fallback for browsers that don't support the Web Share API
            alert('Share feature is not supported in your browser. You can copy the booking ID: ' + bookingId);
        }
    }
    
    // Add share button functionality if it exists
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareBooking);
    }
    
    // Add calendar integration if available
    const addToCalendarBtn = document.querySelector('.calendar-btn');
    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener('click', function() {
            const dateTimeStr = document.querySelector('.detail-item:nth-child(3) .detail-value').textContent;
            const location = document.querySelector('.detail-item:nth-child(4) .detail-value').textContent;
            
            // Parse date and time (this is a simplified example)
            const dateTimeParts = dateTimeStr.split('•');
            const datePart = dateTimeParts[0].trim();
            const timePart = dateTimeParts[1].trim();
            
            // Create calendar event URL (for Google Calendar)
            const eventTitle = 'Velo Rapido Bike Rental';
            const eventDetails = `Pickup Location: ${location}`;
            
            // This is a simplified example - in a real app, you'd need proper date parsing
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(location)}&dates=20230615T100000Z/20230615T140000Z`;
            
            // Open calendar in new tab
            window.open(googleCalendarUrl, '_blank');
        });
    }
    
    // Display a confetti animation for a celebratory effect
    function showConfetti() {
        // This would typically use a library like canvas-confetti
        // For demo purposes, we'll just add a simple animation class
        const confirmationCard = document.querySelector('.confirmation-card');
        if (confirmationCard) {
            confirmationCard.classList.add('celebration');
            
            // Remove the class after animation completes
            setTimeout(() => {
                confirmationCard.classList.remove('celebration');
            }, 3000);
        }
    }
    
    // Show confetti on page load
    setTimeout(showConfetti, 500);
});