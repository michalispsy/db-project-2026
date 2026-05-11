#!/usr/bin/env python3
"""
Synthetic Data Generator for ygeiopolis database.

Outputs:
  - Clean CSVs in data/csv/load/ (one per table)
  - sql/load.sql with LOAD DATA LOCAL INFILE statements

Usage:
    python3 data/synthetic_data/generate.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_SQL, OUT_CSV_DIR, REL_CSV_DIR
from gen_reference import (
    gen_icd10, gen_ken, gen_substances_and_drugs,
    gen_medical_procedures, gen_operating_rooms, gen_lab_exam_types,
)
from gen_entities import (
    gen_departments, gen_staff_and_doctors, gen_nurses,
    gen_admin, gen_beds, gen_patients,
)
from gen_clinical import (
    gen_admissions, gen_triages, gen_lab_exams,
    gen_procedure_executions, gen_prescriptions,
    gen_ratings, gen_shifts, gen_images,
)


# Table -> (csv_filename, [columns]) mapping for LOAD DATA
LOAD_ORDER = [
    ("icd10",                     "icd10.csv",                     ["icd10_code", "description", "category"]),
    ("ken_categories",            "ken_categories.csv",            ["category_letter", "description"]),
    ("ken",                       "ken.csv",                       ["ken_code", "description", "base_cost", "avg_length_of_stay", "daily_surcharge_rate", "category_letter"]),
    ("active_substances",         "active_substances.csv",         ["substance_id", "name"]),
    ("drugs",                     "drugs.csv",                     ["drug_id", "ema_code", "name", "manufacturer"]),
    ("drug_contains_substances",  "drug_contains_substances.csv",  ["drug_id", "substance_id"]),
    ("medical_procedures",        "medical_procedures.csv",        ["procedure_code", "name", "category", "standard_duration", "standard_cost"]),
    ("exam_types",                "exam_types.csv",                ["exam_code", "name"]),
    ("operating_rooms",           "operating_rooms.csv",           ["room_id", "room_name", "room_type", "floor", "building"]),
    ("departments",               "departments.csv",               ["dept_id", "name", "description", "bed_count", "floor", "building", "director_AMKA"]),
    # Staff loaded in 3 batches (all into same `staff` table)
    ("staff",                     "staff_doctors.csv",             ["AMKA", "first_name", "last_name", "date_of_birth", "email", "phone_number", "hire_date", "staff_type"]),
    ("doctors",                   "doctors.csv",                   ["AMKA", "license_number", "`rank`", "specialty", "supervisor_AMKA"]),
    ("doctor_departments",        "doctor_departments.csv",        ["doctor_AMKA", "dept_id"]),
    # --- director UPDATE goes here (handled separately) ---
    ("staff",                     "staff_nurses.csv",              ["AMKA", "first_name", "last_name", "date_of_birth", "email", "phone_number", "hire_date", "staff_type"]),
    ("nurses",                    "nurses.csv",                    ["AMKA", "`rank`", "dept_id"]),
    ("staff",                     "staff_admin.csv",               ["AMKA", "first_name", "last_name", "date_of_birth", "email", "phone_number", "hire_date", "staff_type"]),
    ("admin_staff",               "admin_staff.csv",               ["AMKA", "position", "office_location", "dept_id"]),
    ("beds",                      "beds.csv",                      ["bed_id", "dept_id", "room_capacity", "bed_type"]),
    ("patients",                  "patients.csv",                  ["AMKA", "first_name", "last_name", "fathers_name", "date_of_birth", "gender", "weight", "height", "phone_number", "email", "address", "occupation", "nationality", "insurance_provider"]),
    ("patient_emergency_contacts","patient_emergency_contacts.csv",["patient_AMKA", "first_name", "last_name", "phone_number", "email", "relationship_to_patient"]),
    ("patient_allergies",         "patient_allergies.csv",         ["patient_AMKA", "substance_id"]),
    ("admissions",                "admissions.csv",                ["patient_AMKA", "department_id", "bed_id", "ken_code", "admission_date", "discharge_date", "admission_diagnosis_code", "discharge_diagnosis_code"]),
    # --- discharge UPDATEs go here (handled separately) ---
    ("triages",                   "triages.csv",                   ["patient_AMKA", "nurse_AMKA", "arrival_time", "triage_time", "minutes_waited", "urgency_level", "symptoms", "outcome", "admission_id"]),
    ("lab_exams",                 "lab_exams.csv",                 ["admission_id", "exam_code", "exam_date", "result_text", "result_numeric", "result_unit", "cost", "doctor_AMKA"]),
    ("procedure_executions",      "procedure_executions.csv",      ["admission_id", "procedure_code", "room_id", "main_doctor_AMKA", "start_time", "end_time", "actual_cost"]),
    ("procedure_assistants",      "procedure_assistants.csv",      ["execution_id", "staff_AMKA", "`role`"]),
    ("prescriptions",             "prescriptions.csv",             ["admission_id", "patient_AMKA", "doctor_AMKA", "drug_id", "dosage", "frequency", "start_date", "end_date"]),
    ("admission_ratings",         "admission_ratings.csv",         ["admission_id", "nursing_quality", "cleanliness", "food", "overall", "comment", "rated_at"]),
    ("doctor_ratings",            "doctor_ratings.csv",            ["admission_id", "doctor_AMKA", "medical_care_quality", "comment", "rated_at"]),
    ("shifts",                    "shifts.csv",                    ["shift_id", "shift_date", "shift_slot", "shift_status", "dept_id"]),
    ("shift_staffing",            "shift_staffing.csv",            ["shift_id", "staff_AMKA"]),
    ("department_images",         "department_images.csv",         ["dept_id", "img_url", "caption", "ordering"]),
    ("drug_images",               "drug_images.csv",               ["drug_id", "img_url", "caption", "ordering"]),
    ("doctor_images",             "doctor_images.csv",             ["doctor_AMKA", "img_url", "caption", "ordering"]),
]


def write_load_sql(director_updates, discharge_updates):
    """Generate load.sql with LOAD DATA LOCAL INFILE + UPDATE statements."""
    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write("-- ============================================\n")
        f.write("-- Load synthetic data for ygeiopolis database\n")
        f.write("-- Auto-generated by generate.py\n")
        f.write("-- Uses LOAD DATA LOCAL INFILE from CSVs\n")
        f.write("-- ============================================\n\n")
        f.write("USE ygeiopolis;\n\n")

        for table, csv_file, columns in LOAD_ORDER:
            csv_path = os.path.join(OUT_CSV_DIR, csv_file)
            rel_path = f"{REL_CSV_DIR}/{csv_file}"

            # Check if CSV was generated (some may be empty)
            if not os.path.exists(csv_path):
                f.write(f"-- Skipped {table} ({csv_file} not found)\n\n")
                continue

            col_list = ", ".join(columns)
            f.write(f"-- {table}\n")
            f.write(f"LOAD DATA LOCAL INFILE '{rel_path}'\n")
            f.write(f"INTO TABLE `{table}`\n")
            f.write("CHARACTER SET utf8mb4\n")
            f.write("FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"'\n")
            f.write("LINES TERMINATED BY '\\n'\n")
            f.write("IGNORE 1 ROWS\n")
            f.write(f"({col_list});\n\n")

            # After doctor_departments: set directors
            if table == "doctor_departments":
                f.write("-- Set department directors\n")
                for dept_id, amka in director_updates:
                    f.write(f"UPDATE departments SET director_AMKA = '{amka}' WHERE dept_id = {dept_id};\n")
                f.write("\n")

            # After admissions: discharge patients (triggers extra_cost + bed free)
            if table == "admissions":
                f.write("-- Discharge patients (triggers calculate extra_cost and free beds)\n")
                for adm in discharge_updates:
                    icd = adm["icd_out"].replace("'", "\\'") if adm["icd_out"] else ""
                    f.write(f"UPDATE admissions SET discharge_date = '{adm['dis_date']}', "
                            f"discharge_diagnosis_code = '{icd}' "
                            f"WHERE admission_id = {adm['id']};\n")
                f.write("\n")

        f.write("-- Done.\n")


def main():
    print("=" * 60)
    print("Generating synthetic data (CSVs + LOAD DATA INFILE)")
    print("=" * 60)

    # 1. Reference data
    print("\n[1/5] Reference data from CSVs...")
    icd10_codes = gen_icd10()
    ken_codes = gen_ken()
    drug_ids, substance_list, sub_id_map, drug_substance_map = gen_substances_and_drugs()
    proc_codes = gen_medical_procedures()
    room_ids = gen_operating_rooms()
    lab_types = gen_lab_exam_types()

    # 2. Structural entities
    print("\n[2/5] People & structure...")
    dept_ids = gen_departments()
    doctors, director_updates = gen_staff_and_doctors(dept_ids)
    nurses = gen_nurses(dept_ids)
    admins = gen_admin(dept_ids)
    dept_beds = gen_beds(dept_ids)
    patients, patient_allergy_map = gen_patients(sub_id_map)

    # 3. Clinical data
    print("\n[3/5] Clinical records...")
    admissions, discharge_updates = gen_admissions(patients, dept_ids, dept_beds, ken_codes, icd10_codes)
    gen_triages(patients, nurses, admissions)
    lab_doctors = gen_lab_exams(admissions, doctors, lab_types)
    procedure_doctors = gen_procedure_executions(admissions, proc_codes, room_ids, doctors)
    prescribing_doctors = gen_prescriptions(admissions, doctors, drug_ids, patient_allergy_map, drug_substance_map)
    gen_ratings(discharge_updates, prescribing_doctors, procedure_doctors, lab_doctors)

    # 4. Scheduling & images
    print("\n[4/5] Shifts & images...")
    gen_shifts(dept_ids, doctors, nurses, admins)
    gen_images(dept_ids, drug_ids, doctors)

    # 5. Generate load.sql
    print("\n[5/5] Writing load.sql...")
    write_load_sql(director_updates, discharge_updates)

    sql_size = os.path.getsize(OUTPUT_SQL)
    csv_count = len([f for f in os.listdir(OUT_CSV_DIR) if f.endswith(".csv")])
    print(f"\n{'=' * 60}")
    print(f"✓ Generated {csv_count} CSVs in {OUT_CSV_DIR}")
    print(f"✓ Generated {OUTPUT_SQL}")
    print(f"  load.sql size: {sql_size / 1024:.1f} KB")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
