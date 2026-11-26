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

	$doctor_ssn = isset($_GET['doctor_ssn']) ? $_GET['doctor_ssn'] : '';

function getConnection() {
    $dbConfig = include('config.php');

    $connection = @new mysqli(
        $dbConfig['host'],
        $dbConfig['username'],
        $dbConfig['password'],
        $dbConfig['database'],
        $dbConfig['port']
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

	if ($doctor_ssn !== '') {
		$stmt = $conn->prepare("SELECT id, doctor_id, doctor_ssn, days_of_the_week, work_start, work_end, break_start, break_duration, duration_of_admission, telemed_start, telemed_end, state_start, state_end, vip_start, vip_end FROM dst_doctors_work_schedule WHERE doctor_ssn = ?");
		$stmt->bind_param("s", $doctor_ssn);
	} else {
		$stmt = $conn->prepare("SELECT id, doctor_id, doctor_ssn, days_of_the_week, work_start, work_end, break_start, break_duration, duration_of_admission, telemed_start, telemed_end, state_start, state_end, vip_start, vip_end FROM dst_doctors_work_schedule");
	}
	$stmt->execute();
	$stmt->bind_result($id, $doctor_id, $doctor_ssn, $days_of_the_week, $work_start, $work_end, $break_start, $break_duration, $duration_of_admission, $telemed_start, $telemed_end, $state_start, $state_end, $vip_start, $vip_end);

	$dst_doctors_work_schedule = array();

	header('Content-type: application/json');

	while($stmt->fetch()){
		$temp = array();
		$temp['id'] = $id;
		$temp['doctor_id'] = strval($doctor_id);
		$temp['doctor_ssn'] = $doctor_ssn;
		$temp['days_of_the_week'] = $days_of_the_week;
		$temp['work_start'] = $work_start;
		$temp['work_end'] = $work_end;
		$temp['break_start'] = $break_start;
		$temp['break_duration'] = $break_duration;
		$temp['duration_of_admission'] = $duration_of_admission;
		$temp['telemed_start'] = $telemed_start;
		$temp['telemed_end'] = $telemed_end;
		$temp['state_start'] = $state_start;
		$temp['state_end'] = $state_end;
		$temp['vip_start'] = $vip_start;
		$temp['vip_end'] = $vip_end;

	array_push($dst_doctors_work_schedule, $temp);
	}
	echo json_encode($dst_doctors_work_schedule,JSON_UNESCAPED_UNICODE);

	$conn->close();

}
Else
{
	echo 'Access denied...';
    exit();
}
?>
