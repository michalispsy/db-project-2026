# Ygeiopolis — Βάση Δεδομένων Νοσοκομείου

Εξαμηνιαία εργασία για το μάθημα Βάσεων Δεδομένων, ακαδημαϊκό έτος 2025–2026.  
Σχεδιασμός, υλοποίηση και ερώτηση σχεσιακής βάσης δεδομένων για τη διαχείριση νοσοκομείου.

---


## Εγκατάσταση και εκτέλεση

## Επιλογή 1 — Αυτόματη εγκατάσταση (Linux)

```bash
bash semester_exe/code/setup.sh
```

Το script εγκαθιστά αυτόματα MariaDB αν δεν υπάρχει, δημιουργεί τη βάση
και ανοίγει MariaDB shell στη βάση `ygeiopolis`.

Μετά την αρχική εγκατάσταση το script αντιγράφεται στο `/usr/local/bin/db`
οπότε μπορείτε να τρέχετε απλά `db` από οπουδήποτε.

## Επιλογή 2 — Χειροκίνητα

```bash
# Δημιουργία σχήματος και φόρτωση δεδομένων
mariadb < semester_exe/sql/install.sql
mariadb < semester_exe/sql/load.sql

# Εκτέλεση ερωτήματος (π.χ. Q01)
mariadb ygeiopolis < semester_exe/sql/Q01.sql
```

### Εκκίνηση web interface

```bash
cd semester_exe/code
python3 -m venv venv
venv/bin/pip install flask mysql-connector-python
bash run.sh
# Άνοιγμα στο http://localhost:5000
```

> Το `run.sh` απαιτεί sudo γιατί συνδέεται στο MariaDB μέσω unix socket (`/run/mysqld/mysqld.sock`).

---

## Σχήμα βάσης

Η βάση ονομάζεται `ygeiopolis` και περιέχει 34 πίνακες.

## Πίνακες

### Προσωπικό

| Πίνακας | PK | Βασικά πεδία |
|---|---|---|
| `staff` | `amka` | `first_name`, `last_name`, `date_of_birth`, `age` *(virtual)*, `email`, `phone_number`, `hire_date`, `staff_type` |
| `doctors` | `amka` | `license_number`, `rank`, `specialty`, `supervisor_amka` |
| `nurses` | `amka` | `rank`, `dept_id` |
| `admin_staff` | `amka` | `position`, `office_location`, `dept_id` |
| `doctor_departments` | `(doctor_amka, dept_id)` | — |

### Τμήματα και κλίνες

| Πίνακας | PK | Βασικά πεδία |
|---|---|---|
| `departments` | `dept_id` | `name`, `description`, `bed_count` *(trigger-maintained)*, `floor`, `building`, `director_amka` |
| `beds` | `bed_id` | `dept_id`, `room_capacity`, `bed_type`, `status`, `assigned_to` *(trigger-maintained)* |

### Ασθενείς

| Πίνακας | PK | Βασικά πεδία |
|---|---|---|
| `patients` | `amka` | `first_name`, `last_name`, `fathers_name`, `date_of_birth`, `age` *(virtual)*, `gender`, `weight`, `height`, `phone_number`, `email`, `address`, `occupation`, `nationality`, `insurance_provider` |
| `patient_emergency_contacts` | `(patient_amka, contact_seq)` | `first_name`, `last_name`, `phone_number`, `email`, `relationship_to_patient` |
| `patient_allergies` | `(patient_amka, substance_id)` | — |

### Νοσηλείες

| Πίνακας | PK | Βασικά πεδία |
|---|---|---|
| `admissions` | `admission_id` | `patient_amka`, `department_id`, `bed_id`, `ken_code`, `admission_date`, `discharge_date`, `admission_diagnosis_code`, `discharge_diagnosis_code`, `base_cost`, `extra_cost`, `total_cost` *(virtual)* |
| `triages` | `triage_id` | `patient_amka`, `nurse_amka`, `arrival_time`, `triage_time`, `minutes_waited`, `urgency_level`, `symptoms`, `outcome`, `admission_id` |

### Ιατρική δραστηριότητα

