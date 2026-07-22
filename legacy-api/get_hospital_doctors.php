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

	$stmt = $conn->prepare("SELECT u.id, u.user_id, u.user_document, u.user_ssn, u.user_name, u.user_surname, u.user_middlename, u.user_birthday, u.user_gender, u.user_phone, u.user_mail, u.department_name_id, u.department_name, u.cabinet, u.profession_id, u.profession, u.position, u.academic_degree, u.rating, u.rating_dislike, u.branch_id, u.branch_office, IF(s.service_price is null, 0, s.service_price) as defoult_cons_price, if(s2.service_price is null, 0, s2.service_price) as defoult_telemed_cons_price, u.about_us, IF(u.user_image is null, '', u.user_image) as user_image, teleconsultation_enabled FROM dst_hospital_users_list u LEFT JOIN structure_hospital_services s ON(u.defoult_cons_service_code = s.id) LEFT JOIN structure_hospital_services s2 ON(u.defoult_telemed_cons_service_code = s2.id) where u.access_of_mobile = 1 AND u.enabled = 1");

	$stmt->execute();
	$stmt->bind_result($id, $user_id, $user_document, $user_ssn, $user_name, $user_surname, $user_middlename, $user_birthday, $user_gender, $user_phone, $user_mail, $department_name_id, $department_name, $cabinet, $profession_id, $profession, $position, $academic_degree, $rating, $rating_dislike, $branch_id, $branch_office, $defoult_cons_price, $defoult_telemed_cons_price, $about_us, $user_image, $teleconsultation_enabled);

	$dst_hospital_users_list = array();

	header('Content-type: application/json');

	while($stmt->fetch()){
		$temp = array();
		$temp['id'] = $id;
		$temp['user_id'] = strval($user_id);
		$temp['user_document'] = $user_document;
		$temp['user_ssn'] = $user_ssn;
		$temp['user_name'] = $user_name;
		$temp['user_surname'] = $user_surname;
		$temp['user_middlename'] = $user_middlename;
		$temp['user_birthday'] = $user_birthday;
		$temp['user_gender'] = $user_gender;
		$temp['user_phone'] = $user_phone;
		$temp['user_mail'] = $user_mail;
		$temp['department_name_id'] = $department_name_id;
		$temp['department_name'] = $department_name;
		$temp['cabinet'] = $cabinet;
		$temp['profession_id'] = $profession_id;
		$temp['profession'] = $profession;
		$temp['position'] = $position;
		$temp['academic_degree'] = $academic_degree;
		$temp['rating'] = $rating;
		$temp['rating_dislike'] = $rating_dislike;
		$temp['branch_id'] = $branch_id;
		$temp['branch_office'] = $branch_office;
		$temp['defoult_cons_price'] = floatval($defoult_cons_price);
		$temp['defoult_telemed_cons_price'] = floatval($defoult_telemed_cons_price);
		$temp['teleconsultation_enabled'] = $teleconsultation_enabled;
		$temp['about_us'] = $about_us;
		$temp['user_image'] = base64_encode($user_image);

	array_push($dst_hospital_users_list, $temp);
	}
	echo json_encode($dst_hospital_users_list,JSON_UNESCAPED_UNICODE);

	$conn->close();

}
Else
{
	echo 'Access denied...';
    exit();
}
?>
