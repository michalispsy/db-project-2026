drop database if exists ygeiopolis;
create database ygeiopolis;
use ygeiopolis;

-- λεξικά και βοηθητικοί πίνακες

create table staff_types (
    code varchar(20),
    name varchar(50) not null,
    constraint pk_staff_types primary key (code)
);
insert into staff_types values ('doctor','Ιατρός'),('nurse','Νοσηλευτής'),('admin','Διοικητικός');

create table doctor_ranks (
    code varchar(30),
    name varchar(50) not null,
    constraint pk_doctor_ranks primary key (code)
);
insert into doctor_ranks values
    ('Ειδικευόμενος','Ειδικευόμενος'),('Επιμελητής Β','Επιμελητής Β'),
    ('Επιμελητής Α','Επιμελητής Α'),('Διευθυντής','Διευθυντής');

create table nurse_ranks (
    code varchar(30),
    name varchar(50) not null,
    constraint pk_nurse_ranks primary key (code)
);
insert into nurse_ranks values
    ('Βοηθός Νοσηλευτή','Βοηθός Νοσηλευτή'),
    ('Νοσηλευτής','Νοσηλευτής'),
    ('Προϊστάμενος','Προϊστάμενος');

create table admin_roles (
    code varchar(30),
    name varchar(50) not null,
    constraint pk_admin_roles primary key (code)
);
insert into admin_roles values
    ('Γραμματέας','Γραμματέας'),('Λογιστής','Λογιστής'),
    ('Υπάλληλος IT','Υπάλληλος IT'),('Ρεσεψιονίστ','Ρεσεψιονίστ'),
    ('Αρχειοθέτης','Αρχειοθέτης'),('Γραμματέας Τμήματος','Γραμματέας Τμήματος'),
    ('Υπεύθυνος Προμηθειών','Υπεύθυνος Προμηθειών');

create table genders (
    code varchar(10),
    name varchar(20) not null,
    constraint pk_genders primary key (code)
);
insert into genders values ('m','Άνδρας'),('f','Γυναίκα'),('other','Άλλο');

create table insurance_providers (
    code varchar(30),
    name varchar(100) not null,
    constraint pk_insurance_providers primary key (code)
);
insert into insurance_providers values
    ('ΕΦΚΑ','ΕΦΚΑ'),
    ('Ιδιωτική Ασφάλεια','Ιδιωτική Ασφάλεια'),
    ('Ανασφάλιστος','Ανασφάλιστος');

create table bed_types (
    code varchar(20),
    name varchar(50) not null,
    constraint pk_bed_types primary key (code)
);
insert into bed_types values
    ('ΜΕΘ','Μονάδα Εντατικής Θεραπείας'),('μονόκλινο','Μονόκλινο δωμάτιο'),('πολύκλινο','Πολύκλινο δωμάτιο');

create table bed_statuses (
    code varchar(20),
    name varchar(50) not null,
    constraint pk_bed_statuses primary key (code)
);
insert into bed_statuses values
    ('διαθέσιμη','Διαθέσιμη'),('κατειλημμένη','Κατειλημμένη'),('υπό συντήρηση','Υπό συντήρηση');

create table urgency_levels (
    `level` tinyint,
    name varchar(50) not null,
    constraint pk_urgency_levels primary key (`level`)
);
insert into urgency_levels values
    (1,'immediate'),(2,'emergent'),(3,'urgent'),(4,'less urgent'),(5,'non-urgent');

create table triage_outcomes (
    code varchar(20),
    name varchar(100) not null,
    constraint pk_triage_outcomes primary key (code)
);
insert into triage_outcomes values
    ('discharged','Αποχώρηση με οδηγίες'),
    ('hospitalized','Παραπομπή για νοσηλεία');

create table shift_slots (
    code varchar(20),
    name varchar(50) not null,
    constraint pk_shift_slots primary key (code)
);
insert into shift_slots values
    ('πρωινή','Πρωινή (07-15)'),('απογευματινή','Απογευματινή (15-23)'),('νυχτερινή','Νυχτερινή (23-07)');

create table shift_statuses (
    code varchar(20),
    name varchar(50) not null,
    constraint pk_shift_statuses primary key (code)
);
insert into shift_statuses values
    ('scheduled','Προγραμματισμένη'),('in progress','Σε εξέλιξη'),
    ('completed','Ολοκληρωμένη'),('cancelled','Ακυρωμένη'),('understaffed','Ελλιπής Στελέχωση');

