<?php
session_start();
require_once '../config/database.php';

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $username = sanitize($_POST['username']);
    $phone = sanitize($_POST['phone']);
    $email = sanitize($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    
    // Validate input
    if (empty($username) || empty($phone) || empty($email) || empty($password) || empty($confirm_password)) {
        $_SESSION['error'] = "All fields are required";
        header("Location: ../signup.html");
        exit();
    }
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $_SESSION['error'] = "Invalid email format";
        header("Location: ../signup.html");
        exit();
    }
    
    // Check if passwords match
    if ($password !== $confirm_password) {
        $_SESSION['error'] = "Passwords do not match";
        header("Location: ../signup.html");
        exit();
    }
    
    // Check password strength
    if (strlen($password) < 8) {
        $_SESSION['error'] = "Password must be at least 8 characters long";
        header("Location: ../signup.html");
        exit();
    }
    
    try {
        // Check if username or email already exists
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username OR email = :email OR phone = :phone");
        $stmt->execute([
            ':username' => $username,
            ':email' => $email,
            ':phone' => $phone
        ]);
        
        if ($stmt->rowCount() > 0) {
            $_SESSION['error'] = "Username, email, or phone number already exists";
            header("Location: ../signup.html");
            exit();
        }
        
        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO users (username, phone, email, password) VALUES (:username, :phone, :email, :password)");
        $stmt->execute([
            ':username' => $username,
            ':phone' => $phone,
            ':email' => $email,
            ':password' => $hashed_password
        ]);
        
        $_SESSION['success'] = "Registration successful! You can now log in.";
        header("Location: ../login.html");
        exit();
    } catch (PDOException $e) {
        $_SESSION['error'] = "Database error: " . $e->getMessage();
        header("Location: ../signup.html");
        exit();
    }
} else {
    // If not a POST request, redirect to registration page
    header("Location: ../signup.html");
    exit();
}
?>