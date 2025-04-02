// ==================== GLOBAL VARIABLES ====================
let authToken;
let API_BASE_URL = 'http://localhost/api';

// ==================== INITIALIZATION ====================

// Add event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Set API base URL
    window.API_BASE_URL = API_BASE_URL;
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library is not loaded. Maps will not work.');
        
        // Add Leaflet CSS and JS dynamically if not present
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const leafletCSS = document.createElement('link');
            leafletCSS.rel = 'stylesheet';
            leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
            document.head.appendChild(leafletCSS);
        }
        
        if (!document.querySelector('script[src*="leaflet.js"]')) {
            const leafletJS = document.createElement('script');
            leafletJS.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
            leafletJS.onload = function() {
                // Initialize admin dashboard after Leaflet is loaded
                initializeAdmin();
            };
            document.head.appendChild(leafletJS);
        }
    } else {
        // Initialize admin dashboard
        initializeAdmin();
    }
});

// Main initialization function
function initializeAdmin() {
    // Check if user is logged in and has admin role
    authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    if (!authToken || userRole !== 'admin') {
        // Redirect to login page if not admin
        window.location.href = 'login.html';
        return;
    }

    // Set global auth token
    window.authToken = authToken;

    // Initialize tabs
    initTabs();

    // Initialize modals
    initModals();
    
    // Initialize maps
    initMaps();

    // Initialize search and filter functionality
    initSearchAndFilters();

    // Initialize notification form
    initNotificationForm();
    
    // Add event listeners for add buttons
    const addBikeBtn = document.getElementById('addBikeBtn');
    if (addBikeBtn) {
        addBikeBtn.addEventListener('click', function () {
            openBikeModal();
        });
    }

    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function () {
            openUserModal();
        });
    }

    // Add event listener for logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            // Clear local storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');

            // Redirect to login page
            window.location.href = 'login.html';
        });
    }

    // Load initial data based on active tab
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        loadTabContent(activeTab.getAttribute('data-tab'));
    } else {
        // Default to dashboard tab
        const dashboardTab = document.querySelector('.tab-btn[data-tab="dashboard"]');
        if (dashboardTab) {
            dashboardTab.classList.add('active');
            loadTabContent('dashboard');
        }
    }
}

// Initialize tabs
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Load tab content
            const tabId = this.getAttribute('data-tab');
            loadTabContent(tabId);
        });
    });
}

// Load tab content
function loadTabContent(tabId) {
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.style.display = 'none');

    // Show selected tab content
    const selectedContent = document.getElementById(`${tabId}Content`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }

    // Load data for the selected tab
    switch (tabId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'bikes':
            loadBikes();
            break;
        case 'users':
            loadUsers();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'maintenance':
            loadMaintenance();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'notifications':
            loadEmailLogs();
            loadSmsLogs();
            break;
    }
}

