<?php
session_start();
require_once '../config/database.php';

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $username = sanitize($_POST['username']);
    $password = $_POST['password'];
    
    // Validate input
    if (empty($username) || empty($password)) {
        $_SESSION['error'] = "Username and password are required";
        header("Location: ../login.html");
        exit();
    }
    
    try {
        // Prepare SQL statement
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username OR phone = :phone");
        $stmt->execute([
            ':username' => $username,
            ':phone' => $username // Allow login with phone number too
        ]);
        
        $user = $stmt->fetch();
        
        // Check if user exists and verify password
        if ($user && password_verify($password, $user['password'])) {
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['logged_in'] = true;
            
            // Redirect based on role
            if ($user['role'] == 'admin') {
                header("Location: ../admin/dashboard.php");
            } else {
                header("Location: ../home.html");
            }
            exit();
        } else {
            $_SESSION['error'] = "Invalid username or password";
            header("Location: ../login.html");
            exit();
        }
    } catch (PDOException $e) {
        $_SESSION['error'] = "Database error: " . $e->getMessage();
        header("Location: ../login.html");
        exit();
    }
} else {
    // If not a POST request, redirect to login page
    header("Location: ../login.html");
    exit();
}
?>