<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: *");

if ($_SERVER["REQUEST_METHOD"] == "POST") {

  $headers = apache_request_headers();

  if(isset($headers['Authorization'])){
  $token = $headers['Authorization'];
  }

  	if ($token != 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MjkzMTk1MDAsImV4cCI6MTc2MDg1NTUwMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.73yulxFZZVxnx-Pi0q7VAlw4d2Q5phHZ3IJouKkvaG0') {
      	echo 'Access denied...';
  		exit();
    }


  if (isset($_POST['doctor_ssn'])) {$doctor_ssn = $_POST['doctor_ssn'];}

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

	$stmt = $conn->prepare("SELECT id, doctor_ssn, block_start, block_end, 'block' as type FROM dst_doctors_blocked_time WHERE doctor_ssn = '$doctor_ssn' AND block_end > NOW() AND visible = 1 UNION ALL SELECT id, doctor_ssn, visit_date as block_start, visit_date_end as block_end, 'appointment' as type FROM dst_patient_schedule WHERE doctor_ssn = '$doctor_ssn' AND visit_date_end > NOW() AND completed_by = 0 AND cancelled_by = 0 AND visible = 1");
	$stmt->execute();
	$stmt->bind_result($id, $doctor_ssn, $block_start, $block_end, $type);

	$dst_doctors_blocked_time = array();

	header('Content-type: application/json');

	while($stmt->fetch()){
		$temp = array();
		$temp['id'] = $id;
		$temp['doctor_ssn'] = $doctor_ssn;
		$temp['block_start'] = $block_start;
		$temp['block_end'] = $block_end;
		$temp['type'] = $type;
	array_push($dst_doctors_blocked_time, $temp);
	}
	echo json_encode($dst_doctors_blocked_time,JSON_UNESCAPED_UNICODE);

	$conn->close();

}
Else
{
	echo 'Access denied...';
    exit();
}
?>