| Πίνακας | PK | Βασικά πεδία |
|---|---|---|
| `lab_exams` | `exam_id` | `admission_id`, `exam_code`, `exam_date`, `result_text`, `result_numeric`, `result_unit`, `cost`, `doctor_amka` |
| `medical_procedures` | `procedure_code` | `name`, `category`, `standard_duration`, `standard_cost` |
| `operating_rooms` | `room_id` | `room_name`, `room_type`, `floor`, `building` |
| `procedure_executions` | `execution_id` | `admission_id`, `procedure_code`, `room_id`, `main_doctor_amka`, `start_time`, `end_time`, `actual_cost` |
| `procedure_assistants` | `(staff_amka, execution_id)` | `role` |

### Φάρμακα και συνταγογράφηση

| Πίνακας | PK | Βασικά πεδία |
|---|---|---|
| `drugs` | `drug_id` | `ema_code`, `name`, `manufacturer` |
| `active_substances` | `substance_id` | `name` |
| `drug_contains_substances` | `(drug_id, substance_id)` | — |
| `prescriptions` | `prescription_id` | `admission_id`, `patient_amka`, `doctor_amka`, `drug_id`, `dosage`, `frequency`, `start_date`, `end_date` |

### Εφημερίες

| Πίνακας | PK | Βασικά πεδία |
|---|---|---|
| `shifts` | `shift_id` | `shift_date`, `shift_slot`, `shift_status`, `dept_id` |
| `shift_staffing` | `(staff_amka, shift_id)` | — |

### Αξιολογήσεις

| Πίνακας | PK | Βασικά πεδία |
|---|---|---|
| `admission_ratings` | `admission_id` | `nursing_quality`, `cleanliness`, `food`, `overall` *(1–5)*, `comment`, `rated_at` |
| `doctor_ratings` | `rating_id` | `admission_id`, `doctor_amka`, `medical_care_quality` *(1–5)*, `comment`, `rated_at` |

### Κωδικολόγια

| Πίνακας | Περιγραφή |
|---|---|
| `icd10` | Κωδικοί διαγνώσεων ICD-10 |
| `ken` | Κλειστά Ενοποιημένα Νοσήλια |
| `ken_categories` | Κατηγορίες ΚΕΝ |
| `exam_types` | Τύποι εργαστηριακών εξετάσεων |
| `specialties` | Ιατρικές ειδικότητες |
| `staff_types` | Τύποι προσωπικού (doctor / nurse / admin) |
| `doctor_ranks` | Βαθμοί ιατρών |
| `nurse_ranks` | Βαθμοί νοσηλευτών |
| `admin_roles` | Θέσεις διοικητικού προσωπικού |
| `genders` | Φύλο |
| `insurance_providers` | Ασφαλιστικοί φορείς |
| `bed_types` | Τύποι κλινών |
| `bed_statuses` | Καταστάσεις κλίνης |
| `urgency_levels` | Επίπεδα επείγοντος triage (1–5, κλίμακα Manchester) |
| `triage_outcomes` | Αποτελέσματα triage (discharged / hospitalized) |
| `shift_slots` | Βάρδιες (πρωινή / απογευματινή / νυχτερινή) |
| `shift_statuses` | Καταστάσεις εφημερίας |
| `procedure_categories` | Κατηγορίες ιατρικών πράξεων |
| `room_types` | Τύποι αιθουσών |

### Εικόνες

| Πίνακας | Συνδέεται με |
|---|---|
| `department_images` | `departments` |
| `drug_images` | `drugs` |
| `doctor_images` | `doctors` |
| `operating_room_images` | `operating_rooms` |

---

## Σχέσεις