// Initialize modals
function initModals() {
    // Close modals when clicking outside
    window.addEventListener('click', function (event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Initialize maps
function initMaps() {
    // Check if map container exists
    const mapContainer = document.getElementById('bikeLocationsMap');
    if (mapContainer) {
        // Initialize the map
        const map = L.map('bikeLocationsMap').setView([51.505, -0.09], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Store map in global variable for later use
        window.bikeMap = map;
    }
}

// Initialize bike location map for the modal
function initBikeLocationMap(lat = 51.505, lng = -0.09) {
    const locationMapContainer = document.getElementById('bikeLocationMap');
    
    if (locationMapContainer) {
        // Clear previous map
        locationMapContainer.innerHTML = '';
        
        // Create new map
        const locationMap = L.map('bikeLocationMap').setView([lat, lng], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(locationMap);
        
        // Add marker
        const marker = L.marker([lat, lng], {
            draggable: true
        }).addTo(locationMap);
        
        // Update coordinates when marker is moved
        marker.on('dragend', function(event) {
            const position = marker.getLatLng();
            document.getElementById('bikeLatitude').value = position.lat;
            document.getElementById('bikeLongitude').value = position.lng;
        });
        
        // Update marker when coordinates are changed manually
        document.getElementById('bikeLatitude').addEventListener('change', updateMarkerPosition);
        document.getElementById('bikeLongitude').addEventListener('change', updateMarkerPosition);
        
        function updateMarkerPosition() {
            const lat = parseFloat(document.getElementById('bikeLatitude').value);
            const lng = parseFloat(document.getElementById('bikeLongitude').value);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                marker.setLatLng([lat, lng]);
                locationMap.setView([lat, lng], 13);
            }
        }
        
        // Store map in a variable for later use
        window.bikeLocationMap = locationMap;
    }
}

// Load bike locations on the map
function loadBikeLocations() {
    if (window.bikeMap && window.bikesData) {
        // Clear existing markers
        if (window.bikeMarkers) {
            window.bikeMarkers.forEach(marker => window.bikeMap.removeLayer(marker));
        }

        // Create new markers array
        window.bikeMarkers = [];

        // Add markers for each bike
        window.bikesData.forEach(bike => {
            if (bike.latitude && bike.longitude) {
                const marker = L.marker([bike.latitude, bike.longitude])
                    .addTo(window.bikeMap)
                    .bindPopup(`<b>${bike.name}</b><br>${formatBikeType(bike.type)}<br>$${bike.price_per_day}/day`);

                window.bikeMarkers.push(marker);
            }
        });

        // Adjust map view to fit all markers if there are any
        if (window.bikeMarkers.length > 0) {
            const group = new L.featureGroup(window.bikeMarkers);
            window.bikeMap.fitBounds(group.getBounds().pad(0.1));
        }
    }
}

// Initialize search and filters
function initSearchAndFilters() {
    // Bike search
    const bikeSearch = document.getElementById('bikeSearch');
    if (bikeSearch) {
        bikeSearch.addEventListener('input', filterBikes);
    }

    // User search
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', filterUsers);
    }

    // Booking search and filters
    const bookingSearch = document.getElementById('bookingSearch');
    const bookingStatusFilter = document.getElementById('bookingStatusFilter');
    if (bookingSearch) {
        bookingSearch.addEventListener('input', filterBookings);
    }
    if (bookingStatusFilter) {
        bookingStatusFilter.addEventListener('change', filterBookings);
    }

    // Maintenance search and filters
    const maintenanceSearch = document.getElementById('maintenanceSearch');
    const maintenanceStatusFilter = document.getElementById('maintenanceStatusFilter');
    if (maintenanceSearch) {
        maintenanceSearch.addEventListener('input', filterMaintenance);
    }
    if (maintenanceStatusFilter) {
        maintenanceStatusFilter.addEventListener('change', filterMaintenance);
    }

    // Review search and filters
    const reviewSearch = document.getElementById('reviewSearch');
    const reviewRatingFilter = document.getElementById('reviewRatingFilter');
    if (reviewSearch) {
        reviewSearch.addEventListener('input', filterReviews);
    }
    if (reviewRatingFilter) {
        reviewRatingFilter.addEventListener('change', filterReviews);
    }
}

// ==================== DASHBOARD MANAGEMENT ====================

// Load dashboard data
function loadDashboardData() {
    // Load summary data
    fetch(`${API_BASE_URL}/dashboard.php`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            // Update dashboard stats
            document.getElementById('totalBikes').textContent = data.total_bikes || 0;
            document.getElementById('totalUsers').textContent = data.total_users || 0;
            document.getElementById('totalBookings').textContent = data.total_bookings || 0;
            document.getElementById('totalRevenue').textContent = `$${(data.total_revenue || 0).toFixed(2)}`;

            // Update recent bookings
            const recentBookingsTable = document.getElementById('recentBookingsTable');
            if (recentBookingsTable && data.recent_bookings && data.recent_bookings.length > 0) {
                const tbody = recentBookingsTable.querySelector('tbody');
                let html = '';

                data.recent_bookings.forEach(booking => {
                    html += `
                    <tr>
                        <td>${booking.id}</td>
                        <td>${booking.user_id || 'Guest'}</td>
                        <td>${booking.bike_name}</td>
                        <td>${booking.date}</td>
                        <td>$${booking.total_price.toFixed(2)}</td>
                        <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                    </tr>
                `;
                });

                tbody.innerHTML = html;
            }

            // Update recent maintenance requests
            const recentMaintenanceTable = document.getElementById('recentMaintenanceTable');
            if (recentMaintenanceTable && data.recent_maintenance && data.recent_maintenance.length > 0) {
                const tbody = recentMaintenanceTable.querySelector('tbody');
                let html = '';

                data.recent_maintenance.forEach(request => {
                    html += `
                    <tr>
                        <td>${request.id}</td>
                        <td>${request.name}</td>
                        <td>${formatServiceType(request.service_type)}</td>
                        <td>${request.preferred_date}</td>
                        <td>$${request.price.toFixed(2)}</td>
                        <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                    </tr>
                `;
                });

                tbody.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
        });
}

// ==================== BIKE MANAGEMENT ====================

// Load bikes
function loadBikes() {
    fetch(`${API_BASE_URL}/bikes.php`)
        .then(response => response.json())
        .then(data => {
            const bikesTable = document.getElementById('bikesTable');
            if (bikesTable) {
                const tbody = bikesTable.querySelector('tbody');
                
                if (data.bikes && data.bikes.length > 0) {
                    // Store bikes in a global variable for filtering and map
                    window.bikesData = data.bikes;
                    
                    // Render bikes
                    renderBikes(data.bikes);
                    
                    // Update map with bike locations
                    loadBikeLocations();
                } else {
                    tbody.innerHTML = '<tr><td colspan="7">No bikes found.</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading bikes:', error);
            const bikesTable = document.getElementById('bikesTable');
            if (bikesTable) {
                const tbody = bikesTable.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="7">Error loading bikes.</td></tr>';
            }
        });
}

// Render bikes
function renderBikes(bikes) {
    const bikesTable = document.getElementById('bikesTable');
    if (bikesTable) {
        const tbody = bikesTable.querySelector('tbody');
        
        if (bikes.length > 0) {
            let html = '';
            
            bikes.forEach(bike => {
                html += `
                    <tr data-id="${bike.id}">
                        <td>${bike.id}</td>
                        <td>${bike.name}</td>
                        <td>${formatBikeType(bike.type)}</td>
                        <td>$${bike.price_per_day.toFixed(2)}</td>
                        <td>${bike.quantity}</td>
                        <td><span class="status-badge status-${bike.status}">${bike.status}</span></td>
                        <td>
                            <button class="action-btn edit-btn" data-id="${bike.id}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${bike.id}">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
            
            // Add event listeners to action buttons
            const editButtons = tbody.querySelectorAll('.edit-btn');
            const deleteButtons = tbody.querySelectorAll('.delete-btn');
            
            editButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const bikeId = this.getAttribute('data-id');
                    openBikeModal(bikeId);
                });
            });
            
            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const bikeId = this.getAttribute('data-id');
                    confirmDeleteBike(bikeId);
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7">No bikes found.</td></tr>';
        }
    }
}

// Filter bikes
function filterBikes() {
    const searchTerm = document.getElementById('bikeSearch').value.toLowerCase();
    
    if (window.bikesData) {
        const filteredBikes = window.bikesData.filter(bike => {
            return bike.id.toString().includes(searchTerm) ||
                bike.name.toLowerCase().includes(searchTerm) ||
                bike.type.toLowerCase().includes(searchTerm) ||
                bike.description.toLowerCase().includes(searchTerm);
        });
        
        renderBikes(filteredBikes);
    }
}

// Open bike modal for adding or editing
function openBikeModal(bikeId = null) {
    const modal = document.getElementById('bikeModal');
    const form = document.getElementById('bikeForm');
    const modalTitle = document.getElementById('bikeModalTitle');
    
    // Reset form
    form.reset();
    
    // Set modal title and button text
    if (bikeId) {
        modalTitle.textContent = 'Edit Bike';
        document.getElementById('saveBikeBtn').textContent = 'Update Bike';
        
        // Find bike data
        const bike = window.bikesData.find(b => b.id == bikeId);
        
        if (bike) {
            // Populate form with bike data
            document.getElementById('bikeId').value = bike.id;
            document.getElementById('bikeName').value = bike.name;
            document.getElementById('bikeType').value = bike.type;
            document.getElementById('bikeDescription').value = bike.description;
            document.getElementById('bikePrice').value = bike.price_per_day;
            document.getElementById('bikeQuantity').value = bike.quantity;
            document.getElementById('bikeStatus').value = bike.status;
            document.getElementById('bikeLatitude').value = bike.latitude || '';
            document.getElementById('bikeLongitude').value = bike.longitude || '';
            
            // Initialize location map if it exists
            initBikeLocationMap(bike.latitude, bike.longitude);
        }
    } else {
        modalTitle.textContent = 'Add New Bike';
        document.getElementById('saveBikeBtn').textContent = 'Add Bike';
        document.getElementById('bikeId').value = '';
        
        // Initialize location map with default coordinates
        initBikeLocationMap();
    }
    
    // Show modal
    modal.style.display = 'block';
    
    // Add event listeners to close buttons
    const closeButtons = modal.querySelectorAll('.close-modal, .cancel-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
    
    // Add event listener to form submission
    form.onsubmit = function(e) {
        e.preventDefault();
        saveBike();
    };
}

// Save bike (add or update)
function saveBike() {
    const bikeId = document.getElementById('bikeId').value;
    const method = bikeId ? 'PUT' : 'POST';
    const url = bikeId ? `${API_BASE_URL}/bikes.php?id=${bikeId}` : `${API_BASE_URL}/bikes.php`;
    
    // Get form data
    const bikeData = {
        name: document.getElementById('bikeName').value,
        type: document.getElementById('bikeType').value,
        description: document.getElementById('bikeDescription').value,
        price_per_day: parseFloat(document.getElementById('bikePrice').value),
        quantity: parseInt(document.getElementById('bikeQuantity').value),
        status: document.getElementById('bikeStatus').value,
        latitude: document.getElementById('bikeLatitude').value || null,
        longitude: document.getElementById('bikeLongitude').value || null
    };
    
    // Send request to API
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(bikeData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal
            document.getElementById('bikeModal').style.display = 'none';
            
            // Reload bikes
            loadBikes();
            
            // Show success message
            alert(bikeId ? 'Bike updated successfully!' : 'Bike added successfully!');
        } else {
            alert(`Error: ${data.error || 'Failed to save bike'}`);
        }
    })
    .catch(error => {
        console.error('Error saving bike:', error);
        alert('An error occurred while saving the bike.');
    });
}

// Confirm delete bike
function confirmDeleteBike(bikeId) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmNoBtn = document.getElementById('confirmNoBtn');
    
    // Set message
    confirmMessage.textContent = 'Are you sure you want to delete this bike? This action cannot be undone.';
    
    // Show modal
    confirmModal.style.display = 'block';
    
    // Add event listener to Yes button
    confirmYesBtn.onclick = function() {
        deleteBike(bikeId);
        confirmModal.style.display = 'none';
    };
    
    // Add event listener to No button
    confirmNoBtn.onclick = function() {
        confirmModal.style.display = 'none';
    };
    
    // Add event listener to close button
    const closeButton = confirmModal.querySelector('.close-modal');
    closeButton.onclick = function() {
        confirmModal.style.display = 'none';
    };
}

// Delete bike
function deleteBike(bikeId) {
    fetch(`${API_BASE_URL}/bikes.php?id=${bikeId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reload bikes
            loadBikes();
            
            // Show success message
            alert('Bike deleted successfully!');
        } else {
            alert(`Error: ${data.error || 'Failed to delete bike'}`);
        }
    })
    .catch(error => {
        console.error('Error deleting bike:', error);
        alert('An error occurred while deleting the bike.');
    });
}

// ==================== USER MANAGEMENT ====================

// Load users
function loadUsers() {
    fetch(`${API_BASE_URL}/users.php`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const usersTable = document.getElementById('usersTable');
        if (usersTable) {
            const tbody = usersTable.querySelector('tbody');
            
            if (data.users && data.users.length > 0) {
                // Store users in a global variable for filtering
                window.usersData = data.users;
                
                // Render users
                renderUsers(data.users);
            } else {
                tbody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
            }
        }
    })
    .catch(error => {
        console.error('Error loading users:', error);
        const usersTable = document.getElementById('usersTable');
        if (usersTable) {
            const tbody = usersTable.querySelector('tbody');
            tbody.innerHTML = '<tr><td colspan="6">Error loading users.</td></tr>';
        }
    });
}

// Render users
function renderUsers(users) {
    const usersTable = document.getElementById('usersTable');
    if (usersTable) {
        const tbody = usersTable.querySelector('tbody');
        
        if (users.length > 0) {
            let html = '';
            
            users.forEach(user => {
                html += `
                    <tr data-id="${user.id}">
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${formatDate(user.created_at)}</td>
                        <td>
                            <button class="action-btn edit-btn" data-id="${user.id}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${user.id}">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
            
            // Add event listeners to action buttons
            const editButtons = tbody.querySelectorAll('.edit-btn');
            const deleteButtons = tbody.querySelectorAll('.delete-btn');
            
            editButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    openUserModal(userId);
                });
            });
            
            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    confirmDeleteUser(userId);
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
        }
    }
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    
    if (window.usersData) {
        const filteredUsers = window.usersData.filter(user => {
            return user.id.toString().includes(searchTerm) ||
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.role.toLowerCase().includes(searchTerm);
        });
        
        renderUsers(filteredUsers);
    }
}

// Open user modal for adding or editing
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const modalTitle = document.getElementById('userModalTitle');
    const passwordField = document.getElementById('userPassword');
    const passwordLabel = document.querySelector('label[for="userPassword"]');
    
    // Reset form
    form.reset();
    
    // Set modal title and button text
    if (userId) {
        modalTitle.textContent = 'Edit User';
        document.getElementById('saveUserBtn').textContent = 'Update User';
        
        // Make password optional for editing
        passwordField.required = false;
        passwordLabel.textContent = 'Password (leave blank to keep current)';
        
        // Find user data
        const user = window.usersData.find(u => u.id == userId);
        
        if (user) {
            // Populate form with user data
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userPhone').value = user.phone || '';
            document.getElementById('userAddress').value = user.address || '';
        }
    } else {
        modalTitle.textContent = 'Add New User';
        document.getElementById('saveUserBtn').textContent = 'Add User';
        document.getElementById('userId').value = '';
        
        // Make password required for new users
        passwordField.required = true;
        passwordLabel.textContent = 'Password *';
    }
    
    // Show modal
    modal.style.display = 'block';
    
    // Add event listeners to close buttons
    const closeButtons = modal.querySelectorAll('.close-modal, .cancel-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
    
    // Add event listener to form submission
    form.onsubmit = function(e) {
        e.preventDefault();
        saveUser();
    };
}

// Save user (add or update)
function saveUser() {
    const userId = document.getElementById('userId').value;
    const method = userId ? 'PUT' : 'POST';
    const url = userId ? `${API_BASE_URL}/users.php?id=${userId}` : `${API_BASE_URL}/users.php`;
    
    // Get form data
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        phone: document.getElementById('userPhone').value,
        address: document.getElementById('userAddress').value
    };
    
    // Add password if provided
    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.password = password;
    }
    
    // Send request to API
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal
            document.getElementById('userModal').style.display = 'none';
            
            // Reload users
            loadUsers();
            
            // Show success message
            alert(userId ? 'User updated successfully!' : 'User added successfully!');
        } else {
            alert(`Error: ${data.error || 'Failed to save user'}`);
        }
    })
    .catch(error => {
        console.error('Error saving user:', error);
        alert('An error occurred while saving the user.');
    });
}

// Confirm delete user
function confirmDeleteUser(userId) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    const confirmNoBtn = document.getElementById('confirmNoBtn');
    
    // Set message
    confirmMessage.textContent = 'Are you sure you want to delete this user? This action cannot be undone.';
    
    // Show modal
    confirmModal.style.display = 'block';
    
    // Add event listener to Yes button
    confirmYesBtn.onclick = function() {
        deleteUser(userId);
        confirmModal.style.display = 'none';
    };
    
    // Add event listener to No button
    confirmNoBtn.onclick = function() {
        confirmModal.style.display = 'none';
    };
    
    // Add event listener to close button
    const closeButton = confirmModal.querySelector('.close-modal');
    closeButton.onclick = function() {
        confirmModal.style.display = 'none';
    };
}

// Delete user
function deleteUser(userId) {
    fetch(`${API_BASE_URL}/users.php?id=${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reload users
                loadUsers();
                
                // Show success message
                alert('User deleted successfully!');
            } else {
                alert(`Error: ${data.error || 'Failed to delete user'}`);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting the user.');
        });
    }
    
    // ==================== BOOKING MANAGEMENT ====================
    
    // Load bookings
    function loadBookings() {
        fetch(`${API_BASE_URL}/bookings.php`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const bookingsTable = document.getElementById('bookingsTable');
            if (bookingsTable) {
                const tbody = bookingsTable.querySelector('tbody');
                
                if (data.bookings && data.bookings.length > 0) {
                    // Store bookings in a global variable for filtering
                    window.bookingsData = data.bookings;
                    
                    // Render bookings
                    renderBookings(data.bookings);
                } else {
                    tbody.innerHTML = '<tr><td colspan="7">No bookings found.</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading bookings:', error);
            const bookingsTable = document.getElementById('bookingsTable');
            if (bookingsTable) {
                const tbody = bookingsTable.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="7">Error loading bookings.</td></tr>';
            }
        });
    }
    
    // Render bookings
    function renderBookings(bookings) {
        const bookingsTable = document.getElementById('bookingsTable');
        if (bookingsTable) {
            const tbody = bookingsTable.querySelector('tbody');
            
            if (bookings.length > 0) {
                let html = '';
                
                bookings.forEach(booking => {
                    html += `
                        <tr data-id="${booking.id}">
                            <td>${booking.id}</td>
                            <td>${booking.user_name || 'Guest'}</td>
                            <td>${booking.bike_name}</td>
                            <td>${booking.start_date} to ${booking.end_date}</td>
                            <td>$${booking.total_price.toFixed(2)}</td>
                            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                            <td>
                                <button class="action-btn edit-btn" data-id="${booking.id}">Edit</button>
                                <button class="action-btn delete-btn" data-id="${booking.id}">Delete</button>
                            </td>
                        </tr>
                    `;
                });
                
                tbody.innerHTML = html;
                
                // Add event listeners to action buttons
                const editButtons = tbody.querySelectorAll('.edit-btn');
                const deleteButtons = tbody.querySelectorAll('.delete-btn');
                
                editButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const bookingId = this.getAttribute('data-id');
                        openBookingModal(bookingId);
                    });
                });
                
                deleteButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const bookingId = this.getAttribute('data-id');
                        confirmDeleteBooking(bookingId);
                    });
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="7">No bookings found.</td></tr>';
            }
        }
    }
    
    // Filter bookings
    function filterBookings() {
        const searchTerm = document.getElementById('bookingSearch').value.toLowerCase();
        const statusFilter = document.getElementById('bookingStatusFilter').value;
        
        if (window.bookingsData) {
            const filteredBookings = window.bookingsData.filter(booking => {
                const matchesSearch = booking.id.toString().includes(searchTerm) ||
                    (booking.user_name && booking.user_name.toLowerCase().includes(searchTerm)) ||
                    booking.bike_name.toLowerCase().includes(searchTerm) ||
                    booking.start_date.includes(searchTerm) ||
                    booking.end_date.includes(searchTerm);
                    
                const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
                
                return matchesSearch && matchesStatus;
            });
            
            renderBookings(filteredBookings);
        }
    }
    
    // Open booking modal for editing
    function openBookingModal(bookingId) {
        const modal = document.getElementById('bookingModal');
        const form = document.getElementById('bookingForm');
        
        // Reset form
        form.reset();
        
        // Find booking data
        const booking = window.bookingsData.find(b => b.id == bookingId);
        
        if (booking) {
            // Populate form with booking data
            document.getElementById('bookingId').value = booking.id;
            document.getElementById('bookingStatus').value = booking.status;
            
            // Show modal
            modal.style.display = 'block';
            
            // Add event listeners to close buttons
            const closeButtons = modal.querySelectorAll('.close-modal, .cancel-btn');
            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            });
            
            // Add event listener to form submission
            form.onsubmit = function(e) {
                e.preventDefault();
                updateBookingStatus();
            };
        }
    }
    
    // Update booking status
    function updateBookingStatus() {
        const bookingId = document.getElementById('bookingId').value;
        const status = document.getElementById('bookingStatus').value;
        
        fetch(`${API_BASE_URL}/bookings.php?id=${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: status })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal
                document.getElementById('bookingModal').style.display = 'none';
                
                // Reload bookings
                loadBookings();
                
                // Show success message
                alert('Booking status updated successfully!');
            } else {
                alert(`Error: ${data.error || 'Failed to update booking status'}`);
            }
        })
        .catch(error => {
            console.error('Error updating booking status:', error);
            alert('An error occurred while updating the booking status.');
        });
    }
    
    // Confirm delete booking
    function confirmDeleteBooking(bookingId) {
        const confirmModal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');
        
        // Set message
        confirmMessage.textContent = 'Are you sure you want to delete this booking? This action cannot be undone.';
        
        // Show modal
        confirmModal.style.display = 'block';
        
        // Add event listener to Yes button
        confirmYesBtn.onclick = function() {
            deleteBooking(bookingId);
            confirmModal.style.display = 'none';
        };
        
        // Add event listener to No button
        confirmNoBtn.onclick = function() {
            confirmModal.style.display = 'none';
        };
        
        // Add event listener to close button
        const closeButton = confirmModal.querySelector('.close-modal');
        closeButton.onclick = function() {
            confirmModal.style.display = 'none';
        };
    }
    
    // Delete booking
    function deleteBooking(bookingId) {
        fetch(`${API_BASE_URL}/bookings.php?id=${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reload bookings
                loadBookings();
                
                // Show success message
                alert('Booking deleted successfully!');
            } else {
                alert(`Error: ${data.error || 'Failed to delete booking'}`);
            }
        })
        .catch(error => {
            console.error('Error deleting booking:', error);
            alert('An error occurred while deleting the booking.');
        });
    }
    
    // ==================== MAINTENANCE MANAGEMENT ====================
    
    // Load maintenance requests
    function loadMaintenance() {
        fetch(`${API_BASE_URL}/maintenance.php`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const maintenanceTable = document.getElementById('maintenanceTable');
            if (maintenanceTable) {
                const tbody = maintenanceTable.querySelector('tbody');
                
                if (data.maintenance && data.maintenance.length > 0) {
                    // Store maintenance requests in a global variable for filtering
                    window.maintenanceData = data.maintenance;
                    
                    // Render maintenance requests
                    renderMaintenance(data.maintenance);
                } else {
                    tbody.innerHTML = '<tr><td colspan="7">No maintenance requests found.</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading maintenance requests:', error);
            const maintenanceTable = document.getElementById('maintenanceTable');
            if (maintenanceTable) {
                const tbody = maintenanceTable.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="7">Error loading maintenance requests.</td></tr>';
            }
        });
    }
    
    // Render maintenance requests
    function renderMaintenance(maintenance) {
        const maintenanceTable = document.getElementById('maintenanceTable');
        if (maintenanceTable) {
            const tbody = maintenanceTable.querySelector('tbody');
            
            if (maintenance.length > 0) {
                let html = '';
                
                maintenance.forEach(request => {
                    html += `
                        <tr data-id="${request.id}">
                            <td>${request.id}</td>
                            <td>${request.name}</td>
                            <td>${request.email}</td>
                            <td>${formatServiceType(request.service_type)}</td>
                            <td>${request.preferred_date} (${formatTimeSlot(request.time_slot)})</td>
                            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                            <td>
                                <button class="action-btn view-btn" data-id="${request.id}">View</button>
                                <button class="action-btn edit-btn" data-id="${request.id}">Edit</button>
                            </td>
                        </tr>
                    `;
                });
                
                tbody.innerHTML = html;
                
                // Add event listeners to action buttons
                const viewButtons = tbody.querySelectorAll('.view-btn');
                const editButtons = tbody.querySelectorAll('.edit-btn');
                
                viewButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const requestId = this.getAttribute('data-id');
                        viewMaintenanceDetails(requestId);
                    });
                });
                
                editButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const requestId = this.getAttribute('data-id');
                        openMaintenanceModal(requestId);
                    });
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="7">No maintenance requests found.</td></tr>';
            }
        }
    }
    
    // Filter maintenance requests
    function filterMaintenance() {
        const searchTerm = document.getElementById('maintenanceSearch').value.toLowerCase();
        const statusFilter = document.getElementById('maintenanceStatusFilter').value;
        
        if (window.maintenanceData) {
            const filteredMaintenance = window.maintenanceData.filter(request => {
                const matchesSearch = request.id.toString().includes(searchTerm) ||
                    request.name.toLowerCase().includes(searchTerm) ||
                    request.email.toLowerCase().includes(searchTerm) ||
                    request.service_type.toLowerCase().includes(searchTerm) ||
                    request.preferred_date.includes(searchTerm);
                    
                const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
                
                return matchesSearch && matchesStatus;
            });
            
            renderMaintenance(filteredMaintenance);
        }
    }
    
    // View maintenance details
    function viewMaintenanceDetails(requestId) {
        const request = window.maintenanceData.find(r => r.id == requestId);
        
        if (request) {
            const modal = document.getElementById('maintenanceDetailsModal');
            const detailsContainer = document.getElementById('maintenanceDetails');
            
            // Format details
            let details = `
                <h3>Maintenance Request #${request.id}</h3>
                <div class="details-row">
                    <div class="details-label">Name:</div>
                    <div class="details-value">${request.name}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Email:</div>
                    <div class="details-value">${request.email}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Phone:</div>
                    <div class="details-value">${request.phone || 'N/A'}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Service Type:</div>
                    <div class="details-value">${formatServiceType(request.service_type)}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Bike Details:</div>
                    <div class="details-value">${request.bike_details || 'N/A'}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Preferred Date:</div>
                    <div class="details-value">${request.preferred_date}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Time Slot:</div>
                    <div class="details-value">${formatTimeSlot(request.time_slot)}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Message:</div>
                    <div class="details-value">${request.message || 'N/A'}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Status:</div>
                    <div class="details-value"><span class="status-badge status-${request.status}">${request.status}</span></div>
                </div>
                <div class="details-row">
                    <div class="details-label">Created At:</div>
                    <div class="details-value">${formatDate(request.created_at)}</div>
                </div>
            `;
            
            detailsContainer.innerHTML = details;
            
            // Show modal
            modal.style.display = 'block';
            
            // Add event listener to close button
            const closeButton = modal.querySelector('.close-modal');
            closeButton.onclick = function() {
                modal.style.display = 'none';
            };
        }
    }
    
    // Open maintenance modal for editing
    function openMaintenanceModal(requestId) {
        const modal = document.getElementById('maintenanceModal');
        const form = document.getElementById('maintenanceForm');
        
        // Reset form
        form.reset();
        
        // Find maintenance request data
        const request = window.maintenanceData.find(r => r.id == requestId);
        
        if (request) {
            // Populate form with request data
            document.getElementById('maintenanceId').value = request.id;
            document.getElementById('maintenanceStatus').value = request.status;
            document.getElementById('maintenanceNotes').value = request.admin_notes || '';
            document.getElementById('maintenancePrice').value = request.price || '';
            
            // Show modal
            modal.style.display = 'block';
            
            // Add event listeners to close buttons
            const closeButtons = modal.querySelectorAll('.close-modal, .cancel-btn');
            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            });
            
            // Add event listener to form submission
            form.onsubmit = function(e) {
                e.preventDefault();
                updateMaintenanceRequest();
            };
        }
    }
    
    // Update maintenance request
    function updateMaintenanceRequest() {
        const requestId = document.getElementById('maintenanceId').value;
        const status = document.getElementById('maintenanceStatus').value;
        const notes = document.getElementById('maintenanceNotes').value;
        const price = document.getElementById('maintenancePrice').value;
        
        fetch(`${API_BASE_URL}/maintenance.php?id=${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                status: status,
                admin_notes: notes,
                price: price
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal
                document.getElementById('maintenanceModal').style.display = 'none';
                
                // Reload maintenance requests
                loadMaintenance();
                
                // Show success message
                alert('Maintenance request updated successfully!');
            } else {
                alert(`Error: ${data.error || 'Failed to update maintenance request'}`);
            }
        })
        .catch(error => {
            console.error('Error updating maintenance request:', error);
            alert('An error occurred while updating the maintenance request.');
        });
    }
    
    // ==================== REVIEW MANAGEMENT ====================
    
    // Load reviews
    function loadReviews() {
        fetch(`${API_BASE_URL}/reviews.php`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const reviewsTable = document.getElementById('reviewsTable');
            if (reviewsTable) {
                const tbody = reviewsTable.querySelector('tbody');
                
                if (data.reviews && data.reviews.length > 0) {
                    // Store reviews in a global variable for filtering
                    window.reviewsData = data.reviews;
                    
                    // Render reviews
                    renderReviews(data.reviews);
                } else {
                    tbody.innerHTML = '<tr><td colspan="6">No reviews found.</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
            const reviewsTable = document.getElementById('reviewsTable');
            if (reviewsTable) {
                const tbody = reviewsTable.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="6">Error loading reviews.</td></tr>';
            }
        });
    }
    
    // Render reviews
    function renderReviews(reviews) {
        const reviewsTable = document.getElementById('reviewsTable');
        if (reviewsTable) {
            const tbody = reviewsTable.querySelector('tbody');
            
            if (reviews.length > 0) {
                let html = '';
                
                reviews.forEach(review => {
                    html += `
                        <tr data-id="${review.id}">
                            <td>${review.id}</td>
                            <td>${review.user_name || 'Anonymous'}</td>
                            <td>${review.bike_name || 'General'}</td>
                            <td>${renderStars(review.rating)}</td>
                            <td>${formatDate(review.created_at)}</td>
                            <td>
                                <button class="action-btn view-btn" data-id="${review.id}">View</button>
                                <button class="action-btn delete-btn" data-id="${review.id}">Delete</button>
                            </td>
                        </tr>
                    `;
                });
                
                tbody.innerHTML = html;
                
                // Add event listeners to action buttons
                const viewButtons = tbody.querySelectorAll('.view-btn');
                const deleteButtons = tbody.querySelectorAll('.delete-btn');
                
                viewButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const reviewId = this.getAttribute('data-id');
                        viewReviewDetails(reviewId);
                    });
                });
                
                deleteButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const reviewId = this.getAttribute('data-id');
                        confirmDeleteReview(reviewId);
                    });
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="6">No reviews found.</td></tr>';
            }
        }
    }
    
    // Render stars for rating
    function renderStars(rating) {
        const fullStar = '<span class="star full-star">★</span>';
        const emptyStar = '<span class="star empty-star">☆</span>';
        
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? fullStar : emptyStar;
        }
        
        return stars;
    }
    
    // Filter reviews
    function filterReviews() {
        const searchTerm = document.getElementById('reviewSearch').value.toLowerCase();
        const ratingFilter = document.getElementById('reviewRatingFilter').value;
        
        if (window.reviewsData) {
            const filteredReviews = window.reviewsData.filter(review => {
                const matchesSearch = review.id.toString().includes(searchTerm) ||
                    (review.user_name && review.user_name.toLowerCase().includes(searchTerm)) ||
                    (review.bike_name && review.bike_name.toLowerCase().includes(searchTerm)) ||
                    (review.comment && review.comment.toLowerCase().includes(searchTerm));
                    
                const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
                
                return matchesSearch && matchesRating;
            });
            
            renderReviews(filteredReviews);
        }
    }
    
    // View review details
    function viewReviewDetails(reviewId) {
        const review = window.reviewsData.find(r => r.id == reviewId);
        
        if (review) {
            const modal = document.getElementById('reviewDetailsModal');
            const detailsContainer = document.getElementById('reviewDetails');
            
            // Format details
            let details = `
                <h3>Review #${review.id}</h3>
                <div class="details-row">
                    <div class="details-label">User:</div>
                    <div class="details-value">${review.user_name || 'Anonymous'}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Bike:</div>
                    <div class="details-value">${review.bike_name || 'General'}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Rating:</div>
                    <div class="details-value">${renderStars(review.rating)} (${review.rating}/5)</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Comment:</div>
                    <div class="details-value">${review.comment || 'No comment provided.'}</div>
                </div>
                <div class="details-row">
                    <div class="details-label">Created At:</div>
                    <div class="details-value">${formatDate(review.created_at)}</div>
                </div>
            `;
            
            detailsContainer.innerHTML = details;
            
            // Show modal
            modal.style.display = 'block';
            
            // Add event listener to close button
            const closeButton = modal.querySelector('.close-modal');
            closeButton.onclick = function() {
                modal.style.display = 'none';
            };
        }
    }
    
    // Confirm delete review
    function confirmDeleteReview(reviewId) {
        const confirmModal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');
        
        // Set message
        confirmMessage.textContent = 'Are you sure you want to delete this review? This action cannot be undone.';
        
        // Show modal
        confirmModal.style.display = 'block';
        
        // Add event listener to Yes button
        confirmYesBtn.onclick = function() {
            deleteReview(reviewId);
            confirmModal.style.display = 'none';
        };
        
        // Add event listener to No button
        confirmNoBtn.onclick = function() {
            confirmModal.style.display = 'none';
        };
        
        // Add event listener to close button
        const closeButton = confirmModal.querySelector('.close-modal');
        closeButton.onclick = function() {
            confirmModal.style.display = 'none';
        };
    }
    
    // Delete review
    function deleteReview(reviewId) {
        fetch(`${API_BASE_URL}/reviews.php?id=${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reload reviews
                loadReviews();
                
                // Show success message
                alert('Review deleted successfully!');
            } else {
                alert(`Error: ${data.error || 'Failed to delete review'}`);
            }
        })
        .catch(error => {
            console.error('Error deleting review:', error);
            alert('An error occurred while deleting the review.');
        });
    }
    
    // ==================== NOTIFICATION MANAGEMENT ====================
    
    // Initialize notification form
    function initNotificationForm() {
        const notificationForm = document.getElementById('notificationForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                sendNotification();
            });
        }
    }
    
    // Send notification
    function sendNotification() {
        const notificationType = document.getElementById('notificationType').value;
        const notificationRecipients = document.getElementById('notificationRecipients').value;
        const notificationSubject = document.getElementById('notificationSubject').value;
        const notificationMessage = document.getElementById('notificationMessage').value;
        
        // Validate form
        if (!notificationSubject || !notificationMessage) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Prepare data
        const notificationData = {
            type: notificationType,
            recipients: notificationRecipients,
            subject: notificationSubject,
            message: notificationMessage
        };
        
        // Send request to API
        fetch(`${API_BASE_URL}/notifications.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(notificationData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reset form
                document.getElementById('notificationForm').reset();
                
                // Show success message
                alert('Notification sent successfully!');
                
                // Reload logs
                if (notificationType === 'email') {
                    loadEmailLogs();
                } else if (notificationType === 'sms') {
                    loadSmsLogs();
                }
            } else {
                alert(`Error: ${data.error || 'Failed to send notification'}`);
            }
        })
        .catch(error => {
            console.error('Error sending notification:', error);
            alert('An error occurred while sending the notification.');
        });
    }
    
    // Load email logs
    function loadEmailLogs() {
        fetch(`${API_BASE_URL}/notifications.php?type=email`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const emailLogsTable = document.getElementById('emailLogsTable');
            if (emailLogsTable) {
                const tbody = emailLogsTable.querySelector('tbody');
                
                if (data.logs && data.logs.length > 0) {
                    let html = '';
                    
                    data.logs.forEach(log => {
                        html += `
                            <tr>
                                <td>${log.id}</td>
                                <td>${log.recipient}</td>
                                <td>${log.subject}</td>
                                <td>${formatDate(log.sent_at)}</td>
                                <td><span class="status-badge status-${log.status}">${log.status}</span></td>
                            </tr>
                        `;
                    });
                    
                    tbody.innerHTML = html;
                } else {
                    tbody.innerHTML = '<tr><td colspan="5">No email logs found.</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading email logs:', error);
            const emailLogsTable = document.getElementById('emailLogsTable');
            if (emailLogsTable) {
                const tbody = emailLogsTable.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="5">Error loading email logs.</td></tr>';
            }
        });
    }
    
    // Load SMS logs
    function loadSmsLogs() {
        fetch(`${API_BASE_URL}/notifications.php?type=sms`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const smsLogsTable = document.getElementById('smsLogsTable');
            if (smsLogsTable) {
                const tbody = smsLogsTable.querySelector('tbody');
                
                if (data.logs && data.logs.length > 0) {
                    let html = '';
                    
                    data.logs.forEach(log => {
                        html += `
                            <tr>
                                <td>${log.id}</td>
                                <td>${log.recipient}</td>
                                <td>${log.message.substring(0, 50)}${log.message.length > 50 ? '...' : ''}</td>
                                <td>${formatDate(log.sent_at)}</td>
                                <td><span class="status-badge status-${log.status}">${log.status}</span></td>
                            </tr>
                        `;
                    });
                    
                    tbody.innerHTML = html;
                } else {
                    tbody.innerHTML = '<tr><td colspan="5">No SMS logs found.</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading SMS logs:', error);
            const smsLogsTable = document.getElementById('smsLogsTable');
            if (smsLogsTable) {
                const tbody = smsLogsTable.querySelector('tbody');
                tbody.innerHTML = '<tr><td colspan="5">Error loading SMS logs.</td></tr>';
            }
        });
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    // Format bike type
    function formatBikeType(type) {
        switch (type) {
                case 'road':
                    return 'Road Bike';
                case 'mountain':
                    return 'Mountain Bike';
                case 'hybrid':
                    return 'Hybrid Bike';
                case 'electric':
                    return 'Electric Bike';
                case 'city':
                    return 'City Bike';
                default:
                    return type.charAt(0).toUpperCase() + type.slice(1);
            }
        }
    
    // Format service type
    function formatServiceType(type) {
        switch (type) {
            case 'basic_tune':
                return 'Basic Tune-Up';
            case 'standard_tune':
                return 'Standard Tune-Up';
            case 'premium_tune':
                return 'Premium Tune-Up';
            case 'flat_repair':
                return 'Flat Repair';
            case 'brake_adjustment':
                return 'Brake Adjustment';
            case 'gear_adjustment':
                return 'Gear Adjustment';
            case 'wheel_truing':
                return 'Wheel Truing';
            case 'custom':
                return 'Custom Service';
            default:
                return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    }
    
    // Format time slot
    function formatTimeSlot(slot) {
        switch (slot) {
            case 'morning':
                return 'Morning (9am - 12pm)';
            case 'afternoon':
                return 'Afternoon (1pm - 4pm)';
            case 'evening':
                return 'Evening (5pm - 7pm)';
            default:
                return slot.charAt(0).toUpperCase() + slot.slice(1);
        }
    }
    
    // ==================== INITIALIZATION ====================
    
    // Initialize admin dashboard
    function initAdminDashboard() {
        // Check if user is logged in and has admin privileges
        checkAdminAuth();
        
        // Initialize tabs
        initTabs();
        
        // Initialize event listeners
        initEventListeners();
        
        // Initialize notification form
        initNotificationForm();
        
        // Load data for the active tab
        loadActiveTabData();
    }
    
    // Initialize tabs
    function initTabs() {
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get the tab ID
                const tabId = this.getAttribute('data-tab');
                
                // Remove active class from all tab links and contents
                tabLinks.forEach(link => link.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to current tab link and content
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                // Load data for the active tab
                loadTabData(tabId);
            });
        });
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Add user button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', function() {
                openUserModal();
            });
        }
        
        // User search
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', function() {
                filterUsers();
            });
        }
        
        // Booking search and filter
        const bookingSearch = document.getElementById('bookingSearch');
        const bookingStatusFilter = document.getElementById('bookingStatusFilter');
        if (bookingSearch) {
            bookingSearch.addEventListener('input', function() {
                filterBookings();
            });
        }
        if (bookingStatusFilter) {
            bookingStatusFilter.addEventListener('change', function() {
                filterBookings();
            });
        }
        
        // Maintenance search and filter
        const maintenanceSearch = document.getElementById('maintenanceSearch');
        const maintenanceStatusFilter = document.getElementById('maintenanceStatusFilter');
        if (maintenanceSearch) {
            maintenanceSearch.addEventListener('input', function() {
                filterMaintenance();
            });
        }
        if (maintenanceStatusFilter) {
            maintenanceStatusFilter.addEventListener('change', function() {
                filterMaintenance();
            });
        }
        
        // Review search and filter
        const reviewSearch = document.getElementById('reviewSearch');
        const reviewRatingFilter = document.getElementById('reviewRatingFilter');
        if (reviewSearch) {
            reviewSearch.addEventListener('input', function() {
                filterReviews();
            });
        }
        if (reviewRatingFilter) {
            reviewRatingFilter.addEventListener('change', function() {
                filterReviews();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                logout();
            });
        }
    }
    
    // Load data for the active tab
    function loadActiveTabData() {
        const activeTab = document.querySelector('.tab-link.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('data-tab');
            loadTabData(tabId);
        }
    }
    
    // Load data for a specific tab
    function loadTabData(tabId) {
        switch (tabId) {
            case 'usersTab':
                loadUsers();
                break;
            case 'bookingsTab':
                loadBookings();
                break;
            case 'maintenanceTab':
                loadMaintenance();
                break;
            case 'reviewsTab':
                loadReviews();
                break;
            case 'notificationsTab':
                loadEmailLogs();
                loadSmsLogs();
                break;
            case 'dashboardTab':
                loadDashboardStats();
                break;
        }
    }
    
    // Load dashboard statistics
    function loadDashboardStats() {
        fetch(`${API_BASE_URL}/dashboard.php`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update statistics
                document.getElementById('totalUsers').textContent = data.stats.total_users || 0;
                document.getElementById('totalBookings').textContent = data.stats.total_bookings || 0;
                document.getElementById('totalRevenue').textContent = `$${(data.stats.total_revenue || 0).toFixed(2)}`;
                document.getElementById('pendingBookings').textContent = data.stats.pending_bookings || 0;
                document.getElementById('pendingMaintenance').textContent = data.stats.pending_maintenance || 0;
                
                // Update recent activity
                const recentActivityList = document.getElementById('recentActivityList');
                if (recentActivityList && data.recent_activity && data.recent_activity.length > 0) {
                    let html = '';
                    
                    data.recent_activity.forEach(activity => {
                        html += `
                            <li class="activity-item">
                                <div class="activity-icon ${activity.type}">
                                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                                </div>
                                <div class="activity-details">
                                    <div class="activity-title">${activity.title}</div>
                                    <div class="activity-description">${activity.description}</div>
                                    <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
                                </div>
                            </li>
                        `;
                    });
                    
                    recentActivityList.innerHTML = html;
                }
            }
        })
        .catch(error => {
            console.error('Error loading dashboard stats:', error);
        });
    }
    
    // Get icon for activity type
    function getActivityIcon(type) {
        switch (type) {
            case 'booking':
                return 'fa-calendar-check';
            case 'user':
                return 'fa-user';
            case 'maintenance':
                return 'fa-tools';
            case 'review':
                return 'fa-star';
            case 'notification':
                return 'fa-bell';
            default:
                return 'fa-info-circle';
        }
    }
    
    // Format time ago
    function formatTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
        }
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
        }
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
        }
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
        }
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
        }
        
        return Math.floor(seconds) + ' second' + (seconds === 1 ? '' : 's') + ' ago';
    }
    
    // Logout
    function logout() {
        // Clear auth token
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
    
    // Initialize admin dashboard when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initAdminDashboard();
    });