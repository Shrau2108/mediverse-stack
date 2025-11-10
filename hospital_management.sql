-- Hospital Management System (HMS) - MySQL InnoDB schema and seed data
-- Engine: InnoDB, Charset: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in dependency-safe order
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS hospital_wallet;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bill_items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS medicine_issues;
DROP TABLE IF EXISTS prescription_items;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS lab_reports;
DROP TABLE IF EXISTS lab_requests;
DROP TABLE IF EXISTS treatments;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS accommodations;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS lab_techs;
DROP TABLE IF EXISTS attendants;
DROP TABLE IF EXISTS chemists;
DROP TABLE IF EXISTS nurses;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;

-- Users and Roles
CREATE TABLE users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(191) NOT NULL,
  phone         VARCHAR(32) NULL,
  role          ENUM('ADMIN','DOCTOR','NURSE','CHEMIST','ATTENDANT','LAB_TECH','PATIENT') NOT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE patients (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  dob           DATE NULL,
  gender        ENUM('MALE','FEMALE','OTHER') NULL,
  blood_group   ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NULL,
  emergency_contact VARCHAR(191) NULL,
  address       VARCHAR(255) NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE doctors (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  specialty     VARCHAR(191) NOT NULL,
  license_no    VARCHAR(64) NOT NULL UNIQUE,
  PRIMARY KEY (id),
  CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE nurses (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  license_no    VARCHAR(64) NULL UNIQUE,
  PRIMARY KEY (id),
  CONSTRAINT fk_nurses_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE chemists (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  registration_no VARCHAR(64) NULL UNIQUE,
  PRIMARY KEY (id),
  CONSTRAINT fk_chemists_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendants (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  PRIMARY KEY (id),
  CONSTRAINT fk_attendants_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lab_techs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  certification VARCHAR(191) NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_labtechs_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Facilities & Inventory
CREATE TABLE rooms (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_number   VARCHAR(32) NOT NULL UNIQUE,
  room_type     ENUM('GENERAL','SEMI_PRIVATE','PRIVATE','ICU','OT','LAB') NOT NULL,
  daily_rate_cents INT UNSIGNED NOT NULL DEFAULT 0,
  is_available  TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE accommodations (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id    BIGINT UNSIGNED NOT NULL,
  room_id       BIGINT UNSIGNED NOT NULL,
  admitted_by_nurse_id BIGINT UNSIGNED NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime   DATETIME NULL,
  status        ENUM('ONGOING','DISCHARGED','TRANSFERRED','CANCELLED') NOT NULL DEFAULT 'ONGOING',
  PRIMARY KEY (id),
  INDEX idx_accom_patient (patient_id),
  INDEX idx_accom_room (room_id),
  CONSTRAINT fk_accom_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_accom_room FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_accom_nurse FOREIGN KEY (admitted_by_nurse_id) REFERENCES nurses(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Appointments & Treatments
CREATE TABLE appointments (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id    BIGINT UNSIGNED NOT NULL,
  doctor_id     BIGINT UNSIGNED NOT NULL,
  scheduled_at  DATETIME NOT NULL,
  status        ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
  notes         VARCHAR(500) NULL,
  PRIMARY KEY (id),
  INDEX idx_appt_patient (patient_id),
  INDEX idx_appt_doctor (doctor_id),
  INDEX idx_appt_status (status),
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE treatments (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  appointment_id BIGINT UNSIGNED NOT NULL,
  patient_id    BIGINT UNSIGNED NOT NULL,
  doctor_id     BIGINT UNSIGNED NOT NULL,
  diagnosis     VARCHAR(500) NOT NULL,
  status        ENUM('OPEN','IN_PROGRESS','AWAITING_LAB','COMPLETED','CANCELLED') NOT NULL DEFAULT 'OPEN',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_treat_patient (patient_id),
  INDEX idx_treat_doctor (doctor_id),
  CONSTRAINT fk_treat_appt FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_treat_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_treat_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Prescriptions & Pharmacy
CREATE TABLE medicines (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(191) NOT NULL,
  code          VARCHAR(64) NOT NULL UNIQUE,
  unit          ENUM('TABLET','ML','MG','VIAL','UNIT') NOT NULL,
  unit_price_cents INT UNSIGNED NOT NULL,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  INDEX idx_medicines_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE prescriptions (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  treatment_id  BIGINT UNSIGNED NOT NULL,
  prescribed_by_doctor_id BIGINT UNSIGNED NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_presc_treatment (treatment_id),
  CONSTRAINT fk_presc_treatment FOREIGN KEY (treatment_id) REFERENCES treatments(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_presc_doctor FOREIGN KEY (prescribed_by_doctor_id) REFERENCES doctors(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE prescription_items (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  prescription_id BIGINT UNSIGNED NOT NULL,
  medicine_id   BIGINT UNSIGNED NOT NULL,
  dosage        VARCHAR(128) NOT NULL,
  frequency     VARCHAR(128) NOT NULL,
  days          INT UNSIGNED NOT NULL,
  quantity      INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_pi_prescription (prescription_id),
  INDEX idx_pi_medicine (medicine_id),
  CONSTRAINT fk_pi_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pi_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE medicine_issues (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  prescription_item_id BIGINT UNSIGNED NOT NULL,
  patient_id    BIGINT UNSIGNED NOT NULL,
  chemist_id    BIGINT UNSIGNED NOT NULL,
  issued_quantity INT UNSIGNED NOT NULL,
  issued_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_issue_patient (patient_id),
  INDEX idx_issue_chemist (chemist_id),
  CONSTRAINT fk_issue_pi FOREIGN KEY (prescription_item_id) REFERENCES prescription_items(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_issue_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_issue_chemist FOREIGN KEY (chemist_id) REFERENCES chemists(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Laboratory
CREATE TABLE lab_requests (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  treatment_id  BIGINT UNSIGNED NOT NULL,
  requested_by_doctor_id BIGINT UNSIGNED NOT NULL,
  requested_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  test_type     VARCHAR(191) NOT NULL,
  status        ENUM('REQUESTED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'REQUESTED',
  PRIMARY KEY (id),
  INDEX idx_lr_treatment (treatment_id),
  CONSTRAINT fk_lr_treatment FOREIGN KEY (treatment_id) REFERENCES treatments(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_lr_doctor FOREIGN KEY (requested_by_doctor_id) REFERENCES doctors(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lab_reports (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lab_request_id BIGINT UNSIGNED NOT NULL,
  processed_by_labtech_id BIGINT UNSIGNED NOT NULL,
  reported_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  findings      TEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_report_request (lab_request_id),
  CONSTRAINT fk_report_request FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_report_labtech FOREIGN KEY (processed_by_labtech_id) REFERENCES lab_techs(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Billing & Payments
CREATE TABLE bills (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id    BIGINT UNSIGNED NOT NULL,
  treatment_id  BIGINT UNSIGNED NULL,
  total_amount_cents INT UNSIGNED NOT NULL DEFAULT 0,
  status        ENUM('DRAFT','ISSUED','PAID','VOID') NOT NULL DEFAULT 'DRAFT',
  issued_at     DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_bill_patient (patient_id),
  INDEX idx_bill_treatment (treatment_id),
  CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_bill_treatment FOREIGN KEY (treatment_id) REFERENCES treatments(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bill_items (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bill_id       BIGINT UNSIGNED NOT NULL,
  item_type     ENUM('CONSULTATION','ROOM','MEDICINE','LAB','OTHER') NOT NULL,
  ref_id        BIGINT UNSIGNED NULL,
  description   VARCHAR(255) NOT NULL,
  amount_cents  INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_bi_bill (bill_id),
  INDEX idx_bi_type (item_type),
  CONSTRAINT fk_bi_bill FOREIGN KEY (bill_id) REFERENCES bills(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bill_id       BIGINT UNSIGNED NOT NULL,
  amount_cents  INT UNSIGNED NOT NULL,
  method        ENUM('CASH','CARD','UPI','BANK_TRANSFER') NOT NULL,
  status        ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'SUCCESS',
  paid_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_pay_bill (bill_id),
  CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES bills(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Hospital wallet as a transaction ledger
CREATE TABLE hospital_wallet (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bill_id         BIGINT UNSIGNED NULL,
  payment_id      BIGINT UNSIGNED NULL,
  direction       ENUM('CREDIT','DEBIT') NOT NULL,
  amount_cents    INT UNSIGNED NOT NULL,
  balance_after_cents BIGINT UNSIGNED NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_wallet_created (created_at),
  CONSTRAINT fk_wallet_bill FOREIGN KEY (bill_id) REFERENCES bills(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_wallet_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Activity logs
CREATE TABLE activity_logs (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NULL,
  action        VARCHAR(128) NOT NULL,
  entity_type   VARCHAR(64) NULL,
  entity_id     BIGINT UNSIGNED NULL,
  metadata_json JSON NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_logs_user (user_id),
  INDEX idx_logs_entity (entity_type, entity_id),
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed data
START TRANSACTION;

-- Users (5 patients, 3 doctors, 4 nurses, 2 chemists, plus 1 admin, 1 attendant, 1 lab_tech)
INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@hms.test', '$2y$dummy', 'Site Admin', '+910000000000', 'ADMIN'),
('doc1@hms.test', '$2y$dummy', 'Dr. Aditi Rao', '+911111111111', 'DOCTOR'),
('doc2@hms.test', '$2y$dummy', 'Dr. Vikram Shah', '+912222222222', 'DOCTOR'),
('doc3@hms.test', '$2y$dummy', 'Dr. Neha Mehta', '+913333333333', 'DOCTOR'),
('nurse1@hms.test', '$2y$dummy', 'Nurse Priya', '+914444444444', 'NURSE'),
('nurse2@hms.test', '$2y$dummy', 'Nurse Rahul', '+915555555555', 'NURSE'),
('nurse3@hms.test', '$2y$dummy', 'Nurse Simran', '+916666666666', 'NURSE'),
('nurse4@hms.test', '$2y$dummy', 'Nurse Arjun', '+917777777777', 'NURSE'),
('chem1@hms.test', '$2y$dummy', 'Chemist Mohan', '+918888888888', 'CHEMIST'),
('chem2@hms.test', '$2y$dummy', 'Chemist Rina', '+919999999999', 'CHEMIST'),
('att1@hms.test', '$2y$dummy', 'Attendant Kiran', '+910101010101', 'ATTENDANT'),
('lab1@hms.test', '$2y$dummy', 'LabTech Pooja', '+910202020202', 'LAB_TECH'),
('pat1@hms.test', '$2y$dummy', 'Arjun Kapoor', '+910303030303', 'PATIENT'),
('pat2@hms.test', '$2y$dummy', 'Meera Joshi', '+910404040404', 'PATIENT'),
('pat3@hms.test', '$2y$dummy', 'Sanjay Das', '+910505050505', 'PATIENT'),
('pat4@hms.test', '$2y$dummy', 'Radhika Nair', '+910606060606', 'PATIENT'),
('pat5@hms.test', '$2y$dummy', 'Ishaan Roy', '+910707070707', 'PATIENT');

-- Map to roles
INSERT INTO doctors (user_id, specialty, license_no)
SELECT id, 'Cardiology', 'DOC-A1' FROM users WHERE email='doc1@hms.test';
INSERT INTO doctors (user_id, specialty, license_no)
SELECT id, 'General Medicine', 'DOC-B2' FROM users WHERE email='doc2@hms.test';
INSERT INTO doctors (user_id, specialty, license_no)
SELECT id, 'Orthopedics', 'DOC-C3' FROM users WHERE email='doc3@hms.test';

INSERT INTO nurses (user_id, license_no)
SELECT id, 'NUR-101' FROM users WHERE email='nurse1@hms.test';
INSERT INTO nurses (user_id, license_no)
SELECT id, 'NUR-102' FROM users WHERE email='nurse2@hms.test';
INSERT INTO nurses (user_id, license_no)
SELECT id, 'NUR-103' FROM users WHERE email='nurse3@hms.test';
INSERT INTO nurses (user_id, license_no)
SELECT id, 'NUR-104' FROM users WHERE email='nurse4@hms.test';

INSERT INTO chemists (user_id, registration_no)
SELECT id, 'CHEM-21' FROM users WHERE email='chem1@hms.test';
INSERT INTO chemists (user_id, registration_no)
SELECT id, 'CHEM-22' FROM users WHERE email='chem2@hms.test';

INSERT INTO attendants (user_id)
SELECT id FROM users WHERE email='att1@hms.test';

INSERT INTO lab_techs (user_id, certification)
SELECT id, 'MLT' FROM users WHERE email='lab1@hms.test';

INSERT INTO patients (user_id, dob, gender, blood_group, emergency_contact, address)
SELECT id, '1990-01-01', 'MALE', 'A+', '+919876543210', 'Mumbai' FROM users WHERE email='pat1@hms.test';
INSERT INTO patients (user_id, dob, gender, blood_group, emergency_contact, address)
SELECT id, '1988-05-10', 'FEMALE', 'B+', '+919876543211', 'Pune' FROM users WHERE email='pat2@hms.test';
INSERT INTO patients (user_id, dob, gender, blood_group, emergency_contact, address)
SELECT id, '1975-07-15', 'MALE', 'O+', '+919876543212', 'Delhi' FROM users WHERE email='pat3@hms.test';
INSERT INTO patients (user_id, dob, gender, blood_group, emergency_contact, address)
SELECT id, '2000-12-20', 'FEMALE', 'AB+', '+919876543213', 'Bengaluru' FROM users WHERE email='pat4@hms.test';
INSERT INTO patients (user_id, dob, gender, blood_group, emergency_contact, address)
SELECT id, '1995-03-22', 'MALE', 'O-', '+919876543214', 'Chennai' FROM users WHERE email='pat5@hms.test';

-- Rooms (6)
INSERT INTO rooms (room_number, room_type, daily_rate_cents, is_available) VALUES
('G101', 'GENERAL', 30000, 1),
('G102', 'GENERAL', 30000, 1),
('SP201', 'SEMI_PRIVATE', 60000, 1),
('PR301', 'PRIVATE', 100000, 1),
('IC401', 'ICU', 200000, 1),
('LAB1', 'LAB', 0, 1);

-- Medicines (3)
INSERT INTO medicines (name, code, unit, unit_price_cents, stock_quantity, is_active) VALUES
('Paracetamol 500mg', 'MED-PARA', 'TABLET', 200, 1000, 1),
('Amoxicillin 250mg', 'MED-AMOX', 'TABLET', 500, 500, 1),
('Cough Syrup 100ml', 'MED-COUGH', 'ML', 150, 10000, 1);

-- One treatment cycle for patient pat1: appointment -> treatment -> prescription -> lab -> bill -> payment

-- Appointment
INSERT INTO appointments (patient_id, doctor_id, scheduled_at, status, notes)
SELECT p.id, d.id, NOW(), 'COMPLETED', 'Initial visit'
FROM patients p, doctors d, users up, users ud
WHERE up.email='pat1@hms.test' AND up.id=p.user_id AND ud.email='doc2@hms.test' AND ud.id=d.user_id
LIMIT 1;

-- Treatment based on the appointment
INSERT INTO treatments (appointment_id, patient_id, doctor_id, diagnosis, status)
SELECT a.id, a.patient_id, a.doctor_id, 'Acute pharyngitis', 'AWAITING_LAB'
FROM appointments a
JOIN patients p ON p.id=a.patient_id
JOIN doctors d ON d.id=a.doctor_id
ORDER BY a.id DESC LIMIT 1;

-- Prescription for treatment
INSERT INTO prescriptions (treatment_id, prescribed_by_doctor_id, created_at)
SELECT t.id, t.doctor_id, NOW() FROM treatments t ORDER BY t.id DESC LIMIT 1;

-- Prescription items
INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, days, quantity)
SELECT pr.id, m.id, '500mg', '1-0-1', 5, 10
FROM prescriptions pr, medicines m
WHERE m.code='MED-PARA'
ORDER BY pr.id DESC LIMIT 1;

INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, days, quantity)
SELECT pr.id, m.id, '250mg', '1-1-1', 5, 15
FROM prescriptions pr, medicines m
WHERE m.code='MED-AMOX'
ORDER BY pr.id DESC LIMIT 1;

-- Issue medicines by chemist
INSERT INTO medicine_issues (prescription_item_id, patient_id, chemist_id, issued_quantity)
SELECT pi.id, t.patient_id, c.id, pi.quantity
FROM prescription_items pi
JOIN prescriptions pr ON pr.id=pi.prescription_id
JOIN treatments t ON t.id=pr.treatment_id
JOIN chemists c ON c.id=(SELECT c2.id FROM chemists c2 LIMIT 1)
ORDER BY pi.id ASC LIMIT 1;

INSERT INTO medicine_issues (prescription_item_id, patient_id, chemist_id, issued_quantity)
SELECT pi.id, t.patient_id, c.id, pi.quantity
FROM prescription_items pi
JOIN prescriptions pr ON pr.id=pi.prescription_id
JOIN treatments t ON t.id=pr.treatment_id
JOIN chemists c ON c.id=(SELECT c2.id FROM chemists c2 ORDER BY c2.id DESC LIMIT 1)
ORDER BY pi.id DESC LIMIT 1;

-- Lab request and report
INSERT INTO lab_requests (treatment_id, requested_by_doctor_id, test_type, status)
SELECT t.id, t.doctor_id, 'CBC', 'COMPLETED' FROM treatments t ORDER BY t.id DESC LIMIT 1;

INSERT INTO lab_reports (lab_request_id, processed_by_labtech_id, findings)
SELECT lr.id, lt.id, 'CBC normal ranges observed.'
FROM lab_requests lr, lab_techs lt
ORDER BY lr.id DESC, lt.id LIMIT 1;

-- Accommodation (admit and discharge same day for sample)
INSERT INTO accommodations (patient_id, room_id, admitted_by_nurse_id, start_datetime, end_datetime, status)
SELECT t.patient_id, r.id, n.id, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), 'DISCHARGED'
FROM treatments t, rooms r, nurses n
WHERE r.room_type='GENERAL'
ORDER BY r.id, n.id LIMIT 1;

-- Bill for consultation, room, lab, medicine
INSERT INTO bills (patient_id, treatment_id, total_amount_cents, status, issued_at)
SELECT t.patient_id, t.id, 0, 'ISSUED', NOW() FROM treatments t ORDER BY t.id DESC LIMIT 1;

-- Add bill items
-- Consultation (flat 500 INR = 50000 cents)
INSERT INTO bill_items (bill_id, item_type, ref_id, description, amount_cents)
SELECT b.id, 'CONSULTATION', t.id, 'Doctor consultation', 50000
FROM bills b JOIN treatments t ON t.id=b.treatment_id ORDER BY b.id DESC LIMIT 1;

-- Room (1 day general = 30000 cents)
INSERT INTO bill_items (bill_id, item_type, ref_id, description, amount_cents)
SELECT b.id, 'ROOM', r.id, 'General ward - 1 day', r.daily_rate_cents
FROM bills b, rooms r WHERE r.room_type='GENERAL' ORDER BY b.id DESC, r.id LIMIT 1;

-- Lab (CBC = 8000 cents)
INSERT INTO bill_items (bill_id, item_type, ref_id, description, amount_cents)
SELECT b.id, 'LAB', lr.id, 'CBC Test', 8000
FROM bills b, lab_requests lr ORDER BY b.id DESC, lr.id DESC LIMIT 1;

-- Medicine (sum of issued quantities * unit price)
INSERT INTO bill_items (bill_id, item_type, ref_id, description, amount_cents)
SELECT b.id, 'MEDICINE', pr.id, 'Medicines dispensed',
  (
    SELECT SUM(pi.quantity * m.unit_price_cents)
    FROM prescriptions pr2
    JOIN prescription_items pi ON pi.prescription_id=pr2.id
    JOIN medicines m ON m.id=pi.medicine_id
    WHERE pr2.id=pr.id
  )
FROM bills b
JOIN treatments t ON t.id=b.treatment_id
JOIN prescriptions pr ON pr.treatment_id=t.id
ORDER BY b.id DESC LIMIT 1;

-- Update bill total
UPDATE bills b
JOIN (
  SELECT bill_id, SUM(amount_cents) AS total FROM bill_items GROUP BY bill_id
) x ON x.bill_id=b.id
SET b.total_amount_cents=x.total;

-- Payment (paid in full via UPI)
INSERT INTO payments (bill_id, amount_cents, method, status)
SELECT b.id, b.total_amount_cents, 'UPI', 'SUCCESS' FROM bills b ORDER BY b.id DESC LIMIT 1;

-- Hospital wallet credit entry
INSERT INTO hospital_wallet (bill_id, payment_id, direction, amount_cents, balance_after_cents)
SELECT b.id, p.id, 'CREDIT', p.amount_cents,
  COALESCE((SELECT hw.balance_after_cents FROM hospital_wallet hw ORDER BY hw.id DESC LIMIT 1), 0) + p.amount_cents
FROM bills b
JOIN payments p ON p.bill_id=b.id
ORDER BY p.id DESC LIMIT 1;

-- Activity logs (minimal)
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
SELECT u.id, 'APPOINTMENT_COMPLETED', 'appointments', a.id, JSON_OBJECT('notes', a.notes)
FROM users u, appointments a WHERE u.email='doc2@hms.test' ORDER BY a.id DESC LIMIT 1;

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
SELECT u.id, 'PRESCRIPTION_CREATED', 'prescriptions', pr.id, NULL
FROM users u, prescriptions pr WHERE u.email='doc2@hms.test' ORDER BY pr.id DESC LIMIT 1;

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
SELECT u.id, 'LAB_REPORT_FILED', 'lab_reports', lr.id, NULL
FROM users u, lab_reports lr WHERE u.email='lab1@hms.test' ORDER BY lr.id DESC LIMIT 1;

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata_json)
SELECT u.id, 'PAYMENT_SUCCESS', 'payments', p.id, NULL
FROM users u, payments p WHERE u.email='admin@hms.test' ORDER BY p.id DESC LIMIT 1;

COMMIT;

-- Key schema choices (brief)
-- 1) Separate role tables reference a unified users table to enforce role-specific attributes while keeping auth centralized (3NF+).
-- 2) Strong FK with ON DELETE CASCADE for patient-centric records ensures cleanup; RESTRICT for reference data (doctors, rooms, medicines) protects integrity.
-- 3) Billing uses bill_items with type to normalize costs across services; wallet is a transaction ledger for auditable revenue state.
-- 4) Comprehensive indexes on foreign keys and high-cardinality columns optimize common queries (patient, doctor, treatment flows).


