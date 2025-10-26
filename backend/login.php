<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$input = json_decode(file_get_contents("php://input"), true);

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// Connect to MySQL
$conn = new mysqli("localhost", "root", "", "dbuser");

if ($conn->connect_error) {
    echo json_encode(["message" => "Database connection failed"]);
    exit();
}

// Query user
$stmt = $conn->prepare("SELECT * FROM tbuser WHERE name = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["message" => "Invalid username or password"]);
    exit();
}

$user = $result->fetch_assoc();

// Verify password (assuming password_hash in DB)
if (!password_verify($password, $user['password'])) {
    echo json_encode(["message" => "Invalid username or password"]);
    exit();
}

echo json_encode(["message" => "Login successful", "username" => $user['username']]);
$conn->close();
?>