create table procedure_categories (
    code varchar(20),
    name varchar(100) not null,
    constraint pk_procedure_categories primary key (code)
);
insert into procedure_categories values
    ('χειρουργική','Χειρουργικές επεμβάσεις'),
    ('διαγνωστική','Διαγνωστικές πράξεις'),
    ('θεραπευτική','Θεραπευτικές πράξεις');

create table room_types (
    code varchar(30),
    name varchar(50) not null,
    constraint pk_room_types primary key (code)
);
insert into room_types values
    ('exam room','Αίθουσα Εξέτασης'),('icu','ΜΕΘ'),
    ('operating room','Χειρουργείο'),('therapy room','Αίθουσα Θεραπείας');

create table exam_types (
    exam_code int,
    name text not null,
    constraint pk_exam_types primary key (exam_code)
);

create table specialties (
    code varchar(50),
    name varchar(100) not null,
    constraint pk_specialties primary key (code)
);
insert into specialties values
    ('cardiology','Καρδιολογία'),
    ('surgery','Χειρουργική'),
    ('pediatrics','Παιδιατρική'),
    ('neurology','Νευρολογία'),
    ('orthopedics','Ορθοπεδική'),
    ('internal medicine','Παθολογία'),
    ('emergency medicine','Επείγουσα Ιατρική'),
    ('anesthesiology','Αναισθησιολογία'),
    ('radiology','Ακτινολογία'),
    ('oncology','Ογκολογία'),
    ('psychiatry','Ψυχιατρική'),
    ('obstetrics and gynecology','Μαιευτική & Γυναικολογία'),
    ('dermatology','Δερματολογία'),
    ('urology','Ουρολογία'),
    ('general practice','Γενική Ιατρική');

-- βασικοί πίνακες της βάσης

create table departments (
    dept_id int auto_increment,
    name varchar(50) not null,
    description text,
    bed_count int not null default 0,
    floor int,
    building varchar(50),
    director_amka char(11),

    constraint pk_dept primary key (dept_id)
);

create table beds (
    bed_id int auto_increment,
    dept_id int not null,
    room_capacity int,
    bed_type varchar(20) not null default 'πολύκλινο',
    status varchar(20) not null default 'διαθέσιμη',
    assigned_to int default null,

    constraint pk_beds primary key (bed_id),
    constraint fk_beds_dept foreign key (dept_id) references departments(dept_id) on delete cascade,
    constraint fk_beds_bed_type foreign key (bed_type) references bed_types(code),
    constraint fk_beds_status foreign key (status) references bed_statuses(code)
);

create table staff (
    amka char(11),
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    date_of_birth date not null,
    age int as (timestampdiff(year, date_of_birth, curdate())) virtual,
    email varchar(50) unique,
    phone_number varchar(15) unique,
    hire_date date not null default (current_date),
    staff_type varchar(20),

    constraint pk_staff primary key (amka),
    constraint fk_staff_type foreign key (staff_type) references staff_types(code)
);

create table doctors (
    amka char(11),
    license_number varchar(20) not null,
    `rank` varchar(30) not null,
    specialty varchar(50) not null,
    supervisor_amka char(11),

    constraint pk_doctors primary key (amka),
    constraint fk_doctors foreign key (amka) references staff(amka) on delete cascade,
    constraint fk_docs_supervisor foreign key (supervisor_amka) references doctors(amka) on delete set null,
    constraint fk_doctor_rank foreign key (`rank`) references doctor_ranks(code),
    constraint fk_doctor_specialty foreign key (specialty) references specialties(code),
    constraint uni_license unique (license_number)
);

create table doctor_departments (
    doctor_amka char(11),
    dept_id int not null,

    constraint pk_dd primary key (doctor_amka, dept_id),
    constraint fk_dd_amka foreign key (doctor_amka) references doctors(amka) on delete cascade,
    constraint fd_dd_dept foreign key (dept_id) references departments(dept_id) on delete cascade
);

alter table departments
add constraint fk_dept_director foreign key (director_amka)
references doctors(amka) on delete set null;

create table admin_staff (
    amka char(11),
    position varchar(30) not null,
    office_location varchar(50) not null,
    dept_id int,

    constraint pk_admin_staff primary key (amka),
    constraint fk_admin_staff foreign key (amka) references staff(amka) on delete cascade,
    constraint fk_admin_dept foreign key (dept_id) references departments(dept_id) on delete set null,
    constraint fk_admin_role foreign key (position) references admin_roles(code)
);

create table nurses (
    amka char(11),
    `rank` varchar(30) not null,
    dept_id int,

    constraint pk_nurses primary key (amka),
    constraint fk_nurses foreign key (amka) references staff(amka) on delete cascade,
    constraint fk_nurses_dept foreign key (dept_id) references departments(dept_id) on delete cascade,
    constraint fk_nurse_rank foreign key (`rank`) references nurse_ranks(code)
);

