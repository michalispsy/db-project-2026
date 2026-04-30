USE ygeiopolis;

-- 1. Εισαγωγή Τμημάτων
INSERT INTO Departments (name, description, beds_count, floor_building) VALUES 
('Καρδιολογία', 'Καρδιολογική Κλινική', 20, 'Κτίριο Α - 2ος'),
('Επείγοντα', 'Τμήμα Επειγόντων Περιστατικών', 10, 'Κτίριο Α - Ισόγειο');

-- 2. Εισαγωγή Προσωπικού
INSERT INTO Personnel (AMK, first_name, last_name, age, email, phone, hire_date, staff_type) VALUES 
('1001', 'Γιώργος', 'Παπαδόπουλος', 55, 'gpap@hospital.gr', '2101234567', '2010-05-15', 'Doctor'),
('1002', 'Ελένη', 'Γεωργίου', 30, 'egeo@hospital.gr', '2107654321', '2020-10-01', 'Doctor'),
('2001', 'Μαρία', 'Κωνσταντίνου', 40, 'mkon@hospital.gr', '2109998888', '2015-03-20', 'Nurse');

-- 3. Εισαγωγή Ιατρών (Σύνδεση με Personnel)
-- Ο Παπαδόπουλος (1001) είναι Διευθυντής χωρίς επόπτη.
-- Η Γεωργίου (1002) είναι Ειδικευόμενη με επόπτη τον Παπαδόπουλο.
INSERT INTO Doctors (AMK, license_number, specialty, rank, supervisor_amk) VALUES 
('1001', 'MD12345', 'Καρδιολογία', 'Director', NULL),
('1002', 'MD67890', 'Καρδιολογία', 'Resident', '1001');

-- 4. Εισαγωγή Ασθενών
INSERT INTO Patients (AMKA, first_name, last_name, age, gender, insurance_provider) VALUES 
('12345678901', 'Ιωάννης', 'Νικολάου', 45, 'M', 'ΕΦΚΑ'),
('98765432101', 'Άννα', 'Δημητρίου', 62, 'F', 'Ιδιωτική Ασφάλεια');

-- 5. Εισαγωγή Κλινών
INSERT INTO Beds (dept_id, bed_number, type, status) VALUES 
(1, 'C101', 'Single', 'Available'),
(1, 'C102', 'Shared', 'Occupied'),
(2, 'E01', 'ICU', 'Available');

-- 6. Εισαγωγή Νοσηλείας (Hospitalization)
INSERT INTO Hospitalizations (patient_amka, bed_id, dept_id, entry_date, diagnosis_entry, total_cost) VALUES 
('12345678901', 2, 1, '2026-04-28 10:00:00', 'Στηθάγχη', 450.00);