| Πίνακας (παιδί) | Πίνακας (γονέας) | Στήλη | ON DELETE |
|---|---|---|---|
| `doctors` | `staff` | `amka` | CASCADE |
| `nurses` | `staff` | `amka` | CASCADE |
| `admin_staff` | `staff` | `amka` | CASCADE |
| `doctors` | `doctors` | `supervisor_amka` | SET NULL |
| `doctor_departments` | `doctors` | `doctor_amka` | CASCADE |
| `doctor_departments` | `departments` | `dept_id` | CASCADE |
| `departments` | `doctors` | `director_amka` | SET NULL |
| `nurses` | `departments` | `dept_id` | CASCADE |
| `admin_staff` | `departments` | `dept_id` | SET NULL |
| `beds` | `departments` | `dept_id` | CASCADE |
| `patient_emergency_contacts` | `patients` | `patient_amka` | CASCADE |
| `patient_allergies` | `patients` | `patient_amka` | CASCADE |
| `patient_allergies` | `active_substances` | `substance_id` | CASCADE |
| `admissions` | `patients` | `patient_amka` | CASCADE |
| `admissions` | `departments` | `department_id` | RESTRICT |
| `admissions` | `beds` | `bed_id` | RESTRICT |
| `admissions` | `ken` | `ken_code` | RESTRICT |
| `admissions` | `icd10` | `admission_diagnosis_code` | RESTRICT |
| `admissions` | `icd10` | `discharge_diagnosis_code` | RESTRICT |
| `triages` | `patients` | `patient_amka` | RESTRICT |
| `triages` | `nurses` | `nurse_amka` | RESTRICT |
| `triages` | `admissions` | `admission_id` | RESTRICT |
| `triages` | `urgency_levels` | `urgency_level` | RESTRICT |
| `triages` | `triage_outcomes` | `outcome` | RESTRICT |
| `lab_exams` | `admissions` | `admission_id` | CASCADE |
| `lab_exams` | `doctors` | `doctor_amka` | RESTRICT |
| `lab_exams` | `exam_types` | `exam_code` | RESTRICT |
| `procedure_executions` | `admissions` | `admission_id` | CASCADE |
| `procedure_executions` | `medical_procedures` | `procedure_code` | RESTRICT |
| `procedure_executions` | `operating_rooms` | `room_id` | RESTRICT |
| `procedure_executions` | `doctors` | `main_doctor_amka` | RESTRICT |
| `procedure_assistants` | `procedure_executions` | `execution_id` | CASCADE |
| `procedure_assistants` | `staff` | `staff_amka` | RESTRICT |
| `prescriptions` | `admissions` | `admission_id` | CASCADE |
| `prescriptions` | `patients` | `patient_amka` | RESTRICT |
| `prescriptions` | `doctors` | `doctor_amka` | RESTRICT |
| `prescriptions` | `drugs` | `drug_id` | RESTRICT |
| `drug_contains_substances` | `drugs` | `drug_id` | CASCADE |
| `drug_contains_substances` | `active_substances` | `substance_id` | CASCADE |
| `shifts` | `departments` | `dept_id` | CASCADE |
| `shifts` | `shift_slots` | `shift_slot` | RESTRICT |
| `shifts` | `shift_statuses` | `shift_status` | RESTRICT |
| `shift_staffing` | `shifts` | `shift_id` | CASCADE |
| `shift_staffing` | `staff` | `staff_amka` | CASCADE |
| `admission_ratings` | `admissions` | `admission_id` | CASCADE |
| `doctor_ratings` | `admissions` | `admission_id` | CASCADE |
| `doctor_ratings` | `doctors` | `doctor_amka` | RESTRICT |
| `ken` | `ken_categories` | `category_letter` | RESTRICT |
| `department_images` | `departments` | `dept_id` | CASCADE |
| `drug_images` | `drugs` | `drug_id` | CASCADE |
| `doctor_images` | `doctors` | `doctor_amka` | CASCADE |
| `operating_room_images` | `operating_rooms` | `room_id` | CASCADE |

---

## Triggers

### Αυτοματισμοί

| Trigger | Πίνακας | Συμβάν | Ενέργεια |
|---|---|---|---|
| `beds_insert_trigger` | `beds` | AFTER INSERT | Αυξάνει `departments.bed_count` κατά 1 |
| `beds_delete_trigger` | `beds` | AFTER DELETE | Μειώνει `departments.bed_count` κατά 1 |
| `set_contact_seq_trigger` | `patient_emergency_contacts` | BEFORE INSERT | Αυτόματο `contact_seq` ανά ασθενή |
| `calculate_admission_base_cost_trigger` | `admissions` | BEFORE INSERT | Θέτει `base_cost` από `ken.base_cost` |
| `calculate_admission_extra_cost_trigger` | `admissions` | BEFORE UPDATE | Υπολογίζει `extra_cost` κατά το εξιτήριο (επιπλέον μέρες × ημερήσιο τέλος ΚΕΝ) |
| `set_bed_occupied_trigger` | `admissions` | AFTER INSERT | Θέτει κλίνη σε `κατειλημμένη`, `assigned_to = admission_id` |
| `set_bed_free_trigger` | `admissions` | AFTER UPDATE | Απελευθερώνει κλίνη όταν οριστεί `discharge_date` |
| `after_staffing_insert_trigger` | `shift_staffing` | AFTER INSERT | Ενημερώνει status εφημερίας (scheduled / understaffed) |
| `after_staffing_delete_trigger` | `shift_staffing` | AFTER DELETE | Ενημερώνει status εφημερίας (scheduled / understaffed) |

