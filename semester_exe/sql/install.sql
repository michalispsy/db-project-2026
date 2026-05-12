DROP DATABASE IF EXISTS ygeiopolis;
CREATE DATABASE ygeiopolis;
USE ygeiopolis;

-- Λεξικά και Βοηθητικοί Πίνακες

CREATE TABLE staff_types (
    code VARCHAR(20),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_staff_types PRIMARY KEY (code)
);
INSERT INTO staff_types VALUES ('Doctor','Doctor'),('Nurse','Nurse'),('Admin','Admin');

CREATE TABLE doctor_ranks (
    code VARCHAR(30),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_doctor_ranks PRIMARY KEY (code)
);
INSERT INTO doctor_ranks VALUES
    ('Resident','Resident'),('Junior Attending','Junior Attending'),
    ('Senior Attending','Senior Attending'),('Director','Director');

CREATE TABLE nurse_ranks (
    code VARCHAR(30),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_nurse_ranks PRIMARY KEY (code)
);
INSERT INTO nurse_ranks VALUES
    ('Nursing Assistant','Nursing Assistant'),
    ('Registered Nurse','Registered Nurse'),
    ('Head Nurse','Head Nurse');

CREATE TABLE admin_roles (
    code VARCHAR(30),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_admin_roles PRIMARY KEY (code)
);
INSERT INTO admin_roles VALUES
    ('Billing Clerk','Billing Clerk'),('HR Officer','HR Officer'),
    ('IT Support','IT Support'),('Receptionist','Receptionist'),
    ('Records Clerk','Records Clerk'),('Secretary','Secretary'),
    ('Supplies Manager','Supplies Manager');

CREATE TABLE genders (
    code VARCHAR(10),
    name VARCHAR(20) NOT NULL,
    CONSTRAINT pk_genders PRIMARY KEY (code)
);
INSERT INTO genders VALUES ('M','Male'),('F','Female'),('Other','Other');

CREATE TABLE insurance_providers (
    code VARCHAR(30),
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_insurance_providers PRIMARY KEY (code)
);
INSERT INTO insurance_providers VALUES
    ('Allianz','Allianz'),('EOPYY','EOPYY'),('Ethniki','Ethniki'),
    ('Eurolife','Eurolife'),('Generali','Generali'),
    ('Interamerican','Interamerican'),('MetLife','MetLife'),
    ('Uninsured','Uninsured');

CREATE TABLE bed_types (
    code VARCHAR(20),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_bed_types PRIMARY KEY (code)
);
INSERT INTO bed_types VALUES
    ('Emergency','Emergency'),('ICU','ICU'),('Pediatric','Pediatric'),('Regular','Regular');

CREATE TABLE bed_statuses (
    code VARCHAR(20),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_bed_statuses PRIMARY KEY (code)
);
INSERT INTO bed_statuses VALUES
    ('Free','Available'),('Occupied','Occupied'),('Maintenance','Under Maintenance');

CREATE TABLE urgency_levels (
    `level` TINYINT,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_urgency_levels PRIMARY KEY (`level`)
);
INSERT INTO urgency_levels VALUES
    (1,'Immediate'),(2,'Emergent'),(3,'Urgent'),(4,'Less Urgent'),(5,'Non-Urgent');

CREATE TABLE triage_outcomes (
    code VARCHAR(20),
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_triage_outcomes PRIMARY KEY (code)
);
INSERT INTO triage_outcomes VALUES
    ('Discharged','Discharged with instructions'),
    ('Hospitalized','Referred for admission');

CREATE TABLE shift_slots (
    code VARCHAR(20),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_shift_slots PRIMARY KEY (code)
);
INSERT INTO shift_slots VALUES
    ('Morning','Morning (07-15)'),('Afternoon','Afternoon (15-23)'),('Night','Night (23-07)');

CREATE TABLE shift_statuses (
    code VARCHAR(20),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_shift_statuses PRIMARY KEY (code)
);
INSERT INTO shift_statuses VALUES
    ('Scheduled','Scheduled'),('In Progress','In Progress'),
    ('Completed','Completed'),('Cancelled','Cancelled'),('Understaffed','Understaffed');

CREATE TABLE procedure_categories (
    code VARCHAR(20),
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_procedure_categories PRIMARY KEY (code)
);
INSERT INTO procedure_categories VALUES
    ('Surgical','Surgical Procedures'),
    ('Diagnostic','Diagnostic Procedures'),
    ('Therapeutic','Therapeutic Procedures');

CREATE TABLE room_types (
    code VARCHAR(30),
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_room_types PRIMARY KEY (code)
);
INSERT INTO room_types VALUES
    ('Exam Room','Exam Room'),('ICU','ICU'),
    ('Operating Room','Operating Room'),('Therapy Room','Therapy Room');

CREATE TABLE exam_types (
    exam_code INT,
    name TEXT NOT NULL,
    CONSTRAINT pk_exam_types PRIMARY KEY (exam_code)
);

CREATE TABLE specialties (
    code VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_specialties PRIMARY KEY (code)
);
INSERT INTO specialties VALUES
    ('Cardiology','Cardiology'),
    ('Surgery','Surgery'),
    ('Pediatrics','Pediatrics'),
    ('Neurology','Neurology'),
    ('Orthopedics','Orthopedics'),
    ('Internal Medicine','Internal Medicine'),
    ('Emergency Medicine','Emergency Medicine'),
    ('Anesthesiology','Anesthesiology'),
    ('Radiology','Radiology'),
    ('Oncology','Oncology'),
    ('Psychiatry','Psychiatry'),
    ('Obstetrics and Gynecology','Obstetrics and Gynecology'),
    ('Dermatology','Dermatology'),
    ('Urology','Urology'),
    ('General Practice','General Practice');

-- Βασικοί Πίνακες της Βάσης

CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    bed_count INT NOT NULL DEFAULT 0,
    floor INT,
    building VARCHAR(50),
    director_AMKA CHAR(11),

    CONSTRAINT pk_dept PRIMARY KEY (dept_id)
);

CREATE TABLE beds (
    bed_id INT AUTO_INCREMENT,
    dept_id INT NOT NULL,
    room_capacity INT,
    bed_type VARCHAR(20) NOT NULL DEFAULT 'Regular',
    status VARCHAR(20) NOT NULL DEFAULT 'Free',
    assigned_to INT DEFAULT NULL,

    CONSTRAINT pk_beds PRIMARY KEY (bed_id),
    CONSTRAINT fk_beds_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE,
    CONSTRAINT fk_beds_bed_type FOREIGN KEY (bed_type) REFERENCES bed_types(code),
    CONSTRAINT fk_beds_status FOREIGN KEY (status) REFERENCES bed_statuses(code)
);

