document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const fleetGrid = document.getElementById('fleetGrid');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortBy = document.getElementById('sort-by');
    
    // Fleet data - in a real application, this would be fetched from the server
    const fleetData = [
        {
            id: 1,
            name: 'Vespa Primavera',
            category: 'scooter',
            categoryName: 'Scooter',
            model: 'Primavera',
            color: 'White',
            year: 2022,
            hourlyRate: 15,
            dailyRate: 75,
            weeklyRate: 450,
            image: './assets/fleet/vespa-primavera.jpg',
            description: 'Classic Italian scooter with modern features. Perfect for city exploration.',
            features: ['125cc Engine', 'Automatic Transmission', 'USB Charging Port', 'Under-seat Storage']
        },
        {
            id: 2,
            name: 'Honda Activa',
            category: 'scooter',
            categoryName: 'Scooter',
            model: 'Activa',
            color: 'Blue',
            year: 2021,
            hourlyRate: 12,
            dailyRate: 60,
            weeklyRate: 360,
            image: './assets/fleet/honda-activa.jpg',
            description: 'Reliable and fuel-efficient scooter for comfortable city rides.',
            features: ['110cc Engine', 'Automatic Transmission', 'Eco Mode', 'Large Storage Space']
        },
        {
            id: 3,
            name: 'Yamaha Fascino',
            category: 'scooter',
            categoryName: 'Scooter',
            model: 'Fascino',
            color: 'Red',
            year: 2022,
            hourlyRate: 13,
            dailyRate: 65,
            weeklyRate: 390,
            image: './assets/fleet/yamaha-fascino.jpg',
            description: 'Stylish scooter with excellent handling and fuel efficiency.',
            features: ['113cc Engine', 'Automatic Transmission', 'LED Headlights', 'Disc Brakes']
        },
        {
            id: 4,
            name: 'Trek Verve+ 2',
            category: 'electric_bike',
            categoryName: 'Electric Bike',
            model: 'Verve+ 2',
            color: 'Black',
            year: 2022,
            hourlyRate: 18,
            dailyRate: 90,
            weeklyRate: 540,
            image: './assets/fleet/trek-verve.jpg',
            description: 'Comfortable electric bike with a powerful motor for effortless rides.',
            features: ['Bosch Active Line Motor', '400Wh Battery', 'Range: 40-80 miles', 'Hydraulic Disc Brakes']
        },
        {
            id: 5,
            name: 'Specialized Turbo Vado',
            category: 'electric_bike',
            categoryName: 'Electric Bike',
            model: 'Turbo Vado',
            color: 'Green',
            year: 2021,
            hourlyRate: 20,
            dailyRate: 100,
            weeklyRate: 600,
            image: './assets/fleet/specialized-vado.jpg',
            description: 'Premium electric bike with long battery life and smooth ride quality.',
            features: ['Specialized 1.2 Motor', '500Wh Battery', 'Range: 50-90 miles', 'Integrated Lights']
        },
        {
            id: 6,
            name: 'Trek FX 3',
            category: 'city_bike',
            categoryName: 'City Bike',
            model: 'FX 3',
            color: 'Black',
            year: 2022,
            hourlyRate: 8,
            dailyRate: 40,
            weeklyRate: 240,
            image: './assets/fleet/trek-fx3.jpg',
            description: 'Versatile hybrid bike perfect for city commuting and fitness rides.',
            features: ['Alpha Gold Aluminum Frame', 'Carbon Fork', '9-speed Shimano Drivetrain', 'Hydraulic Disc Brakes']
        },
        {
            id: 7,
            name: 'Specialized Sirrus',
            category: 'city_bike',
            categoryName: 'City Bike',
            model: 'Sirrus',
            color: 'Silver',
            year: 2021,
            hourlyRate: 9,
            dailyRate: 45,
            weeklyRate: 270,
            image: './assets/fleet/specialized-sirrus.jpg',
            description: 'Comfortable and efficient city bike for daily commuting.',
            features: ['A1 Aluminum Frame', 'Steel Fork', '8-speed Shimano Drivetrain', 'V-Brakes']
        },
        {
            id: 8,
            name: 'Trek Marlin 7',
            category: 'mountain_bike',
            categoryName: 'Mountain Bike',
            model: 'Marlin 7',
            color: 'Red',
            year: 2022,
            hourlyRate: 10,
            dailyRate: 50,
            weeklyRate: 300,
            image: './assets/fleet/trek-marlin.jpg',
            description: 'Versatile mountain bike for trail riding and off-road adventures.',
            features: ['Alpha Silver Aluminum Frame', 'RockShox XC30 Fork', '10-speed Shimano Deore', 'Hydraulic Disc Brakes']
        },
        {
            id: 9,
            name: 'Specialized Rockhopper',
            category: 'mountain_bike',
            categoryName: 'Mountain Bike',
            model: 'Rockhopper',
            color: 'Blue',
            year: 2021,
            hourlyRate: 11,
            dailyRate: 55,
            weeklyRate: 330,
            image: './assets/fleet/specialized-rockhopper.jpg',
            description: 'Reliable mountain bike for beginners and intermediate riders.',
            features: ['A1 Aluminum Frame', 'SR Suntour XCM Fork', '9-speed Shimano Altus', 'Hydraulic Disc Brakes']
        },
        {
            id: 10,
            name: 'Trek Domane AL 3',
            category: 'road_bike',
            categoryName: 'Road Bike',
            model: 'Domane AL 3',
            color: 'White',
            year: 2022,
            hourlyRate: 12,
            dailyRate: 60,
            weeklyRate: 360,
            image: './assets/fleet/trek-domane.jpg',
            description: 'Endurance road bike for comfortable long-distance rides.',
            features: ['Alpha Aluminum Frame', 'Carbon Fork', '9-speed Shimano Sora', 'Endurance Geometry']
        },
        {
            id: 11,
            name: 'Specialized Allez',
            category: 'road_bike',
            categoryName: 'Road Bike',
            model: 'Allez',
            color: 'Black',
            year: 2021,
            hourlyRate: 13,
            dailyRate: 65,
            weeklyRate: 390,
            image: './assets/fleet/specialized-allez.jpg',
            description: 'Entry-level road bike with responsive handling and comfortable ride.',
            features: ['E5 Aluminum Frame', 'Carbon Fork', '8-speed Shimano Claris', 'Dual-pivot Brakes']
        }
    ];
    
    // Initialize fleet display
    displayFleet(fleetData);
    
    // Add event listeners for filters
    categoryFilter.addEventListener('change', filterFleet);
    priceFilter.addEventListener('change', filterFleet);
    sortBy.addEventListener('change', filterFleet);
    
    // Function to display fleet items
    function displayFleet(items) {
        // Clear loading spinner
        fleetGrid.innerHTML = '';
        
        if (items.length === 0) {
            fleetGrid.innerHTML = '<div class="no-results">No vehicles match your filters. Please try different criteria.</div>';
            return;
        }
        
        // Create HTML for each item
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'fleet-item';
            itemElement.innerHTML = `
                <div class="fleet-card">
                    <div class="fleet-image">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="fleet-category">${item.categoryName}</div>
                    </div>
                    <div class="fleet-details">
                        <h3 class="fleet-name">${item.name}</h3>
                        <div class="fleet-specs">
                            <span class="spec"><i class="fas fa-palette"></i> ${item.color}</span>
                            <span class="spec"><i class="fas fa-calendar"></i> ${item.year}</span>
                        </div>
                        <p class="fleet-description">${item.description}</p>
                        <div class="fleet-features">
                            <h4>Features:</h4>
                            <ul>
                                ${item.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="fleet-pricing">
                            <div class="price-item">
                                <span class="price-label">Hourly</span>
                                <span class="price-value">$${item.hourlyRate}</span>
                            </div>
                            <div class="price-item">
                                <span class="price-label">Daily</span>
                                <span class="price-value">$${item.dailyRate}</span>
                            </div>
                            <div class="price-item">
                                <span class="price-label">Weekly</span>
                                <span class="price-value">$${item.weeklyRate}</span>
                            </div>
                        </div>
                        <div class="fleet-actions">
                            <a href="book.html?vehicle=${item.id}" class="book-btn">Book Now</a>
                            <a href="vehicle-details.html?id=${item.id}" class="details-btn">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            fleetGrid.appendChild(itemElement);
        });
    }
    
    // Function to filter and sort fleet
    function filterFleet() {
        const categoryValue = categoryFilter.value;
        const priceValue = priceFilter.value;
        const sortValue = sortBy.value;
        
        // Filter by category
        let filteredFleet = fleetData;
        if (categoryValue !== 'all') {
            filteredFleet = filteredFleet.filter(item => item.category === categoryValue);
        }
        
        // Filter by price
        if (priceValue !== 'all') {
            switch (priceValue) {
                case 'low':
                    filteredFleet = filteredFleet.filter(item => item.hourlyRate < 10);
                    break;
                case 'medium':
                    filteredFleet = filteredFleet.filter(item => item.hourlyRate >= 10 && item.hourlyRate < 15);
                    break;
                case 'high':
                    filteredFleet = filteredFleet.filter(item => item.hourlyRate >= 15);
                    break;
            }
        }
        
        // Sort fleet
        switch (sortValue) {
            case 'name':
                filteredFleet.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price_low':
                filteredFleet.sort((a, b) => a.hourlyRate - b.hourlyRate);
                break;
            case 'price_high':
                filteredFleet.sort((a, b) => b.hourlyRate - a.hourlyRate);
                break;
            case 'newest':
                filteredFleet.sort((a, b) => b.year - a.year);
                break;
        }
        
        // Display filtered and sorted fleet
        displayFleet(filteredFleet);
    }
});