create table patients (
    amka char(11),
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    fathers_name varchar(50),
    date_of_birth date,
    age int as (timestampdiff(year, date_of_birth, curdate())) virtual,
    gender varchar(10) not null,
    weight decimal(5,1),
    height int,
    phone_number varchar(15) unique,
    email varchar(50) unique,
    address varchar(255),
    occupation varchar(50),
    nationality char(2),
    insurance_provider varchar(30),

    constraint pk_patients primary key (amka),
    constraint fk_patient_gender foreign key (gender) references genders(code),
    constraint fk_patient_insurance foreign key (insurance_provider) references insurance_providers(code)
);

create table patient_emergency_contacts (
    patient_amka char(11),
    contact_seq int,
    first_name varchar(50) not null,
    last_name varchar(50) not null,
    phone_number varchar(15) not null,
    email varchar(50),
    relationship_to_patient varchar(50),

    constraint pk_ec primary key (patient_amka, contact_seq),
    constraint fk_ec_patient foreign key (patient_amka) references patients(amka) on delete cascade
);

create table ken_categories (
    category_letter varchar(2),
    description text not null,

    constraint pk_ken_cat primary key (category_letter)
);

create table ken (
    ken_code varchar(7),
    description text not null,
    base_cost decimal(10, 2) not null,
    avg_length_of_stay int,
    daily_surcharge_rate decimal(10, 2),
    category_letter varchar(2),

    constraint pk_ken primary key (ken_code),
    constraint fk_ken_category foreign key (category_letter) references ken_categories(category_letter)
);

create table icd10 (
    icd10_code varchar(7),
    description text not null,
    category varchar(50),

    constraint pk_icd10 primary key (icd10_code)
);

create table admissions (
    admission_id int auto_increment,
    patient_amka char(11) not null,
    department_id int not null,
    bed_id int not null,
    ken_code varchar(7) not null,
    admission_date date not null default (current_date),
    discharge_date date default null,
    admission_diagnosis_code varchar(7) not null,
    discharge_diagnosis_code varchar(7) default null,
    base_cost  decimal(10, 2) default 0.00,
    extra_cost decimal(10, 2) default 0.00,
    total_cost decimal(10, 2) generated always as (base_cost + extra_cost) virtual,

    constraint pk_admissions primary key (admission_id),
    constraint fk_adm_patient foreign key (patient_amka) references patients(amka) on delete cascade,
    constraint fk_adm_dept foreign key (department_id) references departments(dept_id),
    constraint fk_adm_bed foreign key (bed_id) references beds(bed_id),
    constraint fk_adm_ken foreign key (ken_code) references ken(ken_code),
    constraint fk_adm_diag_in foreign key (admission_diagnosis_code) references icd10(icd10_code),
    constraint fk_adm_diag_out foreign key (discharge_diagnosis_code) references icd10(icd10_code),
    constraint chk_discharge_date check (discharge_date is null or discharge_date >= admission_date)
);

create table lab_exams (
    exam_id int auto_increment,
    admission_id int not null,
    exam_code int not null,
    exam_date datetime default current_timestamp,
    result_text text,
    result_numeric decimal(10, 2),
    result_unit varchar(20),
    cost decimal(10, 2) default 0.00,
    doctor_amka char(11) not null,

    constraint pk_exams primary key (exam_id),
    constraint fk_exam_admission foreign key (admission_id) references admissions(admission_id) on delete cascade,
    constraint fk_exam_ordered_by foreign key (doctor_amka) references doctors(amka),
    constraint fk_exam_type foreign key (exam_code) references exam_types(exam_code),
    constraint chk_exam_result check (result_text is not null or result_numeric is not null)
);

create table medical_procedures (
    procedure_code varchar(20),
    name varchar(50) not null,
    category varchar(20),
    standard_duration int,
    standard_cost decimal(10, 2),

    constraint pk_proc_code primary key (procedure_code),
    constraint fk_proc_category foreign key (category) references procedure_categories(code)
);

create table operating_rooms (
    room_id int auto_increment,
    room_name varchar(50) not null,
    room_type varchar(30),
    floor int,
    building varchar(50),

    constraint pk_op_rooms primary key (room_id),
    constraint fk_room_type foreign key (room_type) references room_types(code)
);