CREATE TABLE staff (
    AMKA CHAR(11),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INT AS (TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) VIRTUAL,
    email VARCHAR(50) UNIQUE,
    phone_number VARCHAR(15) UNIQUE,
    hire_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    staff_type VARCHAR(20),

    CONSTRAINT pk_staff PRIMARY KEY (AMKA),
    CONSTRAINT fk_staff_type FOREIGN KEY (staff_type) REFERENCES staff_types(code)
);

CREATE TABLE doctors (
    AMKA CHAR(11),
    license_number VARCHAR(20) NOT NULL,
    `rank` VARCHAR(30) NOT NULL,
    specialty VARCHAR(50) NOT NULL,
    supervisor_AMKA CHAR(11),

    CONSTRAINT pk_doctors PRIMARY KEY (AMKA),
    CONSTRAINT fk_doctors FOREIGN KEY (AMKA) REFERENCES staff(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_docs_supervisor FOREIGN KEY (supervisor_AMKA) REFERENCES doctors(AMKA) ON DELETE SET NULL,
    CONSTRAINT fk_doctor_rank FOREIGN KEY (`rank`) REFERENCES doctor_ranks(code),
    CONSTRAINT fk_doctor_specialty FOREIGN KEY (specialty) REFERENCES specialties(code),
    CONSTRAINT uni_license UNIQUE (license_number)
);

CREATE TABLE doctor_departments (
    doctor_AMKA CHAR(11),
    dept_id INT NOT NULL,

    CONSTRAINT pk_dd PRIMARY KEY (doctor_AMKA, dept_id),
    CONSTRAINT fk_dd_amka FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA) ON DELETE CASCADE,
    CONSTRAINT fd_dd_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

ALTER TABLE departments
    ADD CONSTRAINT fk_dept_director FOREIGN KEY (director_AMKA)
        REFERENCES doctors(AMKA) ON DELETE SET NULL;

CREATE TABLE admin_staff (
    AMKA CHAR(11),
    position VARCHAR(30) NOT NULL,
    office_location VARCHAR(50) NOT NULL,
    dept_id INT,

    CONSTRAINT pk_admin_staff PRIMARY KEY (AMKA),
    CONSTRAINT fk_admin_staff FOREIGN KEY (AMKA) REFERENCES staff(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_admin_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL,
    CONSTRAINT fk_admin_role FOREIGN KEY (position) REFERENCES admin_roles(code)
);

CREATE TABLE nurses (
    AMKA CHAR(11),
    `rank` VARCHAR(30) NOT NULL,
    dept_id INT,

    CONSTRAINT pk_nurses PRIMARY KEY (AMKA),
    CONSTRAINT fk_nurses FOREIGN KEY (AMKA) REFERENCES staff(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_nurses_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE,
    CONSTRAINT fk_nurse_rank FOREIGN KEY (`rank`) REFERENCES nurse_ranks(code)
);

CREATE TABLE patients (
    AMKA CHAR(11),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    fathers_name VARCHAR(50),
    date_of_birth DATE,
    age INT AS (TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) VIRTUAL,
    gender VARCHAR(10) NOT NULL,
    weight DECIMAL(5,1),
    height INT,
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(50) UNIQUE,
    address VARCHAR(255),
    occupation VARCHAR(50),
    nationality CHAR(2),
    insurance_provider VARCHAR(30),

    CONSTRAINT pk_patients PRIMARY KEY (AMKA),
    CONSTRAINT fk_patient_gender FOREIGN KEY (gender) REFERENCES genders(code),
    CONSTRAINT fk_patient_insurance FOREIGN KEY (insurance_provider) REFERENCES insurance_providers(code)
);

CREATE TABLE patient_emergency_contacts (
    patient_AMKA CHAR(11),
    contact_seq INT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(50),
    relationship_to_patient VARCHAR(50),

    CONSTRAINT pk_ec PRIMARY KEY (patient_AMKA, contact_seq),
    CONSTRAINT fk_ec_patient FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA) ON DELETE CASCADE
);

CREATE TABLE ken_categories (
    category_letter VARCHAR(2),
    description TEXT NOT NULL,
    CONSTRAINT pk_ken_cat PRIMARY KEY (category_letter)
);

CREATE TABLE ken (
    ken_code VARCHAR(7),
    description TEXT NOT NULL,
    base_cost DECIMAL(10, 2) NOT NULL,
    avg_length_of_stay INT,
    daily_surcharge_rate DECIMAL(10, 2),
    category_letter VARCHAR(2),

    CONSTRAINT pk_ken PRIMARY KEY (ken_code),
    CONSTRAINT fk_ken_category FOREIGN KEY (category_letter) REFERENCES ken_categories(category_letter)
);

CREATE TABLE icd10 (
    icd10_code VARCHAR(7),
    description TEXT NOT NULL,
    category VARCHAR(50),

    CONSTRAINT pk_icd10 PRIMARY KEY (icd10_code)
);

CREATE TABLE admissions (
    admission_id INT AUTO_INCREMENT,
    patient_AMKA CHAR(11) NOT NULL,
    department_id INT NOT NULL,
    bed_id INT NOT NULL,
    ken_code VARCHAR(7) NOT NULL,
    admission_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    discharge_date DATE DEFAULT NULL,
    admission_diagnosis_code VARCHAR(7) NOT NULL,
    discharge_diagnosis_code VARCHAR(7) DEFAULT NULL,
    base_cost  DECIMAL(10, 2) DEFAULT 0.00,
    extra_cost DECIMAL(10, 2) DEFAULT 0.00,
    total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (base_cost + extra_cost) VIRTUAL,

    CONSTRAINT pk_admissions PRIMARY KEY (admission_id),
    CONSTRAINT fk_adm_patient FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_adm_dept FOREIGN KEY (department_id) REFERENCES departments(dept_id),
    CONSTRAINT fk_adm_bed FOREIGN KEY (bed_id) REFERENCES beds(bed_id),
    CONSTRAINT fk_adm_ken FOREIGN KEY (ken_code) REFERENCES ken(ken_code),
    CONSTRAINT fk_adm_diag_in FOREIGN KEY (admission_diagnosis_code) REFERENCES icd10(icd10_code),
    CONSTRAINT fk_adm_diag_out FOREIGN KEY (discharge_diagnosis_code) REFERENCES icd10(icd10_code),
    CONSTRAINT chk_discharge_date CHECK (discharge_date IS NULL OR discharge_date >= admission_date)
);

CREATE TABLE lab_exams (
    exam_id INT AUTO_INCREMENT,
    admission_id INT NOT NULL,
    exam_code INT NOT NULL,
    exam_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    result_text TEXT,
    result_numeric DECIMAL(10, 2),
    result_unit VARCHAR(20),
    cost DECIMAL(10, 2) DEFAULT 0.00,
    doctor_AMKA CHAR(11) NOT NULL,

    CONSTRAINT pk_exams PRIMARY KEY (exam_id),
    CONSTRAINT fk_exam_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_ordered_by FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA),
    CONSTRAINT fk_exam_type FOREIGN KEY (exam_code) REFERENCES exam_types(exam_code),
    CONSTRAINT chk_exam_result CHECK (result_text IS NOT NULL OR result_numeric IS NOT NULL)
);

CREATE TABLE medical_procedures (
    procedure_code VARCHAR(20),
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20),
    standard_duration INT,
    standard_cost DECIMAL(10, 2),

    CONSTRAINT pk_proc_code PRIMARY KEY (procedure_code),
    CONSTRAINT fk_proc_category FOREIGN KEY (category) REFERENCES procedure_categories(code)
);

