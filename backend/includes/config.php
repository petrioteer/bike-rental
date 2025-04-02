<?php
// Database simulation using JSON files
define('DATA_PATH', __DIR__ . '/../data/');
define('USERS_FILE', DATA_PATH . 'users.json');
define('BIKES_FILE', DATA_PATH . 'bikes.json');
define('BOOKINGS_FILE', DATA_PATH . 'bookings.json');
define('REVIEWS_FILE', DATA_PATH . 'reviews.json');
define('MAINTENANCE_FILE', DATA_PATH . 'maintenance.json');

// JWT Secret (for local authentication)
define('JWT_SECRET', 'velo_rapido_local_secret_key');

// Initialize data files if they don't exist
function initDataFiles() {
    if (!file_exists(DATA_PATH)) {
        mkdir(DATA_PATH, 0755, true);
    }
    
    $files = [
        USERS_FILE => [
            [
                'id' => 1,
                'username' => 'admin',
                'email' => 'admin@velorapido.com',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'role' => 'admin',
                'created_at' => date('Y-m-d H:i:s')
            ],
            [
                'id' => 2,
                'username' => 'user',
                'email' => 'user@example.com',
                'password' => password_hash('user123', PASSWORD_DEFAULT),
                'role' => 'user',
                'created_at' => date('Y-m-d H:i:s')
            ]
        ],
        BIKES_FILE => [
            [
                'id' => 1,
                'name' => 'Trek FX 3 City Bike',
                'type' => 'city_bike',
                'price_per_hour' => 8,
                'description' => 'Comfortable city bike for urban exploration',
                'image' => './assets/bikes/city-bike-1.jpg',
                'available' => true,
                'location' => ['lat' => 40.7128, 'lng' => -74.0060],
                'features' => ['Lightweight frame', '24-speed', 'Front suspension']
            ],
            [
                'id' => 2,
                'name' => 'Specialized Rockhopper Mountain Bike',
                'type' => 'mountain_bike',
                'price_per_hour' => 12,
                'description' => 'Durable mountain bike for off-road adventures',
                'image' => './assets/bikes/mountain-bike-1.jpg',
                'available' => true,
                'location' => ['lat' => 40.7128, 'lng' => -74.0060],
                'features' => ['Full suspension', '27-speed', 'Hydraulic disc brakes']
            ],
            [
                'id' => 3,
                'name' => 'Cannondale Synapse Road Bike',
                'type' => 'road_bike',
                'price_per_hour' => 15,
                'description' => 'High-performance road bike for speed enthusiasts',
                'image' => './assets/bikes/road-bike-1.jpg',
                'available' => true,
                'location' => ['lat' => 40.7128, 'lng' => -74.0060],
                'features' => ['Carbon frame', '22-speed', 'Aerodynamic design']
            ],
            [
                'id' => 4,
                'name' => 'Rad Power RadCity Electric Bike',
                'type' => 'electric_bike',
                'price_per_hour' => 18,
                'description' => 'Powerful electric bike for effortless commuting',
                'image' => './assets/bikes/electric-bike-1.jpg',
                'available' => true,
                'location' => ['lat' => 40.7128, 'lng' => -74.0060],
                'features' => ['750W motor', '45-mile range', 'Pedal assist']
            ],
            [
                'id' => 5,
                'name' => 'Vespa Primavera Scooter',
                'type' => 'scooter',
                'price_per_hour' => 20,
                'description' => 'Classic Italian scooter for stylish urban travel',
                'image' => './assets/bikes/scooter-1.jpg',
                'available' => true,
                'location' => ['lat' => 40.7128, 'lng' => -74.0060],
                'features' => ['125cc engine', 'Automatic transmission', 'Under-seat storage']
            ]
        ],
        BOOKINGS_FILE => [],
        REVIEWS_FILE => [],
        MAINTENANCE_FILE => []
    ];
    
    foreach ($files as $file => $defaultData) {
        if (!file_exists($file)) {
            file_put_contents($file, json_encode($defaultData, JSON_PRETTY_PRINT));
        }
    }
}

// Initialize data files
initDataFiles();

// Helper functions for data manipulation
function readJsonFile($file) {
    if (!file_exists($file)) {
        return [];
    }
    $data = file_get_contents($file);
    return json_decode($data, true) ?: [];
}

function writeJsonFile($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    return true;
}

// Set headers for API responses
function setApiHeaders() {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Generate a simple JWT token
function generateJWT($userId, $username, $role) {
    $issuedAt = time();
    $expirationTime = $issuedAt + 3600; // Valid for 1 hour
    
    $payload = [
        'iat' => $issuedAt,
        'exp' => $expirationTime,
        'userId' => $userId,
        'username' => $username,
        'role' => $role
    ];
    
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode($payload));
    $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    
    return "$header.$payload.$signature";
}

// Verify JWT token
function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    $verifySignature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    
    if ($signature !== $verifySignature) {
        return false;
    }
    
    $payload = json_decode(base64_decode($payload), true);
    
    if ($payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

// Get authenticated user from JWT token
function getAuthenticatedUser() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    return verifyJWT($token);
}

// Check if user is admin
function isAdmin() {
    $user = getAuthenticatedUser();
    return $user && $user['role'] === 'admin';
}
?>