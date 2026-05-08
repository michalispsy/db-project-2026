"""Generate people & structural entity CSVs."""
import random
from datetime import date, timedelta
from config import *


def gen_departments():
    rows = []
    for i, (name, desc) in enumerate(DEPT_NAMES[:N_DEPARTMENTS], 1):
        floor = (i - 1) // 5 + 1
        bld = BUILDINGS[(i - 1) % len(BUILDINGS)]
        rows.append((i, name, desc, 0, floor, bld, None))
    write_csv_file("departments.csv", ["dept_id", "name", "description", "bed_count", "floor", "building", "director_AMKA"], rows)
    return list(range(1, N_DEPARTMENTS + 1))


def gen_staff_and_doctors(dept_ids):
    doctors = []
    staff_rows = []
    doctor_rows = []
    dd_rows = []

    for i in range(N_DOCTORS):
        gender = random.choice(["M", "F"])
        first, last, g = gen_person(gender)
        amka = gen_amka()
        dob = gen_dob(30, 60)
        email = gen_email(first, last)
        phone = gen_phone()
        hire = random_date(date(2015, 1, 1), date(2024, 6, 1))

        staff_rows.append((amka, first, last, str(dob), email, phone, str(hire), "Doctor"))

        if i < N_DEPARTMENTS:
            rank = "Director"
        elif i < N_DEPARTMENTS + 15:
            rank = "Senior Attending"
        elif i < N_DEPARTMENTS + 35:
            rank = "Junior Attending"
        else:
            rank = "Resident"

        doctors.append({"amka": amka, "rank": rank, "idx": i, "gender": gender,
                        "dept": dept_ids[i % len(dept_ids)]})

    write_csv_file("staff_doctors.csv",
                   ["AMKA", "first_name", "last_name", "date_of_birth", "email", "phone_number", "hire_date", "staff_type"],
                   staff_rows)

    # Build doctor rows with department-aware supervisors
    # First, let's map department directors
    dept_directors = {doc["dept"]: doc["amka"] for doc in doctors if doc["rank"] == "Director"}

    for doc in doctors:
        sup = None
        dept_id = doc["dept"]
        
        # Get potential supervisors in the SAME department
        dept_seniors = [d for d in doctors if d["dept"] == dept_id and d["rank"] == "Senior Attending"]
        dept_juniors = [d for d in doctors if d["dept"] == dept_id and d["rank"] == "Junior Attending"]
        
        if doc["rank"] == "Resident":
            # Residents report to a Senior or Junior Attending in their department
            options = dept_seniors + dept_juniors
            if options:
                sup = random.choice(options)["amka"]
            else:
                # Fallback to Director if no Attendings
                sup = dept_directors.get(dept_id)
                
        elif doc["rank"] == "Junior Attending":
            # Junior Attendings report to a Senior Attending in their department
            if dept_seniors:
                sup = random.choice(dept_seniors)["amka"]
            else:
                # Fallback to Director
                sup = dept_directors.get(dept_id)
                
        elif doc["rank"] == "Senior Attending":
            # Senior Attendings report to the Department Director
            sup = dept_directors.get(dept_id)
            
        lic = gen_license()
        doctor_rows.append((doc["amka"], lic, doc["rank"], sup))

    write_csv_file("doctors.csv", ["AMKA", "license_number", "rank", "supervisor_AMKA"], doctor_rows)

    # Doctor-department
    for doc in doctors:
        dd_rows.append((doc["amka"], doc["dept"]))
        if random.random() < 0.2:
            other = random.choice([d for d in dept_ids if d != doc["dept"]])
            dd_rows.append((doc["amka"], other))
    dd_rows = list(set(dd_rows))
    write_csv_file("doctor_departments.csv", ["doctor_AMKA", "dept_id"], dd_rows)

    # Director updates (returned for SQL UPDATE statements)
    director_updates = [(dept_ids[i], doctors[i]["amka"]) for i in range(N_DEPARTMENTS)]

    return doctors, director_updates


def gen_nurses(dept_ids):
    nurses = []
    staff_rows = []
    nurse_rows = []
    for i in range(N_NURSES):
        gender = random.choices(["M", "F"], weights=[0.2, 0.8])[0]
        first, last, g = gen_person(gender)
        amka = gen_amka()
        dob = gen_dob(22, 55)
        email = gen_email(first, last)
        phone = gen_phone()
        hire = random_date(date(2016, 1, 1), date(2024, 12, 1))
        dept = random.choice(dept_ids)

        staff_rows.append((amka, first, last, str(dob), email, phone, str(hire), "Nurse"))
        rank = random.choices(NURSE_RANKS, weights=[0.4, 0.45, 0.15])[0]
        nurse_rows.append((amka, rank, dept))
        nurses.append({"amka": amka, "dept": dept})

    write_csv_file("staff_nurses.csv",
                   ["AMKA", "first_name", "last_name", "date_of_birth", "email", "phone_number", "hire_date", "staff_type"],
                   staff_rows)
    write_csv_file("nurses.csv", ["AMKA", "rank", "dept_id"], nurse_rows)
    return nurses


