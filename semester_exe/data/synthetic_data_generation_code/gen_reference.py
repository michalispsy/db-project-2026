"""Generate reference data CSVs from real source CSVs."""
import random
import re
from config import *


def gen_icd10():
    rows_raw = read_csv("icd10.csv")
    rows = []
    codes = []
    for r in rows_raw:
        code = r["code"][:7]
        desc = r["description"]
        rows.append((code, desc, code[:3]))
        codes.append(code)
    write_csv_file("icd10.csv", ["icd10_code", "description", "category"], rows)
    return random.sample(codes, min(N_ICD10_SAMPLE, len(codes)))


def gen_ken():
    rows_raw = read_csv("ken.csv")
    ken_rows = []
    cat_rows = []
    codes = []
    for r in rows_raw:
        code = r["code"][:7]
        desc = r["description"]
        if "(*)" in code or "(*)" in desc:
            continue
        
        if "ΤΚΑ" in code or (not r.get("cost") and not r.get("avg_days") and "ΤΚΑ" in code):
            match = re.search(r'\(([Α-ΩA-Z])\)', desc)
            if match:
                letter = match.group(1)
                clean_desc = re.sub(r'\s*\([Α-ΩA-Z]\)\s*', '', desc).strip()
                cat_rows.append((letter, clean_desc))
            continue

        cost = r.get("cost", "").strip()
        avg_days = r.get("avg_days", "").strip()
        cost_val = float(cost) if cost else round(random.uniform(500, 5000), 2)
        avg_val = int(float(avg_days)) if avg_days else random.randint(3, 15)
        surcharge = round(random.uniform(50, 300), 2)
        cat_letter = code[0] if code else ""
        
        ken_rows.append((code, desc, f"{cost_val:.2f}", avg_val, f"{surcharge:.2f}", cat_letter))
        codes.append(code)
        
    write_csv_file("ken_categories.csv", ["category_letter", "description"], cat_rows)
    write_csv_file("ken.csv", ["ken_code", "description", "base_cost", "avg_length_of_stay", "daily_surcharge_rate", "category_letter"], ken_rows)
    return random.sample(codes, min(400, len(codes)))


def gen_substances_and_drugs():
    prods_raw = read_csv("ema_products.csv")
    subs_raw = read_csv("ema_active_substances.csv")
    
    substance_set = set()
    prod_subs = {}
    for r in subs_raw:
        sname = r["substance_name"].strip()[:100]
        if sname:
            substance_set.add(sname)
            prod_subs.setdefault(r["product_id"], []).append(sname)

    substance_list = sorted(substance_set)
    sub_id_map = {name: i + 1 for i, name in enumerate(substance_list)}

    sub_rows = [(sub_id_map[s], s) for s in substance_list]
    write_csv_file("active_substances.csv", ["substance_id", "name"], sub_rows)

    drug_rows = []
    drug_id_map = {}
    for i, r in enumerate(prods_raw, 1):
        ema_code = f"EMA-{r['product_id'].zfill(6)}"
        name = r["product_name"][:150]
        mfr = r.get("holder", "Unknown")[:100]
        drug_rows.append((i, ema_code, name, mfr))
        drug_id_map[r["product_id"]] = i
        
    write_csv_file("drugs.csv", ["drug_id", "ema_code", "name", "manufacturer"], drug_rows)

    dcs_rows = []
    drug_substance_map = {}
    for pid, snames in prod_subs.items():
        if pid in drug_id_map:
            did = drug_id_map[pid]
            for sn in snames:
                if sn in sub_id_map:
                    dcs_rows.append((did, sub_id_map[sn]))
                    drug_substance_map.setdefault(did, set()).add(sub_id_map[sn])
    write_csv_file("drug_contains_substances.csv", ["drug_id", "substance_id"], dcs_rows)

    sampled_drug_ids = random.sample(list(drug_id_map.values()), min(N_DRUG_SAMPLE, len(drug_id_map)))
    return sampled_drug_ids, substance_list, sub_id_map, drug_substance_map


def gen_medical_procedures():
    rows_raw = read_csv("medical_procedures.csv")
    rows = []
    codes = []
    for r in rows_raw:
        code = r["code"][:20]
        desc = r["description"][:50]
        raw_cat = r.get("category", "").strip()
        # Ministry source uses Greek letters: Α=χειρουργική, Β=διαγνωστική or θεραπευτική
        if raw_cat == "Α":
            cat = "χειρουργική"
        elif raw_cat == "Β":
            cat = random.choice(["διαγνωστική", "θεραπευτική"])
        else:
            cat = random.choice(["χειρουργική", "διαγνωστική", "θεραπευτική"])
        dur = random.randint(15, 240)
        cost = round(random.uniform(200, 10000), 2)
        rows.append((code, desc, cat, dur, f"{cost:.2f}"))
        codes.append(code)
    write_csv_file("medical_procedures.csv", ["procedure_code", "name", "category", "standard_duration", "standard_cost"], rows)
    return random.sample(codes, min(N_PROCEDURE_SAMPLE, len(codes)))


def gen_operating_rooms():
    rows = []
    for i, (name, rtype) in enumerate(ROOM_NAMES[:N_OPERATING_ROOMS], 1):
        floor = random.randint(0, 3)
        bld = random.choice(BUILDINGS)
        rows.append((i, name, rtype, floor, bld))
    write_csv_file("operating_rooms.csv", ["room_id", "room_name", "room_type", "floor", "building"], rows)
    return list(range(1, N_OPERATING_ROOMS + 1))


def gen_lab_exam_types():
    rows_raw = read_csv("lab_tests.csv")
    rows = []
    used_ids = set()
    lab_types = []
    for r in rows_raw:
        code_str = r["code"][:20]
        desc = r["description"]
        
        base_id = abs(hash(code_str)) % 99999 + 1
        exam_id = base_id
        while exam_id in used_ids:
            exam_id += 1
        used_ids.add(exam_id)
        
        rows.append((exam_id, desc))
        lab_types.append((code_str, desc, exam_id))
        
    write_csv_file("exam_types.csv", ["exam_code", "name"], rows)
    return random.sample(lab_types, min(N_LAB_SAMPLE, len(lab_types)))
