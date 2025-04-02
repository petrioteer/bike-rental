<?php
require_once '../includes/config.php';

setApiHeaders();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['bike_id'])) {
            getReviewsByBike($_GET['bike_id']);
        } else if (isset($_GET['id'])) {
            getReview($_GET['id']);
        } else {
            getReviews();
        }
        break;
        
    case 'POST':
        $user = getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            break;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        addReview($data, $user);
        break;
        
    case 'DELETE':
        $user = getAuthenticatedUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            break;
        }
        
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Review ID is required']);
            break;
        }
        
        deleteReview($_GET['id'], $user);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function getReviews() {
    $reviews = readJsonFile(REVIEWS_FILE);
    echo json_encode(['reviews' => $reviews]);
}

function getReview($id) {
    $reviews = readJsonFile(REVIEWS_FILE);
    
    foreach ($reviews as $review) {
        if ($review['id'] == $id) {
            echo json_encode(['review' => $review]);
            return;
        }
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'Review not found']);
}

function getReviewsByBike($bikeId) {
    $reviews = readJsonFile(REVIEWS_FILE);
    
    $bikeReviews = array_filter($reviews, function($review) use ($bikeId) {
        return $review['bike_id'] == $bikeId;
    });
    
    echo json_encode(['reviews' => array_values($bikeReviews)]);
}

function addReview($data, $user) {
    if (!isset($data['bike_id']) || !isset($data['rating']) || !isset($data['comment'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Bike ID, rating, and comment are required']);
        return;
    }
    
    // Validate rating
    $rating = intval($data['rating']);
    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'Rating must be between 1 and 5']);
        return;
    }
    
    // Check if bike exists
    $bikes = readJsonFile(BIKES_FILE);
    $bikeExists = false;
    
    foreach ($bikes as $bike) {
        if ($bike['id'] == $data['bike_id']) {
            $bikeExists = true;
            break;
        }
    }
    
    if (!$bikeExists) {
        http_response_code(404);
        echo json_encode(['error' => 'Bike not found']);
        return;
    }
    
    // Check if user has booked this bike before
    $bookings = readJsonFile(BOOKINGS_FILE);
    $hasBooked = false;
    
    foreach ($bookings as $booking) {
        if ($booking['user_id'] == $user['userId'] && $booking['bike_id'] == $data['bike_id'] && $booking['status'] === 'completed') {
            $hasBooked = true;
            break;
        }
    }
    
    // Skip booking check for admins
    if ($user['role'] !== 'admin' && !$hasBooked) {
        http_response_code(403);
        echo json_encode(['error' => 'You can only review bikes you have rented']);
        return;
    }
    
    // Check if user has already reviewed this bike
    $reviews = readJsonFile(REVIEWS_FILE);
    
    foreach ($reviews as $review) {
        if ($review['user_id'] == $user['userId'] && $review['bike_id'] == $data['bike_id']) {
            http_response_code(409);
            echo json_encode(['error' => 'You have already reviewed this bike']);
            return;
        }
    }
    
    // Create new review
    $newReview = [
        'id' => count($reviews) + 1,
        'user_id' => $user['userId'],
        'username' => $user['username'],
        'bike_id' => $data['bike_id'],
        'rating' => $rating,
        'comment' => $data['comment'],
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $reviews[] = $newReview;
    
    if (writeJsonFile(REVIEWS_FILE, $reviews)) {
        echo json_encode([
            'success' => true,
            'message' => 'Review added successfully',
            'review' => $newReview
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add review']);
    }
}

function deleteReview($id, $user) {
    $reviews = readJsonFile(REVIEWS_FILE);
    $index = -1;
    
    foreach ($reviews as $i => $review) {
        if ($review['id'] == $id) {
            // Check if user is authorized to delete this review
            if ($user['role'] !== 'admin' && $review['user_id'] != $user['userId']) {
                http_response_code(403);
                echo json_encode(['error' => 'Unauthorized']);
                return;
            }
            
            $index = $i;
            break;
        }
    }
    
    if ($index === -1) {
        http_response_code(404);
        echo json_encode(['error' => 'Review not found']);
        return;
    }
    
    array_splice($reviews, $index, 1);
    
    if (writeJsonFile(REVIEWS_FILE, $reviews)) {
        echo json_encode([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete review']);
    }
}
?>