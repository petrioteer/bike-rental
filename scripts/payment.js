document.addEventListener('DOMContentLoaded', function() {
    // Get payment method radio buttons
    const creditCardRadio = document.getElementById('credit-card');
    const paypalRadio = document.getElementById('paypal');
    
    // Get payment form sections
    const creditCardForm = document.getElementById('credit-card-form');
    const paypalForm = document.getElementById('paypal-form');
    
    // Add event listeners to payment method radios
    creditCardRadio.addEventListener('change', function() {
        if (this.checked) {
            creditCardForm.classList.remove('hidden');
            paypalForm.classList.add('hidden');
        }
    });
    
    paypalRadio.addEventListener('change', function() {
        if (this.checked) {
            creditCardForm.classList.add('hidden');
            paypalForm.classList.remove('hidden');
        }
    });
    
    // Format credit card number with spaces
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', function() {
        let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        this.value = formattedValue;
    });
    
    // Format expiry date with slash
    const expiryDateInput = document.getElementById('expiry-date');
    expiryDateInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length > 2) {
            this.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
            this.value = value;
        }
    });
    
    // Limit CVV to 3 or 4 digits
    const cvvInput = document.getElementById('cvv');
    cvvInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').substring(0, 4);
    });
    
    // Handle form submission
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        const payBtn = document.querySelector('.pay-btn');
        const originalText = payBtn.textContent;
        payBtn.textContent = 'Processing...';
        payBtn.disabled = true;
        
        // Simulate payment processing
        setTimeout(function() {
            // In a real application, this would send payment data to the server
            
            // Redirect to confirmation page
            window.location.href = 'confirmation.html';
        }, 2000);
    });
    
    // Form validation function
    function validateForm() {
        let isValid = true;
        
        // Check if credit card payment is selected
        if (creditCardRadio.checked) {
            const cardHolder = document.getElementById('card-holder');
            const cardNumber = document.getElementById('card-number');
            const expiryDate = document.getElementById('expiry-date');
            const cvv = document.getElementById('cvv');
            
            // Validate card holder name
            if (!cardHolder.value.trim()) {
                showError(cardHolder, 'Please enter the cardholder name');
                isValid = false;
            } else {
                removeError(cardHolder);
            }
            
            // Validate card number (simple validation for demo)
            if (!cardNumber.value.trim() || cardNumber.value.replace(/\s/g, '').length < 16) {
                showError(cardNumber, 'Please enter a valid card number');
                isValid = false;
            } else {
                removeError(cardNumber);
            }
            
            // Validate expiry date
            if (!expiryDate.value.trim() || !expiryDate.value.includes('/')) {
                showError(expiryDate, 'Please enter a valid expiry date (MM/YY)');
                isValid = false;
            } else {
                removeError(expiryDate);
            }
            
            // Validate CVV
            if (!cvv.value.trim() || cvv.value.length < 3) {
                showError(cvv, 'Please enter a valid CVV');
                isValid = false;
            } else {
                removeError(cvv);
            }
        }
        
        // Validate billing address fields
        const address = document.getElementById('address');
        const city = document.getElementById('city');
        const state = document.getElementById('state');
        const zip = document.getElementById('zip');
        
        if (!address.value.trim()) {
            showError(address, 'Please enter your address');
            isValid = false;
        } else {
            removeError(address);
        }
        
        if (!city.value.trim()) {
            showError(city, 'Please enter your city');
            isValid = false;
        } else {
            removeError(city);
        }
        
        if (!state.value.trim()) {
            showError(state, 'Please enter your state');
            isValid = false;
        } else {
            removeError(state);
        }
        
        if (!zip.value.trim()) {
            showError(zip, 'Please enter your ZIP code');
            isValid = false;
        } else {
            removeError(zip);
        }
        
        // Validate terms checkbox
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            showError(termsCheckbox, 'You must agree to the terms and conditions');
            isValid = false;
        } else {
            removeError(termsCheckbox);
        }
        
        return isValid;
    }
    
    // Helper function to show error message
    function showError(input, message) {
        const formGroup = input.closest('.form-group') || input.closest('.checkbox-group');
        
        // Remove any existing error message
        removeError(input);
        
        // Add error class to input
        input.classList.add('error-input');
        
        // Create and append error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        formGroup.appendChild(errorElement);
    }
    
    // Helper function to remove error message
    function removeError(input) {
        const formGroup = input.closest('.form-group') || input.closest('.checkbox-group');
        
        // Remove error class from input
        input.classList.remove('error-input');
        
        // Remove error message if it exists
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    // Load booking details from URL parameters or localStorage
    function loadBookingDetails() {
        // In a real application, this would load data from the server or localStorage
        // For demo purposes, we'll use the hardcoded values in the HTML
    }
    
    // Initialize the page
    loadBookingDetails();
});