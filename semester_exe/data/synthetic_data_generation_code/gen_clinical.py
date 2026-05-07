"""Generate clinical, scheduling, and image CSVs."""
import random
from datetime import date, timedelta
from config import *


def gen_admissions(patients, dept_ids, dept_beds, ken_codes, icd10_codes):
    """Returns (admissions_info, discharged_info, discharge_updates)."""
    adm_rows = []
    admissions = []
    discharge_updates = []

    all_beds = []
    for dept, beds in dept_beds.items():
        for b in beds:
            all_beds.append((dept, b))
    random.shuffle(all_beds)

    for i in range(min(N_ADMISSIONS, len(all_beds))):
        dept, bed = all_beds[i]
        pat = random.choice(patients)
        ken = random.choice(ken_codes)
        icd_in = random.choice(icd10_codes)
        adm_date = random_date(date(2024, 1, 1), date(2025, 11, 1))

        if random.random() < 0.85:
            los = random.randint(1, 25)
            dis_date = adm_date + timedelta(days=los)
        else:
            dis_date = None

        icd_out = random.choice(icd10_codes) if dis_date else None

        # CSV row: discharge_date=NULL initially (trigger needs INSERT then UPDATE)
        adm_rows.append((pat["amka"], dept, bed, ken, str(adm_date), None, icd_in, None))

        adm_info = {"id": i + 1, "patient": pat["amka"], "dept": dept,
                    "bed": bed, "dis_date": dis_date, "icd_out": icd_out,
                    "adm_date": adm_date}
        admissions.append(adm_info)

        if dis_date:
            discharge_updates.append(adm_info)

    write_csv_file("admissions.csv",
                   ["patient_AMKA", "department_id", "bed_id", "ken_code",
                    "admission_date", "discharge_date", "admission_diagnosis_code",
                    "discharge_diagnosis_code"], adm_rows)

    return admissions, discharge_updates


