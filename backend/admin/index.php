<?php
require_once '../includes/config.php';

// Check if user is authenticated and is an admin
session_start();
$isLoggedIn = isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';

if (!$isLoggedIn) {
    header('Location: ../../login.html?redirect=admin');
    exit;
}

$user = $_SESSION['user'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Velo Rapido</title>
    <link rel="stylesheet" href="../../styles/admin.css">
</head>
<body>
    <div class="admin-container">
        <div class="admin-sidebar">
            <div class="admin-logo">
                <h2>Velo Rapido</h2>
                <p>Admin Panel</p>
            </div>
            
            <nav class="admin-nav">
                <ul>
                    <li class="active"><a href="#dashboard" data-section="dashboard">Dashboard</a></li>
                    <li><a href="#bookings" data-section="bookings">Bookings</a></li>
                    <li><a href="#bikes" data-section="bikes">Bikes</a></li>
                    <li><a href="#users" data-section="users">Users</a></li>
                    <li><a href="#maintenance" data-section="maintenance">Maintenance</a></li>
                    <li><a href="#reviews" data-section="reviews">Reviews</a></li>
                    <li><a href="#notifications" data-section="notifications">Notifications</a></li>
                </ul>
            </nav>
            
            <div class="admin-user">
                <div class="user-info">
                    <p class="user-name"><?php echo htmlspecialchars($user['username']); ?></p>
                    <p class="user-role">Administrator</p>
                </div>
                <a href="logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
        
        <div class="admin-content">
            <div class="admin-header">
                <h1 id="section-title">Dashboard</h1>
                <div class="header-actions">
                    <button id="refreshBtn" class="refresh-btn">Refresh Data</button>
                </div>
            </div>
            
            <div class="admin-sections">
                <!-- Dashboard Section -->
                <section id="dashboard" class="admin-section active">
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <h3>Total Bookings</h3>
                            <p class="stat-value" id="totalBookings">Loading...</p>
                        </div>
                        <div class="stat-card">
                            <h3>Active Bikes</h3>
                            <p class="stat-value" id="activeBikes">Loading...</p>
                        </div>
                        <div class="stat-card">
                            <h3>Total Users</h3>
                            <p class="stat-value" id="totalUsers">Loading...</p>
                        </div>
                        <div class="stat-card">
                            <h3>Pending Maintenance</h3>
                            <p class="stat-value" id="pendingMaintenance">Loading...</p>
                        </div>
                    </div>
                    
                    <div class="dashboard-charts">
                        <div class="chart-container">
                            <h3>Recent Bookings</h3>
                            <div class="recent-bookings" id="recentBookings">
                                <p>Loading recent bookings...</p>
                            </div>
                        </div>
                        <div class="chart-container">
                            <h3>Bike Availability</h3>
                            <div class="bike-availability" id="bikeAvailability">
                                <p>Loading bike availability...</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Bookings Section -->
                <section id="bookings" class="admin-section">
                    <div class="section-actions">
                        <div class="search-filter">
                            <input type="text" id="bookingSearch" placeholder="Search bookings...">
                            <select id="bookingStatusFilter">
                                <option value="">All Statuses</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="data-table-container">
                        <table class="data-table" id="bookingsTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Bike</th>
                                    <th>Date & Time</th>
                                    <th>Duration</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="8">Loading bookings...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <!-- Bikes Section -->
                <section id="bikes" class="admin-section">
                    <div class="section-actions">
                        <button id="addBikeBtn" class="action-btn">Add New Bike</button>
                        <div class="search-filter">
                            <input type="text" id="bikeSearch" placeholder="Search bikes...">
                            <select id="bikeTypeFilter">
                                <option value="">All Types</option>
                                <option value="city_bike">City Bike</option>
                                <option value="mountain_bike">Mountain Bike</option>
                                <option value="road_bike">Road Bike</option>
                                <option value="electric_bike">Electric Bike</option>
                                <option value="scooter">Scooter</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="data-table-container">
                        <table class="data-table" id="bikesTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Price/Hour</th>
                                    <th>Available</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="7">Loading bikes...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <!-- Users Section -->
                <section id="users" class="admin-section">
                    <div class="section-actions">
                        <button id="addUserBtn" class="action-btn">Add New User</button>
                        <div class="search-filter">
                            <input type="text" id="userSearch" placeholder="Search users...">
                        </div>
                    </div>
                    
                    <div class="data-table-container">
                        <table class="data-table" id="usersTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="6">Loading users...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <!-- Maintenance Section -->
                <section id="maintenance" class="admin-section">
                    <div class="section-actions">
                        <div class="search-filter">
                            <input type="text" id="maintenanceSearch" placeholder="Search maintenance requests...">
                            <select id="maintenanceStatusFilter">
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="data-table-container">
                        <table class="data-table" id="maintenanceTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Service Type</th>
                                    <th>Customer</th>
                                    <th>Preferred Date</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="7">Loading maintenance requests...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <!-- Reviews Section -->
                <section id="reviews" class="admin-section">
                    <div class="section-actions">
                        <div class="search-filter">
                            <input type="text" id="reviewSearch" placeholder="Search reviews...">
                            <select id="reviewRatingFilter">
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="data-table-container">
                        <table class="data-table" id="reviewsTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Bike</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="7">Loading reviews...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <!-- Notifications Section -->
                <section id="notifications" class="admin-section">
                    <div class="notification-tabs">
                        <button class="tab-btn active" data-tab="email">Email Logs</button>
                        <button class="tab-btn" data-tab="sms">SMS Logs</button>
                        <button class="tab-btn" data-tab="send">Send Notification</button>
                    </div>
                    
                    <div class="notification-content">
                        <div class="tab-content active" id="emailTab">
                            <div class="data-table-container">
                                <table class="data-table" id="emailTable">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Recipient</th>
                                            <th>Subject</th>
                                            <th>Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="4">Loading email logs...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="smsTab">
                            <div class="data-table-container">
                                <table class="data-table" id="smsTable">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Recipient</th>
                                            <th>Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="3">Loading SMS logs...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div class="tab-content" id="sendTab">
                            <div class="notification-form">
                                <h3>Send New Notification</h3>
                                <form id="sendNotificationForm">
                                    <div class="form-group">
                                        <label for="notificationType">Notification Type</label>
                                        <select id="notificationType" name="type" required>
                                            <option value="email">Email</option>
                                            <option value="sms">SMS</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="recipientType">Recipient Type</label>
                                        <select id="recipientType" name="recipientType" required>
                                            <option value="individual">Individual User</option>
                                            <option value="all">All Users</option>
                                            <option value="custom">Custom List</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group" id="individualRecipientGroup">
                                        <label for="recipientEmail">Recipient Email/Phone</label>
                                        <input type="text" id="recipientEmail" name="to" placeholder="Enter email or phone number">
                                    </div>
                                    
                                    <div class="form-group" id="customRecipientGroup" style="display: none;">
                                        <label for="customRecipients">Custom Recipients</label>
                                        <textarea id="customRecipients" name="customRecipients" placeholder="Enter emails or phone numbers, one per line"></textarea>
                                    </div>
                                    
                                    <div class="form-group email-only">
                                        <label for="emailSubject">Subject</label>
                                        <input type="text" id="emailSubject" name="subject" placeholder="Enter email subject">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="notificationMessage">Message</label>
                                        <textarea id="notificationMessage" name="message" placeholder="Enter your message" required></textarea>
                                    </div>
                                    
                                    <div class="form-actions">
                                        <button type="submit" class="submit-btn">Send Notification</button>
                                        <button type="reset" class="reset-btn">Reset</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
    
    <!-- Modal Templates -->
    <div class="modal" id="bikeModal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2 id="bikeModalTitle">Add New Bike</h2>
            <form id="bikeForm">
                <input type="hidden" id="bikeId" name="id">
                <div class="form-group">
                    <label for="bikeName">Bike Name</label>
                    <input type="text" id="bikeName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="bikeType">Type</label>
                    <select id="bikeType" name="type" required>
                        <option value="city_bike">City Bike</option>
                        <option value="mountain_bike">Mountain Bike</option>
                        <option value="road_bike">Road Bike</option>
                        <option value="electric_bike">Electric Bike</option>
                        <option value="scooter">Scooter</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="bikePrice">Price per Hour ($)</label>
                    <input type="number" id="bikePrice" name="price_per_hour" min="1" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="bikeDescription">Description</label>
                    <textarea id="bikeDescription" name="description"></textarea>
                </div>
                <div class="form-group">
                    <label for="bikeImage">Image URL</label>
                    <input type="text" id="bikeImage" name="image" placeholder="./assets/bikes/default.jpg">
                </div>
                <div class="form-group">
                    <label for="bikeAvailable">Available</label>
                    <select id="bikeAvailable" name="available">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="bikeFeatures">Features (comma separated)</label>
                    <input type="text" id="bikeFeatures" name="features" placeholder="Feature 1, Feature 2, Feature 3">
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Save Bike</button>
                    <button type="button" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="modal" id="userModal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2 id="userModalTitle">Add New User</h2>
            <form id="userForm">
                <input type="hidden" id="userId" name="id">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password">
                    <small>Leave blank to keep current password (for editing)</small>
                </div>
                <div class="form-group">
                    <label for="role">Role</label>
                    <select id="role" name="role" required>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Save User</button>
                    <button type="button" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    </div>
    
    <div class="modal" id="bookingModal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2 id="bookingModalTitle">Booking Details</h2>
            <div id="bookingDetails">
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value" id="bookingDetailId"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">User:</span>
                    <span class="detail-value" id="bookingDetailUser"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Bike:</span>
                    <span class="detail-value" id="bookingDetailBike"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date & Time:</span>
                    <span class="detail-value" id="bookingDetailDateTime"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value" id="bookingDetailDuration"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">From:</span>
                    <span class="detail-value" id="bookingDetailFrom"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">To:</span>
                    <span class="detail-value" id="bookingDetailTo"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Extras:</span>
                    <span class="detail-value" id="bookingDetailExtras"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value" id="bookingDetailTotal"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" id="bookingDetailStatus"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Created:</span>
                    <span class="detail-value" id="bookingDetailCreated"></span>
                </div>
            </div>
            <div class="form-group">
                <label for="bookingStatus">Update Status</label>
                <select id="bookingStatus">
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" id="updateBookingBtn" class="submit-btn">Update Status</button>
                <button type="button" class="cancel-btn">Close</button>
            </div>
        </div>
    </div>
    
    <div class="modal" id="maintenanceModal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2 id="maintenanceModalTitle">Maintenance Request Details</h2>
            <div id="maintenanceDetails">
                <div class="detail-row">
                    <span class="detail-label">Request ID:</span>
                    <span class="detail-value" id="maintenanceDetailId"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Service Type:</span>
                    <span class="detail-value" id="maintenanceDetailType"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Customer:</span>
                    <span class="detail-value" id="maintenanceDetailCustomer"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value" id="maintenanceDetailEmail"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value" id="maintenanceDetailPhone"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Bike Details:</span>
                    <span class="detail-value" id="maintenanceDetailBike"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Date:</span>
                    <span class="detail-value" id="maintenanceDetailDate"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Preferred Time:</span>
                    <span class="detail-value" id="maintenanceDetailTime"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Special Instructions:</span>
                    <span class="detail-value" id="maintenanceDetailInstructions"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price:</span>
                    <span class="detail-value" id="maintenanceDetailPrice"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" id="maintenanceDetailStatus"></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Created:</span>
                    <span class="detail-value" id="maintenanceDetailCreated"></span>
                </div>
            </div>
            <div class="form-group">
                <label for="maintenanceStatus">Update Status</label>
                <select id="maintenanceStatus">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" id="updateMaintenanceBtn" class="submit-btn">Update Status</button>
                <button type="button" class="cancel-btn">Close</button>
            </div>
        </div>
    </div>
    
    <div class="modal" id="confirmModal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Confirm Action</h2>
            <p id="confirmMessage">Are you sure you want to proceed with this action?</p>
            <div class="form-actions">
                <button type="button" id="confirmYesBtn" class="submit-btn">Yes</button>
                <button type="button" id="confirmNoBtn" class="cancel-btn">No</button>
            </div>
        </div>
    </div>
    
    <script src="../../scripts/admin.js"></script>
</body>
</html>