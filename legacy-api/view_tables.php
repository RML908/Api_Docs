<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: *");
header('Content-type: application/json');

$headers = apache_request_headers();

if (isset($headers['Authorization'])) {
    $token = $headers['Authorization'];
}

if ($token != 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MjkzMTk1MDAsImV4cCI6MTc2MDg1NTUwMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.73yulxFZZVxnx-Pi0q7VAlw4d2Q5phHZ3IJouKkvaG0') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit();
}

$dbConfig = include('config.php');

$conn = @new mysqli(
    $dbConfig['host'],
    $dbConfig['username'],
    $dbConfig['password'],
    $dbConfig['database']
);

if ($conn->connect_error) {
    http_response_code(503);
    echo json_encode(['success' => false, 'message' => 'The server is not available.']);
    exit();
}

$tables = [
    'dst_patient_schedule',
    'dst_patient_schedule_sublist',
    'dst_doctors_blocked_time',
];

$result = [];
foreach ($tables as $table) {
    $rows = [];
    $res = $conn->query("SELECT * FROM `$table` ORDER BY id DESC LIMIT 200");
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $rows[] = $row;
        }
    }
    $result[$table] = $rows;
}

$conn->close();

echo json_encode(['success' => true, 'data' => $result], JSON_UNESCAPED_UNICODE);