create table procedure_executions (
    execution_id int auto_increment,
    admission_id int not null,
    procedure_code varchar(20) not null,
    room_id int not null,
    main_doctor_amka char(11) not null,
    start_time datetime not null,
    end_time datetime,
    actual_cost decimal(10, 2),

    constraint pk_proc_exec primary key (execution_id),
    constraint fk_proc_admission foreign key (admission_id) references admissions(admission_id) on delete cascade,
    constraint fk_proc_code foreign key (procedure_code) references medical_procedures(procedure_code),
    constraint fk_proc_room foreign key (room_id) references operating_rooms(room_id),
    constraint fk_proc_doctor foreign key (main_doctor_amka) references doctors(amka),
    constraint chk_proc_times check (end_time is null or end_time > start_time)
);

create table procedure_assistants (
    execution_id int not null,
    staff_amka char(11) not null,
    role varchar(50) not null,

    constraint pk_proc_staff primary key (staff_amka, execution_id),
    constraint fk_proc_exec foreign key (execution_id) references procedure_executions(execution_id) on delete cascade,
    foreign key (staff_amka) references staff(amka)
);

create table triages (
    triage_id int auto_increment,
    patient_amka char(11) not null,
    nurse_amka char(11) not null,
    arrival_time datetime not null default current_timestamp,
    triage_time datetime default null,
    minutes_waited int default null,
    urgency_level tinyint,
    symptoms text,
    outcome varchar(20) default null,
    admission_id int default null,

    constraint pk_triages primary key (triage_id),
    constraint fk_triage_patient foreign key (patient_amka) references patients(amka),
    constraint fk_triage_nurse foreign key (nurse_amka) references nurses(amka),
    constraint fk_triage_admission foreign key (admission_id) references admissions(admission_id),
    constraint fk_triage_urgency foreign key (urgency_level) references urgency_levels(`level`),
    constraint fk_triage_outcome foreign key (outcome) references triage_outcomes(code),
    constraint uni_admission_id unique (admission_id),
    constraint chk_triage_consistency check ( outcome is null or (outcome = 'hospitalized' and admission_id is not null) or (outcome = 'discharged'   and admission_id is null))
);

create table active_substances (
    substance_id int auto_increment,
    name varchar(100) not null,

    constraint pk_active_substances primary key (substance_id),
    constraint uni_substance_name unique (name)
);

create table drugs (
    drug_id int auto_increment,
    ema_code varchar(50) not null,
    name varchar(150) not null,
    manufacturer varchar(100),

    constraint pk_drugs primary key (drug_id),
    constraint uni_ema_code unique (ema_code)
);

create table drug_contains_substances (
    drug_id int,
    substance_id int,

    constraint pk_drug_cs primary key (drug_id, substance_id),
    constraint fk_drug_id foreign key (drug_id) references drugs(drug_id) on delete cascade,
    constraint fk_dcs_substance_id foreign key (substance_id) references active_substances(substance_id) on delete cascade
);

create table patient_allergies (
    patient_amka char(11),
    substance_id int,

    constraint pk_patient_allergies primary key (patient_amka, substance_id),
    constraint fk_allergy_patient foreign key (patient_amka) references patients(amka) on delete cascade,
    constraint fk_allergy_substance foreign key (substance_id) references active_substances(substance_id) on delete cascade
);

create table prescriptions (
    prescription_id int auto_increment,
    admission_id int not null,
    patient_amka char(11) not null,
    doctor_amka char(11) not null,
    drug_id int not null,
    dosage varchar(50),
    frequency varchar(50),
    start_date date not null,
    end_date date not null,

    constraint pk_prescriptions primary key (prescription_id),
    constraint fk_presc_admi_id foreign key (admission_id) references admissions(admission_id) on delete cascade,
    constraint fk_presc_pati_id foreign key (patient_amka) references patients(amka),
    constraint fk_presc_doct_id foreign key (doctor_amka) references doctors(amka),
    constraint fk_presc_drug_id foreign key (drug_id) references drugs(drug_id),
    constraint uni_prescription unique (doctor_amka, patient_amka, drug_id, start_date),
    constraint chk_presc_dates check (end_date > start_date)
);

create table admission_ratings (
    admission_id int,
    nursing_quality tinyint not null,
    cleanliness tinyint not null,
    food tinyint not null,
    overall tinyint not null,
    comment text,
    rated_at datetime default current_timestamp,

    constraint pk_admission_ratings primary key (admission_id),
    constraint fk_rating_admission foreign key (admission_id) references admissions(admission_id) on delete cascade,
    constraint chk_nursing_range check (nursing_quality between 1 and 5),
    constraint chk_clean_range check (cleanliness between 1 and 5),
    constraint chk_food_range check (food between 1 and 5),
    constraint chk_overall_range check (overall between 1 and 5)
);

