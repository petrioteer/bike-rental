<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    $_SESSION['error'] = "You must be logged in to make a booking";
    header("Location: ../login.html");
    exit();
}

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $user_id = $_SESSION['user_id'];
    $from = sanitize($_POST['from']);
    $from_lat = sanitize($_POST['from_lat']);
    $from_lng = sanitize($_POST['from_lng']);
    $to = sanitize($_POST['to']);
    $to_lat = sanitize($_POST['to_lat']);
    $to_lng = sanitize($_POST['to_lng']);
    $vehicle_type = sanitize($_POST['vehicle_type']);
    $vehicle_id = sanitize($_POST['vehicle_id']);
    $date = sanitize($_POST['date']);
    $time = sanitize($_POST['time']);
    $duration = sanitize($_POST['duration']);
    $extras = isset($_POST['extras']) ? $_POST['extras'] : [];
    
    // Validate input
    if (empty($from) || empty($to) || empty($vehicle_id) || empty($date) || empty($time) || empty($duration)) {
        $_SESSION['error'] = "All fields are required";
        header("Location: ../book.html");
        exit();
    }
    
    // Format start and end times
    $start_time = date('Y-m-d H:i:s', strtotime("$date $time"));
    $end_time = date('Y-m-d H:i:s', strtotime("$date $time + $duration hours"));
    
    try {
        // Check if vehicle is available for the requested time
        $stmt = $pdo->prepare("
            SELECT * FROM bookings 
            WHERE vehicle_id = :vehicle_id 
            AND status IN ('pending', 'confirmed', 'active') 
            AND (
                (start_time <= :start_time AND end_time >= :start_time) OR
                (start_time <= :end_time AND end_time >= :end_time) OR
                (start_time >= :start_time AND end_time <= :end_time)
            )
        ");
        
        $stmt->execute([
            ':vehicle_id' => $vehicle_id,
            ':start_time' => $start_time,
            ':end_time' => $end_time
        ]);
        
        if ($stmt->rowCount() > 0) {
            $_SESSION['error'] = "This vehicle is not available for the selected time period";
            header("Location: ../book.html");
            exit();
        }
        
        // Get vehicle details
        $stmt = $pdo->prepare("SELECT * FROM vehicles WHERE id = :id");
        $stmt->execute([':id' => $vehicle_id]);
        $vehicle = $stmt->fetch();
        
        if (!$vehicle) {
            $_SESSION['error'] = "Vehicle not found";
            header("Location: ../book.html");
            exit();
        }
        
        // Calculate base cost
        $base_cost = $vehicle['hourly_rate'] * $duration;
        
        // If duration is 8 hours or more, use daily rate
        if ($duration >= 8) {
            $base_cost = $vehicle['daily_rate'];
        }
        
        // Calculate extras cost
        $extras_cost = 0;
        $extras_list = [];
        
        foreach ($extras as $extra) {
            switch ($extra) {
                case 'helmet':
                    $extras_cost += 5;
                    $extras_list[] = 'Helmet';
                    break;
                case 'lock':
                    $extras_cost += 3;
                    $extras_list[] = 'Security Lock';
                    break;
                case 'basket':
                    $extras_cost += 2;
                    $extras_list[] = 'Basket';
                    break;
                case 'insurance':
                    $extras_cost += 10;
                    $extras_list[] = 'Insurance';
                    break;
            }
        }
        
        // Calculate total cost
        $total_amount = $base_cost + $extras_cost;
        
        // Begin transaction
        $pdo->beginTransaction();
        
        // Insert booking
        $stmt = $pdo->prepare("
            INSERT INTO bookings (
                user_id, vehicle_id, start_time, end_time, 
                pickup_location, dropoff_location, status, total_amount
            ) VALUES (
                :user_id, :vehicle_id, :start_time, :end_time, 
                :pickup_location, :dropoff_location, 'pending', :total_amount
            )
        ");
        
        $stmt->execute([
            ':user_id' => $user_id,
            ':vehicle_id' => $vehicle_id,
            ':start_time' => $start_time,
            ':end_time' => $end_time,
            ':pickup_location' => $from,
            ':dropoff_location' => $to,
            ':total_amount' => $total_amount
        ]);
        
        $booking_id = $pdo->lastInsertId();
        
        // Update vehicle status to 'rented' for the booking period
        $stmt = $pdo->prepare("UPDATE vehicles SET status = 'rented' WHERE id = :id");
        $stmt->execute([':id' => $vehicle_id]);
        
        // Store extras in a separate table or as JSON in the booking record
        if (!empty($extras_list)) {
            $extras_json = json_encode($extras_list);
            $stmt = $pdo->prepare("UPDATE bookings SET extras = :extras WHERE id = :id");
            $stmt->execute([
                ':extras' => $extras_json,
                ':id' => $booking_id
            ]);
        }
        
        // Commit transaction
        $pdo->commit();
        
        // Redirect to payment page
        $_SESSION['booking_id'] = $booking_id;
        header("Location: ../payment.php");
        exit();
    } catch (PDOException $e) {
        // Rollback transaction on error
        $pdo->rollBack();
        
        $_SESSION['error'] = "Database error: " . $e->getMessage();
        header("Location: ../book.html");
        exit();
    }
} else {
    // If not a POST request, redirect to booking page
    header("Location: ../book.html");
    exit();
}
?>