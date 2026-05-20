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
    CELEBRITIES = [
        # Singers & Musicians
        ("Sakis", "Rouvas", "M"), ("Giannis", "Antetokounmpo", "M"), ("Antonis", "Remos", "M"),
        ("Anna", "Vissi", "F"), ("Despina", "Vandi", "F"), ("Eleni", "Foureira", "F"),
        ("Konstantinos", "Argiros", "M"), ("Nikos", "Vertis", "M"), ("Pantelis", "Pantelidis", "M"),
        ("Katerina", "Stikoudi", "F"), ("Helena", "Paparizou", "F"), ("Notis", "Sfakianakis", "M"),
        ("Giorgos", "Mazonakis", "M"), ("Natasa", "Theodorou", "F"), ("Peggy", "Zina", "F"),
        ("Panos", "Kiamos", "M"), ("Giannis", "Ploutarchos", "M"), ("Michalis", "Hatzigiannis", "M"),
        ("Melina", "Aslanidou", "F"), ("Nikos", "Oikonomopoulos", "M"), ("Vasilis", "Karras", "M"),
        ("Stelios", "Kazantzidis", "M"), ("Marinella", "Marinella", "F"), ("Haris", "Alexiou", "F"),
        ("Maria", "Callas", "F"), ("Mikis", "Theodorakis", "M"), ("Manos", "Hatzidakis", "M"),
        ("Dimitris", "Mitropanos", "M"), ("Eleni", "Vitali", "F"), ("Vangelis", "Papathanassiou", "M"),
        
        # Athletes
        ("Nikos", "Galis", "M"), ("Theodoros", "Zagorakis", "M"), ("Giorgos", "Karagounis", "M"),
        ("Kostas", "Sloukas", "M"), ("Dimitris", "Diamantidis", "M"), ("Miltiadis", "Tentoglou", "M"),
        ("Lefteris", "Petrounias", "M"), ("Katerina", "Stefanidi", "F"), ("Anna", "Korakaki", "F"),
        ("Vassilis", "Spanoulis", "M"), ("Stefanos", "Tsitsipas", "M"), ("Maria", "Sakkari", "F"),
        ("Pyrros", "Dimas", "M"), ("Sofia", "Bekatorou", "F"), ("Voula", "Patoulidou", "F"),
        ("Otto", "Rehhagel", "M"), ("Panagiotis", "Giannakis", "M"), ("Angelos", "Charisteas", "M"),
        
        # TV Personalities & Actors
        ("Eleni", "Menegaki", "F"), ("Grigoris", "Arnaoutoglou", "M"), ("Sakis", "Tanimanidis", "M"),
        ("Zeta", "Makripoulia", "F"), ("Smaragda", "Karydi", "F"), ("Thodoris", "Atheridis", "M"),
        ("Giannis", "Bezos", "M"), ("Spyros", "Papadopoulos", "M"), ("Katerina", "Kainourgiou", "F"),
        ("Nikos", "Moutsinas", "M"), ("Giorgos", "Kapoutzidis", "M"), ("Nikos", "Chatzinikolaou", "M"),
        ("Faii", "Skorda", "F"), ("Tatiana", "Stefanidou", "F"), ("Stamatis", "Fasoulis", "M"),
        ("Vasilis", "Bisbikis", "M"), ("Nikos", "Aliagas", "M"), ("Katerina", "Papoutsaki", "F"),
        ("Aliki", "Vougiouklaki", "F"), ("Dimitris", "Horn", "M"), ("Rena", "Vlachopoulou", "F"),
        ("Thanasis", "Veggos", "M"), ("Lambros", "Konstantaras", "M"), ("Dionysis", "Papagiannopoulos", "M"),
        ("Jenny", "Karezi", "F"), ("Nikos", "Kourkoulos", "M"), ("Stathis", "Psaltis", "M"),
        ("Kostas", "Voutsas", "M"), ("Sotiris", "Moustakas", "M"), ("Eleni", "Rantou", "F"),
        
        # Comedians (Stand up / TV)
        ("Lambros", "Fisfis", "M"), ("Giorgos", "Xatzipavlou", "M"), ("Dimitris", "Makalias", "M"),
        ("Katerina", "Vrioni", "F"), ("Alexandros", "Tsouvelas", "M"), ("Lakis", "Lazopoulos", "M"),
        ("Markos", "Seferlis", "M"), ("Dionysis", "Atzarakis", "M"), ("Thomas", "Zabras", "M"),
        ("Blandine", "Drakou", "F"), ("Ira", "Katsouda", "F"), ("Babis", "Bates", "M"),
        
        # Politicians & Historical Figures
        ("Eleftherios", "Venizelos", "M"), ("Ioannis", "Kapodistrias", "M"), ("Charilaos", "Trikoupis", "M"),
        ("Theodoros", "Kolokotronis", "M"), ("Georgios", "Karaiskakis", "M"), ("Laskarina", "Bouboulina", "F"),
        ("Manto", "Mavrogenous", "F"), ("Andreas", "Papandreou", "M"), ("Konstantinos", "Karamanlis", "M"),
        ("Kyriakos", "Mitsotakis", "M"), ("Alexis", "Tsipras", "M"), ("Nikos", "Androulakis", "M"),
        ("Dimitris", "Koutsoumpas", "M"), ("Zoi", "Konstantopoulou", "F"), ("Dora", "Bakoyannis", "F"),
        ("Melina", "Mercouri", "F"), ("Kostas", "Simitis", "M"), ("George", "Papandreou", "M"),
        ("Antonis", "Samaras", "M"), ("Kostas", "Karamanlis", "M"), ("Prokopis", "Pavlopoulos", "M"),
        ("Katerina", "Sakellaropoulou", "F"), ("Karolos", "Papoulias", "M"), ("Nikos", "Dendias", "M"),
        ("Adonis", "Georgiadis", "M"), ("Kostis", "Hatzidakis", "M"), ("Niki", "Kerameus", "F"),
        
        # Ancient Greeks & Philosophers (Fun additions)
        ("Socrates", "Philosopher", "M"), ("Plato", "Philosopher", "M"), ("Aristotle", "Philosopher", "M"),
        ("Alexander", "TheGreat", "M"), ("Pericles", "Statesman", "M"), ("Leonidas", "King", "M"),
        ("Homer", "Poet", "M"), ("Sappho", "Poet", "F"), ("Hippocrates", "Doctor", "M"),
        ("Pythagoras", "Mathematician", "M"), ("Archimedes", "Inventor", "M"), ("Cleopatra", "Queen", "F")
    ]

    for i in range(N_DOCTORS):
        if i == 0:
            first, last, g = gen_person("M")
            last = "Alexiou"  # Required for Q1-5
            gender = "M"
        elif i <= len(CELEBRITIES):
            first, last, gender = CELEBRITIES[i - 1]
        else:
            gender = random.choice(["M", "F"])
            first, last, g = gen_person(gender)
        amka = gen_amka()
        dob = gen_dob(30, 60)
        email = gen_email(first, last)
        phone = gen_phone()
        hire = random_date(date(2015, 1, 1), date(2024, 6, 1))

        staff_rows.append((amka, first, last, str(dob), email, phone, str(hire), "Doctor"))

        n_seniors = N_DEPARTMENTS * 2
        n_juniors = N_DEPARTMENTS * 4
        if i < N_DEPARTMENTS:
            rank = "Διευθυντής"
        elif i < N_DEPARTMENTS + n_seniors:
            rank = "Επιμελητής Α"
        elif i < N_DEPARTMENTS + n_seniors + n_juniors:
            rank = "Επιμελητής Β"
        else:
            rank = "Ειδικευόμενος"

        doctors.append({"amka": amka, "rank": rank, "idx": i, "gender": gender,
                        "dept": dept_ids[i % len(dept_ids)]})

    write_csv_file("staff_doctors.csv",
                   ["AMKA", "first_name", "last_name", "date_of_birth", "email", "phone_number", "hire_date", "staff_type"],
                   staff_rows)

    # Build doctor rows with department-aware supervisors
    # First, let's map department directors
    dept_directors = {doc["dept"]: doc["amka"] for doc in doctors if doc["rank"] == "Διευθυντής"}

    for doc in doctors:
        sup = None
        dept_id = doc["dept"]
        
        # Get potential supervisors in the SAME department
        dept_seniors = [d for d in doctors if d["dept"] == dept_id and d["rank"] == "Επιμελητής Α"]
        dept_juniors = [d for d in doctors if d["dept"] == dept_id and d["rank"] == "Επιμελητής Β"]
        
        if doc["rank"] == "Ειδικευόμενος":
            # Ειδικευόμενοι report to an Επιμελητής in their department
            options = dept_seniors + dept_juniors
            if options:
                sup = random.choice(options)["amka"]
            else:
                # Fallback to Διευθυντής if no Attendings
                sup = dept_directors.get(dept_id)
                
        elif doc["rank"] == "Επιμελητής Β":
            # Επιμελητές Β report to an Επιμελητής Α in their department
            if dept_seniors:
                sup = random.choice(dept_seniors)["amka"]
            else:
                # Fallback to Διευθυντής
                sup = dept_directors.get(dept_id)
                
        elif doc["rank"] == "Επιμελητής Α":
            # Επιμελητές Α report to the Department Διευθυντής
            sup = dept_directors.get(dept_id)
            
        lic = gen_license()
        specialty = random.choice(DOCTOR_SPECIALTIES)
        doctor_rows.append((doc["amka"], lic, doc["rank"], specialty, sup))

    write_csv_file("doctors.csv", ["AMKA", "license_number", "rank", "specialty", "supervisor_AMKA"], doctor_rows)

    # Doctor-department
    for doc in doctors:
        dd_rows.append((doc["amka"], doc["dept"]))
        if random.random() < 0.2:
            other = random.choice([d for d in dept_ids if d != doc["dept"]])
            dd_rows.append((doc["amka"], other))
    dd_rows = list(set(dd_rows))
    write_csv_file("doctor_departments.csv", ["doctor_AMKA", "dept_id"], dd_rows)

    # 13. doctor_images (Map to existing doctors)
    img_data = []
    doctor_amkas = [d["amka"] for d in doctors]
    for i, doc_amka in enumerate(doctor_amkas):
        gender_type = "women" if i % 2 == 0 else "men"
        img_url = f"https://randomuser.me/api/portraits/{gender_type}/{i % 100}.jpg"
        img_data.append([doc_amka, img_url, "Profile photo", 1])
    write_csv_file("doctor_images.csv", ["doctor_AMKA", "img_url", "caption", "ordering"], img_data)

    # Director updates (returned for SQL UPDATE statements)
    director_updates = [(dept_ids[i], doctors[i]["amka"]) for i in range(N_DEPARTMENTS)]

    return doctors, director_updates, doctors[0]["amka"]


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
    patient_allergy_map = {}
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
        address = f"{random.choice(ATHENS_STREETS)} {random.randint(1, 200)}, Athens"

        pat_rows.append((amka, first, last, fathers, str(dob), gender,
                         weight, height, phone, email, address, occ, nat, ins))
        patients.append({"amka": amka})

        # Emergency contacts (1-2)
        for _ in range(random.randint(1, 2)):
            cf, cl, _ = gen_person()
            cp = gen_phone()
            rel = random.choice(RELATIONSHIPS)
            ec_rows.append((amka, cf, cl, cp, None, rel))

        # Allergies (0-3)
        patient_allergy_map[amka] = set()
        if substance_ids and random.random() < 0.3:
            for sid in random.sample(substance_ids, min(random.randint(1, 3), len(substance_ids))):
                allergy_rows.append((amka, sid))
                patient_allergy_map[amka].add(sid)

    write_csv_file("patients.csv",
                   ["AMKA", "first_name", "last_name", "fathers_name", "date_of_birth",
                    "gender", "weight", "height", "phone_number", "email",
                    "address", "occupation", "nationality", "insurance_provider"], pat_rows)
    # Omit contact_seq — trigger handles it
    write_csv_file("patient_emergency_contacts.csv",
                   ["patient_AMKA", "first_name", "last_name", "phone_number", "email",
                    "relationship_to_patient"], ec_rows)
    allergy_rows = list(set(allergy_rows))
    if allergy_rows:
        write_csv_file("patient_allergies.csv", ["patient_AMKA", "substance_id"], allergy_rows)

    return patients, patient_allergy_map