create table doctor_ratings (
    rating_id int auto_increment,
    admission_id int not null,
    doctor_amka char(11) not null,
    medical_care_quality tinyint not null,
    comment text,
    rated_at datetime default current_timestamp,

    constraint pk_doc_ratings primary key (rating_id),
    constraint fk_doc_rating_adm foreign key (admission_id) references admissions(admission_id) on delete cascade,
    constraint fk_doc_rating_doc foreign key (doctor_amka) references doctors(amka),
    constraint uni_admission_doctor_duplicate unique (admission_id, doctor_amka),
    constraint chk_medical_range check (medical_care_quality between 1 and 5)
);

create table shifts (
    shift_id int auto_increment,
    shift_date date not null,
    shift_slot varchar(20) not null,
    shift_status varchar(20) default 'scheduled',
    dept_id int not null,

    constraint pk_shift primary key (shift_id),
    constraint fk_shift_dept foreign key (dept_id) references departments(dept_id) on delete cascade,
    constraint fk_shift_slot foreign key (shift_slot) references shift_slots(code),
    constraint fk_shift_status foreign key (shift_status) references shift_statuses(code),
    constraint uni_shift unique (dept_id, shift_date, shift_slot)
);

create table shift_staffing (
    shift_id int,
    staff_amka char(11),

    constraint pk_shift_staffing primary key (staff_amka, shift_id),
    constraint fk_staffing_shift foreign key (shift_id) references shifts(shift_id) on delete cascade,
    constraint fk_staffing_staff foreign key (staff_amka) references staff(amka) on delete cascade
);

create table department_images (
    img_id int auto_increment,
    dept_id int not null,
    img_url varchar(255) not null,
    caption varchar(255),
    ordering int default 0,

    constraint pk_dept_images primary key (img_id),
    constraint fk_dept_img_relation foreign key (dept_id) references departments(dept_id) on delete cascade
);

create table drug_images (
    img_id int auto_increment,
    drug_id int not null,
    img_url varchar(255) not null,
    caption varchar(255),
    ordering int default 0,

    constraint pk_drug_images primary key (img_id),
    constraint fk_drug_img_relation foreign key (drug_id) references drugs(drug_id) on delete cascade
);

create table doctor_images (
    img_id int auto_increment,
    doctor_amka char(11) not null,
    img_url varchar(255) not null,
    caption varchar(255),
    ordering int default 0,

    constraint pk_doctor_images primary key (img_id),
    constraint fk_doctor_img_relation foreign key (doctor_amka) references doctors(amka) on delete cascade
);

create table operating_room_images (
    img_id int auto_increment,
    room_id int not null,
    img_url varchar(255) not null,
    caption varchar(255),
    ordering int default 0,

    constraint pk_doctor_images primary key (img_id),
    constraint fk_doctor_img_relation foreign key (room_id) references operating_rooms(room_id) on delete cascade
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
        WHERE patient_amka = NEW.patient_amka
    );
END//

CREATE TRIGGER check_admission_dept_matches_bed_insert_trigger
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

CREATE TRIGGER check_admission_dept_matches_bed_update_trigger
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
    IF v_bed_status = 'υπό συντήρηση' THEN
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
    UPDATE beds SET status = 'κατειλημμένη', assigned_to = NEW.admission_id WHERE bed_id = NEW.bed_id;
END//

CREATE TRIGGER set_bed_free_trigger
AFTER UPDATE ON admissions
FOR EACH ROW
BEGIN
    IF OLD.discharge_date IS NULL AND NEW.discharge_date IS NOT NULL THEN
        UPDATE beds SET status = 'διαθέσιμη', assigned_to = NULL WHERE bed_id = NEW.bed_id;
    END IF;
END//

-- Triggers για ελέγχους και περιορισμούς (Business Rules)

CREATE TRIGGER doctor_rank_insert_check_trigger
BEFORE INSERT ON doctors
FOR EACH ROW
BEGIN
    IF NEW.rank = 'Ειδικευόμενος' AND NEW.supervisor_amka IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Οι ειδικευόμενοι ιατροί πρέπει υποχρεωτικά να έχουν επόπτη.';
    END IF;

    IF NEW.rank = 'Διευθυντής' AND NEW.supervisor_amka IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Οι διευθυντές δεν μπορούν να έχουν επόπτη.';
    END IF;
END//

