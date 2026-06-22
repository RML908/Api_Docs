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


$visit_date = isset($_POST['visit_date']) ? $_POST['visit_date'] : '0001-01-01 00:00:00';
$visit_duration = isset($_POST['visit_duration']) ? $_POST['visit_duration'] : '30';
$type_of_visit_id = isset($_POST['type_of_visit_id']) ? $_POST['type_of_visit_id'] : '1';
$type_of_visit = isset($_POST['type_of_visit']) ? $_POST['type_of_visit'] : '';
$patient_ssn = isset($_POST['patient_ssn']) ? $_POST['patient_ssn'] : '';
$patient_document = isset($_POST['patient_document']) ? $_POST['patient_document'] : '';
$patient_name = isset($_POST['patient_name']) ? $_POST['patient_name'] : '';
$patient_surname = isset($_POST['patient_surname']) ? $_POST['patient_surname'] : '';
$patient_middlename = isset($_POST['patient_middlename']) ? $_POST['patient_middlename'] : '';
$patient_birthday = isset($_POST['patient_birthday']) ? $_POST['patient_birthday'] : '0001-01-01';
$patient_gender = isset($_POST['patient_gender']) ? $_POST['patient_gender'] : '';
$patient_phone_mobile = isset($_POST['patient_phone_mobile']) ? $_POST['patient_phone_mobile'] : '';
$patient_mail = isset($_POST['patient_mail']) ? $_POST['patient_mail'] : '';
$complaints = isset($_POST['complaints']) ? $_POST['complaints'] : '';
$insurance_id = isset($_POST['insurance_id']) ? $_POST['insurance_id'] : '0';
$insurance_name = isset($_POST['insurance_name']) ? $_POST['insurance_name'] : '';
$insurance_policy_no = isset($_POST['insurance_policy_no']) ? $_POST['insurance_policy_no'] : '';
$department_id = isset($_POST['department_id']) ? $_POST['department_id'] : '';
$department_name = isset($_POST['department_name']) ? $_POST['department_name'] : '';
$doctor_id = isset($_POST['doctor_id']) ? $_POST['doctor_id'] : '0';
$doctor_name = isset($_POST['doctor_name']) ? $_POST['doctor_name'] : '';
$doctor_ssn = isset($_POST['doctor_ssn']) ? $_POST['doctor_ssn'] : '';
$note = isset($_POST['note']) ? $_POST['note'] : '';
$have_a_referral = isset($_POST['have_a_referral']) ? $_POST['have_a_referral'] : '0';
$payment_type_id = isset($_POST['payment_type_id']) ? $_POST['payment_type_id'] : '3';


  if (isset($_POST['services'])) {$services = $_POST['services'];}

  $services = str_replace('\"', '"', $services);
  $ServiceList_array = json_decode($services, true);
  $jsonWithoutSlashes = json_encode($ServiceList_array);


	$payment_type_name = '';

	$branch_office_id = '0';
	$branch_office = '';

  $visit_date_end = strtotime($visit_date . ' + ' . $visit_duration . ' minute');
  $visit_date_end = date('Y-m-d H:i:s', $visit_date_end);

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


$unique_jitsi = substr(uniqid('', true), -8);

$JitsiURL='https://jitsi.riot.im//' . $unique_jitsi . '#userInfo.displayName="MedCard"&config.toolbarButtons=["microphone","camera","desktop","chat","raisehand","participants-pane","tileview","toggle-camera","hangup","videoquality","fullscreen","closedcaptions","recording","highlight","noisesuppression","whiteboard","etherpad","select-background","dock-iframe","settings","stats","shortcuts","embedmeeting","feedback"]&config.prejoinConfig.enabled=false&config.faceLandmarks.enableFaceCentering=false&config.disableTileEnlargement=true&config.disableInviteFunctions=true&config.defaultLaunchInBrowserOnMobile=true&config.disableDeepLinking=true&config.notifications=[]';

$conn = getConnection();

$doctor_id_query = "SELECT user_id as doctor_id FROM dst_hospital_users_list WHERE user_ssn = '$doctor_ssn' AND enabled = 1";
$result = mysqli_query($conn, $doctor_id_query);

if ($row = mysqli_fetch_assoc($result)) {
	$doctor_id = $row['doctor_id'];
} else {
	$doctor_id = '0';
}

     $Sql_Query = "INSERT INTO dst_patient_schedule(created_date, visit_date, visit_date_end, duration, type_of_visit_id, type_of_visit, visit_id, patient_ssn, patient_document, patient_name, patient_surname, patient_middlename, patient_birthday, patient_gender, patient_phone_mobile, patient_mail, complaints, insurance_id, insurance_name, insurance_policy_no, department_id, department_name, doctor_id, doctor_name, doctor_ssn, is_mobile, tele_consultation_url, note, have_a_referral, write_by, payment_type_id, payment_type_name) VALUES(NOW(), '$visit_date', '$visit_date_end', '$visit_duration', '$type_of_visit_id', '$type_of_visit', (SELECT CONCAT(date_format(NOW(),'%y'),'0', (SELECT COUNT(id) + 1 FROM dst_patient_schedule as visit_dst_patient_schedule  WHERE date_format(created_date,'%y') = date_format(NOW(),'%y'))) AS VisitNumber), '$patient_ssn', '$patient_document', '$patient_name', '$patient_surname', '$patient_middlename', '$patient_birthday', '$patient_gender', '$patient_phone_mobile', '', '$complaints', '$insurance_id', '$insurance_name', '$insurance_policy_no', '$department_id', '$department_name', '$doctor_id', '$doctor_name', '$doctor_ssn', '1', '$JitsiURL', '$note', '$have_a_referral', '0', '$payment_type_id', '$payment_type_name')";

 	$dst_patient_schedule = array();
	header('Content-type: application/json');

	if(mysqli_query($conn,$Sql_Query))
	{
		$last_id = $conn->insert_id;

        $stmt = $conn->prepare("INSERT INTO dst_patient_schedule_sublist (schedule_id, service_id, service_name) VALUES (?,?,?)");
        $stmt->bind_param("sss", $schedule_id, $service_id, $service_name);

if (is_array($ServiceList_array) && !empty($ServiceList_array)) {
    foreach ($ServiceList_array as $s_item) {
        if (isset($s_item['service_id']) && isset($s_item['service_name'])) {
            $schedule_id = $last_id;
            $service_id = $s_item['service_id'];
            $service_name = $s_item['service_name'];

            $stmt->execute();
        }
    }
}
		$temp = array();
		$temp['status'] = '1';
		$temp['message'] = 'Registration Successfully';
		$temp['row_id'] = $last_id;
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
