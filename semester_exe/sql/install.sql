USE information_schema;
DROP DATABASE IF EXISTS ygeiopolis;
CREATE DATABASE ygeiopolis;
USE ygeiopolis;

-- ============================================================
-- LOOKUP TABLES
-- ============================================================

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
    ('Interamerican','Interamerican'),('MetLife','MetLife');

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
    level TINYINT,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_urgency_levels PRIMARY KEY (level)
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
    code VARCHAR(5),
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_procedure_categories PRIMARY KEY (code)
);
INSERT INTO procedure_categories VALUES ('Α','Category A'),('Β','Category B');

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
-- exam_types rows loaded from CSV in load.sql

-- ============================================================
-- CORE TABLES
-- ============================================================

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
    hire_date DATE DEFAULT (CURRENT_DATE),
    staff_type VARCHAR(20),

    CONSTRAINT pk_staff PRIMARY KEY (AMKA),
    CONSTRAINT fk_staff_type FOREIGN KEY (staff_type) REFERENCES staff_types(code)
);

CREATE TABLE doctors (
    AMKA CHAR(11),
    license_number VARCHAR(20) NOT NULL,
    `rank` VARCHAR(30) NOT NULL,
    supervisor_AMKA CHAR(11),

    CONSTRAINT pk_doctors PRIMARY KEY (AMKA),
    CONSTRAINT fk_doctors FOREIGN KEY (AMKA) REFERENCES staff(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_docs_supervisor FOREIGN KEY (supervisor_AMKA) REFERENCES doctors(AMKA) ON DELETE SET NULL,
    CONSTRAINT fk_doctor_rank FOREIGN KEY (`rank`) REFERENCES doctor_ranks(code),
    -- CONSTRAINT chk_resident_supervisor CHECK (`rank` != 'Resident' OR supervisor_AMKA IS NOT NULL),
    -- CONSTRAINT chk_director_supervisor CHECK (`rank` != 'Director' OR supervisor_AMKA IS NULL),
    CONSTRAINT uni_license UNIQUE (license_number)
);

CREATE TABLE doctor_departments (
    doctor_AMKA CHAR(11),
    dept_id INT NOT NULL,

    CONSTRAINT pk_dd PRIMARY KEY (doctor_AMKA, dept_id),
    CONSTRAINT fk_dd_amka FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA) ON DELETE CASCADE,
    CONSTRAINT fd_dd_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

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
    weight INT,
    height INT,
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(50) UNIQUE,
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
    CONSTRAINT fk_adm_diag_out FOREIGN KEY (discharge_diagnosis_code) REFERENCES icd10(icd10_code)
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
    category VARCHAR(5),
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
    outcome VARCHAR(20) DEFAULT 'Discharged',
    admission_id INT DEFAULT NULL UNIQUE,

    CONSTRAINT pk_triages PRIMARY KEY (triage_id),
    CONSTRAINT fk_triage_patient FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA),
    CONSTRAINT fk_triage_nurse FOREIGN KEY (nurse_AMKA) REFERENCES nurses(AMKA),
    CONSTRAINT fk_triage_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id),
    CONSTRAINT fk_triage_urgency FOREIGN KEY (urgency_level) REFERENCES urgency_levels(level),
    CONSTRAINT fk_triage_outcome FOREIGN KEY (outcome) REFERENCES triage_outcomes(code)
);

CREATE TABLE active_substances (
    substance_id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,

    CONSTRAINT pk_active_substances PRIMARY KEY (substance_id)
);

CREATE TABLE drugs (
    drug_id INT AUTO_INCREMENT,
    ema_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    manufacturer VARCHAR(100),

    CONSTRAINT pk_drugs PRIMARY KEY (drug_id)
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
    nursing_quality TINYINT NOT NULL CHECK (nursing_quality BETWEEN 1 AND 5),
    cleanliness TINYINT NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
    food TINYINT NOT NULL CHECK (food BETWEEN 1 AND 5),
    overall TINYINT NOT NULL CHECK (overall BETWEEN 1 AND 5),
    comment TEXT,
    rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_admission_ratings PRIMARY KEY (admission_id),
    CONSTRAINT fk_rating_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE
);

CREATE TABLE doctor_ratings (
    rating_id INT AUTO_INCREMENT,
    admission_id INT NOT NULL,
    doctor_AMKA CHAR(11) NOT NULL,
    medical_care_quality TINYINT NOT NULL CHECK (medical_care_quality BETWEEN 1 AND 5),
    rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_doc_ratings PRIMARY KEY (rating_id),
    CONSTRAINT fk_doc_rating_adm FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_rating_doc FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA),
    UNIQUE (admission_id, doctor_AMKA)
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

-- ============================================================
-- TRIGGERS
-- ============================================================

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
        SET NEW.base_cost = OLD.base_cost;
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

-- -------------------- TRIGGERS GIA TA SHIFTS TA PARATISA ----------------------------------------

-- CREATE TRIGGER check_max_shifts_trigger
-- BEFORE INSERT ON shift_staffing
-- FOR EACH ROW
-- BEGIN
--     DECLARE shift_count INT;
--     DECLARE staff_role VARCHAR(20);
--     DECLARE current_month INT;
--     DECLARE current_year INT;
--
--     SELECT MONTH(shift_date), YEAR(shift_date) INTO current_month, current_year
--     FROM shifts WHERE shift_id = NEW.shift_id;
--
--     SELECT role INTO staff_role FROM staff WHERE AMKA = NEW.staff_AMKA;
--
--     SELECT COUNT(*) INTO shift_count
--     FROM shift_staffing ss
--     JOIN shifts s ON ss.shift_id = s.shift_id
--     WHERE ss.staff_AMKA = NEW.staff_AMKA
--     AND MONTH(s.shift_date) = current_month
--     AND YEAR(s.shift_date) = current_year;
--
--     IF (staff_role = 'Doctor' AND shift_count >= 15) THEN
--         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Doctor exceeded max monthly shifts (15)';
--     ELSEIF (staff_role = 'Nurse' AND shift_count >= 20) THEN
--         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nurse exceeded max monthly shifts (20)';
--     ELSEIF (staff_role = 'Admin' AND shift_count >= 25) THEN
--         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Admin exceeded max monthly shifts (25)';
--     END IF;
-- END;
--
-- CREATE TRIGGER prevent_consecutive_shifts_trigger
-- BEFORE INSERT ON shift_staffing
-- FOR EACH ROW
-- BEGIN
--     DECLARE last_shift_date DATE;
--     DECLARE last_shift_slot ENUM('Morning', 'Afternoon', 'Night');
--
--     SELECT s.shift_date, s.shift_slot INTO last_shift_date, last_shift_slot
--     FROM shift_staffing ss
--     JOIN shifts s ON ss.shift_id = s.shift_id
--     WHERE ss.staff_AMKA = NEW.staff_AMKA
--     ORDER BY s.shift_date DESC, s.shift_slot DESC
--     LIMIT 1;
-- END;
--
-- CREATE TRIGGER check_supervisor_trigger
-- BEFORE UPDATE ON shifts
-- FOR EACH ROW
-- BEGIN
--     IF NEW.shift_status = 'Scheduled' THEN
--         IF (SELECT COUNT(*) FROM shift_staffing ss
--             JOIN staff st ON ss.staff_AMKA = st.AMKA
--             WHERE ss.shift_id = NEW.shift_id
--             AND st.rank IN ('Supervisor', 'Senior Attending')) = 0
--         THEN
--             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Shift must have at least one Supervisor/Senior.';
--         END IF;
--     END IF;
-- END;

DELIMITER ;