def gen_triages(patients, nurses, admissions):
    rows = []
    linked_adms = random.sample(admissions, min(N_TRIAGES // 2, len(admissions)))

    for i in range(N_TRIAGES):
        pat = random.choice(patients)
        nurse = random.choice(nurses)
        arr_date = random_date(date(2024, 1, 1), date(2025, 12, 1))
        arr_time = random_datetime(arr_date)
        wait = random.randint(5, 120)
        triage_dt = random_datetime(arr_date)
        urgency = random.randint(1, 5)
        syms = random.choice(SYMPTOMS)

        if i < len(linked_adms):
            outcome = "Hospitalized"
            adm_id = linked_adms[i]["id"]
        else:
            outcome = "Discharged"
            adm_id = None

        rows.append((pat["amka"], nurse["amka"], arr_time, triage_dt,
                     wait, urgency, syms, outcome, adm_id))

    write_csv_file("triages.csv",
                   ["patient_AMKA", "nurse_AMKA", "arrival_time", "triage_time",
                    "minutes_waited", "urgency_level", "symptoms", "outcome", "admission_id"], rows)


def gen_lab_exams(admissions, doctors, lab_types):
    rows = []
    for i in range(N_LAB_EXAMS):
        adm = random.choice(admissions)
        doc = random.choice(doctors)
        lt = random.choice(lab_types)
        end_d = adm.get("dis_date") or adm["adm_date"] + timedelta(days=5)
        exam_date = random_datetime(random_date(adm["adm_date"], end_d))
        result_num = round(random.uniform(0.1, 500.0), 2)
        unit = random.choice(RESULT_UNITS)
        cost = round(random.uniform(10, 500), 2)
        code_str = lt[0]
        exam_code = lt[2]

        rows.append((adm["id"], exam_code, lt[1][:100], exam_date,
                     f"Result for {lt[1][:30]}", f"{result_num:.2f}", unit,
                     f"{cost:.2f}", doc["amka"]))

    write_csv_file("lab_exams.csv",
                   ["admission_id", "exam_code", "exam_type", "exam_date",
                    "result_text", "result_numeric", "result_unit", "cost", "doctor_AMKA"], rows)


def gen_procedure_executions(admissions, proc_codes, room_ids, doctors):
    exec_rows = []
    assist_rows = []
    all_amkas = [d["amka"] for d in doctors]

    for i in range(N_PROCEDURE_EXECS):
        adm = random.choice(admissions)
        pcode = random.choice(proc_codes)
        room = random.choice(room_ids)
        doc = random.choice(doctors)
        end_d = adm.get("dis_date") or adm["adm_date"] + timedelta(days=3)
        start_d = random_date(adm["adm_date"], end_d)
        start_dt = random_datetime(start_d)
        dur = random.randint(30, 300)
        h = int(start_dt.split(" ")[1].split(":")[0])
        end_dt = f"{start_d} {min(h + dur // 60, 23):02d}:{random.randint(0,59):02d}:00"
        cost = round(random.uniform(300, 15000), 2)

        exec_rows.append((adm["id"], pcode, room, doc["amka"], start_dt, end_dt, f"{cost:.2f}"))

        used = {doc["amka"]}
        for _ in range(random.randint(1, 3)):
            asst = random.choice(all_amkas)
            if asst not in used:
                used.add(asst)
                role = random.choice(["First Assistant", "Anesthesiologist", "Scrub Nurse", "Circulating Nurse"])
                assist_rows.append((i + 1, asst, role))

    write_csv_file("procedure_executions.csv",
                   ["admission_id", "procedure_code", "room_id", "main_doctor_AMKA",
                    "start_time", "end_time", "actual_cost"], exec_rows)
    if assist_rows:
        write_csv_file("procedure_assistants.csv", ["execution_id", "staff_AMKA", "role"], assist_rows)


def gen_prescriptions(admissions, doctors, drug_ids):
    rows = []
    for i in range(N_PRESCRIPTIONS):
        adm = random.choice(admissions)
        doc = random.choice(doctors)
        drug = random.choice(drug_ids)
        dosage = random.choice(DOSAGES)
        freq = random.choice(FREQUENCIES)
        start = adm["adm_date"]
        end = start + timedelta(days=random.randint(3, 30))
        rows.append((adm["id"], adm["patient"], doc["amka"], drug,
                     dosage, freq, str(start), str(end)))

    write_csv_file("prescriptions.csv",
                   ["admission_id", "patient_AMKA", "doctor_AMKA", "drug_id",
                    "dosage", "frequency", "start_date", "end_date"], rows)


def gen_ratings(discharged, doctors):
    adm_rows = []
    doc_rows = []

    for adm in discharged:
        if random.random() < 0.6:
            nq, cl, fo, ov = [random.randint(1, 5) for _ in range(4)]
            comment = random.choice(["Very good care", "Satisfactory", "Could be better",
                                      "Excellent staff", "Long waiting times", "Clean facilities",
                                      "Great doctors", "Needs improvement", None])
            rated = random_datetime(adm["dis_date"] + timedelta(days=random.randint(0, 7)))
            adm_rows.append((adm["id"], nq, cl, fo, ov, comment, rated))

        if random.random() < 0.5:
            doc = random.choice(doctors)
            mcq = random.randint(1, 5)
            rated = random_datetime(adm["dis_date"] + timedelta(days=random.randint(0, 7)))
            doc_rows.append((adm["id"], doc["amka"], mcq, rated))

    # Deduplicate doctor ratings
    seen = set()
    unique_dr = []
    for r in doc_rows:
        key = (r[0], r[1])
        if key not in seen:
            seen.add(key)
            unique_dr.append(r)

    if adm_rows:
        write_csv_file("admission_ratings.csv",
                       ["admission_id", "nursing_quality", "cleanliness", "food",
                        "overall", "comment", "rated_at"], adm_rows)
    if unique_dr:
        write_csv_file("doctor_ratings.csv",
                       ["admission_id", "doctor_AMKA", "medical_care_quality", "rated_at"], unique_dr)


def gen_shifts(dept_ids, doctors, nurses, admins):
    shift_rows = []
    staffing_rows = []
    shift_id = 1
    start = date(2025, 7, 1)
    all_staff = [d["amka"] for d in doctors] + [n["amka"] for n in nurses] + [a["amka"] for a in admins]

    for m in range(N_SHIFTS_MONTHS):
        for day_offset in range(30):
            d = start + timedelta(days=m * 30 + day_offset)
            for dept in dept_ids:
                for slot in SHIFT_SLOTS:
                    status = random.choice(["Scheduled", "Completed", "Completed", "Completed"])
                    shift_rows.append((shift_id, str(d), slot, status, dept))
                    n_staff = random.randint(2, 4)
                    for s_amka in random.sample(all_staff, min(n_staff, len(all_staff))):
                        staffing_rows.append((shift_id, s_amka))
                    shift_id += 1

    write_csv_file("shifts.csv", ["shift_id", "shift_date", "shift_slot", "shift_status", "dept_id"], shift_rows)
    staffing_rows = list(set(staffing_rows))
    write_csv_file("shift_staffing.csv", ["shift_id", "staff_AMKA"], staffing_rows)


def gen_images(dept_ids, drug_ids, doctors):
    dept_rows = []
    for i, dept in enumerate(dept_ids):
        pid = DEPT_PHOTO_IDS[i % len(DEPT_PHOTO_IDS)]
        url = f"https://images.unsplash.com/photo-{pid}?w=800&h=600&fit=crop"
        dept_rows.append((dept, url, f"Department {dept} photo", 1))
    write_csv_file("department_images.csv", ["dept_id", "img_url", "caption", "ordering"], dept_rows)

    drug_rows = []
    for did in drug_ids[:50]:
        url = f"https://picsum.photos/seed/drug{did}/400/400"
        drug_rows.append((did, url, f"Drug {did} image", 1))
    write_csv_file("drug_images.csv", ["drug_id", "img_url", "caption", "ordering"], drug_rows)

    doc_rows = []
    for i, doc in enumerate(doctors):
        gp = "men" if doc["gender"] == "M" else "women"
        url = f"https://randomuser.me/api/portraits/{gp}/{i % 100}.jpg"
        doc_rows.append((doc["amka"], url, "Profile photo", 1))
    write_csv_file("doctor_images.csv", ["doctor_AMKA", "img_url", "caption", "ordering"], doc_rows)
