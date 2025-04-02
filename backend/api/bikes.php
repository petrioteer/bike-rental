<?php
require_once '../includes/config.php';

setApiHeaders();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getBike($_GET['id']);
        } else {
            getBikes();
        }
        break;
        
    case 'POST':
        $user = getAuthenticatedUser();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        addBike($data);
        break;
        
    case 'PUT':
        $user = getAuthenticatedUser();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }
        
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bike ID is required']);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        updateBike($_GET['id'], $data);
        break;
        
    case 'DELETE':
        $user = getAuthenticatedUser();
        if (!$user || $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }
        
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bike ID is required']);
            break;
        }
        
        deleteBike($_GET['id']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getBikes() {
    $bikes = readJsonFile(BIKES_FILE);
    
    // Filter by type if specified
    if (isset($_GET['type']) && $_GET['type']) {
        $bikes = array_filter($bikes, function($bike) {
            return $bike['type'] === $_GET['type'];
        });
    }
    
    // Filter by availability if specified
    if (isset($_GET['available']) && $_GET['available'] !== '') {
        $available = $_GET['available'] === 'true';
        $bikes = array_filter($bikes, function($bike) use ($available) {
            return $bike['available'] === $available;
        });
    }
    
    echo json_encode(['bikes' => array_values($bikes)]);
}

function getBike($id) {
    $bikes = readJsonFile(BIKES_FILE);
    
    foreach ($bikes as $bike) {
        if ($bike['id'] == $id) {
            echo json_encode(['bike' => $bike]);
            return;
        }
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'Bike not found']);
}

function addBike($data) {
    if (!isset($data['name']) || !isset($data['type']) || !isset($data['price_per_hour'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, type, and price_per_hour are required']);
        return;
    }
    
    $bikes = readJsonFile(BIKES_FILE);
    
    $newBike = [
        'id' => count($bikes) + 1,
        'name' => $data['name'],
        'type' => $data['type'],
        'price_per_hour' => $data['price_per_hour'],
        'description' => $data['description'] ?? '',
        'image' => $data['image'] ?? './assets/bikes/default.jpg',
        'available' => $data['available'] ?? true,
        'location' => $data['location'] ?? ['lat' => 40.7128, 'lng' => -74.0060],
        'features' => $data['features'] ?? []
    ];
    
    $bikes[] = $newBike;
    
    if (writeJsonFile(BIKES_FILE, $bikes)) {
        echo json_encode([
            'success' => true,
            'message' => 'Bike added successfully',
            'bike' => $newBike
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add bike']);
    }
}

function updateBike($id, $data) {
    $bikes = readJsonFile(BIKES_FILE);
    $updated = false;
    
    foreach ($bikes as &$bike) {
        if ($bike['id'] == $id) {
            // Update bike properties
            foreach ($data as $key => $value) {
                $bike[$key] = $value;
            }
            $updated = true;
            break;
        }
    }
    
    if (!$updated) {
        http_response_code(404);
        echo json_encode(['error' => 'Bike not found']);
        return;
    }
    
    if (writeJsonFile(BIKES_FILE, $bikes)) {
        echo json_encode([
            'success' => true,
            'message' => 'Bike updated successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update bike']);
    }
}

function deleteBike($id) {
    $bikes = readJsonFile(BIKES_FILE);
    $index = -1;
    
    foreach ($bikes as $i => $bike) {
        if ($bike['id'] == $id) {
            $index = $i;
            break;
        }
    }
    
    if ($index === -1) {
        http_response_code(404);
        echo json_encode(['error' => 'Bike not found']);
        return;
    }
    
    array_splice($bikes, $index, 1);
    
    if (writeJsonFile(BIKES_FILE, $bikes)) {
        echo json_encode([
            'success' => true,
            'message' => 'Bike deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete bike']);
    }
}
?>