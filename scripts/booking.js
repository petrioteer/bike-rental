document.addEventListener('DOMContentLoaded', function() {
    const vehicleTypeSelect = document.getElementById('vehicle_type');
    const vehicleOptionsDiv = document.getElementById('vehicle_options');
    const vehicleSelect = document.getElementById('vehicle_id');
    const summaryDiv = document.getElementById('summary');
    const durationInput = document.getElementById('duration');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const extraInputs = document.querySelectorAll('input[name="extras[]"]');
    
    // Set minimum date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    
    // Set default time to current time + 1 hour, rounded to nearest hour
    const nextHour = new Date(today.setHours(today.getHours() + 1, 0, 0, 0));
    const hours = String(nextHour.getHours()).padStart(2, '0');
    const minutes = String(nextHour.getMinutes()).padStart(2, '0');
    timeInput.value = `${hours}:${minutes}`;
    
    // Vehicle data - in a real application, this would be fetched from the server
    const vehicles = {
        scooter: [
            { id: 1, name: 'Vespa Primavera', hourlyRate: 15, dailyRate: 75 },
            { id: 2, name: 'Honda Activa', hourlyRate: 12, dailyRate: 60 },
            { id: 3, name: 'Yamaha Fascino', hourlyRate: 13, dailyRate: 65 }
        ],
        electric_bike: [
            { id: 4, name: 'Trek Verve+ 2', hourlyRate: 18, dailyRate: 90 },
            { id: 5, name: 'Specialized Turbo Vado', hourlyRate: 20, dailyRate: 100 }
        ],
        city_bike: [
            { id: 6, name: 'Trek FX 3', hourlyRate: 8, dailyRate: 40 },
            { id: 7, name: 'Specialized Sirrus', hourlyRate: 9, dailyRate: 45 }
        ],
        mountain_bike: [
            { id: 8, name: 'Trek Marlin 7', hourlyRate: 10, dailyRate: 50 },
            { id: 9, name: 'Specialized Rockhopper', hourlyRate: 11, dailyRate: 55 }
        ],
        road_bike: [
            { id: 10, name: 'Trek Domane AL 3', hourlyRate: 12, dailyRate: 60 },
            { id: 11, name: 'Specialized Allez', hourlyRate: 13, dailyRate: 65 }
        ]
    };
    
    // When vehicle type changes, update vehicle options
    vehicleTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        
        if (selectedType) {
            // Clear previous options
            vehicleSelect.innerHTML = '';
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a vehicle';
            vehicleSelect.appendChild(defaultOption);
            
            // Add options for selected type
            vehicles[selectedType].forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.name} - $${vehicle.hourlyRate}/hour`;
                option.dataset.hourlyRate = vehicle.hourlyRate;
                option.dataset.dailyRate = vehicle.dailyRate;
                vehicleSelect.appendChild(option);
            });
            
            // Show vehicle options
            vehicleOptionsDiv.classList.remove('hidden');
        } else {
            // Hide vehicle options
            vehicleOptionsDiv.classList.add('hidden');
        }
        
        // Update summary
        updateSummary();
    });
    
    // When vehicle, duration, or extras change, update summary
    vehicleSelect.addEventListener('change', updateSummary);
    durationInput.addEventListener('change', updateSummary);
    dateInput.addEventListener('change', updateSummary);
    timeInput.addEventListener('change', updateSummary);
    
    extraInputs.forEach(input => {
        input.addEventListener('change', updateSummary);
    });
    
    // Update booking summary
    function updateSummary() {
        // Get selected vehicle
        const vehicleId = vehicleSelect.value;
        
        if (!vehicleId) {
            summaryDiv.innerHTML = '<p>Please select your route and vehicle to see the summary.</p>';
            return;
        }
        
        // Get selected vehicle type
        const vehicleType = vehicleTypeSelect.value;
        
        // Find selected vehicle
        const selectedVehicle = vehicles[vehicleType].find(v => v.id == vehicleId);
        
        // Get duration
        const duration = parseInt(durationInput.value);
        
        // Calculate base cost
        let baseCost = selectedVehicle.hourlyRate * duration;
        
        // If duration is 8 hours or more, use daily rate
        if (duration >= 8) {
            baseCost = selectedVehicle.dailyRate;
        }
        
        // Calculate extras cost
        let extrasCost = 0;
        const selectedExtras = [];
        
        extraInputs.forEach(input => {
            if (input.checked) {
                switch (input.value) {
                    case 'helmet':
                        extrasCost += 5;
                        selectedExtras.push('Helmet (+$5)');
                        break;
                    case 'lock':
                        extrasCost += 3;
                        selectedExtras.push('Security Lock (+$3)');
                        break;
                    case 'basket':
                        extrasCost += 2;
                        selectedExtras.push('Basket (+$2)');
                        break;
                    case 'insurance':
                        extrasCost += 10;
                        selectedExtras.push('Insurance (+$10)');
                        break;
                }
            }
        });
        
        // Calculate total cost
        const totalCost = baseCost + extrasCost;
        
        // Get pickup and dropoff locations
        const pickup = document.getElementById('from').value;
        const dropoff = document.getElementById('to').value;
        
        // Get date and time
        const date = dateInput.value;
        const time = timeInput.value;
        
        // Format date
        const formattedDate = new Date(date + 'T' + time).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
        
        // Build summary HTML
        let summaryHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="text-yellow-400 font-medium">Vehicle</h4>
                    <p>${selectedVehicle.name}</p>
                </div>
                
                <div>
                    <h4 class="text-yellow-400 font-medium">Route</h4>
                    <p>${pickup ? pickup : 'Not specified'} → ${dropoff ? dropoff : 'Not specified'}</p>
                </div>
                
                <div>
                    <h4 class="text-yellow-400 font-medium">Date & Time</h4>
                    <p>${formattedDate}</p>
                </div>
                
                <div>
                    <h4 class="text-yellow-400 font-medium">Duration</h4>
                    <p>${duration} hour${duration > 1 ? 's' : ''}</p>
                </div>
        `;
        
        // Add extras if any
        if (selectedExtras.length > 0) {
            summaryHTML += `
                <div>
                    <h4 class="text-yellow-400 font-medium">Extras</h4>
                    <ul class="list-disc pl-5">
                        ${selectedExtras.map(extra => `<li>${extra}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add cost breakdown
        summaryHTML += `
                <div class="border-t border-gray-700 pt-4 mt-4">
                    <h4 class="text-yellow-400 font-medium">Cost Breakdown</h4>
                    <div class="flex justify-between">
                        <span>Base Rate (${duration >= 8 ? 'Daily' : 'Hourly'})</span>
                        <span>$${baseCost.toFixed(2)}</span>
                    </div>
                    ${extrasCost > 0 ? `
                    <div class="flex justify-between">
                        <span>Extras</span>
                        <span>$${extrasCost.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between font-bold text-yellow-400 mt-2 pt-2 border-t border-gray-700">
                        <span>Total</span>
                        <span>$${totalCost.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Update summary
        summaryDiv.innerHTML = summaryHTML;
    }
    
    // Form submission
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        // Check if user is logged in
        const isLoggedIn = false; // This would be determined by checking session/cookies
        
        if (!isLoggedIn) {
            e.preventDefault();
            
            // Show login prompt
            const confirmLogin = confirm('You need to be logged in to complete your booking. Would you like to log in now?');
            
            if (confirmLogin) {
                // Redirect to login page with return URL
                window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
            }
        }
    });
});