### Έλεγχοι ακεραιότητας

| Trigger | Πίνακας | Συμβάν | Κανόνας |
|---|---|---|---|
| `check_admission_dept_matches_bed_insert_trigger` | `admissions` | BEFORE INSERT | Κλίνη πρέπει να ανήκει στο τμήμα εισαγωγής |
| `check_admission_dept_matches_bed_update_trigger` | `admissions` | BEFORE UPDATE | Κλίνη πρέπει να ανήκει στο τμήμα εισαγωγής |
| `check_bed_overlap_insert_trigger` | `admissions` | BEFORE INSERT | Απαγόρευση overlap κλίνης · απαγόρευση κλίνης υπό συντήρηση |
| `check_bed_overlap_update_trigger` | `admissions` | BEFORE UPDATE | Απαγόρευση overlap κλίνης |
| `doctor_rank_insert_check_trigger` | `doctors` | BEFORE INSERT | Ειδικευόμενος → υποχρεωτικός επόπτης · Διευθυντής → απαγόρευση επόπτη |
| `doctor_rank_update_check_trigger` | `doctors` | BEFORE UPDATE | Ειδικευόμενος → υποχρεωτικός επόπτης · Διευθυντής → απαγόρευση επόπτη |
| `doctor_supervisor_insert_trigger` | `doctors` | BEFORE INSERT | Ανίχνευση κυκλικής εξάρτησης εποπτείας (recursive CTE) |
| `doctor_supervisor_update_trigger` | `doctors` | BEFORE UPDATE | Ανίχνευση κυκλικής εξάρτησης εποπτείας (recursive CTE) |
| `check_for_admins_in_procedure_trigger` | `procedure_assistants` | BEFORE INSERT | Διοικητικό προσωπικό δεν επιτρέπεται ως βοηθός επέμβασης |
| `check_admission_rating_trigger` | `admission_ratings` | BEFORE INSERT | Αξιολόγηση επιτρέπεται μόνο μετά το εξιτήριο |
| `check_doctor_rating_insert_trigger` | `doctor_ratings` | BEFORE INSERT | Ιατρός πρέπει να συμμετείχε στη νοσηλεία · εξιτήριο απαραίτητο |
| `check_doctor_rating_update_trigger` | `doctor_ratings` | BEFORE UPDATE | Ιατρός πρέπει να συμμετείχε στη νοσηλεία · εξιτήριο απαραίτητο |
| `check_lab_exam_window_insert_trigger` | `lab_exams` | BEFORE INSERT | Εξέταση εντός παραθύρου νοσηλείας |
| `check_lab_exam_window_update_trigger` | `lab_exams` | BEFORE UPDATE | Εξέταση εντός παραθύρου νοσηλείας |
| `check_procedure_window_insert_trigger` | `procedure_executions` | BEFORE INSERT | Επέμβαση εντός παραθύρου νοσηλείας |
| `check_procedure_window_update_trigger` | `procedure_executions` | BEFORE UPDATE | Επέμβαση εντός παραθύρου νοσηλείας |
| `procedure_overlap_insert_trigger` | `procedure_executions` | BEFORE INSERT | Αίθουσα και κύριος ιατρός δεν επιτρέπεται να είναι ήδη δεσμευμένοι |
| `procedure_overlap_update_trigger` | `procedure_executions` | BEFORE UPDATE | Αίθουσα και κύριος ιατρός δεν επιτρέπεται να είναι ήδη δεσμευμένοι |
| `check_patient_drug_allergies_trigger` | `prescriptions` | BEFORE INSERT | Απαγόρευση συνταγής αν ασθενής είναι αλλεργικός σε δραστική ουσία φαρμάκου |
| `shift_staffing_insert_trigger` | `shift_staffing` | BEFORE INSERT | Μέγιστα όρια/μήνα (15 ιατροί · 20 νοσηλευτές · 25 διοικητικοί) · max 3 συνεχόμενες νυχτερινές |
| `shift_staffing_update_trigger` | `shift_staffing` | BEFORE UPDATE | Ίδιοι κανόνες ορίων εφημεριών |
| `prevent_consecutive_shift_insert_trigger` | `shift_staffing` | BEFORE INSERT | Ελάχιστο 8 ωρών ανάπαυσης μεταξύ βαρδιών |
| `prevent_consecutive_shift_update_trigger` | `shift_staffing` | BEFORE UPDATE | Ελάχιστο 8 ωρών ανάπαυσης μεταξύ βαρδιών |
| `validate_shift_on_lock_trigger` | `shifts` | BEFORE UPDATE | Κατά το κλείδωμα (→ completed): ≥3 ιατροί, ≥6 νοσηλευτές, ≥2 διοικητικοί · αν υπάρχει ειδικευόμενος, απαιτείται Επιμελητής Α ή Διευθυντής |
| `protect_locked_shifts_trigger` | `shift_staffing` | BEFORE INSERT | Απαγόρευση προσθήκης σε κλειδωμένη εφημερία |
| `protect_locked_shifts_delete_trigger` | `shift_staffing` | BEFORE DELETE | Απαγόρευση αφαίρεσης από κλειδωμένη εφημερία |

