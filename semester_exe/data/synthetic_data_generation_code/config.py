"""Constants and helpers for synthetic data generation (CSV output version)."""
import csv
import os
import random
from datetime import date, timedelta

SEED = 42
random.seed(SEED)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.dirname(SCRIPT_DIR)          # data/
PROJECT_ROOT = os.path.dirname(DATA_DIR)        # semester_exe/
CSV_DIR = os.path.join(DATA_DIR, "csv")         # source CSVs (from ETL)
OUT_CSV_DIR = os.path.join(DATA_DIR, "csv", "load")  # generated CSVs for LOAD DATA
REL_CSV_DIR = "data/csv/load"                   # relative path for LOAD DATA INFILE
SQL_DIR = os.path.join(PROJECT_ROOT, "sql")
OUTPUT_SQL = os.path.join(SQL_DIR, "load.sql")

os.makedirs(OUT_CSV_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Volume constants
# ---------------------------------------------------------------------------
N_DEPARTMENTS = 15
N_DOCTORS = 300
N_NURSES = 450
N_ADMIN = 120
N_PATIENTS = 200
N_ADMISSIONS = 500
N_PRESCRIPTIONS = 300
N_OPERATING_ROOMS = 10
N_PROCEDURE_EXECS = 600
N_LAB_EXAMS = 200
N_TRIAGES = 120
N_SHIFTS_MONTHS = 6
BEDS_PER_DEPT = 40

N_ICD10_SAMPLE = 400
N_DRUG_SAMPLE = 200
N_PROCEDURE_SAMPLE = 200
N_LAB_SAMPLE = 200

N_ALEXIOU_BOOST = 500  # extra ratings injected for the Alexiou doctor

# ---------------------------------------------------------------------------
# Greek names (romanized)
# ---------------------------------------------------------------------------
MALE_FIRST = [
    "Giannis", "Nikos", "Dimitris", "Konstantinos", "Panagiotis",
    "Alexandros", "Christos", "Andreas", "Georgios", "Michalis",
    "Spyros", "Theodoros", "Vasilis", "Ioannis", "Petros",
    "Stefanos", "Evangelos", "Athanasios", "Eleftherios", "Filippos",
    "Sotiris", "Ilias", "Leonidas", "Markos", "Thomas",
    "Emmanouil", "Pavlos", "Aristeidis", "Kyriakos", "Dionysios",
    "Charalampos", "Anastasios", "Grigoris", "Fotios", "Antonis",
]
FEMALE_FIRST = [
    "Maria", "Eleni", "Katerina", "Sofia", "Anastasia",
    "Dimitra", "Christina", "Evangelia", "Georgia", "Aikaterini",
    "Vasiliki", "Paraskevi", "Eirini", "Theodora", "Ioanna",
    "Athina", "Despoina", "Kalliopi", "Elisavet", "Foteini",
    "Stavroula", "Margarita", "Alexandra", "Nikoletta", "Pinelopi",
    "Olympia", "Xanthi", "Danai", "Ariadni", "Aggeliki",
]
LAST_NAMES = [
    "Papadopoulos", "Vlachopoulos", "Angelopoulos", "Archontopoulos",
    "Nikolaidis", "Georgiou", "Dimitriou", "Konstantinidis",
    "Mavridis", "Chatzidakis", "Papanikolaou", "Oikonomidis",
    "Stamatiou", "Makris", "Panagiotidis", "Christodoulou",
    "Athanasiou", "Vasileiou", "Ioannidis", "Karamanlis",
    "Spanos", "Lazaridis", "Tsakalidis", "Michailidis",
    "Antoniou", "Petridis", "Sidiropoulos", "Triantafyllou",
    "Eleftheriadis", "Bakogiannis", "Papageorgiou", "Karagiannis",
    "Papadimitriou", "Oikonomou", "Alexiou", "Kalligas",
    "Chronopoulos", "Diamantis", "Lamprou", "Tsoukalas",
]

DEPT_NAMES = [
    ("Kardiologiko", "Cardiology department"),
    ("Cheirourgiko", "General surgery department"),
    ("Pathologiko", "Internal medicine department"),
    ("Orthopediko", "Orthopedics department"),
    ("Neurologiko", "Neurology department"),
    ("Paidiatriko", "Pediatrics department"),
    ("Gynaikologiko", "Gynecology and obstetrics"),
    ("Ogkologiko", "Oncology department"),
    ("Ourologiko", "Urology department"),
    ("Pnevmonologiko", "Pulmonology department"),
    ("Aimatologiko", "Hematology department"),
    ("Revmatologiko", "Rheumatology department"),
    ("Nefrologiko", "Nephrology department"),
    ("Dermatologiko", "Dermatology department"),
    ("Psychiatriko", "Psychiatry department"),
]

BUILDINGS = ["A", "B", "C"]
BED_TYPES = ["Regular", "ICU", "Emergency", "Pediatric"]
BED_TYPE_WEIGHTS = [0.7, 0.1, 0.1, 0.1]
ROOM_NAMES = [
    ("OR-1", "Operating Room"), ("OR-2", "Operating Room"),
    ("OR-3", "Operating Room"), ("OR-4", "Operating Room"),
    ("OR-5", "Operating Room"), ("ICU-1", "ICU"),
    ("ICU-2", "ICU"), ("EXAM-1", "Exam Room"),
    ("EXAM-2", "Exam Room"), ("THER-1", "Therapy Room"),
]
DOCTOR_RANKS = ["Resident", "Junior Attending", "Senior Attending", "Director"]
DOCTOR_SPECIALTIES = [
    "Cardiology", "Surgery", "Pediatrics", "Neurology", "Orthopedics",
    "Internal Medicine", "Emergency Medicine", "Anesthesiology", "Radiology",
    "Oncology", "Psychiatry", "Obstetrics and Gynecology", "Dermatology",
    "Urology", "General Practice",
]
ATHENS_STREETS = [
    "Patision", "Stadiou", "Akadimias", "Panepistimiou", "Vasilissis Sofias",
    "Alexandras", "Kifissias", "Mesogeion", "Syngrou", "Vouliagmenis",
    "Pireos", "Ermou", "Athinas", "Omirou", "Solonos",
]
NURSE_RANKS = ["Nursing Assistant", "Registered Nurse", "Head Nurse"]
ADMIN_POSITIONS = [
    "Secretary", "Receptionist", "Billing Clerk", "HR Officer",
    "IT Support", "Records Clerk", "Supplies Manager",
]
GENDERS = ["M", "F", "Other"]
GENDER_WEIGHTS = [0.48, 0.48, 0.04]
NATIONALITIES = ["GR", "GR", "GR", "GR", "GR", "CY", "AL", "BG", "DE", "GB"]
INSURANCE = [
    "EOPYY", "EOPYY", "EOPYY", "EOPYY",
    "Generali", "Ethniki", "Interamerican", "Eurolife",
    "Allianz", "MetLife", "Uninsured",
]
RELATIONSHIPS = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Other"]
SHIFT_SLOTS = ["Morning", "Afternoon", "Night"]
DOSAGES = ["5mg", "10mg", "20mg", "50mg", "100mg", "200mg", "250mg", "500mg"]
FREQUENCIES = [
    "1x daily", "2x daily", "3x daily", "Every 8 hours",
    "Every 12 hours", "Once weekly", "As needed",
]
RESULT_UNITS = ["mg/dL", "mmol/L", "g/dL", "U/L", "mEq/L", "%", "cells/uL", "ng/mL"]
SYMPTOMS = [
    "Chest pain", "Shortness of breath", "Fever", "Headache",
    "Abdominal pain", "Nausea", "Dizziness", "Back pain",
    "Cough", "Fatigue", "Swelling", "Palpitations",
    "Blurred vision", "Joint pain", "Skin rash",
]
DEPT_PHOTO_IDS = [
    "L8tWZT4CcVQ", "yo01Z-9HQAw", "U4FyCp3-KzY", "bss7pLodMFg",
    "NFvdKIhxYlU", "SJCalEw-1LM", "5SG7_YBMxWA", "hIgeoQjS_iE",
    "w0lvg9blfXE", "OgbEAhCV43c", "FVh_yqLR9eA", "kk3gLMNRQig",
    "6UFnAx0w9Zg", "nss2eRzQwgw", "L-2p8fapOA8",
]

# ---------------------------------------------------------------------------
# CSV writer (MySQL-compatible: \N for NULL, proper quoting)
# ---------------------------------------------------------------------------
def append_csv_file(filename, rows):
    """Append rows to an existing CSV (no header). NULL values written as \\N."""
    path = os.path.join(OUT_CSV_DIR, filename)
    with open(path, "a", encoding="utf-8", newline="") as f:
        for row in rows:
            parts = []
            for val in row:
                if val is None:
                    parts.append("\\N")
                else:
                    s = str(val)
                    if "," in s or '"' in s or "\n" in s or "\\" in s:
                        s = '"' + s.replace('"', '""') + '"'
                    parts.append(s)
            f.write(",".join(parts) + "\n")
    print(f"    -> {filename}: +{len(rows)} rows appended")


def write_csv_file(filename, header, rows):
    """Write a MySQL-compatible CSV file. NULL values written as \\N."""
    path = os.path.join(OUT_CSV_DIR, filename)
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(",".join(header) + "\n")
        for row in rows:
            parts = []
            for val in row:
                if val is None:
                    parts.append("\\N")
                else:
                    s = str(val)
                    if "," in s or '"' in s or "\n" in s or "\\" in s:
                        s = '"' + s.replace('"', '""') + '"'
                    parts.append(s)
            f.write(",".join(parts) + "\n")
    print(f"    -> {filename}: {len(rows)} rows")
    return path


def read_csv(filename):
    path = os.path.join(CSV_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


# ---------------------------------------------------------------------------
# Unique value generators
# ---------------------------------------------------------------------------
_used_amkas = set()
_used_phones = set()
_used_emails = set()
_used_licenses = set()


def gen_amka():
    while True:
        amka = "".join(str(random.randint(0, 9)) for _ in range(11))
        if amka not in _used_amkas:
            _used_amkas.add(amka)
            return amka


def gen_phone():
    while True:
        phone = "69" + "".join(str(random.randint(0, 9)) for _ in range(8))
        if phone not in _used_phones:
            _used_phones.add(phone)
            return phone


def gen_email(first, last):
    base = f"{first.lower()}.{last.lower()}"
    email = f"{base}@ygeiopolis.gr"
    i = 1
    while email in _used_emails:
        email = f"{base}{i}@ygeiopolis.gr"
        i += 1
    _used_emails.add(email)
    return email


def gen_license():
    while True:
        lic = f"LIC-{random.randint(10000, 99999)}"
        if lic not in _used_licenses:
            _used_licenses.add(lic)
            return lic


def gen_dob(min_age=25, max_age=65):
    today = date.today()
    days = random.randint(min_age * 365, max_age * 365)
    return today - timedelta(days=days)


def adjust_greek_surname(last, gender):
    """Adjusts masculine Greek surnames to feminine form if needed."""
    if gender != "F":
        return last
    
    # Common Greek surname ending transformations
    if last.endswith("opoulos"):
        return last[:-2] + "ou"  # Papadopoulos -> Papadopoulou
    if last.endswith("idis"):
        return last[:-1]         # Mavridis -> Mavridi
    if last.endswith("akis"):
        return last[:-1]         # Chatzidakis -> Chatzidaki
    if last.endswith("is"):
        return last[:-1]         # Makris -> Makri
    if last.endswith("as"):
        return last[:-1]         # Tsoukalas -> Tsoukala
    if last.endswith("os"):
        return last[:-2] + "ou"  # Spanos -> Spanou
    
    return last


def gen_person(gender=None):
    if gender is None:
        gender = random.choices(["M", "F"], weights=[0.5, 0.5])[0]
    if gender == "M":
        first = random.choice(MALE_FIRST)
    else:
        first = random.choice(FEMALE_FIRST)
    
    last = random.choice(LAST_NAMES)
    last = adjust_greek_surname(last, gender)
    
    return first, last, gender


def random_date(start, end):
    delta = (end - start).days
    if delta <= 0:
        return start
    return start + timedelta(days=random.randint(0, delta))


def random_datetime(d):
    h = random.randint(0, 23)
    m = random.randint(0, 59)
    return f"{d} {h:02d}:{m:02d}:00"