CREATE TABLE operating_rooms (
    room_id INT AUTO_INCREMENT,
    room_name VARCHAR(50) NOT NULL,
    room_type VARCHAR(30),
    floor INT,
    building VARCHAR(50),

    CONSTRAINT pk_op_rooms PRIMARY KEY (room_id),
    CONSTRAINT fk_room_type FOREIGN KEY (room_type) REFERENCES room_types(code)
);

CREATE TABLE procedure_executions (
    execution_id INT AUTO_INCREMENT,
    admission_id INT NOT NULL,
    procedure_code VARCHAR(20) NOT NULL,
    room_id INT NOT NULL,
    main_doctor_AMKA CHAR(11) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    actual_cost DECIMAL(10, 2),

    CONSTRAINT pk_proc_exec PRIMARY KEY (execution_id),
    CONSTRAINT fk_proc_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    CONSTRAINT fk_proc_code FOREIGN KEY (procedure_code) REFERENCES medical_procedures(procedure_code),
    CONSTRAINT fk_proc_room FOREIGN KEY (room_id) REFERENCES operating_rooms(room_id),
    CONSTRAINT fk_proc_doctor FOREIGN KEY (main_doctor_AMKA) REFERENCES doctors(AMKA),
    CONSTRAINT chk_proc_times CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE TABLE procedure_assistants (
    execution_id INT NOT NULL,
    staff_AMKA CHAR(11) NOT NULL,
    role VARCHAR(50) NOT NULL,

    CONSTRAINT pk_proc_staff PRIMARY KEY (staff_AMKA, execution_id),
    CONSTRAINT fk_proc_exec FOREIGN KEY (execution_id) REFERENCES procedure_executions(execution_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_AMKA) REFERENCES staff(AMKA)
);

CREATE TABLE triages (
    triage_id INT AUTO_INCREMENT,
    patient_AMKA CHAR(11) NOT NULL,
    nurse_AMKA CHAR(11) NOT NULL,
    arrival_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    triage_time DATETIME DEFAULT NULL,
    minutes_waited INT DEFAULT NULL,
    urgency_level TINYINT,
    symptoms TEXT,
    outcome VARCHAR(20) DEFAULT NULL,
    admission_id INT DEFAULT NULL,

    CONSTRAINT pk_triages PRIMARY KEY (triage_id),
    CONSTRAINT fk_triage_patient FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA),
    CONSTRAINT fk_triage_nurse FOREIGN KEY (nurse_AMKA) REFERENCES nurses(AMKA),
    CONSTRAINT fk_triage_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id),
    CONSTRAINT fk_triage_urgency FOREIGN KEY (urgency_level) REFERENCES urgency_levels(`level`),
    CONSTRAINT fk_triage_outcome FOREIGN KEY (outcome) REFERENCES triage_outcomes(code),
    CONSTRAINT uni_admission_id UNIQUE (admission_id),
    CONSTRAINT chk_triage_consistency CHECK (
        outcome IS NULL OR
        (outcome = 'Hospitalized' AND admission_id IS NOT NULL) OR
        (outcome = 'Discharged'   AND admission_id IS NULL)
    )
);

CREATE TABLE active_substances (
    substance_id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,

    CONSTRAINT pk_active_substances PRIMARY KEY (substance_id),
    CONSTRAINT uni_substance_name UNIQUE (name)
);

CREATE TABLE drugs (
    drug_id INT AUTO_INCREMENT,
    ema_code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    manufacturer VARCHAR(100),

    CONSTRAINT pk_drugs PRIMARY KEY (drug_id),
    CONSTRAINT uni_ema_code UNIQUE (ema_code)
);

CREATE TABLE drug_contains_substances (
    drug_id INT,
    substance_id INT,

    CONSTRAINT pk_drug_cs PRIMARY KEY (drug_id, substance_id),
    CONSTRAINT fk_drug_id FOREIGN KEY (drug_id) REFERENCES drugs(drug_id) ON DELETE CASCADE,
    CONSTRAINT fk_dcs_substance_id FOREIGN KEY (substance_id) REFERENCES active_substances(substance_id) ON DELETE CASCADE
);

CREATE TABLE patient_allergies (
    patient_AMKA CHAR(11),
    substance_id INT,

    CONSTRAINT pk_patient_allergies PRIMARY KEY (patient_AMKA, substance_id),
    CONSTRAINT fk_allergy_patient FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_allergy_substance FOREIGN KEY (substance_id) REFERENCES active_substances(substance_id) ON DELETE CASCADE
);

CREATE TABLE prescriptions (
    prescription_id INT AUTO_INCREMENT,
    admission_id INT NOT NULL,
    patient_AMKA CHAR(11) NOT NULL,
    doctor_AMKA CHAR(11) NOT NULL,
    drug_id INT NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    CONSTRAINT pk_prescriptions PRIMARY KEY (prescription_id),
    CONSTRAINT fk_presc_admi_id FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    CONSTRAINT fk_presc_pati_id FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA),
    CONSTRAINT fk_presc_doct_id FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA),
    CONSTRAINT fk_presc_drug_id FOREIGN KEY (drug_id) REFERENCES drugs(drug_id),
    CONSTRAINT uni_prescription UNIQUE (doctor_AMKA, patient_AMKA, drug_id, start_date),
    CONSTRAINT chk_presc_dates CHECK (end_date > start_date)
);

