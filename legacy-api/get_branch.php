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

	$stmt = $conn->prepare("SELECT id, code, text_am, text_en, text_ru, letter, address, phone, gps_location, medcard, hospital_id, mail, discount_lab, discount_clinic FROM structure_branch_list WHERE visible = 1");
	$stmt->execute();
	$stmt->bind_result($id, $code, $text_am, $text_en, $text_ru, $letter, $address, $phone, $gps_location, $medcard, $hospital_id, $mail, $discount_lab, $discount_clinic);

	$structure_branch_list = array();

	header('Content-type: application/json');

	while($stmt->fetch()){
		$temp = array();
		$temp['id'] = $id;
		$temp['code'] = $code;
		$temp['text_am'] = $text_am;
		$temp['text_en'] = $text_en;
		$temp['text_ru'] = $text_ru;
		$temp['letter'] = $letter;
		$temp['address'] = $address;
		$temp['phone'] = $phone;
		$temp['gps_location'] = $gps_location;
		$temp['medcard'] = $medcard;
		$temp['hospital_id'] = $hospital_id;
		$temp['mail'] = $mail;
		$temp['discount_lab'] = $discount_lab;
		$temp['discount_clinic'] = $discount_clinic;
	array_push($structure_branch_list, $temp);
	}
	echo json_encode($structure_branch_list,JSON_UNESCAPED_UNICODE);

	$conn->close();

}
Else
{
	echo 'Access denied...';
    exit();
}
?>
