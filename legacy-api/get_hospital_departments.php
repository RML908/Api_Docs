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

	$stmt = $conn->prepare("SELECT id, global_service_code, global_service, department_id, department_name_am, department_name_en, department_name_ru, department_specialization_id, department_specialization, is_tool, branch_id, branch_name, queuing, location, registration_location FROM structure_department_list WHERE visible = 1 AND medcard = 1");
	$stmt->execute();
	$stmt->bind_result($id, $global_service_code, $global_service, $department_id, $department_name_am, $department_name_en, $department_name_ru, $department_specialization_id, $department_specialization, $is_tool, $branch_id, $branch_name, $queuing, $location, $registration_location);

	$structure_department_list = array();

	header('Content-type: application/json');

	while($stmt->fetch()){
		$temp = array();
		$temp['id'] = $id;
		$temp['global_service_code'] = $global_service_code;
		$temp['global_service'] = $global_service;
		$temp['department_id'] = $department_id;
		$temp['department_name_am'] = $department_name_am;
		$temp['department_name_en'] = $department_name_en;
		$temp['department_name_ru'] = $department_name_ru;
		$temp['department_specialization_id'] = $department_specialization_id;
		$temp['department_specialization'] = $department_specialization;
		$temp['is_tool'] = $is_tool;
		$temp['branch_id'] = $branch_id;
		$temp['branch_name'] = $branch_name;
		$temp['queuing'] = $queuing;
		$temp['location'] = $location;
		$temp['registration_location'] = $registration_location;
	array_push($structure_department_list, $temp);
	}
	echo json_encode($structure_department_list,JSON_UNESCAPED_UNICODE);

	$conn->close();

}
Else
{
	echo 'Access denied...';
    exit();
}
?>