---

## CHECK Constraints

| Πίνακας | Constraint | Κανόνας |
|---|---|---|
| `admissions` | `chk_discharge_date` | `discharge_date IS NULL OR discharge_date >= admission_date` |
| `lab_exams` | `chk_exam_result` | `result_text IS NOT NULL OR result_numeric IS NOT NULL` |
| `prescriptions` | `chk_presc_dates` | `end_date > start_date` |
| `procedure_executions` | `chk_proc_times` | `end_time IS NULL OR end_time > start_time` |
| `triages` | `chk_triage_consistency` | Αν `outcome = 'hospitalized'` τότε `admission_id IS NOT NULL` · αν `outcome = 'discharged'` τότε `admission_id IS NULL` |
| `admission_ratings` | `chk_nursing_range` | `nursing_quality BETWEEN 1 AND 5` |
| `admission_ratings` | `chk_clean_range` | `cleanliness BETWEEN 1 AND 5` |
| `admission_ratings` | `chk_food_range` | `food BETWEEN 1 AND 5` |
| `admission_ratings` | `chk_overall_range` | `overall BETWEEN 1 AND 5` |
| `doctor_ratings` | `chk_medical_range` | `medical_care_quality BETWEEN 1 AND 5` |

---


## Web Interface

Μικρό web app για την εξερεύνηση της βάσης, χτισμένο με:
- Backend: Python / Flask, σύνδεση με MariaDB μέσω unix socket
- Frontend: HTML + JSX (React) + CSS, server-side rendered

Τρέχει στο `http://localhost:5000` μετά από `bash run.sh`.

---

## Συνθετικά δεδομένα

Τα δεδομένα παράχθηκαν συνθετικά μέσω Python scripts στο
`data/synthetic_data_generation_code/`, με βάση πραγματικά κωδικολόγια
(ICD-10, ΚΕΝ, EMA). Η φόρτωση γίνεται μέσω `LOAD DATA LOCAL INFILE` από
αρχεία CSV στο `data/csv/load/`.

---

## Ευρετήρια

Ορίζονται 8 ευρετήρια αποκλειστικά σε στήλες που δεν καλύπτονται ήδη από
αυτόματα FK indexes της MariaDB:


| Index | Στήλη | Χρήση σε ερωτήματα |
|---|---|---|
| `idx_adm_date` | `admissions.admission_date` | Q01, Q06, Q09, Q14 |
| `idx_pe_start_time` | `procedure_executions.start_time` | Q11 |
| `idx_shifts_date` | `shifts.shift_date` | Q08, Q12 |
| `idx_triage_time` | `triages.triage_time` | Q15 |
| `idx_icd10_category` | `icd10.category` | Q14 |
| `idx_staff_last_name` | `staff.last_name` | Q04 |
| `idx_patients_last_name` | `patients.last_name` | Q06 |
| `idx_patients_dob` | `patients.date_of_birth` | Q05 |


