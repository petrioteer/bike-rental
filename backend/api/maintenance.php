<?php
require_once '../includes/config.php';

setApiHeaders();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $user = getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            break;
        }
        
        if (isset($_GET['id'])) {
            getMaintenanceRequest($_GET['id'], $user);
        } else {
            getMaintenanceRequests($user);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        createMaintenanceRequest($data);
        break;
        
    case 'PUT':
        $user = getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            break;
        }
        
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Maintenance request ID is required']);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        updateMaintenanceRequest($_GET['id'], $data, $user);
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
            echo json_encode(['error' => 'Maintenance request ID is required']);
            break;
        }
        
        deleteMaintenanceRequest($_GET['id']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getMaintenanceRequests($user) {
    $requests = readJsonFile(MAINTENANCE_FILE);
    
    // Filter requests by user ID unless admin
    if ($user['role'] !== 'admin') {
        $requests = array_filter($requests, function($request) use ($user) {
            return $request['user_id'] == $user['userId'];
        });
    }
    
    // Filter by status if specified
    if (isset($_GET['status']) && $_GET['status']) {
        $requests = array_filter($requests, function($request) {
            return $request['status'] === $_GET['status'];
        });
    }
    
    echo json_encode(['maintenance_requests' => array_values($requests)]);
}

function getMaintenanceRequest($id, $user) {
    $requests = readJsonFile(MAINTENANCE_FILE);
    
    foreach ($requests as $request) {
        if ($request['id'] == $id) {
            // Check if user is authorized to view this request
            if ($user['role'] !== 'admin' && $request['user_id'] != $user['userId']) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
                return;
            }
            
            echo json_encode(['maintenance_request' => $request]);
            return;
        }
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'Maintenance request not found']);
}

function createMaintenanceRequest($data) {
    if (!isset($data['service_type']) || !isset($data['bike_details']) || 
        !isset($data['name']) || !isset($data['email']) || 
        !isset($data['phone']) || !isset($data['preferred_date'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required maintenance information']);
        return;
    }
    
    $requests = readJsonFile(MAINTENANCE_FILE);
    
    // Get user ID if authenticated
    $user = getAuthenticatedUser();
    $userId = $user ? $user['userId'] : null;
    
    // Calculate price based on service type
    $prices = [
        'basic_tune_up' => 39.99,
        'standard_service' => 79.99,
        'premium_service' => 129.99,
        'custom_service' => 99.99
    ];
    
    $price = $prices[$data['service_type']] ?? 99.99;
    
    // Create new maintenance request
    $newRequest = [
        'id' => count($requests) + 1,
        'user_id' => $userId,
        'service_type' => $data['service_type'],
        'bike_details' => $data['bike_details'],
        'name' => $data['name'],
        'email' => $data['email'],
        'phone' => $data['phone'],
        'preferred_date' => $data['preferred_date'],
        'preferred_time' => $data['preferred_time'] ?? 'morning',
        'special_instructions' => $data['special_instructions'] ?? '',
        'price' => $price,
        'status' => 'pending',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $requests[] = $newRequest;
    
    if (writeJsonFile(MAINTENANCE_FILE, $requests)) {
        // Send confirmation email (simulated)
        $confirmationId = 'MR-' . date('Ymd') . '-' . $newRequest['id'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Maintenance request created successfully',
            'maintenance_request' => $newRequest,
            'confirmation_id' => $confirmationId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create maintenance request']);
    }
}

function updateMaintenanceRequest($id, $data, $user) {
    $requests = readJsonFile(MAINTENANCE_FILE);
    $updated = false;
    
    foreach ($requests as &$request) {
        if ($request['id'] == $id) {
            // Check if user is authorized to update this request
            if ($user['role'] !== 'admin' && $request['user_id'] != $user['userId']) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
                return;
            }
            
            // Only allow updating certain fields
            $allowedFields = ['special_instructions'];
            
            if ($user['role'] === 'admin') {
                // Admins can update more fields
                $allowedFields = array_merge($allowedFields, ['status', 'preferred_date', 'preferred_time', 'price']);
            }
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $request[$field] = $data[$field];
                }
            }
            
            $updated = true;
            break;
        }
    }
    
    if (!$updated) {
        http_response_code(404);
        echo json_encode(['error' => 'Maintenance request not found']);
        return;
    }
    
    if (writeJsonFile(MAINTENANCE_FILE, $requests)) {
        echo json_encode([
            'success' => true,
            'message' => 'Maintenance request updated successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update maintenance request']);
    }
}

function deleteMaintenanceRequest($id) {
    $requests = readJsonFile(MAINTENANCE_FILE);
    $index = -1;
    
    foreach ($requests as $i => $request) {
        if ($request['id'] == $id) {
            $index = $i;
            break;
        }
    }
    
    if ($index === -1) {
        http_response_code(404);
        echo json_encode(['error' => 'Maintenance request not found']);
        return;
    }
    
    array_splice($requests, $index, 1);
    
    if (writeJsonFile(MAINTENANCE_FILE, $requests)) {
        echo json_encode([
            'success' => true,
            'message' => 'Maintenance request deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete maintenance request']);
    }
}
?>