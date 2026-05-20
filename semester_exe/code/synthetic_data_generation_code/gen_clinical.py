"""Generate clinical, scheduling, and image CSVs."""
import random
from datetime import date, datetime, timedelta
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

    today = date.today()
    start = date(2026, 3, 1)
    span = max(1, (today - start).days)

    forced_dept = all_beds[0][0]
    forced_count = 0

    # --- Εξασφάλιση ζευγαριών ασθενών με ίδιο αριθμό ημερών νοσηλείας (Q09) ---
    # Για κάθε target_days, 2 ασθενείς θα πάρουν νοσηλείες ώστε το
    # σύνολο ημερών τους να ταιριάζει ακριβώς.
    MATCHING_DAYS = [18, 20, 22, 25, 28, 30]
    q09_patients = patients[1:1 + len(MATCHING_DAYS) * 2]  # 12 ασθενείς
    q09_bed_idx = 0

    for target_days in MATCHING_DAYS:
        for p_offset in range(2):  # 2 ασθενείς ανά target
            pat = q09_patients.pop(0)
            # Χωρίζουμε τις μέρες σε 2-3 νοσηλείες
            stays = [target_days // 2, target_days - target_days // 2]
            adm_date_cursor = start + timedelta(days=random.randint(0, 15))
            for los in stays:
                if q09_bed_idx >= len(all_beds):
                    break
                dept, bed = all_beds[q09_bed_idx]
                q09_bed_idx += 1
                ken = random.choice(ken_codes)
                icd_in = random.choice(icd10_codes)
                icd_out = random.choice(icd10_codes)
                adm_date = adm_date_cursor
                dis_date = adm_date + timedelta(days=los)
                adm_date_cursor = dis_date + timedelta(days=random.randint(5, 15))

                idx = len(admissions) + 1
                adm_rows.append((pat["amka"], dept, bed, ken,
                                 str(adm_date), None, icd_in, None))
                adm_info = {"id": idx, "patient": pat["amka"], "dept": dept,
                            "bed": bed, "dis_date": dis_date, "icd_out": icd_out,
                            "adm_date": adm_date}
                admissions.append(adm_info)
                discharge_updates.append(adm_info)

    # --- Εξασφάλιση Q14 ---
    # Create 6 admissions in 2024 and 6 in 2025 for a specific ICD code to ensure Q14 has results
    q14_icd = icd10_codes[2]
    q14_ken = ken_codes[2]
    q14_dept, q14_bed = all_beds[0]
    
    for year in [2024, 2025]:
        for m in range(6):
            pat = patients[m % len(patients)] # Just use some existing patients
            adm_date = date(year, m + 1, 10)
            dis_date = adm_date + timedelta(days=3)
            
            idx = len(admissions) + 1
            adm_rows.append((pat["amka"], q14_dept, q14_bed, q14_ken,
                             str(adm_date), str(dis_date), q14_icd, q14_icd))
            adm_info = {"id": idx, "patient": pat["amka"], "dept": q14_dept,
                        "bed": q14_bed, "dis_date": dis_date, "icd_out": q14_icd,
                        "adm_date": adm_date}
            admissions.append(adm_info)
            discharge_updates.append(adm_info)

    # --- Κύριος βρόχος νοσηλειών ---
    for i in range(q09_bed_idx, min(N_ADMISSIONS, len(all_beds))):
        dept, bed = all_beds[i]
        pat = random.choice(patients)
        
        # Force the first patient to take 4 admissions in forced_dept
        if dept == forced_dept and forced_count < 4:
            pat = patients[0]
            forced_count += 1
            
        ken = random.choice(ken_codes)
        icd_in = random.choice(icd10_codes)

        # ~12% are currently hospitalized: admitted within last 0-10 days, no discharge
        if random.random() < 0.12:
            adm_date = today - timedelta(days=random.randint(0, min(10, span)))
            dis_date = None
            icd_out = None
        else:
            # Completed admission within [start, today]
            adm_date = start + timedelta(days=random.randint(0, span))
            max_los = max(1, (today - adm_date).days)
            los = random.randint(1, min(25, max_los))
            dis_date = adm_date + timedelta(days=los)
            if dis_date > today:
                dis_date = today
            icd_out = random.choice(icd10_codes)

        idx = len(admissions) + 1
        # CSV row: discharge_date=NULL initially (trigger needs INSERT then UPDATE)
        adm_rows.append((pat["amka"], dept, bed, ken, str(adm_date), None, icd_in, None))

        adm_info = {"id": idx, "patient": pat["amka"], "dept": dept,
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
    now = datetime.now()
    start_dt = datetime(2026, 3, 1)
    span_secs = max(1.0, (now - start_dt).total_seconds())

    # Ρεαλιστικοί χρόνοι αναμονής (λεπτά) ανά επίπεδο επείγοντος
    WAIT_RANGES = {
        1: (0, 10),      # Immediate: σχεδόν αμέσως
        2: (5, 30),      # Emergent
        3: (15, 60),     # Urgent
        4: (30, 120),    # Less Urgent
        5: (60, 240),    # Non-Urgent: μεγάλη αναμονή
    }
    # Πιθανότητα νοσηλείας ανά επίπεδο
    HOSP_PROB = {1: 0.85, 2: 0.65, 3: 0.40, 4: 0.20, 5: 0.10}

    # ~10% ακόμα περιμένουν στην αίθουσα αναμονής (δεν τους έχει δει γιατρός)
    n_active = max(2, int(N_TRIAGES * 0.10))

    # Προετοιμασία: ξεχωρίζουμε admissions που δεν έχουν συνδεθεί ακόμα
    available_adms = list(admissions)
    random.shuffle(available_adms)
    adm_idx = 0

    for i in range(N_TRIAGES):
        pat = random.choice(patients)
        nurse = random.choice(nurses)
        syms = random.choice(SYMPTOMS)

        if i < n_active:
            # Ασθενής που περιμένει — δεν έχει γίνει ακόμα triage
            arrival = now - timedelta(minutes=random.randint(3, 180))
            arr_str = arrival.strftime("%Y-%m-%d %H:%M:%S")
            rows.append((pat["amka"], nurse["amka"], arr_str,
                         None, None, None, syms, None, None))
        else:
            # Ολοκληρωμένο triage
            urgency = random.choices([1, 2, 3, 4, 5],
                                     weights=[0.10, 0.15, 0.25, 0.30, 0.20])[0]

            arrival = start_dt + timedelta(seconds=random.uniform(0, span_secs))
            lo, hi = WAIT_RANGES[urgency]
            wait = random.randint(lo, hi)
            triage_dt = arrival + timedelta(minutes=wait)
            if triage_dt > now:
                triage_dt = now

            arr_str = arrival.strftime("%Y-%m-%d %H:%M:%S")
            triage_str = triage_dt.strftime("%Y-%m-%d %H:%M:%S")
            minutes_waited = int((triage_dt - arrival).total_seconds() // 60)

            # Νοσηλεία ή αποχώρηση βάσει πιθανότητας ανά επίπεδο
            if random.random() < HOSP_PROB[urgency] and adm_idx < len(available_adms):
                outcome = "hospitalized"
                adm_id = available_adms[adm_idx]["id"]
                adm_idx += 1
            else:
                outcome = "discharged"
                adm_id = None

            rows.append((pat["amka"], nurse["amka"], arr_str, triage_str,
                         minutes_waited, urgency, syms, outcome, adm_id))

    write_csv_file("triages.csv",
                   ["patient_AMKA", "nurse_AMKA", "arrival_time", "triage_time",
                    "minutes_waited", "urgency_level", "symptoms", "outcome", "admission_id"], rows)


def gen_lab_exams(admissions, doctors, lab_types):
    rows = []
    lab_doctors = set()  # (admission_id, doctor_amka)
    for i in range(N_LAB_EXAMS):
        adm = random.choice(admissions)
        doc = random.choice(doctors)
        lt = random.choice(lab_types)
        end_d = adm.get("dis_date") or min(adm["adm_date"] + timedelta(days=5), date.today())
        exam_date = random_datetime(random_date(adm["adm_date"], end_d))
        result_num = round(random.uniform(0.1, 500.0), 2)
        unit = random.choice(RESULT_UNITS)
        cost = round(random.uniform(10, 500), 2)
        code_str = lt[0]
        exam_code = lt[2]

        rows.append((adm["id"], exam_code, exam_date,
                     f"Result for {lt[1][:30]}", f"{result_num:.2f}", unit,
                     f"{cost:.2f}", doc["amka"]))
        lab_doctors.add((adm["id"], doc["amka"]))

    write_csv_file("lab_exams.csv",
                   ["admission_id", "exam_code", "exam_date",
                    "result_text", "result_numeric", "result_unit", "cost", "doctor_AMKA"], rows)
    return lab_doctors


def gen_procedure_executions(admissions, proc_codes, room_ids, doctors):
    exec_rows = []
    assist_rows = []
    all_amkas = [d["amka"] for d in doctors]

    # Track existing bookings to satisfy procedure_overlap_insert_trigger:
    # no two procedures may overlap in the same room, and the same main doctor
    # cannot be in two procedures at once.
    room_busy = {r: [] for r in room_ids}   # room_id -> [(start_dt, end_dt), ...]
    doc_busy  = {}                          # amka    -> [(start_dt, end_dt), ...]

    def overlaps(intervals, s, e):
        for ps, pe in intervals:
            if s < pe and e > ps:
                return True
        return False

    exec_id = 0
    for _ in range(N_PROCEDURE_EXECS):
        adm = random.choice(admissions)
        pcode = random.choice(proc_codes)
        end_d = adm.get("dis_date") or min(adm["adm_date"] + timedelta(days=3), date.today())

        placed = False
        for _attempt in range(30):
            room = random.choice(room_ids)
            doc = random.choice(doctors)
            start_d = random_date(adm["adm_date"], end_d)
            dur = random.randint(30, 300)
            start_h = random.randint(6, 20)
            start_m = random.randint(0, 59)
            start_obj = datetime(start_d.year, start_d.month, start_d.day, start_h, start_m)
            end_obj = start_obj + timedelta(minutes=dur)

            if overlaps(room_busy[room], start_obj, end_obj):
                continue
            if overlaps(doc_busy.get(doc["amka"], []), start_obj, end_obj):
                continue
            placed = True
            break

        if not placed:
            continue

        room_busy[room].append((start_obj, end_obj))
        doc_busy.setdefault(doc["amka"], []).append((start_obj, end_obj))

        exec_id += 1
        cost = round(random.uniform(300, 15000), 2)
        exec_rows.append((adm["id"], pcode, room, doc["amka"],
                          start_obj.strftime("%Y-%m-%d %H:%M:%S"),
                          end_obj.strftime("%Y-%m-%d %H:%M:%S"),
                          f"{cost:.2f}"))

        used = {doc["amka"]}
        for _ in range(random.randint(1, 3)):
            asst = random.choice(all_amkas)
            if asst not in used:
                used.add(asst)
                role = random.choice(["First Assistant", "Anesthesiologist", "Scrub Nurse", "Circulating Nurse"])
                assist_rows.append((exec_id, asst, role))

    write_csv_file("procedure_executions.csv",
                   ["admission_id", "procedure_code", "room_id", "main_doctor_AMKA",
                    "start_time", "end_time", "actual_cost"], exec_rows)
    if assist_rows:
        write_csv_file("procedure_assistants.csv", ["execution_id", "staff_AMKA", "role"], assist_rows)

    procedure_doctors = {(r[0], r[3]) for r in exec_rows}  # (admission_id, main_doctor_amka)
    return procedure_doctors


def gen_prescriptions(admissions, doctors, drug_ids, patient_allergy_map=None, drug_substance_map=None):
    rows = []
    prescribing_doctors = set() # (admission_id, doctor_amka)
    patient_allergy_map = patient_allergy_map or {}
    drug_substance_map = drug_substance_map or {}
    
    # --- Εξασφάλιση Q10 ---
    # Inject high frequency co-prescribed pairs
    # Sort drug ids so that d1 < d2 to match the p1.drug_id < p2.drug_id condition
    sorted_drugs = sorted(drug_ids)
    q10_pairs = [
        (sorted_drugs[0], sorted_drugs[1], 18),
        (sorted_drugs[2], sorted_drugs[3], 12),
        (sorted_drugs[4], sorted_drugs[5], 7)
    ]
    for d1, d2, target_freq in q10_pairs:
        count = 0
        for adm in admissions:
            if count >= target_freq:
                break
            patient_amka = adm["patient"]
            allergies = patient_allergy_map.get(patient_amka, set())
            d1_sub = drug_substance_map.get(d1, set())
            d2_sub = drug_substance_map.get(d2, set())
            
            # Avoid duplicate pair for same admission, and avoid allergies
            if not (d1_sub & allergies) and not (d2_sub & allergies):
                doc = random.choice(doctors)
                start = adm["adm_date"]
                end = start + timedelta(days=7)
                rows.append((adm["id"], patient_amka, doc["amka"], d1, "1 tab", "1/day", str(start), str(end)))
                rows.append((adm["id"], patient_amka, doc["amka"], d2, "1 tab", "1/day", str(start), str(end)))
                prescribing_doctors.add((adm["id"], doc["amka"]))
                count += 1
                
    # --- Random prescriptions ---
    for i in range(N_PRESCRIPTIONS):
        adm = random.choice(admissions)
        doc = random.choice(doctors)
        patient_amka = adm["patient"]
        allergies = patient_allergy_map.get(patient_amka, set())
        safe_drugs = [d for d in drug_ids if not (drug_substance_map.get(d, set()) & allergies)]
        if not safe_drugs:
            safe_drugs = drug_ids
        drug = random.choice(safe_drugs)
        dosage = random.choice(DOSAGES)
        freq = random.choice(FREQUENCIES)
        start = adm["adm_date"]
        end = start + timedelta(days=random.randint(3, 30))
        rows.append((adm["id"], patient_amka, doc["amka"], drug,
                     dosage, freq, str(start), str(end)))
        prescribing_doctors.add((adm["id"], doc["amka"]))

    write_csv_file("prescriptions.csv",
                   ["admission_id", "patient_AMKA", "doctor_AMKA", "drug_id",
                    "dosage", "frequency", "start_date", "end_date"], rows)
    return prescribing_doctors


def gen_ratings(discharged, prescribing_doctors, procedure_doctors=None, lab_doctors=None):
    adm_rows = []
    doc_rows = []

    # Merge all doctors who treated the patient for this admission
    all_treating = set(prescribing_doctors)
    if procedure_doctors:
        all_treating |= procedure_doctors
    if lab_doctors:
        all_treating |= lab_doctors

    docs_by_adm = {}
    for adm_id, doc_amka in all_treating:
        docs_by_adm.setdefault(adm_id, []).append(doc_amka)

    for adm in discharged:
        if random.random() < 0.6:
            nq, cl, fo, ov = [random.randint(1, 5) for _ in range(4)]
            comment = random.choice(["Very good care", "Satisfactory", "Could be better",
                                      "Excellent staff", "Long waiting times", "Clean facilities",
                                      "Great doctors", "Needs improvement", None])
            rated = random_datetime(adm["dis_date"] + timedelta(days=random.randint(0, 7)))
            adm_rows.append((adm["id"], nq, cl, fo, ov, comment, rated))

        # Rate any doctor who treated the patient (prescribed, performed procedure, or ordered exam)
        if adm["id"] in docs_by_adm and random.random() < 0.7:
            doc_amka = random.choice(docs_by_adm[adm["id"]])
            mcq = random.randint(1, 5)
            comment = random.choice(["Excellent diagnosis", "Very attentive", "Professional",
                                      "Could explain more", "Great bedside manner", None])
            rated = random_datetime(adm["dis_date"] + timedelta(days=random.randint(0, 7)))
            doc_rows.append((adm["id"], doc_amka, mcq, comment, rated))

    # Deduplicate doctor ratings (unique per admission + doctor)
    seen = set()
    unique_dr = []
    for r in doc_rows:
        key = (r[0], r[1])  # (admission_id, doctor_amka)
        if key not in seen:
            seen.add(key)
            unique_dr.append(r)

    if adm_rows:
        write_csv_file("admission_ratings.csv",
                       ["admission_id", "nursing_quality", "cleanliness", "food",
                        "overall", "comment", "rated_at"], adm_rows)
    if unique_dr:
        write_csv_file("doctor_ratings.csv",
                       ["admission_id", "doctor_AMKA", "medical_care_quality", "comment", "rated_at"], unique_dr)


def gen_alexiou_boost(alexiou_amka, ken_codes, icd10_codes, lab_types, base_adm_count):
    """Append N_ALEXIOU_BOOST extra patients/admissions/ratings for the Alexiou doctor.

    All admissions are in the past and already discharged so that rating triggers pass.
    Lab exams are created so the doctor-treated-patient trigger is satisfied.
    Returns discharge_updates for the new admissions (to be merged into write_load_sql).
    """
    n = N_ALEXIOU_BOOST
    today = date.today()

    ken_code = ken_codes[0]
    icd_code = icd10_codes[0]
    exam_code = lab_types[0][2]  # numeric exam_code

    # IDs for the new rows: they follow immediately after the baseline data
    next_adm_id = base_adm_count + 1

    patient_rows = []
    admission_rows = []
    lab_rows = []
    adm_rating_rows = []
    doc_rating_rows = []
    discharge_updates = []

    for i in range(n):
        # --- patient ---
        gender = random.choice(["M", "F"])
        first = random.choice(MALE_FIRST if gender == "M" else FEMALE_FIRST)
        last = random.choice(LAST_NAMES)
        last = adjust_greek_surname(last, gender)
        amka = gen_amka()
        dob = gen_dob(20, 80)
        phone = gen_phone()
        email = gen_email(first, last)
        patient_rows.append((
            amka, first, last, random.choice(MALE_FIRST), str(dob),
            gender, random.randint(50, 120), random.randint(155, 195),
            phone, email, "Patision 1, Athens", "Other", "GR", "ΕΦΚΑ",
        ))

        # --- bed in dept 1 (reuse existing 40 beds cyclically) ---
        bid = 1 + (i % 40)

        # --- admission: spread strictly BEFORE the baseline data starts ---
        # Baseline data starts on 2026-03-01. 
        # For a given bed (i%40), the admissions are spaced by 10 days.
        # e.g., i=0 -> bed 1 at start - 10 days
        #       i=40 -> bed 1 at start - 20 days
        # This guarantees zero overlaps internally AND zero overlaps with baseline.
        base_start = date(2026, 3, 1)
        cycle_num = i // 40
        adm_date = base_start - timedelta(days=10 + cycle_num * 10)
        dis_date = adm_date + timedelta(days=3)
        adm_id = next_adm_id + i

        # CSV row: put dis_date directly so triggers don't think bed is indefinitely occupied
        admission_rows.append((amka, 1, bid, ken_code, str(adm_date), str(dis_date), icd_code, icd_code))

        discharge_updates.append({
            "id": adm_id,
            "dis_date": dis_date,
            "icd_out": icd_code,
            "patient": amka,
            "adm_date": adm_date,
        })

        # --- lab exam: proves Alexiou treated this patient ---
        lab_rows.append((
            adm_id, exam_code,
            f"{adm_date} 10:00:00",
            "Routine checkup", f"{random.uniform(10, 200):.2f}",
            "mg/dL", f"{random.uniform(20, 400):.2f}",
            alexiou_amka,
        ))

        # --- admission rating ---
        rated_dt = f"{dis_date} 12:00:00"
        adm_rating_rows.append((
            adm_id,
            random.randint(3, 5), random.randint(3, 5),
            random.randint(3, 5), random.randint(3, 5),
            random.choice(["Very good care", "Satisfactory", "Excellent staff", None]),
            rated_dt,
        ))

        # --- doctor rating for Alexiou ---
        doc_rating_rows.append((
            adm_id, alexiou_amka,
            random.randint(3, 5),
            random.choice(["Excellent diagnosis", "Very attentive", "Great bedside manner", None]),
            rated_dt,
        ))

    append_csv_file("patients.csv", patient_rows)
    append_csv_file("admissions.csv", admission_rows)
    append_csv_file("lab_exams.csv", lab_rows)
    append_csv_file("admission_ratings.csv", adm_rating_rows)
    append_csv_file("doctor_ratings.csv", doc_rating_rows)

    print(f"    -> Alexiou boost: {n} ratings for AMKA {alexiou_amka}")
    return discharge_updates


def gen_shifts(dept_ids, doctors, nurses, admins):
    shift_rows = []
    staffing_rows = []
    sid = 1
    start = date(2026, 3, 1)
    end = date.today()
    n_days = max(1, (end - start).days + 1)

    LIMITS = {"doctor": 15, "nurse": 20, "admin": 25}

    doctor_amkas = [d["amka"] for d in doctors]
    nurse_amkas  = [n["amka"] for n in nurses]
    admin_amkas  = [a["amka"] for a in admins]

    staff_type_map = {}
    for d in doctors: staff_type_map[d["amka"]] = "doctor"
    for n in nurses:  staff_type_map[n["amka"]] = "nurse"
    for a in admins:  staff_type_map[a["amka"]] = "admin"

    monthly_counts = {}   # (amka, year, month) -> int
    person_shifts  = {}   # amka -> set of (date, slot)
    person_dates   = {}   # amka -> set of dates (max 1 shift/day)

    def can_assign(amka, d, slot):
        ym = (d.year, d.month)
        if monthly_counts.get((amka, ym), 0) >= LIMITS[staff_type_map[amka]]:
            return False
        # One shift per person per day (prevents same-day M+A and A+N conflicts)
        if d in person_dates.get(amka, set()):
            return False
        shifts = person_shifts.get(amka, set())
        # νυχτερινή (D) and πρωινή (D+1) are only 8h apart end-to-start, which is
        # exactly the minimum — but 8h START-to-START is less than the required 16h
        # gap between shift starts (each shift is 8h, so 8h rest needs 16h start gap).
        if slot == "πρωινή" and (d - timedelta(days=1), "νυχτερινή") in shifts:
            return False
        if slot == "νυχτερινή" and (d + timedelta(days=1), "πρωινή") in shifts:
            return False
        # validate_consecutive_nights trigger forbids the 3rd consecutive night
        if slot == "νυχτερινή":
            if (d - timedelta(days=1), "νυχτερινή") in shifts \
               and (d - timedelta(days=2), "νυχτερινή") in shifts:
                return False
            if (d + timedelta(days=1), "νυχτερινή") in shifts \
               and (d + timedelta(days=2), "νυχτερινή") in shifts:
                return False
            if (d - timedelta(days=1), "νυχτερινή") in shifts \
               and (d + timedelta(days=1), "νυχτερινή") in shifts:
                return False
        return True

    def do_assign(amka, d, slot, cur_sid):
        ym = (d.year, d.month)
        monthly_counts[(amka, ym)] = monthly_counts.get((amka, ym), 0) + 1
        person_shifts.setdefault(amka, set()).add((d, slot))
        person_dates.setdefault(amka, set()).add(d)
        staffing_rows.append((cur_sid, amka))

    def pick(pool, d, slot, cur_sid, needed):
        ym = (d.year, d.month)
        avail = [a for a in pool if can_assign(a, d, slot)]
        # Prefer staff with the fewest shifts so far this month (random tiebreak)
        random.shuffle(avail)
        avail.sort(key=lambda a: monthly_counts.get((a, ym), 0))
        for amka in avail[:needed]:
            do_assign(amka, d, slot, cur_sid)

    # Emit shifts.csv in date order with sequential ids
    all_shifts = []
    for day_offset in range(n_days):
        d = start + timedelta(days=day_offset)
        for dept in dept_ids:
            for slot in SHIFT_SLOTS:
                shift_rows.append((sid, str(d), slot, "scheduled", dept))
                all_shifts.append((sid, d, slot))
                sid += 1

    # Staff shifts in shuffled order so the monthly budget spreads evenly
    # across all days instead of burning out in the first ~10 days of the month
    random.shuffle(all_shifts)
    for (cur_sid, d, slot) in all_shifts:
        pick(doctor_amkas, d, slot, cur_sid, 3)
        pick(nurse_amkas,  d, slot, cur_sid, 6)
        pick(admin_amkas,  d, slot, cur_sid, 2)

    staffing_rows.sort(key=lambda r: (r[0], r[1]))

    write_csv_file("shifts.csv", ["shift_id", "shift_date", "shift_slot", "shift_status", "dept_id"], shift_rows)
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
        url = f"https://loremflickr.com/400/400/pills,medicine/all?lock={did}"
        drug_rows.append((did, url, f"Drug {did} image", 1))
    write_csv_file("drug_images.csv", ["drug_id", "img_url", "caption", "ordering"], drug_rows)

    doc_rows = []
    for i, doc in enumerate(doctors):
        gp = "men" if doc["gender"] == "M" else "women"
        url = f"https://randomuser.me/api/portraits/{gp}/{i % 100}.jpg"
        doc_rows.append((doc["amka"], url, "Profile photo", 1))
    write_csv_file("doctor_images.csv", ["doctor_AMKA", "img_url", "caption", "ordering"], doc_rows)
