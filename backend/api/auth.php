<?php
require_once '../includes/config.php';

setApiHeaders();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action'])) {
            switch ($data['action']) {
                case 'login':
                    handleLogin($data);
                    break;
                case 'register':
                    handleRegister($data);
                    break;
                default:
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid action']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Action not specified']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function handleLogin($data) {
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }
    
    $users = readJsonFile(USERS_FILE);
    $user = null;
    
    foreach ($users as $u) {
        if ($u['email'] === $data['email']) {
            $user = $u;
            break;
        }
    }
    
    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }
    
    // Generate JWT token
    $token = generateJWT($user['id'], $user['username'], $user['role']);
    
    // Remove password from response
    unset($user['password']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);
}

function handleRegister($data) {
    if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username, email, and password are required']);
        return;
    }
    
    $users = readJsonFile(USERS_FILE);
    
    // Check if email already exists
    foreach ($users as $user) {
        if ($user['email'] === $data['email']) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists']);
            return;
        }
    }
    
    // Create new user
    $newUser = [
        'id' => count($users) + 1,
        'username' => $data['username'],
        'email' => $data['email'],
        'password' => password_hash($data['password'], PASSWORD_DEFAULT),
        'role' => 'user',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $users[] = $newUser;
    
    if (writeJsonFile(USERS_FILE, $users)) {
        // Generate JWT token
        $token = generateJWT($newUser['id'], $newUser['username'], $newUser['role']);
        
        // Remove password from response
        unset($newUser['password']);
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'token' => $token,
            'user' => $newUser
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to register user']);
    }
}
?>