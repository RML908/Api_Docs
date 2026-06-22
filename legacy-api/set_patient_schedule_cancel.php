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


  if (isset($_POST['schedule_id'])) {$schedule_id = $_POST['schedule_id'];}
  if (isset($_POST['cancelled_by'])) {$cancelled_by = $_POST['cancelled_by'];}
  if (isset($_POST['cancelled_date'])) {$cancelled_date = $_POST['cancelled_date'];}


    if (empty($schedule_id) || empty($cancelled_by) || empty($cancelled_date)) {
    $check_key = array();
    $temp = array();
    $temp['status'] = '0';
    $temp['message'] = 'Parameters are incorrect, Something went wrong';

    http_response_code(403);
    array_push($check_key, $temp);

    echo json_encode($check_key, JSON_UNESCAPED_UNICODE);
    die();
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

   $Sql_Query = "UPDATE dst_patient_schedule SET cancelled_date = '$cancelled_date', cancelled_by = '$cancelled_by', status = 'Canceled' WHERE id = '$schedule_id'";

 	$dst_patient_schedule = array();
	header('Content-type: application/json');


	if(mysqli_query($conn,$Sql_Query))
	{

		$temp = array();
	    $temp['status'] = '1';
		$temp['message'] = 'Queue canceled successfully';
		$temp['schedule_id'] = $schedule_id;
	    array_push($dst_patient_schedule, $temp);
		echo json_encode($dst_patient_schedule,JSON_UNESCAPED_UNICODE);
	}
	else
	{
 		$temp = array();
	    $temp['status'] = '0';
		$temp['message'] = 'Something went wrong';
	    http_response_code(403);
	    array_push($dst_patient_schedule, $temp);
		echo json_encode($dst_patient_schedule,JSON_UNESCAPED_UNICODE);
	}

	$conn->close();

}
Else
{
	 	echo 'Access denied...';
    exit();
}
?>
