<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "dbuser");

$name = $_GET['name'] ?? ''; // from URL ?name=Emylia

$sql = "SELECT tbBook.*, tbUser.phoneNum, tbUser.email 
        FROM tbBook 
        INNER JOIN tbUser ON tbBook.name = tbUser.name 
        WHERE tbBook.name = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $name);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
