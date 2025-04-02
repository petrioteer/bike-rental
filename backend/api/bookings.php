<?php
require_once '../includes/config.php';

setApiHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$user = getAuthenticatedUser();

if (!$user && $method !== 'POST') {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
    exit;
}

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getBooking($_GET['id'], $user);
        } else {
            getBookings($user);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        createBooking($data, $user);
        break;
        
    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Booking ID is required']);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        updateBooking($_GET['id'], $data, $user);
        break;
        
    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Booking ID is required']);
            break;
        }
        
        cancelBooking($_GET['id'], $user);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getBookings($user) {
    $bookings = readJsonFile(BOOKINGS_FILE);
    
    // Filter bookings by user ID unless admin
    if ($user['role'] !== 'admin') {
        $bookings = array_filter($bookings, function($booking) use ($user) {
            return $booking['user_id'] == $user['userId'];
        });
    }
    
    // Filter by status if specified
    if (isset($_GET['status']) && $_GET['status']) {
        $bookings = array_filter($bookings, function($booking) {
            return $booking['status'] === $_GET['status'];
        });
    }
    
    echo json_encode(['bookings' => array_values($bookings)]);
}

function getBooking($id, $user) {
    $bookings = readJsonFile(BOOKINGS_FILE);
    
    foreach ($bookings as $booking) {
        if ($booking['id'] == $id) {
            // Check if user is authorized to view this booking
            if ($user['role'] !== 'admin' && $booking['user_id'] != $user['userId']) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
                return;
            }
            
            echo json_encode(['booking' => $booking]);
            return;
        }
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'Booking not found']);
}

function createBooking($data, $user = null) {
    if (!isset($data['bike_id']) || !isset($data['from_location']) || 
        !isset($data['to_location']) || !isset($data['date']) || 
        !isset($data['time']) || !isset($data['duration'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required booking information']);
        return;
    }
    
    // Check if bike exists and is available
    $bikes = readJsonFile(BIKES_FILE);
    $bikeFound = false;
    $selectedBike = null;
    
    foreach ($bikes as &$bike) {
        if ($bike['id'] == $data['bike_id']) {
            $bikeFound = true;
            $selectedBike = $bike;
            
            if (!$bike['available']) {
                http_response_code(400);
                echo json_encode(['error' => 'Bike is not available']);
                return;
            }
            
            // Mark bike as unavailable
            $bike['available'] = false;
            break;
        }
    }
    
    if (!$bikeFound) {
        http_response_code(404);
        echo json_encode(['error' => 'Bike not found']);
        return;
    }
    
    // Calculate total price
    $pricePerHour = $selectedBike['price_per_hour'];
    $duration = intval($data['duration']);
    $basePrice = $pricePerHour * $duration;
    
    // Add extras cost
    $extrasPrice = 0;
    if (isset($data['extras']) && is_array($data['extras'])) {
        $extrasPrices = [
            'helmet' => 5,
            'lock' => 3,
            'basket' => 2,
            'insurance' => 10
        ];
        
        foreach ($data['extras'] as $extra) {
            if (isset($extrasPrices[$extra])) {
                $extrasPrice += $extrasPrices[$extra];
            }
        }
    }
    
    $subtotal = $basePrice + $extrasPrice;
    $tax = $subtotal * 0.08; // 8% tax
    $total = $subtotal + $tax;
    
    // Create booking
    $bookings = readJsonFile(BOOKINGS_FILE);
    
    $newBooking = [
        'id' => count($bookings) + 1,
        'user_id' => $user ? $user['userId'] : ($data['user_id'] ?? null),
        'bike_id' => $data['bike_id'],
        'bike_name' => $selectedBike['name'],
        'bike_type' => $selectedBike['type'],
        'from_location' => $data['from_location'],
        'to_location' => $data['to_location'],
        'date' => $data['date'],
        'time' => $data['time'],
        'duration' => $duration,
        'extras' => $data['extras'] ?? [],
        'base_price' => $basePrice,
        'extras_price' => $extrasPrice,
        'tax' => $tax,
        'total_price' => $total,
        'status' => 'confirmed',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $bookings[] = $newBooking;
    
    // Save updated bike availability
    writeJsonFile(BIKES_FILE, $bikes);
    
    if (writeJsonFile(BOOKINGS_FILE, $bookings)) {
        // Generate booking confirmation
        $confirmationId = 'VR-' . date('Ymd') . '-' . $newBooking['id'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Booking created successfully',
            'booking' => $newBooking,
            'confirmation_id' => $confirmationId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create booking']);
    }
}

function updateBooking($id, $data, $user) {
    $bookings = readJsonFile(BOOKINGS_FILE);
    $updated = false;
    
    foreach ($bookings as &$booking) {
        if ($booking['id'] == $id) {
            // Check if user is authorized to update this booking
            if ($user['role'] !== 'admin' && $booking['user_id'] != $user['userId']) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
                return;
            }
            
            // Only allow updating certain fields
            $allowedFields = ['status'];
            
            if ($user['role'] === 'admin') {
                // Admins can update more fields
                $allowedFields = array_merge($allowedFields, ['from_location', 'to_location', 'date', 'time', 'duration']);
            }
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $booking[$field] = $data[$field];
                }
            }
            
            $updated = true;
            break;
        }
    }
    
    if (!$updated) {
        http_response_code(404);
        echo json_encode(['error' => 'Booking not found']);
        return;
    }
    
    if (writeJsonFile(BOOKINGS_FILE, $bookings)) {
        echo json_encode([
            'success' => true,
            'message' => 'Booking updated successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update booking']);
    }
}

function cancelBooking($id, $user) {
    $bookings = readJsonFile(BOOKINGS_FILE);
    $bikes = readJsonFile(BIKES_FILE);
    $cancelled = false;
    $bikeId = null;
    
    foreach ($bookings as &$booking) {
        if ($booking['id'] == $id) {
            // Check if user is authorized to cancel this booking
            if ($user['role'] !== 'admin' && $booking['user_id'] != $user['userId']) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
                return;
            }
            
            // Check if booking can be cancelled
            if ($booking['status'] === 'completed' || $booking['status'] === 'cancelled') {
                http_response_code(400);
                echo json_encode(['error' => 'Booking cannot be cancelled']);
                return;
            }
            
            $booking['status'] = 'cancelled';
            $bikeId = $booking['bike_id'];
            $cancelled = true;
            break;
        }
    }
    
    if (!$cancelled) {
        http_response_code(404);
        echo json_encode(['error' => 'Booking not found']);
        return;
    }
    
    // Make bike available again
    if ($bikeId) {
        foreach ($bikes as &$bike) {
            if ($bike['id'] == $bikeId) {
                $bike['available'] = true;
                break;
            }
        }
        writeJsonFile(BIKES_FILE, $bikes);
    }
    
    if (writeJsonFile(BOOKINGS_FILE, $bookings)) {
        echo json_encode([
            'success' => true,
            'message' => 'Booking cancelled successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to cancel booking']);
    }
}
?>