<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

// collect data from frontend
$selectedNeeds = $input['selectedNeeds'] ?? '';

// validate fields

// connect to DB
$conn = new mysqli("localhost", "root", "", "dbuser");
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

// check if email already exists
$stmt = $conn->prepare("SELECT * FROM tbuser");
$stmt->execute();
$result = $stmt->get_result();


// insert new user
$stmt = $conn->prepare("INSERT INTO tbaccessbiltity (id,needs) VALUES (?, ?)");
$stmt->bind_param("sssss", $needs, $SelectedNeesd);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "User registered successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to register user"]);
}

$conn->close();
?>