CREATE TABLE admission_ratings (
    admission_id INT,
    nursing_quality TINYINT NOT NULL,
    cleanliness TINYINT NOT NULL,
    food TINYINT NOT NULL,
    overall TINYINT NOT NULL,
    comment TEXT,
    rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_admission_ratings PRIMARY KEY (admission_id),
    CONSTRAINT fk_rating_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    CONSTRAINT chk_nursing_range CHECK (nursing_quality BETWEEN 1 AND 5),
    CONSTRAINT chk_clean_range CHECK (cleanliness BETWEEN 1 AND 5),
    CONSTRAINT chk_food_range CHECK (food BETWEEN 1 AND 5),
    CONSTRAINT chk_overall_range CHECK (overall BETWEEN 1 AND 5)
);

CREATE TABLE doctor_ratings (
    rating_id INT AUTO_INCREMENT,
    admission_id INT NOT NULL,
    doctor_AMKA CHAR(11) NOT NULL,
    medical_care_quality TINYINT NOT NULL,
    comment TEXT,
    rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_doc_ratings PRIMARY KEY (rating_id),
    CONSTRAINT fk_doc_rating_adm FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_rating_doc FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA),
    CONSTRAINT uni_admission_doctor_duplicate UNIQUE (admission_id, doctor_AMKA),
    CONSTRAINT chk_medical_range CHECK (medical_care_quality BETWEEN 1 AND 5)
);

CREATE TABLE shifts (
    shift_id INT AUTO_INCREMENT,
    shift_date DATE NOT NULL,
    shift_slot VARCHAR(20) NOT NULL,
    shift_status VARCHAR(20) DEFAULT 'Scheduled',
    dept_id INT NOT NULL,

    CONSTRAINT pk_shift PRIMARY KEY (shift_id),
    CONSTRAINT fk_shift_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE,
    CONSTRAINT fk_shift_slot FOREIGN KEY (shift_slot) REFERENCES shift_slots(code),
    CONSTRAINT fk_shift_status FOREIGN KEY (shift_status) REFERENCES shift_statuses(code),
    CONSTRAINT uni_shift UNIQUE (dept_id, shift_date, shift_slot)
);

CREATE TABLE shift_staffing (
    shift_id INT,
    staff_AMKA CHAR(11),

    CONSTRAINT pk_shift_staffing PRIMARY KEY (staff_AMKA, shift_id),
    CONSTRAINT fk_staffing_shift FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE CASCADE,
    CONSTRAINT fk_staffing_staff FOREIGN KEY (staff_AMKA) REFERENCES staff(AMKA) ON DELETE CASCADE
);

CREATE TABLE department_images (
    img_id INT AUTO_INCREMENT,
    dept_id INT NOT NULL,
    img_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    ordering INT DEFAULT 0,

    CONSTRAINT pk_dept_images PRIMARY KEY (img_id),
    CONSTRAINT fk_dept_img_relation FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

CREATE TABLE drug_images (
    img_id INT AUTO_INCREMENT,
    drug_id INT NOT NULL,
    img_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    ordering INT DEFAULT 0,

    CONSTRAINT pk_drug_images PRIMARY KEY (img_id),
    CONSTRAINT fk_drug_img_relation FOREIGN KEY (drug_id) REFERENCES drugs(drug_id) ON DELETE CASCADE
);

CREATE TABLE doctor_images (
    img_id INT AUTO_INCREMENT,
    doctor_AMKA CHAR(11) NOT NULL,
    img_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    ordering INT DEFAULT 0,

    CONSTRAINT pk_doctor_images PRIMARY KEY (img_id),
    CONSTRAINT fk_doctor_img_relation FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA) ON DELETE CASCADE
);

-- Triggers για αυτοματοποιήσεις

DELIMITER //

CREATE TRIGGER beds_insert_trigger
AFTER INSERT ON beds
FOR EACH ROW
UPDATE departments
SET bed_count = bed_count + 1
WHERE dept_id = NEW.dept_id;

CREATE TRIGGER beds_delete_trigger
AFTER DELETE ON beds
FOR EACH ROW
UPDATE departments
SET bed_count = bed_count - 1
WHERE dept_id = OLD.dept_id;

CREATE TRIGGER set_contact_seq_trigger
BEFORE INSERT ON patient_emergency_contacts
FOR EACH ROW
BEGIN
    SET NEW.contact_seq = (
        SELECT COALESCE(MAX(contact_seq), 0) + 1
        FROM patient_emergency_contacts
        WHERE patient_AMKA = NEW.patient_AMKA
    );
END//

CREATE TRIGGER check_admission_dept_matches_bed_insert
BEFORE INSERT ON admissions
FOR EACH ROW
BEGIN
    DECLARE v_bed_dept INT;
    SELECT dept_id INTO v_bed_dept FROM beds WHERE bed_id = NEW.bed_id;
    IF v_bed_dept <> NEW.department_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Bed does not belong to the specified department.';
    END IF;
END//

CREATE TRIGGER check_admission_dept_matches_bed_update
BEFORE UPDATE ON admissions
FOR EACH ROW
BEGIN
    DECLARE v_bed_dept INT;
    IF NEW.bed_id <> OLD.bed_id OR NEW.department_id <> OLD.department_id THEN
        SELECT dept_id INTO v_bed_dept FROM beds WHERE bed_id = NEW.bed_id;
        IF v_bed_dept <> NEW.department_id THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Bed does not belong to the specified department.';
        END IF;
    END IF;
END//

CREATE TRIGGER check_bed_overlap_insert_trigger
BEFORE INSERT ON admissions
FOR EACH ROW
BEGIN
    DECLARE v_bed_status VARCHAR(20);
    DECLARE v_overlap_count INT;

    SELECT status INTO v_bed_status FROM beds WHERE bed_id = NEW.bed_id;
    IF v_bed_status = 'Maintenance' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Η κλίνη βρίσκεται σε συντήρηση.';
    END IF;

    SELECT COUNT(*) INTO v_overlap_count
    FROM admissions
    WHERE bed_id = NEW.bed_id
      AND NEW.admission_date < COALESCE(discharge_date, '9999-12-31')
      AND COALESCE(NEW.discharge_date, '9999-12-31') > admission_date;

    IF v_overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Η κλίνη είναι ήδη κατειλημμένη για αυτό το διάστημα.';
    END IF;
END//

