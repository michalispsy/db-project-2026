USE information_schema;
DROP DATABASE IF EXISTS ygeiopolis;
CREATE DATABASE ygeiopolis;
USE ygeiopolis;

CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    bed_count INT NOT NULL DEFAULT 0,
    floor INT,
    building VARCHAR(50),
    director_AMKA CHAR(11), -- MAYBE ADD NULL OPTION

    CONSTRAINT pk_dept PRIMARY KEY (dept_id)
);

CREATE TABLE beds (
    bed_id INT AUTO_INCREMENT,
    dept_id INT NOT NULL,
    room_capacity INT,
    bed_type ENUM('regular', 'icu', 'emergency', 'pediatric') NOT NULL DEFAULT 'regular',
    status ENUM('free', 'occupied', 'maintenance') NOT NULL DEFAULT 'free',
    assigned_to INT DEFAULT NULL,
    
    CONSTRAINT pk_beds PRIMARY KEY (bed_id),
    CONSTRAINT fk_beds_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

CREATE TABLE staff (
    AMKA char(11),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INT AS (TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) VIRTUAL,
    email VARCHAR(50) UNIQUE,
    phone_number VARCHAR(15) UNIQUE,
    hire_date DATE DEFAULT (CURRENT_DATE),
    staff_type ENUM('doctor', 'admin', 'nurse'),

    CONSTRAINT pk_staff PRIMARY KEY (AMKA)
);

CREATE TABLE doctors (
    AMKA CHAR(11),
    license_number VARCHAR(20) NOT NULL,
    rank ENUM('resident', 'junior attending', 'senior attending', 'director') NOT NULL,
    supervisor_AMKA CHAR(11),

    CONSTRAINT pk_doctors PRIMARY KEY (AMKA),
    CONSTRAINT fk_doctors FOREIGN KEY (AMKA) REFERENCES staff(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_docs_supervisor FOREIGN KEY (supervisor_AMKA) REFERENCES doctors(AMKA) ON DELETE SET NULL,
    -- CONSTRAINT chk_resident_supervisor CHECK (CASE WHEN `rank` = 'resident' THEN supervisor_AMKA IS NOT NULL ELSE TRUE END),
    -- CONSTRAINT chk_director_supervisor CHECK (CASE WHEN `rank` = 'director' THEN supervisor_AMKA IS NULL ELSE TRUE END),
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
    position VARCHAR(50) NOT NULL,
    office_location VARCHAR(50) NOT NULL,
    dept_id INT, -- MAYBE ADD NOT NULL
    
    CONSTRAINT pk_admin_staff PRIMARY KEY (AMKA),
    CONSTRAINT fk_admin_staff FOREIGN KEY (AMKA) REFERENCES staff(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_admin_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL -- MAYBE ADD RESTRICT
);

CREATE TABLE nurses (
    AMKA CHAR(11),
    rank ENUM('nursing assistant', 'registered nurse', 'head nurse') NOT NULL,
    dept_id INT, -- MAYBE ADD NOT NULL

    CONSTRAINT pk_nurses PRIMARY KEY (AMKA),
    CONSTRAINT fk_nurses FOREIGN KEY (AMKA) REFERENCES staff(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_nurses_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE -- MAYBE ADD RESTRICT
);

CREATE TABLE patients (
    AMKA CHAR(11),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    fathers_name VARCHAR(50),
    date_of_birth DATE,
    age INT AS (TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())) VIRTUAL,
    gender ENUM('M', 'F', 'Other') NOT NULL,
    weight INT,
    height INT,
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(50) UNIQUE,
    occupation VARCHAR(50),
    nationality CHAR(2),
    insurance_provider VARCHAR(50),
    
    CONSTRAINT pk_patients PRIMARY KEY (AMKA)
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

CREATE TABLE ken (
    ken_code VARCHAR(5),
    description TEXT NOT NULL,
    base_cost DECIMAL(10, 2) NOT NULL,
    avg_length_of_stay INT,
    daily_surcharge_rate DECIMAL(10, 2),

    CONSTRAINT pk_ken PRIMARY KEY (ken_code)
);

CREATE TABLE icd10 (
    icd10_code VARCHAR(6),
    description TEXT NOT NULL,
    category VARCHAR(50),
    
    CONSTRAINT pk_icd10 PRIMARY KEY (icd10_code)
);

CREATE TABLE admissions (
    admission_id INT AUTO_INCREMENT,
    patient_AMKA CHAR(11) NOT NULL,
    department_id INT NOT NULL,
    bed_id INT NOT NULL,
    ken_code VARCHAR(5) NOT NULL,
    admission_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discharge_date DATE DEFAULT NULL,
    admission_diagnosis_code VARCHAR(6) NOT NULL,
    discharge_diagnosis_code VARCHAR(6) DEFAULT NULL,
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
    exam_type VARCHAR(100) NOT NULL,
    exam_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    result_text TEXT,
    result_numeric DECIMAL(10, 2),
    result_unit VARCHAR(20),
    cost DECIMAL(10, 2) DEFAULT 0.00,
    doctor_AMKA CHAR(11) NOT NULL,
    
    CONSTRAINT pk_exams PRIMARY KEY (exam_id),
    CONSTRAINT fk_exam_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_ordered_by FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA)
);

CREATE TABLE medical_procedures (
    procedure_code VARCHAR(20),
    name VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    standard_duration INT,
    standard_cost DECIMAL(10, 2),

    CONSTRAINT pk_proc_code PRIMARY KEY (procedure_code)
);

CREATE TABLE operating_rooms (
    room_id INT AUTO_INCREMENT,
    room_name VARCHAR(50) NOT NULL,
    room_type ENUM('Operating Room', 'ICU', 'Exam Room', 'Therapy Room'),
    floor INT,
    building VARCHAR(50),

    CONSTRAINT pk_op_rooms PRIMARY KEY (room_id)
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
    CONSTRAINT fk_proc_doctor FOREIGN KEY (main_doctor_AMKA) REFERENCES doctors(AMKA)
);

CREATE TABLE procedure_assistants (
    execution_id INT NOT NULL,
    staff_AMKA CHAR(11) NOT NULL,
    role VARCHAR(50) NOT NULL,

    CONSTRAINT pk_proc_staff PRIMARY KEY (execution_id, staff_AMKA),
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
    urgency_level TINYINT CHECK (urgency_level BETWEEN 1 AND 5),
    symptoms TEXT,
    outcome ENUM('hospitalized', 'discharged') DEFAULT 'discharged',
    admission_id INT DEFAULT NULL UNIQUE,

    CONSTRAINT pk_triages PRIMARY KEY (triage_id),
    CONSTRAINT fk_triage_patient FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA),
    CONSTRAINT fk_triage_nurse FOREIGN KEY (nurse_AMKA) REFERENCES nurses(AMKA),
    CONSTRAINT fk_triage_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id)
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
    CONSTRAINT fk_substance_id FOREIGN KEY (substance_id) REFERENCES active_substances(substance_id) ON DELETE CASCADE
);

CREATE TABLE patient_allergies (
    patient_AMKA CHAR(11),
    substance_id INT,

    CONSTRAINT pk_patient_allergies PRIMARY KEY (patient_AMKA, substance_id),
    CONSTRAINT pk_patient FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA) ON DELETE CASCADE,
    CONSTRAINT fk_substance_id FOREIGN KEY (substance_id) REFERENCES active_substances(substance_id) ON DELETE CASCADE
);

