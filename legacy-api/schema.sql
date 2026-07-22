CREATE TABLE IF NOT EXISTS dst_patient_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_date DATETIME NULL,
  visit_date DATETIME NULL,
  visit_date_end DATETIME NULL,
  duration INT NULL,
  type_of_visit_id INT NULL,
  type_of_visit VARCHAR(255) NULL,
  visit_id VARCHAR(50) NULL,
  patient_ssn VARCHAR(50) NULL,
  patient_document VARCHAR(100) NULL,
  patient_name VARCHAR(100) NULL,
  patient_surname VARCHAR(100) NULL,
  patient_middlename VARCHAR(100) NULL,
  patient_birthday DATE NULL,
  patient_gender VARCHAR(20) NULL,
  patient_phone_mobile VARCHAR(50) NULL,
  patient_mail VARCHAR(100) NULL,
  complaints TEXT NULL,
  insurance_id INT NULL,
  insurance_name VARCHAR(100) NULL,
  insurance_policy_no VARCHAR(100) NULL,
  department_id INT NULL,
  department_name VARCHAR(100) NULL,
  doctor_id INT NULL,
  doctor_name VARCHAR(100) NULL,
  doctor_ssn VARCHAR(50) NULL,
  is_mobile TINYINT NULL,
  tele_consultation_url TEXT NULL,
  note TEXT NULL,
  have_a_referral TINYINT NULL,
  write_by INT NULL,
  payment_type_id INT NULL,
  payment_type_name VARCHAR(100) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  cancelled_date DATETIME NULL,
  cancelled_by INT NOT NULL DEFAULT 0,
  completed_by INT NOT NULL DEFAULT 0,
  visible TINYINT NOT NULL DEFAULT 1,
  queue_confirmed_date DATETIME NULL,
  queue_confirmed_by INT NULL,
  branch_office_id INT NOT NULL DEFAULT 0,
  branch_office VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS dst_patient_schedule_sublist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  service_id VARCHAR(50) NULL,
  service_name VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS dst_doctors_blocked_time (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_date DATETIME NULL,
  doctor_id VARCHAR(50) NULL,
  doctor_ssn VARCHAR(50) NULL,
  block_start DATETIME NULL,
  block_end DATETIME NULL,
  note TEXT NULL,
  visible TINYINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS dst_hospital_users_list (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_date DATETIME NULL,
  user_id INT NULL,
  user_document VARCHAR(20) NULL,
  user_ssn VARCHAR(20) NULL,
  user_name VARCHAR(50) NULL,
  user_surname VARCHAR(50) NULL,
  user_middlename VARCHAR(45) NULL,
  user_birthday DATETIME NULL,
  user_gender VARCHAR(45) NULL,
  user_phone VARCHAR(15) NULL,
  user_mail VARCHAR(50) NULL,
  user_image MEDIUMBLOB NULL,
  global_service_id INT NULL DEFAULT 0,
  department_name_id INT NULL DEFAULT 0,
  department_name VARCHAR(255) NULL,
  department_other_id VARCHAR(255) NULL,
  department_other_name MEDIUMTEXT NULL,
  cabinet_id INT NULL DEFAULT 0,
  cabinet VARCHAR(100) NULL,
  profession_id INT NULL DEFAULT 0,
  profession VARCHAR(100) NULL,
  `position` VARCHAR(100) NULL,
  login VARCHAR(50) NULL,
  `password` VARCHAR(50) NULL,
  access_level_id INT NULL DEFAULT 0,
  access_level VARCHAR(100) NULL,
  academic_degree_id INT NULL DEFAULT 0,
  academic_degree VARCHAR(45) NULL,
  about_us LONGTEXT NULL,
  rating INT NULL DEFAULT 0,
  rating_dislike INT NULL DEFAULT 0,
  access_of_mobile INT NULL DEFAULT 0,
  two_step_verification_type VARCHAR(45) NULL,
  two_step_verification_enabled INT NULL DEFAULT 0,
  two_step_verification_secret_key VARCHAR(255) NULL,
  armed_configured INT NULL DEFAULT 0,
  armed_doctor_uuid VARCHAR(100) NULL,
  armed_doctor_operator_uuid VARCHAR(45) NULL,
  armed_doctor_spec_code VARCHAR(100) NULL,
  armed_login VARCHAR(100) NULL,
  armed_password VARCHAR(100) NULL,
  casher_id INT NULL DEFAULT 0,
  branch_id INT NULL DEFAULT 0,
  branch_office VARCHAR(255) NULL,
  branch_letter VARCHAR(10) NULL,
  licanse_id VARCHAR(20) NULL,
  licanse_finished_date DATETIME NULL,
  e_sign MEDIUMBLOB NULL,
  fixed_salary DOUBLE NULL DEFAULT 0,
  visibility_in_list INT NULL DEFAULT 1,
  enabled INT NULL DEFAULT 1,
  access_for_all_patient INT NULL DEFAULT 0,
  automatic_signing_agreements INT NULL DEFAULT 0,
  defoult_cons_service_code INT NULL DEFAULT 0,
  defoult_telemed_cons_service_code INT NULL DEFAULT 0,
  teleconsultation_enabled INT NULL DEFAULT 0,
  type_of_work_schedule INT NULL DEFAULT 0,
  is_online INT NULL DEFAULT 0,
  parent_doctors VARCHAR(200) NULL,
  also_a_specialist INT NULL DEFAULT 0,
  visible INT NULL DEFAULT 1,
  write_by INT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS structure_hospital_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_date DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  branch_office_id INT NULL DEFAULT 0,
  department_id INT NULL DEFAULT 0,
  service_type INT NULL DEFAULT 0,
  service_local_id VARCHAR(50) NULL,
  service_armed_id VARCHAR(50) NULL,
  service_uuid VARCHAR(45) NULL,
  measurement_name_code VARCHAR(50) NULL,
  service_name VARCHAR(255) NULL,
  service_price DOUBLE NULL DEFAULT 0,
  service_price_to DOUBLE NULL DEFAULT 0,
  global_service_id INT NULL DEFAULT 0,
  paymob_dep INT NULL DEFAULT 1,
  paymob_adg_code VARCHAR(20) NULL,
  price_list_id INT NULL DEFAULT 0,
  price_type_id INT NULL DEFAULT 0,
  insurance_id INT NULL DEFAULT 0,
  armed_cover_code VARCHAR(50) NULL DEFAULT '',
  note VARCHAR(255) NULL,
  `enable` TINYINT NULL DEFAULT 1,
  is_public INT NULL DEFAULT 0,
  is_dinamic_price INT NULL DEFAULT 0,
  is_preliminary_request INT NULL DEFAULT 0,
  preliminary_request_service_duration INT NULL DEFAULT 60,
  write_by INT NULL DEFAULT 0,
  visible TINYINT NULL DEFAULT 1
);

INSERT INTO structure_hospital_services
  (branch_office_id, department_id, service_type, service_local_id, service_name, service_price, `enable`, visible)
VALUES
  (1, 1, 1, 'S001', 'General Consultation', 5000, 1, 1),
  (1, 1, 2, 'S002', 'Video Consultation', 4000, 1, 1);

INSERT INTO dst_hospital_users_list
  (created_date, user_id, user_document, user_ssn, user_name, user_surname, user_middlename, user_birthday, user_gender, user_phone, user_mail, department_name_id, department_name, cabinet, profession_id, profession, `position`, academic_degree, rating, rating_dislike, access_of_mobile, branch_id, branch_office, about_us, defoult_cons_service_code, defoult_telemed_cons_service_code, teleconsultation_enabled, enabled, visibility_in_list, visible)
VALUES
  (NOW(), 1, '', '0001', 'Test', 'Doctor', '', '1980-01-01', 'M', '+37499000000', 'doctor@example.com', 1, 'General', '101', 1, 'General Practitioner', 'Doctor', 'MD', 0, 0, 1, 1, 'DST Բժշկական համալիր', 'Experienced general practitioner.', 1, 2, 1, 1, 1, 1);

CREATE TABLE IF NOT EXISTS structure_branch_list (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code INT NULL DEFAULT 0,
  text_am VARCHAR(50) NULL,
  text_en VARCHAR(50) NULL,
  text_ru VARCHAR(50) NULL,
  letter VARCHAR(45) NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(45) NULL,
  gps_location VARCHAR(45) NULL,
  medcard INT NULL DEFAULT 1,
  hospital_id INT NULL DEFAULT 0,
  mail VARCHAR(45) NULL,
  discount_lab DOUBLE NULL DEFAULT 0,
  discount_clinic DOUBLE NULL DEFAULT 0,
  visible INT NULL DEFAULT 1
);

INSERT INTO structure_branch_list
  (code, text_am, letter, address, phone, gps_location, medcard, hospital_id, discount_lab, discount_clinic, visible)
VALUES
  (1, 'DST Բժշկական համալիր', 'G', 'Սաղավանյան 76', '010342058', '40.21025164520757, 44.4390024727424', 1, 0, 0, 0, 1);

