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

    for i in range(min(N_ADMISSIONS, len(all_beds))):
        dept, bed = all_beds[i]
        pat = random.choice(patients)
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
    now = datetime.now()
    start_dt = datetime(2026, 3, 1)
    span_secs = max(1.0, (now - start_dt).total_seconds())

    # ~12% are still in the waiting room at base-start time (arrived 3-120 min
    # ago, not yet triaged). The remainder are completed triages within
    # [start_dt, now]; half of those led to a hospitalization.
    n_active = max(1, int(N_TRIAGES * 0.12))
    n_hospitalized = min(N_TRIAGES // 2, len(admissions))
    linked_adms = random.sample(admissions, n_hospitalized)

    for i in range(N_TRIAGES):
        pat = random.choice(patients)
        nurse = random.choice(nurses)
        syms = random.choice(SYMPTOMS)

        if i < n_active:
            arrival = now - timedelta(minutes=random.randint(3, 120))
            arr_str = arrival.strftime("%Y-%m-%d %H:%M:%S")
            triage_str = None
            minutes_waited = None
            urgency = None
            outcome = None
            adm_id = None
        else:
            arrival = start_dt + timedelta(seconds=random.uniform(0, span_secs))
            wait = random.randint(0, 120)
            triage_dt = arrival + timedelta(minutes=wait)
            if triage_dt > now:
                triage_dt = now
            arr_str = arrival.strftime("%Y-%m-%d %H:%M:%S")
            triage_str = triage_dt.strftime("%Y-%m-%d %H:%M:%S")
            minutes_waited = int((triage_dt - arrival).total_seconds() // 60)
            urgency = random.randint(1, 5)

            j = i - n_active
            if j < n_hospitalized:
                outcome = "Hospitalized"
                adm_id = linked_adms[j]["id"]
            else:
                outcome = "Discharged"
                adm_id = None

        rows.append((pat["amka"], nurse["amka"], arr_str, triage_str,
                     minutes_waited, urgency, syms, outcome, adm_id))

    write_csv_file("triages.csv",
                   ["patient_AMKA", "nurse_AMKA", "arrival_time", "triage_time",
                    "minutes_waited", "urgency_level", "symptoms", "outcome", "admission_id"], rows)


def gen_lab_exams(admissions, doctors, lab_types):
    rows = []
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

    write_csv_file("lab_exams.csv",
                   ["admission_id", "exam_code", "exam_date",
                    "result_text", "result_numeric", "result_unit", "cost", "doctor_AMKA"], rows)


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


def gen_prescriptions(admissions, doctors, drug_ids):
    rows = []
    prescribing_doctors = set() # (admission_id, doctor_amka)
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
        prescribing_doctors.add((adm["id"], doc["amka"]))

    write_csv_file("prescriptions.csv",
                   ["admission_id", "patient_AMKA", "doctor_AMKA", "drug_id",
                    "dosage", "frequency", "start_date", "end_date"], rows)
    return prescribing_doctors


def gen_ratings(discharged, prescribing_doctors):
    adm_rows = []
    doc_rows = []

    # Group prescribing doctors by admission_id for easy lookup
    docs_by_adm = {}
    for adm_id, doc_amka in prescribing_doctors:
        if adm_id not in docs_by_adm:
            docs_by_adm[adm_id] = []
        docs_by_adm[adm_id].append(doc_amka)

    for adm in discharged:
        if random.random() < 0.6:
            nq, cl, fo, ov = [random.randint(1, 5) for _ in range(4)]
            comment = random.choice(["Very good care", "Satisfactory", "Could be better",
                                      "Excellent staff", "Long waiting times", "Clean facilities",
                                      "Great doctors", "Needs improvement", None])
            rated = random_datetime(adm["dis_date"] + timedelta(days=random.randint(0, 7)))
            adm_rows.append((adm["id"], nq, cl, fo, ov, comment, rated))

        # Only rate doctors who actually prescribed something (enforced by DB trigger)
        if adm["id"] in docs_by_adm and random.random() < 0.7:
            doc_amka = random.choice(docs_by_adm[adm["id"]])
            mcq = random.randint(1, 5)
            rated = random_datetime(adm["dis_date"] + timedelta(days=random.randint(0, 7)))
            doc_rows.append((adm["id"], doc_amka, mcq, rated))

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
    sid = 1
    start = date(2026, 3, 1)
    end = date.today()
    n_days = max(1, (end - start).days + 1)

    LIMITS = {"Doctor": 15, "Nurse": 20, "Admin": 25}

    doctor_amkas = [d["amka"] for d in doctors]
    nurse_amkas  = [n["amka"] for n in nurses]
    admin_amkas  = [a["amka"] for a in admins]

    staff_type_map = {}
    for d in doctors: staff_type_map[d["amka"]] = "Doctor"
    for n in nurses:  staff_type_map[n["amka"]] = "Nurse"
    for a in admins:  staff_type_map[a["amka"]] = "Admin"

    monthly_counts = {}   # (amka, year, month) -> int
    person_shifts  = {}   # amka -> set of (date, slot)
    person_dates   = {}   # amka -> set of dates (max 1 shift/day)

    def can_assign(amka, d, slot):
        ym = (d.year, d.month)
        if monthly_counts.get((amka, ym), 0) >= LIMITS[staff_type_map[amka]]:
            return False
        # One shift per person per day (covers same-shift and rest-rule conflicts)
        if d in person_dates.get(amka, set()):
            return False
        # validate_consecutive_nights trigger forbids the 3rd consecutive night
        if slot == "Night":
            shifts = person_shifts.get(amka, set())
            if (d - timedelta(days=1), "Night") in shifts \
               and (d - timedelta(days=2), "Night") in shifts:
                return False
            # also block creating a 3-night streak that wraps around an existing future night
            if (d + timedelta(days=1), "Night") in shifts \
               and (d + timedelta(days=2), "Night") in shifts:
                return False
            if (d - timedelta(days=1), "Night") in shifts \
               and (d + timedelta(days=1), "Night") in shifts:
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
                shift_rows.append((sid, str(d), slot, "Scheduled", dept))
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