CREATE TABLE prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    admission_id INT NOT NULL,
    patient_AMKA CHAR(11) NOT NULL,
    doctor_AMKA CHAR(11) NOT NULL,
    drug_id INT NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    
    FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_AMKA) REFERENCES patients(AMKA),
    FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA),
    FOREIGN KEY (drug_id) REFERENCES drugs(drug_id)
);

CREATE TABLE admission_ratings (
    admission_id INT PRIMARY KEY,
    nursing_quality TINYINT NOT NULL CHECK (nursing_quality BETWEEN 1 AND 5),
    cleanliness TINYINT NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
    food TINYINT NOT NULL CHECK (food BETWEEN 1 AND 5),
    overall TINYINT NOT NULL CHECK (overall BETWEEN 1 AND 5),
    comment TEXT,
    rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rating_admission FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE
);

CREATE TABLE doctor_ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    admission_id INT NOT NULL,
    doctor_AMKA CHAR(11) NOT NULL,
    medical_care_quality TINYINT NOT NULL CHECK (medical_care_quality BETWEEN 1 AND 5),
    rated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_doc_rating_adm FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_rating_doc FOREIGN KEY (doctor_AMKA) REFERENCES doctors(AMKA),
    UNIQUE (admission_id, doctor_AMKA)
);

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
END;

CREATE TRIGGER calculate_admission_base_cost_trigger
BEFORE INSERT ON admissions
FOR EACH ROW
BEGIN
    DECLARE v_cost DECIMAL(10, 2);
    SELECT base_cost INTO v_cost FROM ken WHERE ken_code = NEW.ken_code;
    SET NEW.base_cost = v_cost, NEW.extra_cost = 0.00;
END;

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
END;

CREATE TRIGGER set_bed_occupied_trigger
AFTER INSERT ON admissions
FOR EACH ROW
BEGIN
    UPDATE beds SET status = 'occupied', assigned_to = NEW.admission_id WHERE bed_id = NEW.bed_id;
END;

CREATE TRIGGER set_bed_free_trigger
AFTER UPDATE ON admissions
FOR EACH ROW
BEGIN
    IF OLD.discharge_date IS NULL AND NEW.discharge_date IS NOT NULL THEN
        UPDATE beds SET status = 'free', assigned_to = NULL WHERE bed_id = NEW.bed_id;
    END IF;
END;
