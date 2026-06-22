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

 	$doctor_id = isset($_GET['doctor_id']) ? $_GET['doctor_id'] : '';
 	$doctor_ssn = isset($_GET['doctor_ssn']) ? $_GET['doctor_ssn'] : '';
 	$block_start = isset($_GET['block_start']) ? $_GET['block_start'] : '';
 	$block_end = isset($_GET['block_end']) ? $_GET['block_end'] : '';
 	$note = isset($_GET['note']) ? $_GET['note'] : '';

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

  $Sql_Query = "INSERT INTO dst_doctors_blocked_time(created_date, doctor_id, doctor_ssn, block_start, block_end, note) VALUES(NOW(), '$doctor_id', '$doctor_ssn', '$block_start', '$block_end', '$note')";


  	$medcard_patients_reviews = array();
	header('Content-type: application/json');

	if(mysqli_query($conn,$Sql_Query))
	{
		$last_id = mysqli_insert_id($conn);
		$temp = array();
		$temp['status'] = '1';
		$temp['id'] = $last_id;
		$temp['message'] = 'The data has been created successfully';
		array_push($medcard_patients_reviews, $temp);
		echo json_encode($medcard_patients_reviews,JSON_UNESCAPED_UNICODE);
	}
	else
	{
 		$temp = array();
	    $temp['status'] = '0';
		$temp['message'] = 'Something went wrong';
	    http_response_code(403);
	    array_push($medcard_patients_reviews, $temp);
		echo json_encode($medcard_patients_reviews,JSON_UNESCAPED_UNICODE);
	}

	$conn->close();

}
Else
{
	echo 'Access denied...';
    exit();
}
?>