def gen_admin(dept_ids):
    admins = []
    staff_rows = []
    admin_rows = []
    for i in range(N_ADMIN):
        gender = random.choice(["M", "F"])
        first, last, g = gen_person(gender)
        amka = gen_amka()
        dob = gen_dob(25, 58)
        email = gen_email(first, last)
        phone = gen_phone()
        hire = random_date(date(2017, 1, 1), date(2024, 12, 1))
        dept = random.choice(dept_ids)
        pos = random.choice(ADMIN_POSITIONS)
        office = f"Office-{random.choice(BUILDINGS)}{random.randint(1,3)}{random.randint(1,20):02d}"

        staff_rows.append((amka, first, last, str(dob), email, phone, str(hire), "Admin"))
        admin_rows.append((amka, pos, office, dept))
        admins.append({"amka": amka, "dept": dept})

    write_csv_file("staff_admin.csv",
                   ["AMKA", "first_name", "last_name", "date_of_birth", "email", "phone_number", "hire_date", "staff_type"],
                   staff_rows)
    write_csv_file("admin_staff.csv", ["AMKA", "position", "office_location", "dept_id"], admin_rows)
    return admins


def gen_beds(dept_ids):
    bed_rows = []
    bed_id = 1
    dept_beds = {}
    for dept in dept_ids:
        dept_beds[dept] = []
        for _ in range(BEDS_PER_DEPT):
            btype = random.choices(BED_TYPES, weights=BED_TYPE_WEIGHTS)[0]
            cap = random.choice([1, 2, 3, 4])
            bed_rows.append((bed_id, dept, cap, btype))
            dept_beds[dept].append(bed_id)
            bed_id += 1
    write_csv_file("beds.csv", ["bed_id", "dept_id", "room_capacity", "bed_type"], bed_rows)
    return dept_beds


def gen_patients(sub_id_map):
    patients = []
    pat_rows = []
    ec_rows = []
    allergy_rows = []
    substance_ids = list(sub_id_map.values()) if sub_id_map else []

    for i in range(N_PATIENTS):
        gender = random.choices(GENDERS, weights=GENDER_WEIGHTS)[0]
        g = random.choice(["M", "F"]) if gender == "Other" else gender
        first, last, _ = gen_person(g)
        amka = gen_amka()
        dob = gen_dob(1, 90)
        fathers = random.choice(MALE_FIRST)
        phone = gen_phone()
        email = gen_email(first, last)
        occ = random.choice(["Engineer", "Teacher", "Driver", "Farmer", "Student",
                              "Retired", "Doctor", "Lawyer", "Clerk", "Chef"])
        nat = random.choice(NATIONALITIES)
        ins = random.choice(INSURANCE)
        weight = random.randint(45, 130) if random.random() > 0.1 else None
        height = random.randint(150, 200) if random.random() > 0.1 else None

        pat_rows.append((amka, first, last, fathers, str(dob), gender,
                         weight, height, phone, email, occ, nat, ins))
        patients.append({"amka": amka})

        # Emergency contacts (1-2)
        for _ in range(random.randint(1, 2)):
            cf, cl, _ = gen_person()
            cp = gen_phone()
            rel = random.choice(RELATIONSHIPS)
            ec_rows.append((amka, cf, cl, cp, None, rel))

        # Allergies (0-3)
        if substance_ids and random.random() < 0.3:
            for sid in random.sample(substance_ids, min(random.randint(1, 3), len(substance_ids))):
                allergy_rows.append((amka, sid))

    write_csv_file("patients.csv",
                   ["AMKA", "first_name", "last_name", "fathers_name", "date_of_birth",
                    "gender", "weight", "height", "phone_number", "email",
                    "occupation", "nationality", "insurance_provider"], pat_rows)
    # Omit contact_seq — trigger handles it
    write_csv_file("patient_emergency_contacts.csv",
                   ["patient_AMKA", "first_name", "last_name", "phone_number", "email",
                    "relationship_to_patient"], ec_rows)
    allergy_rows = list(set(allergy_rows))
    if allergy_rows:
        write_csv_file("patient_allergies.csv", ["patient_AMKA", "substance_id"], allergy_rows)

    return patients