CREATE TRIGGER check_bed_overlap_update_trigger
BEFORE UPDATE ON admissions
FOR EACH ROW
BEGIN
    DECLARE v_overlap_count INT;

    IF NEW.bed_id <> OLD.bed_id
       OR NEW.admission_date <> OLD.admission_date
       OR NOT (NEW.discharge_date <=> OLD.discharge_date) THEN

        SELECT COUNT(*) INTO v_overlap_count
        FROM admissions
        WHERE bed_id = NEW.bed_id
          AND admission_id <> NEW.admission_id
          AND NEW.admission_date < COALESCE(discharge_date, '9999-12-31')
          AND COALESCE(NEW.discharge_date, '9999-12-31') > admission_date;

        IF v_overlap_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Σφάλμα: Η κλίνη είναι ήδη κατειλημμένη για αυτό το διάστημα.';
        END IF;
    END IF;
END//

CREATE TRIGGER calculate_admission_base_cost_trigger
BEFORE INSERT ON admissions
FOR EACH ROW
BEGIN
    DECLARE v_cost DECIMAL(10, 2);
    SELECT base_cost INTO v_cost FROM ken WHERE ken_code = NEW.ken_code;
    SET NEW.base_cost = v_cost, NEW.extra_cost = 0.00;
END//

CREATE TRIGGER calculate_admission_extra_cost_trigger
BEFORE UPDATE ON admissions
FOR EACH ROW
BEGIN
    DECLARE v_avg_length_of_stay INT;
    DECLARE v_days_stayed INT;
    DECLARE v_daily_surcharge_rate DECIMAL(10, 2);
    DECLARE v_base_cost DECIMAL(10, 2);

    IF OLD.ken_code <> NEW.ken_code THEN
        SELECT base_cost INTO v_base_cost FROM ken WHERE ken_code = NEW.ken_code;
        SET NEW.base_cost = v_base_cost;
    ELSEIF NEW.base_cost <> OLD.base_cost THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Το βασικό κόστος υπολογίζεται αυτόματα από το ΚΕΝ.';
    END IF;

    IF OLD.discharge_date IS NULL AND NEW.discharge_date IS NOT NULL THEN
        SELECT avg_length_of_stay, daily_surcharge_rate
        INTO v_avg_length_of_stay, v_daily_surcharge_rate
        FROM ken
        WHERE ken_code = NEW.ken_code;

        SET v_days_stayed = DATEDIFF(NEW.discharge_date, NEW.admission_date);
        IF v_days_stayed = 0 THEN SET v_days_stayed = 1; END IF;

        IF v_days_stayed > v_avg_length_of_stay THEN
            SET NEW.extra_cost = (v_days_stayed - v_avg_length_of_stay) * v_daily_surcharge_rate;
        ELSE
            SET NEW.extra_cost = 0.00;
        END IF;
    END IF;
END//

CREATE TRIGGER set_bed_occupied_trigger
AFTER INSERT ON admissions
FOR EACH ROW
BEGIN
    UPDATE beds SET status = 'Occupied', assigned_to = NEW.admission_id WHERE bed_id = NEW.bed_id;
END//

CREATE TRIGGER set_bed_free_trigger
AFTER UPDATE ON admissions
FOR EACH ROW
BEGIN
    IF OLD.discharge_date IS NULL AND NEW.discharge_date IS NOT NULL THEN
        UPDATE beds SET status = 'Free', assigned_to = NULL WHERE bed_id = NEW.bed_id;
    END IF;
END//

-- Triggers για ελέγχους και περιορισμούς (Business Rules)

CREATE TRIGGER doctor_rank_insert_check_trigger
BEFORE INSERT ON doctors
FOR EACH ROW
BEGIN
    IF NEW.rank = 'Resident' AND NEW.supervisor_AMKA IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Οι ειδικευόμενοι ιατροί πρέπει υποχρεωτικά να έχουν επόπτη.';
    END IF;

    IF NEW.rank = 'Director' AND NEW.supervisor_AMKA IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Οι διευθυντές δεν μπορούν να έχουν επόπτη.';
    END IF;
END//

CREATE TRIGGER doctor_rank_update_check_trigger
BEFORE UPDATE ON doctors
FOR EACH ROW
BEGIN
    IF NEW.rank = 'Resident' AND NEW.supervisor_AMKA IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Οι ειδικευόμενοι ιατροί πρέπει υποχρεωτικά να έχουν επόπτη.';
    END IF;

    IF NEW.rank = 'Director' AND NEW.supervisor_AMKA IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Οι διευθυντές δεν μπορούν να έχουν επόπτη.';
    END IF;
END//

CREATE PROCEDURE check_supervisor_cycle_proc(IN p_doctor_amka CHAR(11), IN p_new_supervisor_amka CHAR(11))
main: BEGIN
    DECLARE v_count INT DEFAULT 0;

    IF p_new_supervisor_amka IS NULL THEN
        LEAVE main;
    END IF;

    IF p_doctor_amka = p_new_supervisor_amka THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Ένας ιατρός δεν μπορεί να είναι επόπτης του εαυτού του.';
    END IF;

    WITH RECURSIVE supervision_chain AS (
        SELECT supervisor_AMKA
        FROM doctors
        WHERE AMKA = p_new_supervisor_amka
        
        UNION ALL
        
        SELECT d.supervisor_AMKA
        FROM doctors d
        INNER JOIN supervision_chain sc ON d.AMKA = sc.supervisor_AMKA
        WHERE d.supervisor_AMKA IS NOT NULL AND sc.supervisor_AMKA <> p_doctor_amka
    )
    SELECT COUNT(*) INTO v_count 
    FROM supervision_chain 
    WHERE supervisor_AMKA = p_doctor_amka
    LIMIT 1;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Εντοπίστηκε κυκλική εξάρτηση στην ιεραρχία εποπτείας.';
    END IF;
END main //

CREATE TRIGGER doctor_supervisor_insert_trigger
BEFORE INSERT ON doctors
FOR EACH ROW
BEGIN
    CALL check_supervisor_cycle_proc(NEW.AMKA, NEW.supervisor_AMKA);
END //

CREATE TRIGGER doctor_supervisor_update_trigger
BEFORE UPDATE ON doctors
FOR EACH ROW
BEGIN
    IF (NEW.supervisor_AMKA <> OLD.supervisor_AMKA) 
        OR (NEW.supervisor_AMKA IS NULL AND OLD.supervisor_AMKA IS NOT NULL)
        OR (NEW.supervisor_AMKA IS NOT NULL AND OLD.supervisor_AMKA IS NULL) 
    THEN
        CALL check_supervisor_cycle_proc(NEW.AMKA, NEW.supervisor_AMKA);
    END IF;