CREATE TRIGGER doctor_rank_update_check_trigger
BEFORE UPDATE ON doctors
FOR EACH ROW
BEGIN
    IF NEW.rank = 'Ειδικευόμενος' AND NEW.supervisor_amka IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Οι ειδικευόμενοι ιατροί πρέπει υποχρεωτικά να έχουν επόπτη.';
    END IF;

    IF NEW.rank = 'Διευθυντής' AND NEW.supervisor_amka IS NOT NULL THEN
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
        SELECT supervisor_amka
        FROM doctors
        WHERE amka = p_new_supervisor_amka
        
        UNION ALL
        
        SELECT d.supervisor_amka
        FROM doctors d
        INNER JOIN supervision_chain sc ON d.amka = sc.supervisor_amka
        WHERE d.supervisor_amka IS NOT NULL AND sc.supervisor_amka <> p_doctor_amka
    )
    SELECT COUNT(*) INTO v_count 
    FROM supervision_chain 
    WHERE supervisor_amka = p_doctor_amka
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
    CALL check_supervisor_cycle_proc(NEW.amka, NEW.supervisor_amka);
END //

CREATE TRIGGER doctor_supervisor_update_trigger
BEFORE UPDATE ON doctors
FOR EACH ROW
BEGIN
    IF (NEW.supervisor_amka <> OLD.supervisor_amka) 
        OR (NEW.supervisor_amka IS NULL AND OLD.supervisor_amka IS NOT NULL)
        OR (NEW.supervisor_amka IS NOT NULL AND OLD.supervisor_amka IS NULL) 
    THEN
        CALL check_supervisor_cycle_proc(NEW.amka, NEW.supervisor_amka);
    END IF;
END //

CREATE TRIGGER check_for_admins_in_procedure_trigger
BEFORE INSERT ON procedure_assistants
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT NULL FROM admin_staff WHERE amka = NEW.staff_amka) THEN
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

