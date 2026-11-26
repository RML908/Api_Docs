-- Generated from legacy-api/openapi.yaml. Safe to run once on an empty database.
BEGIN;
INSERT INTO groups (name, description, icon, sort_order) VALUES ('Hospital Scheduling API (Legacy)', 'PHP API for patient schedules, doctors, branches and services. Base URL: https://dstapidocs.space/legacy-api', '🏥', 0);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'POST', '/set_patient_schedule', 'Create Patient Schedule', 'Registers a new patient visit/appointment. Requires header Authorization: Bearer <token>.', 'published', 'v1', '[{"name": "visit_date", "type": "string", "in": "body", "required": true, "description": "Example: 2026-07-01 10:00:00"}, {"name": "visit_duration", "type": "string", "in": "body", "required": false, "description": "Example: 30"}, {"name": "type_of_visit_id", "type": "string", "in": "body", "required": false, "description": "Example: 1"}, {"name": "type_of_visit", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "patient_ssn", "type": "string", "in": "body", "required": true, "description": ""}, {"name": "patient_document", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "patient_name", "type": "string", "in": "body", "required": true, "description": ""}, {"name": "patient_surname", "type": "string", "in": "body", "required": true, "description": ""}, {"name": "patient_middlename", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "patient_birthday", "type": "string", "in": "body", "required": false, "description": "Example: 1990-01-01"}, {"name": "patient_gender", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "patient_phone_mobile", "type": "string", "in": "body", "required": true, "description": ""}, {"name": "patient_mail", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "complaints", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "insurance_id", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "insurance_name", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "insurance_policy_no", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "department_id", "type": "string", "in": "body", "required": true, "description": ""}, {"name": "department_name", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "doctor_ssn", "type": "string", "in": "body", "required": true, "description": ""}, {"name": "doctor_name", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "note", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "have_a_referral", "type": "string", "in": "body", "required": false, "description": "Example: 0"}, {"name": "payment_type_id", "type": "string", "in": "body", "required": false, "description": "Example: 3"}, {"name": "branch_office_id", "type": "string", "in": "body", "required": false, "description": "id from GET /get_branch; the branch name is looked up and stored automatically Example: 1"}, {"name": "services", "type": "string", "in": "body", "required": false, "description": "JSON array of {service_id, service_name} objects Example: []"}]', '[
  {
    "status": "1",
    "message": "Registration Successfully",
    "row_id": 1,
    "branch_office_id": "1",
    "branch_office": "DST Բժշկական համալիր"
  }
]', 200, 0);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'POST', '/set_patient_schedule_update', 'Update Patient Schedule Visit Date', 'Reschedules an existing patient visit and resets its status to Pending. Requires header Authorization: Bearer <token>.', 'published', 'v1', '[{"name": "schedule_id", "type": "string", "in": "body", "required": true, "description": "Example: 1"}, {"name": "visit_date", "type": "string", "in": "body", "required": true, "description": "Example: 2026-07-02 11:00:00"}]', '[
  {
    "status": "1",
    "message": "The queue has been successfully edited"
  }
]', 200, 1);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'POST', '/set_patient_schedule_cancel', 'Cancel Patient Schedule', 'Cancels an existing patient visit. Requires header Authorization: Bearer <token>.', 'published', 'v1', '[{"name": "schedule_id", "type": "string", "in": "body", "required": true, "description": "Example: 1"}, {"name": "cancelled_by", "type": "string", "in": "body", "required": true, "description": "Example: 1"}, {"name": "cancelled_date", "type": "string", "in": "body", "required": true, "description": "Example: 2026-07-01 09:00:00"}]', '[
  {
    "status": "1",
    "message": "Queue canceled successfully",
    "schedule_id": "1"
  }
]', 200, 2);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'POST', '/set_doctor_block_time', 'Block Doctor Time Slot', 'Creates a blocked time entry for a doctor (e.g. vacation, unavailability). Requires header Authorization: Bearer <token>.', 'published', 'v1', '[{"name": "doctor_id", "type": "string", "in": "body", "required": false, "description": ""}, {"name": "doctor_ssn", "type": "string", "in": "body", "required": true, "description": "Example: 0001"}, {"name": "block_start", "type": "string", "in": "body", "required": true, "description": "Example: 2026-08-01 09:00:00"}, {"name": "block_end", "type": "string", "in": "body", "required": true, "description": "Example: 2026-08-01 12:00:00"}, {"name": "note", "type": "string", "in": "body", "required": false, "description": ""}]', '[
  {
    "status": "1",
    "id": 1,
    "message": "The data has been created successfully"
  }
]', 200, 3);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'GET', '/get_doctor_block_time', 'Get Doctor Blocked Time & Appointments', 'Returns a doctor''s upcoming blocked time slots and active appointments combined (excludes completed/cancelled visits and hidden blocks), useful for checking availability. Requires header Authorization: Bearer <token>.', 'published', 'v1', '[{"name": "doctor_ssn", "type": "string", "in": "query", "required": true, "description": ""}]', '[
  {
    "id": 1,
    "doctor_ssn": "0001",
    "block_start": "2026-08-01 09:00:00",
    "block_end": "2026-08-01 12:00:00",
    "type": "block"
  }
]', 200, 4);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'GET', '/get_branch', 'Get Branch List', 'Returns active hospital branches/offices. Omit id to get the full list, or pass it to fetch a single branch. Use the returned id as branch_office_id when calling POST /set_patient_schedule. Requires header Authorization: Bearer <token>.', 'published', 'v1', '[{"name": "id", "type": "integer", "in": "query", "required": false, "description": "Optional — filters to a single branch"}]', '[
  {
    "id": 1,
    "code": 1,
    "text_am": "DST Բժշկական համալիր",
    "text_en": "",
    "text_ru": "",
    "letter": "G",
    "address": "Սաղավանյան 76",
    "phone": "010342058",
    "gps_location": "40.21025164520757, 44.4390024727424",
    "medcard": 1,
    "hospital_id": 0,
    "mail": "",
    "discount_lab": 0,
    "discount_clinic": 0
  }
]', 200, 5);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'GET', '/get_hospital_doctors', 'Get Hospital Doctors', 'Returns doctors available for mobile booking (access_of_mobile = 1, enabled = 1), including their default consultation/telemed service prices resolved via structure_hospital_services. Requires header Authorization: Bearer <token>.', 'published', 'v1', '[]', '[
  {
    "id": 1,
    "user_id": "1",
    "user_document": "",
    "user_ssn": "0001",
    "user_name": "Test",
    "user_surname": "Doctor",
    "user_middlename": "",
    "user_birthday": "1980-01-01 00:00:00",
    "user_gender": "M",
    "user_phone": "+37499000000",
    "user_mail": "doctor@example.com",
    "department_name_id": 1,
    "department_name": "General",
    "cabinet": "101",
    "profession_id": 1,
    "profession": "General Practitioner",
    "position": "Doctor",
    "academic_degree": "MD",
    "rating": 0,
    "rating_dislike": 0,
    "branch_id": 1,
    "branch_office": "DST Բժշկական համալիր",
    "defoult_cons_price": 5000,
    "defoult_telemed_cons_price": 4000,
    "teleconsultation_enabled": 1,
    "about_us": "",
    "user_image": ""
  }
]', 200, 6);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'GET', '/get_hospital_services', 'Get Hospital Services', 'Returns active/enabled hospital services, optionally filtered by department. Requires header Authorization: Bearer <token>.', 'published', 'v1', '[{"name": "department_id", "type": "integer", "in": "query", "required": false, "description": "Optional — filters to a single department''s services"}]', '[
  {
    "id": 1,
    "department_id": 1,
    "service_local_id": "S001",
    "service_name": "General Consultation",
    "service_price": 5000
  }
]', 200, 7);
INSERT INTO endpoints (group_id, method, path, summary, description, status, version, params, response_example, response_status, sort_order) VALUES ((SELECT id FROM groups ORDER BY id DESC LIMIT 1), 'GET', '/get_hospital_departments', 'Get Hospital Departments', 'Returns visible departments/specializations available for the medcard system (visible = 1, medcard = 1). Requires header Authorization: Bearer <token>.', 'published', 'v1', '[]', '[
  {
    "id": 1,
    "global_service_code": "GS001",
    "global_service": "General Medicine",
    "department_id": 1,
    "department_name_am": "",
    "department_name_en": "General Medicine",
    "department_name_ru": "",
    "department_specialization_id": 1,
    "department_specialization": "General Practice",
    "is_tool": 0,
    "branch_id": 1,
    "branch_name": "DST Բժշկական համալիր",
    "queuing": 1,
    "location": "Floor 1",
    "registration_location": "Reception Desk 1"
  }
]', 200, 8);
COMMIT;
