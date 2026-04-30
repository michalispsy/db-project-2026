-- 1. Δημιουργία και χρήση της βάσης
CREATE DATABASE IF NOT EXISTS ygeiopolis;
USE ygeiopolis;

-- 2. Τμήματα (Departments) - Βασική οντότητα
CREATE TABLE Departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    beds_count INT DEFAULT 0,
    floor_building VARCHAR(50)
) ENGINE=InnoDB;

-- 3. Προσωπικό (Personnel) - Γενικός πίνακας
CREATE TABLE Personnel (
    AMK VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INT,
    email VARCHAR(100),
    phone VARCHAR(20),
    hire_date DATE,
    staff_type ENUM('Doctor', 'Nurse', 'Administrative') NOT NULL
) ENGINE=InnoDB;

-- 4. Ιατροί (Doctors) - Εξειδίκευση του Personnel
CREATE TABLE Doctors (
    AMK VARCHAR(20) PRIMARY KEY,
    license_number VARCHAR(50) UNIQUE,
    specialty VARCHAR(100),
    rank ENUM('Resident', 'Attending B', 'Attending A', 'Director'),
    supervisor_amk VARCHAR(20),
    FOREIGN KEY (AMK) REFERENCES Personnel(AMK) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_amk) REFERENCES Doctors(AMK)
) ENGINE=InnoDB;

-- 5. Ασθενείς (Patients)
CREATE TABLE Patients (
    AMKA VARCHAR(11) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INT,
    gender ENUM('M', 'F', 'Other'),
    insurance_provider VARCHAR(100)
) ENGINE=InnoDB;

-- 6. Κλίνες (Beds) - Εξαρτάται από το Department
CREATE TABLE Beds (
    bed_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_id INT,
    bed_number VARCHAR(10) NOT NULL,
    type ENUM('ICU', 'Single', 'Shared'),
    status ENUM('Available', 'Occupied', 'Maintenance'),
    FOREIGN KEY (dept_id) REFERENCES Departments(dept_id)
) ENGINE=InnoDB;

-- 7. Νοσηλείες (Hospitalizations) - Συνδέει Ασθενή, Κλίνη και Τμήμα
CREATE TABLE Hospitalizations (
    hosp_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_amka VARCHAR(11),
    bed_id INT,
    dept_id INT,
    entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    exit_date DATETIME,
    diagnosis_entry TEXT,
    total_cost DECIMAL(10, 2),
    FOREIGN KEY (patient_amka) REFERENCES Patients(AMKA),
    FOREIGN KEY (bed_id) REFERENCES Beds(bed_id),
    FOREIGN KEY (dept_id) REFERENCES Departments(dept_id)
) ENGINE=InnoDB;