CREATE PROCEDURE check_doctor_treated_patient(IN p_admission_id INT, IN p_doctor_amka CHAR(11))
BEGIN
    IF NOT EXISTS (
        SELECT NULL FROM prescriptions
            WHERE admission_id = p_admission_id AND doctor_amka = p_doctor_amka
        UNION ALL
        SELECT NULL FROM procedure_executions
            WHERE admission_id = p_admission_id AND main_doctor_amka = p_doctor_amka
        UNION ALL
        SELECT NULL FROM lab_exams
            WHERE admission_id = p_admission_id AND doctor_amka = p_doctor_amka
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Ο ιατρός δεν συμμετείχε στη νοσηλεία αυτού του ασθενή.';
    END IF;
END//

CREATE TRIGGER check_doctor_rating_insert_trigger
BEFORE INSERT ON doctor_ratings
FOR EACH ROW
BEGIN
    CALL check_doctor_treated_patient(NEW.admission_id, NEW.doctor_amka);
    CALL check_if_discharged(NEW.admission_id);
END//

CREATE TRIGGER check_doctor_rating_update_trigger
BEFORE UPDATE ON doctor_ratings
FOR EACH ROW
BEGIN
    CALL check_doctor_treated_patient(NEW.admission_id, NEW.doctor_amka);
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
    WHERE dcs.drug_id = NEW.drug_id AND pa.patient_amka = NEW.patient_amka
    LIMIT 1;

    IF v_allergy_name IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Ο ασθενής είναι αλλεργικός σε δραστική ουσία του φαρμάκου!';
    END IF;
END//

CREATE PROCEDURE check_procedure_conflicts(IN p_room_id INT, IN p_doctor_amka CHAR(11), IN p_start DATETIME, IN p_end DATETIME, IN p_exec_id INT)
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
        WHERE main_doctor_amka = p_doctor_amka 
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
    CALL check_procedure_conflicts(NEW.room_id, NEW.main_doctor_amka, NEW.start_time, NEW.end_time, NULL);
END //

CREATE TRIGGER procedure_overlap_update_trigger
BEFORE UPDATE ON procedure_executions
FOR EACH ROW
BEGIN
    CALL check_procedure_conflicts(NEW.room_id, NEW.main_doctor_amka, NEW.start_time, NEW.end_time, NEW.execution_id);
END //

CREATE PROCEDURE validate_staff_shift_max_limit(IN p_staff_amka VARCHAR(11), IN p_shift_id INT)
BEGIN
    DECLARE shift_count INT;
    DECLARE p_position VARCHAR(20);
    DECLARE current_month INT;
    DECLARE current_year INT;

    SELECT MONTH(shift_date), YEAR(shift_date) INTO current_month, current_year
    FROM shifts WHERE shift_id = p_shift_id;
    SELECT staff_type INTO p_position FROM staff WHERE amka = p_staff_amka;

    SELECT COUNT(*) INTO shift_count
    FROM shift_staffing ss
    JOIN shifts s ON ss.shift_id = s.shift_id
    WHERE ss.staff_amka = p_staff_amka
    AND MONTH(s.shift_date) = current_month
    AND YEAR(s.shift_date) = current_year;

    IF (p_position = 'doctor' AND shift_count >= 15) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Υπέρβαση μέγιστου ορίου εφημεριών ιατρού (15/μήνα).';
    ELSEIF (p_position = 'nurse' AND shift_count >= 20) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Υπέρβαση μέγιστου ορίου εφημεριών νοσηλευτή (20/μήνα).';
    ELSEIF (p_position = 'admin' AND shift_count >= 25) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Υπέρβαση μέγιστου ορίου εφημεριών διοικητικού (25/μήνα).';
    END IF;
END//

CREATE PROCEDURE validate_consecutive_nights(IN p_staff_amka VARCHAR(11), IN p_shift_id INT)
main: BEGIN
    DECLARE p_date DATE;
    DECLARE p_type VARCHAR(20);
    DECLARE consecutive_count INT;

    SELECT shift_date, shift_slot INTO p_date, p_type FROM shifts WHERE shift_id = p_shift_id;

    IF p_type <> 'νυχτερινή' THEN
        LEAVE main;
    END IF;

    IF EXISTS (
        SELECT 1 FROM shift_staffing ss1
        JOIN shifts s1 ON ss1.shift_id = s1.shift_id
        WHERE ss1.staff_amka = p_staff_amka AND s1.shift_slot = 'νυχτερινή'
        AND s1.shift_date = DATE_ADD(p_date, INTERVAL 1 DAY)
        AND EXISTS (
            SELECT 1 FROM shift_staffing ss2
            JOIN shifts s2 ON ss2.shift_id = s2.shift_id
            WHERE ss2.staff_amka = p_staff_amka AND s2.shift_slot = 'νυχτερινή'
            AND s2.shift_date = DATE_ADD(p_date, INTERVAL 2 DAY)
        )
        ) OR EXISTS (
        SELECT 1 FROM shift_staffing ss1
        JOIN shifts s1 ON ss1.shift_id = s1.shift_id
        WHERE ss1.staff_amka = p_staff_amka AND s1.shift_slot = 'νυχτερινή'
        AND s1.shift_date = DATE_SUB(p_date, INTERVAL 1 DAY)
        AND EXISTS (
            SELECT 1 FROM shift_staffing ss2
            JOIN shifts s2 ON ss2.shift_id = s2.shift_id
            WHERE ss2.staff_amka = p_staff_amka AND s2.shift_slot = 'νυχτερινή'
            AND s2.shift_date = DATE_ADD(p_date, INTERVAL 1 DAY)
        )
        ) OR EXISTS (
        SELECT 1 FROM shift_staffing ss1
        JOIN shifts s1 ON ss1.shift_id = s1.shift_id
        WHERE ss1.staff_amka = p_staff_amka AND s1.shift_slot = 'νυχτερινή'
        AND s1.shift_date = DATE_SUB(p_date, INTERVAL 1 DAY)
        AND EXISTS (
            SELECT 1 FROM shift_staffing ss2
            JOIN shifts s2 ON ss2.shift_id = s2.shift_id
            WHERE ss2.staff_amka = p_staff_amka AND s2.shift_slot = 'νυχτερινή'
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
    CALL validate_staff_shift_max_limit(NEW.staff_amka, NEW.shift_id);
    CALL validate_consecutive_nights(NEW.staff_amka, NEW.shift_id);
END //

CREATE TRIGGER shift_staffing_update_trigger
BEFORE UPDATE ON shift_staffing
FOR EACH ROW
BEGIN
    IF (NEW.staff_amka <> OLD.staff_amka OR NEW.shift_id <> OLD.shift_id) THEN
        CALL validate_staff_shift_max_limit(NEW.staff_amka, NEW.shift_id);
        CALL validate_consecutive_nights(NEW.staff_amka, NEW.shift_id);
    END IF;
END //
        
CREATE PROCEDURE validate_shift_rest(IN p_staff_amka CHAR(11), IN p_shift_id INT)
BEGIN
    DECLARE v_new_date DATE;
    DECLARE v_new_slot VARCHAR(20);
    DECLARE v_new_start DATETIME;
    DECLARE v_violation INT DEFAULT 0;

    SELECT shift_date, shift_slot INTO v_new_date, v_new_slot
    FROM shifts WHERE shift_id = p_shift_id;

    SET v_new_start = TIMESTAMP(v_new_date,
        CASE v_new_slot
            WHEN 'πρωινή'        THEN '07:00:00'
            WHEN 'απογευματινή'  THEN '15:00:00'
            WHEN 'νυχτερινή'     THEN '23:00:00'
        END);

    SELECT COUNT(*) INTO v_violation
    FROM shift_staffing ss
    JOIN shifts s ON ss.shift_id = s.shift_id
    WHERE ss.staff_amka = p_staff_amka
      AND ss.shift_id <> p_shift_id
      AND ABS(TIMESTAMPDIFF(MINUTE, v_new_start,
              TIMESTAMP(s.shift_date,
                  CASE s.shift_slot
                      WHEN 'πρωινή'        THEN '07:00:00'
                      WHEN 'απογευματινή'  THEN '15:00:00'
                      WHEN 'νυχτερινή'     THEN '23:00:00'
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
    CALL validate_shift_rest(NEW.staff_amka, NEW.shift_id);
END//

CREATE TRIGGER prevent_consecutive_shift_update_trigger
BEFORE UPDATE ON shift_staffing
FOR EACH ROW
BEGIN
    IF (NEW.staff_amka <> OLD.staff_amka OR NEW.shift_id <> OLD.shift_id) THEN
        CALL validate_shift_rest(NEW.staff_amka, NEW.shift_id);
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
        COUNT(CASE WHEN s.staff_type = 'doctor' THEN 1 END),
        COUNT(CASE WHEN s.staff_type = 'nurse' THEN 1 END),
        COUNT(CASE WHEN s.staff_type = 'admin' THEN 1 END)
    INTO doc_count, nurse_count, admin_count
    FROM shift_staffing ss
    JOIN staff s ON ss.staff_amka = s.amka
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
    JOIN doctors d ON ss.staff_amka = d.amka
    WHERE ss.shift_id = p_shift_id AND d.rank = 'Ειδικευόμενος';

    IF resident_exists > 0 THEN
        SELECT COUNT(*) INTO senior_exists
        FROM shift_staffing ss
        JOIN doctors d ON ss.staff_amka = d.amka
        WHERE ss.shift_id = p_shift_id 
        AND d.rank IN ('Επιμελητής Α', 'Διευθυντής');

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
        COUNT(CASE WHEN s.staff_type = 'doctor' THEN 1 END),
        COUNT(CASE WHEN s.staff_type = 'nurse' THEN 1 END),
        COUNT(CASE WHEN s.staff_type = 'admin' THEN 1 END)
    INTO doc_count, nurse_count, admin_count
    FROM shift_staffing ss
    JOIN staff s ON ss.staff_amka = s.amka
    WHERE ss.shift_id = p_shift_id;

    IF doc_count >= 3 AND nurse_count >= 6 AND admin_count >= 2 THEN
        SET current_status = 'scheduled';
    ELSE
        SET current_status = 'understaffed';
    END IF;

    UPDATE shifts 
    SET shift_status = current_status 
    WHERE shift_id = p_shift_id 
    AND shift_status IN ('scheduled', 'understaffed'); 
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
    IF NEW.shift_status = 'completed' AND OLD.shift_status <> 'completed' THEN
        CALL validate_shift_requirements(NEW.shift_id);
    END IF;
END//

CREATE TRIGGER protect_locked_shifts_trigger
BEFORE INSERT ON shift_staffing
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT shift_status INTO v_status 
    FROM shifts 
    WHERE shift_id = NEW.shift_id;

    IF v_status = 'completed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Δεν μπορείτε να προσθέσετε προσωπικό σε κλειδωμένη βάρδια.';
    END IF;
END//

CREATE TRIGGER protect_locked_shifts_delete_trigger
BEFORE DELETE ON shift_staffing
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT shift_status INTO v_status 
    FROM shifts 
    WHERE shift_id = OLD.shift_id;

    IF v_status = 'completed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Σφάλμα: Δεν μπορείτε να αφαιρέσετε προσωπικό από κλειδωμένη βάρδια.';
    END IF;
END//

DELIMITER ;


-- Indexes

CREATE INDEX idx_adm_date ON admissions(admission_date);

CREATE INDEX idx_pe_start_time ON procedure_executions(start_time);

CREATE INDEX idx_shifts_date ON shifts(shift_date);

CREATE INDEX idx_triage_time ON triages(triage_time);

CREATE INDEX idx_icd10_category ON icd10(category);

CREATE INDEX idx_staff_last_name    ON staff(last_name);
CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_patients_dob       ON patients(date_of_birth);
