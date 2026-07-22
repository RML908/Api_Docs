<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: *");

if ($_SERVER["REQUEST_METHOD"] == "GET") {

  $headers = apache_request_headers();

  if(isset($headers['Authorization'])){
  $token = $headers['Authorization'];
  }

  	if ($token != 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MjkzMTk1MDAsImV4cCI6MTc2MDg1NTUwMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.73yulxFZZVxnx-Pi0q7VAlw4d2Q5phHZ3IJouKkvaG0') {
      	echo 'Access denied...';
  		exit();
    }

	$department_id = isset($_GET['department_id']) ? $_GET['department_id'] : '';

function getConnection() {
    $dbConfig = include('config.php');

    $connection = @new mysqli(
        $dbConfig['host'],
        $dbConfig['username'],
        $dbConfig['password'],
        $dbConfig['database']
    );


	if ($connection->connect_error) {
		http_response_code(403);
		echo 'The server is not available.';
  		exit();
}

	if (mysqli_connect_errno()) {
		http_response_code(403);
      	echo 'The server is not available...';
  		exit();
	}

    if (!$connection->set_charset("utf8")) {
		http_response_code(403);
      	echo 'Access denied...';
  		exit();
    }

		return $connection;
}

    $conn = getConnection();

	if ($department_id !== '') {
		$stmt = $conn->prepare("SELECT id, department_id, service_local_id, service_name, service_price FROM structure_hospital_services WHERE visible = 1 AND `enable` = 1 AND department_id = ?");
		$stmt->bind_param("i", $department_id);
	} else {
		$stmt = $conn->prepare("SELECT id, department_id, service_local_id, service_name, service_price FROM structure_hospital_services WHERE visible = 1 AND `enable` = 1");
	}
	$stmt->execute();
	$stmt->bind_result($id, $department_id, $service_local_id, $service_name, $service_price);

	$structure_hospital_services = array();

	header('Content-type: application/json');

	while($stmt->fetch()){
		$temp = array();
		$temp['id'] = $id;
		$temp['department_id'] = $department_id;
		$temp['service_local_id'] = $service_local_id;
		$temp['service_name'] = $service_name;
		$temp['service_price'] = $service_price;

	array_push($structure_hospital_services, $temp);
	}
	echo json_encode($structure_hospital_services,JSON_UNESCAPED_UNICODE);

	$conn->close();

}
Else
{
	echo 'Access denied...';
    exit();
}
?>
