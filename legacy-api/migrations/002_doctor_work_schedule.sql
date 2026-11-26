CREATE TABLE IF NOT EXISTS dst_doctors_work_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NULL,
  doctor_ssn VARCHAR(50) NULL,
  days_of_the_week VARCHAR(50) NULL,
  work_start TIME NULL,
  work_end TIME NULL,
  break_start TIME NULL,
  break_duration INT NULL,
  duration_of_admission INT NULL,
  telemed_start TIME NULL,
  telemed_end TIME NULL,
  state_start TIME NULL,
  state_end TIME NULL,
  vip_start TIME NULL,
  vip_end TIME NULL
);

INSERT INTO dst_doctors_work_schedule
  (doctor_id, doctor_ssn, days_of_the_week, work_start, work_end, break_start, break_duration, duration_of_admission, telemed_start, telemed_end, state_start, state_end, vip_start, vip_end)
SELECT 1, '0001', '1,2,3,4,5', '09:00:00', '18:00:00', '13:00:00', 60, 30, '16:00:00', '18:00:00', '09:00:00', '13:00:00', '14:00:00', '16:00:00'
WHERE NOT EXISTS (SELECT 1 FROM dst_doctors_work_schedule WHERE doctor_ssn = '0001');
