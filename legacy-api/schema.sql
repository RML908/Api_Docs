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
  queue_confirmed_by INT NULL
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
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  user_ssn VARCHAR(50) NULL,
  name VARCHAR(100) NULL,
  enabled TINYINT NOT NULL DEFAULT 1
);

INSERT INTO dst_hospital_users_list (user_ssn, name, enabled) VALUES
  ('0001', 'Dr. Test Doctor', 1);