END //

CREATE TRIGGER check_for_admins_in_procedure_trigger
BEFORE INSERT ON procedure_assistants
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT NULL FROM admin_staff WHERE AMKA = NEW.staff_AMKA) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Μόνο ιατροί ή νοσηλευτές μπορούν να συμμετέχουν ως βοηθοί.';
    END IF;
END//

CREATE PROCEDURE check_if_discharged(IN p_admission_id INT)
BEGIN
    DECLARE p_discharge_date DATE;
    SELECT discharge_date INTO p_discharge_date 
    FROM admissions 
    WHERE admission_id = p_admission_id;

    IF p_discharge_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Η αξιολόγηση επιτρέπεται μόνο μετά το εξιτήριο.';
    END IF;
END//

CREATE TRIGGER check_admission_rating_trigger
BEFORE INSERT ON admission_ratings
FOR EACH ROW
BEGIN
    CALL check_if_discharged(NEW.admission_id);
END//

CREATE PROCEDURE check_doctor_treated_patient(IN p_admission_id INT, IN p_doctor_AMKA CHAR(11))
BEGIN
    IF NOT EXISTS (
        SELECT NULL FROM prescriptions
            WHERE admission_id = p_admission_id AND doctor_AMKA = p_doctor_AMKA
        UNION ALL
        SELECT NULL FROM procedure_executions
            WHERE admission_id = p_admission_id AND main_doctor_AMKA = p_doctor_AMKA
        UNION ALL
        SELECT NULL FROM lab_exams
            WHERE admission_id = p_admission_id AND doctor_AMKA = p_doctor_AMKA
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Ο ιατρός δεν συμμετείχε στη νοσηλεία αυτού του ασθενή.';
    END IF;
END//

CREATE TRIGGER check_doctor_rating_insert_trigger
BEFORE INSERT ON doctor_ratings
FOR EACH ROW
BEGIN
    CALL check_doctor_treated_patient(NEW.admission_id, NEW.doctor_AMKA);
    CALL check_if_discharged(NEW.admission_id);
END//

CREATE TRIGGER check_doctor_rating_update_trigger
BEFORE UPDATE ON doctor_ratings
FOR EACH ROW
BEGIN
    CALL check_doctor_treated_patient(NEW.admission_id, NEW.doctor_AMKA);
    CALL check_if_discharged(NEW.admission_id);
END//

CREATE PROCEDURE check_exam_within_admission(IN p_admission_id INT, IN p_exam_date DATETIME)
BEGIN
    DECLARE v_adm_date DATE;
    DECLARE v_dis_date DATE;
    SELECT admission_date, discharge_date INTO v_adm_date, v_dis_date
    FROM admissions WHERE admission_id = p_admission_id;
    IF DATE(p_exam_date) < v_adm_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Η ημερομηνία της εξέτασης δεν μπορεί να προηγείται της εισαγωγής.';
    END IF;
    IF v_dis_date IS NOT NULL AND DATE(p_exam_date) > v_dis_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Η ημερομηνία της εξέτασης δεν μπορεί να είναι μετά το εξιτήριο.';
    END IF;
END//

CREATE TRIGGER check_lab_exam_window_insert_trigger
BEFORE INSERT ON lab_exams
FOR EACH ROW
BEGIN
    CALL check_exam_within_admission(NEW.admission_id, NEW.exam_date);
END//

CREATE TRIGGER check_lab_exam_window_update_trigger
BEFORE UPDATE ON lab_exams
FOR EACH ROW
BEGIN
    IF NOT (NEW.exam_date <=> OLD.exam_date) OR NEW.admission_id <> OLD.admission_id THEN
        CALL check_exam_within_admission(NEW.admission_id, NEW.exam_date);
    END IF;
END//

CREATE PROCEDURE check_procedure_within_admission(IN p_admission_id INT, IN p_start DATETIME)
BEGIN
    DECLARE v_adm_date DATE;
    DECLARE v_dis_date DATE;
    SELECT admission_date, discharge_date INTO v_adm_date, v_dis_date
    FROM admissions WHERE admission_id = p_admission_id;
    IF DATE(p_start) < v_adm_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Η επέμβαση δεν μπορεί να γίνει πριν την εισαγωγή.';
    END IF;
    IF v_dis_date IS NOT NULL AND DATE(p_start) > v_dis_date THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Η επέμβαση δεν μπορεί να γίνει μετά το εξιτήριο.';
    END IF;
END//

CREATE TRIGGER check_procedure_window_insert_trigger
BEFORE INSERT ON procedure_executions
FOR EACH ROW
BEGIN
    CALL check_procedure_within_admission(NEW.admission_id, NEW.start_time);
END//

CREATE TRIGGER check_procedure_window_update_trigger
BEFORE UPDATE ON procedure_executions
FOR EACH ROW
BEGIN
    IF NOT (NEW.start_time <=> OLD.start_time) OR NEW.admission_id <> OLD.admission_id THEN
        CALL check_procedure_within_admission(NEW.admission_id, NEW.start_time);
    END IF;
END//

CREATE TRIGGER check_patient_drug_allergies_trigger
BEFORE INSERT ON prescriptions
FOR EACH ROW
BEGIN
    DECLARE v_allergy_name VARCHAR(100);

    SELECT sub.name INTO v_allergy_name
    FROM drug_contains_substances dcs
    JOIN patient_allergies pa ON dcs.substance_id = pa.substance_id
    JOIN active_substances sub ON sub.substance_id = pa.substance_id
    WHERE dcs.drug_id = NEW.drug_id AND pa.patient_AMKA = NEW.patient_AMKA
    LIMIT 1;

    IF v_allergy_name IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Ο ασθενής είναι αλλεργικός σε δραστική ουσία του φαρμάκου!';
    END IF;
END//

CREATE PROCEDURE check_procedure_conflicts(IN p_room_id INT, IN p_doctor_AMKA CHAR(11), IN p_start DATETIME, IN p_end DATETIME, IN p_exec_id INT)
BEGIN
    DECLARE v_end DATETIME;
    SET v_end = COALESCE(p_end, '2099-12-31 23:59:59');

    IF EXISTS (
        SELECT NULL FROM procedure_executions 
        WHERE room_id = p_room_id 
        AND execution_id != COALESCE(p_exec_id, -1)
        AND p_start < COALESCE(end_time, '2099-12-31 23:59:59') 
        AND v_end > start_time
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Σφάλμα: Η αίθουσα είναι κατειλημμένη αυτή τη στιγμή.';
    END IF;

    IF EXISTS (
        SELECT NULL FROM procedure_executions 
        WHERE main_doctor_AMKA = p_doctor_AMKA 
        AND execution_id != COALESCE(p_exec_id, -1)
        AND p_start < COALESCE(end_time, '2099-12-31 23:59:59') 
        AND v_end > start_time
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Σφάλμα: Ο ιατρός συμμετέχει ήδη σε άλλη επέμβαση.';
    END IF;
END //

CREATE TRIGGER procedure_overlap_insert_trigger
BEFORE INSERT ON procedure_executions
FOR EACH ROW
BEGIN
    CALL check_procedure_conflicts(NEW.room_id, NEW.main_doctor_AMKA, NEW.start_time, NEW.end_time, NULL);
END //

CREATE TRIGGER trg_procedure_overlap_update
BEFORE UPDATE ON procedure_executions
FOR EACH ROW
BEGIN
    CALL check_procedure_conflicts(NEW.room_id, NEW.main_doctor_AMKA, NEW.start_time, NEW.end_time, NEW.execution_id);
END //

CREATE PROCEDURE validate_staff_shift_max_limit(IN p_staff_AMKA VARCHAR(11), IN p_shift_id INT)
BEGIN
    DECLARE shift_count INT;
    DECLARE p_position VARCHAR(20);
    DECLARE current_month INT;
    DECLARE current_year INT;

    SELECT MONTH(shift_date), YEAR(shift_date) INTO current_month, current_year
    FROM shifts WHERE shift_id = p_shift_id;
    SELECT staff_type INTO p_position FROM staff WHERE AMKA = p_staff_AMKA;

    SELECT COUNT(*) INTO shift_count
    FROM shift_staffing ss
    JOIN shifts s ON ss.shift_id = s.shift_id
    WHERE ss.staff_AMKA = p_staff_AMKA
    AND MONTH(s.shift_date) = current_month
    AND YEAR(s.shift_date) = current_year;

    IF (p_position = 'Doctor' AND shift_count >= 15) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Υπέρβαση μέγιστου ορίου εφημεριών ιατρού (15/μήνα).';
    ELSEIF (p_position = 'Nurse' AND shift_count >= 20) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Υπέρβαση μέγιστου ορίου εφημεριών νοσηλευτή (20/μήνα).';
    ELSEIF (p_position = 'Admin' AND shift_count >= 25) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Υπέρβαση μέγιστου ορίου εφημεριών διοικητικού (25/μήνα).';
    END IF;
END//

CREATE PROCEDURE validate_consecutive_nights(IN p_staff_AMKA VARCHAR(11), IN p_shift_id INT)
main: BEGIN
    DECLARE p_date DATE;
    DECLARE p_type VARCHAR(20);
    DECLARE consecutive_count INT;

    SELECT shift_date, shift_slot INTO p_date, p_type FROM shifts WHERE shift_id = p_shift_id;

    IF p_type <> 'Night' THEN
        LEAVE main;
    END IF;

    IF EXISTS (
        SELECT 1 FROM shift_staffing ss1
        JOIN shifts s1 ON ss1.shift_id = s1.shift_id
        WHERE ss1.staff_AMKA = p_staff_AMKA AND s1.shift_slot = 'Night'
        AND s1.shift_date = DATE_ADD(p_date, INTERVAL 1 DAY)
        AND EXISTS (
            SELECT 1 FROM shift_staffing ss2
            JOIN shifts s2 ON ss2.shift_id = s2.shift_id
            WHERE ss2.staff_AMKA = p_staff_AMKA AND s2.shift_slot = 'Night'
            AND s2.shift_date = DATE_ADD(p_date, INTERVAL 2 DAY)
        )
        ) OR EXISTS (
        SELECT 1 FROM shift_staffing ss1
        JOIN shifts s1 ON ss1.shift_id = s1.shift_id
        WHERE ss1.staff_AMKA = p_staff_AMKA AND s1.shift_slot = 'Night'
        AND s1.shift_date = DATE_SUB(p_date, INTERVAL 1 DAY)
        AND EXISTS (
            SELECT 1 FROM shift_staffing ss2
            JOIN shifts s2 ON ss2.shift_id = s2.shift_id
            WHERE ss2.staff_AMKA = p_staff_AMKA AND s2.shift_slot = 'Night'
            AND s2.shift_date = DATE_ADD(p_date, INTERVAL 1 DAY)
        )
        ) OR EXISTS (
        SELECT 1 FROM shift_staffing ss1
        JOIN shifts s1 ON ss1.shift_id = s1.shift_id
        WHERE ss1.staff_AMKA = p_staff_AMKA AND s1.shift_slot = 'Night'
        AND s1.shift_date = DATE_SUB(p_date, INTERVAL 1 DAY)
        AND EXISTS (
            SELECT 1 FROM shift_staffing ss2
            JOIN shifts s2 ON ss2.shift_id = s2.shift_id
            WHERE ss2.staff_AMKA = p_staff_AMKA AND s2.shift_slot = 'Night'
            AND s2.shift_date = DATE_SUB(p_date, INTERVAL 2 DAY)
        )
    ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Σφάλμα: Απαγορεύονται πάνω από 3 συνεχόμενες νυχτερινές βάρδιες.';
END IF;
END main //

CREATE TRIGGER shift_staffing_insert_trigger
BEFORE INSERT ON shift_staffing
FOR EACH ROW
BEGIN
    CALL validate_staff_shift_max_limit(NEW.staff_AMKA, NEW.shift_id);
    CALL validate_consecutive_nights(NEW.staff_AMKA, NEW.shift_id);
END //

CREATE TRIGGER shift_staffing_update_trigger
BEFORE UPDATE ON shift_staffing
FOR EACH ROW
BEGIN
    IF (NEW.staff_AMKA <> OLD.staff_AMKA OR NEW.shift_id <> OLD.shift_id) THEN
        CALL validate_staff_shift_max_limit(NEW.staff_AMKA, NEW.shift_id);
        CALL validate_consecutive_nights(NEW.staff_AMKA, NEW.shift_id);
    END IF;
END //
        
CREATE PROCEDURE validate_shift_rest(IN p_staff_AMKA CHAR(11), IN p_shift_id INT)
BEGIN
    DECLARE v_new_date DATE;
    DECLARE v_new_slot VARCHAR(20);
    DECLARE v_new_start DATETIME;
    DECLARE v_violation INT DEFAULT 0;

    SELECT shift_date, shift_slot INTO v_new_date, v_new_slot
    FROM shifts WHERE shift_id = p_shift_id;

    SET v_new_start = TIMESTAMP(v_new_date,
        CASE v_new_slot
            WHEN 'Morning'   THEN '07:00:00'
            WHEN 'Afternoon' THEN '15:00:00'
            WHEN 'Night'     THEN '23:00:00'
        END);

    -- Each shift is 8h long, so two shifts have >=8h rest gap
    -- iff the distance between their start times is >=16h.
    SELECT COUNT(*) INTO v_violation
    FROM shift_staffing ss
    JOIN shifts s ON ss.shift_id = s.shift_id
    WHERE ss.staff_AMKA = p_staff_AMKA
      AND ss.shift_id <> p_shift_id
      AND ABS(TIMESTAMPDIFF(MINUTE, v_new_start,
              TIMESTAMP(s.shift_date,
                  CASE s.shift_slot
                      WHEN 'Morning'   THEN '07:00:00'
                      WHEN 'Afternoon' THEN '15:00:00'
                      WHEN 'Night'     THEN '23:00:00'
                  END))) < 16 * 60;

    IF v_violation > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Πρέπει να μεσολαβούν τουλάχιστον 8 ώρες ανάπαυσης μεταξύ βαρδιών.';
    END IF;
END//

CREATE TRIGGER prevent_consecutive_shift_insert_trigger
BEFORE INSERT ON shift_staffing
FOR EACH ROW
BEGIN
    CALL validate_shift_rest(NEW.staff_AMKA, NEW.shift_id);
END//

CREATE TRIGGER prevent_consecutive_shift_update_trigger
BEFORE UPDATE ON shift_staffing
FOR EACH ROW
BEGIN
    IF (NEW.staff_AMKA <> OLD.staff_AMKA OR NEW.shift_id <> OLD.shift_id) THEN
        CALL validate_shift_rest(NEW.staff_AMKA, NEW.shift_id);
    END IF;
END//

CREATE PROCEDURE validate_shift_requirements(IN p_shift_id INT)
BEGIN
    DECLARE doc_count INT;
    DECLARE nurse_count INT;
    DECLARE admin_count INT;
    DECLARE resident_exists INT;
    DECLARE senior_exists INT;

    SELECT 
        COUNT(CASE WHEN s.staff_type = 'Doctor' THEN 1 END),
        COUNT(CASE WHEN s.staff_type = 'Nurse' THEN 1 END),
        COUNT(CASE WHEN s.staff_type = 'Admin' THEN 1 END)
    INTO doc_count, nurse_count, admin_count
    FROM shift_staffing ss
    JOIN staff s ON ss.staff_AMKA = s.AMKA
    WHERE ss.shift_id = p_shift_id;

    IF doc_count < 3 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Απαιτούνται τουλάχιστον 3 ιατροί στην εφημερία.';
    ELSEIF nurse_count < 6 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Απαιτούνται τουλάχιστον 6 νοσηλευτές στην εφημερία.';
    ELSEIF admin_count < 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Απαιτούνται τουλάχιστον 2 διοικητικοί στην εφημερία.';
    END IF;

    SELECT COUNT(*) INTO resident_exists
    FROM shift_staffing ss
    JOIN doctors d ON ss.staff_AMKA = d.AMKA
    WHERE ss.shift_id = p_shift_id AND d.rank = 'Resident';

    IF resident_exists > 0 THEN
        SELECT COUNT(*) INTO senior_exists
        FROM shift_staffing ss
        JOIN doctors d ON ss.staff_AMKA = d.AMKA
        WHERE ss.shift_id = p_shift_id 
        AND d.rank IN ('Senior Attending', 'Director');

        IF senior_exists = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Σφάλμα: Σε βάρδια με ειδικευόμενο πρέπει να παρευρίσκεται Επιμελητής Α ή Διευθυντής.';
        END IF;
    END IF;
END//

CREATE PROCEDURE update_shift_staffing_status(IN p_shift_id INT)
BEGIN
    DECLARE doc_count INT;
    DECLARE nurse_count INT;
    DECLARE admin_count INT;
    DECLARE current_status VARCHAR(20);

    SELECT 
        COUNT(CASE WHEN s.staff_type = 'Doctor' THEN 1 END),
        COUNT(CASE WHEN s.staff_type = 'Nurse' THEN 1 END),
        COUNT(CASE WHEN s.staff_type = 'Admin' THEN 1 END)
    INTO doc_count, nurse_count, admin_count
    FROM shift_staffing ss
    JOIN staff s ON ss.staff_AMKA = s.AMKA
    WHERE ss.shift_id = p_shift_id;

    IF doc_count >= 3 AND nurse_count >= 6 AND admin_count >= 2 THEN
        SET current_status = 'Scheduled';
    ELSE
        SET current_status = 'Understaffed';
    END IF;

    UPDATE shifts 
    SET shift_status = current_status 
    WHERE shift_id = p_shift_id 
    AND shift_status IN ('Scheduled', 'Understaffed'); 
END//

CREATE TRIGGER after_staffing_insert_trigger
AFTER INSERT ON shift_staffing
FOR EACH ROW
BEGIN
    CALL update_shift_staffing_status(NEW.shift_id);
END//

CREATE TRIGGER after_staffing_delete_trigger
AFTER DELETE ON shift_staffing
FOR EACH ROW
BEGIN
    CALL update_shift_staffing_status(OLD.shift_id);
END//

CREATE TRIGGER validate_shift_on_lock_trigger
BEFORE UPDATE ON shifts
FOR EACH ROW
BEGIN
    IF NEW.shift_status = 'Completed' AND OLD.shift_status <> 'Completed' THEN
        CALL validate_shift_requirements(NEW.shift_id);
    END IF;
END//

CREATE TRIGGER trg_protect_locked_shifts
BEFORE INSERT ON shift_staffing
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT shift_status INTO v_status 
    FROM shifts 
    WHERE shift_id = NEW.shift_id;

    IF v_status = 'Completed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Δεν μπορείτε να προσθέσετε προσωπικό σε κλειδωμένη βάρδια.';
    END IF;
END//

CREATE TRIGGER trg_protect_locked_shifts_delete
BEFORE DELETE ON shift_staffing
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT shift_status INTO v_status 
    FROM shifts 
    WHERE shift_id = OLD.shift_id;

    IF v_status = 'Completed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Δεν μπορείτε να αφαιρέσετε προσωπικό από κλειδωμένη βάρδια.';
    END IF;
END//

DELIMITER ;
