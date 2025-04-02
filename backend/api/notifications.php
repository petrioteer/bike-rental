<?php
require_once '../includes/config.php';

setApiHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['type'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Notification type is required']);
    exit;
}

switch ($data['type']) {
    case 'email':
        sendEmailNotification($data);
        break;
        
    case 'sms':
        sendSmsNotification($data);
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid notification type']);
}

function sendEmailNotification($data) {
    if (!isset($data['to']) || !isset($data['subject']) || !isset($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'To, subject, and message are required for email notifications']);
        return;
    }
    
    // In a real application, this would use a library like PHPMailer to send emails
    // For this local implementation, we'll just simulate sending an email
    
    // Log the email
    $emailLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'to' => $data['to'],
        'subject' => $data['subject'],
        'message' => $data['message']
    ];
    
    // Save to a log file
    $logFile = DATA_PATH . 'email_log.json';
    $logs = file_exists($logFile) ? json_decode(file_get_contents($logFile), true) : [];
    $logs[] = $emailLog;
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Email notification sent successfully (simulated)',
        'details' => $emailLog
    ]);
}

function sendSmsNotification($data) {
    if (!isset($data['to']) || !isset($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'To and message are required for SMS notifications']);
        return;
    }
    
    // In a real application, this would use a service like Twilio to send SMS
    // For this local implementation, we'll just simulate sending an SMS
    
    // Log the SMS
    $smsLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'to' => $data['to'],
        'message' => $data['message']
    ];
    
    // Save to a log file
    $logFile = DATA_PATH . 'sms_log.json';
    $logs = file_exists($logFile) ? json_decode(file_get_contents($logFile), true) : [];
    $logs[] = $smsLog;
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'SMS notification sent successfully (simulated)',
        'details' => $smsLog
    ]);
}
?>