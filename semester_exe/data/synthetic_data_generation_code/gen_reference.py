"""Generate reference data CSVs from real source CSVs."""
import random
from config import *


def gen_icd10():
    rows_raw = read_csv("icd10.csv")
    sampled = random.sample(rows_raw, min(N_ICD10_SAMPLE, len(rows_raw)))
    rows = []
    codes = []
    for r in sampled:
        code = r["code"][:6]
        desc = r["description"][:500]
        rows.append((code, desc, code[:3]))
        codes.append(code)
    write_csv_file("icd10.csv", ["icd10_code", "description", "category"], rows)
    return codes


def gen_ken():
    rows_raw = read_csv("ken.csv")
    rows = []
    codes = []
    for r in rows_raw:
        code = r["code"][:5]
        desc = r["description"][:500]
        cost = r.get("cost", "").strip()
        avg_days = r.get("avg_days", "").strip()
        cost_val = float(cost) if cost else round(random.uniform(500, 5000), 2)
        avg_val = int(float(avg_days)) if avg_days else random.randint(3, 15)
        surcharge = round(random.uniform(50, 300), 2)
        rows.append((code, desc, f"{cost_val:.2f}", avg_val, f"{surcharge:.2f}"))
        codes.append(code)
    write_csv_file("ken.csv", ["ken_code", "description", "base_cost", "avg_length_of_stay", "daily_surcharge_rate"], rows)
    return codes


def gen_substances_and_drugs():
    prods_raw = read_csv("ema_products.csv")
    subs_raw = read_csv("ema_active_substances.csv")
    sampled_prods = random.sample(prods_raw, min(N_DRUG_SAMPLE, len(prods_raw)))
    sampled_ids = {r["product_id"] for r in sampled_prods}

    substance_set = set()
    prod_subs = {}
    for r in subs_raw:
        if r["product_id"] in sampled_ids:
            sname = r["substance_name"].strip()[:100]
            if sname:
                substance_set.add(sname)
                prod_subs.setdefault(r["product_id"], []).append(sname)

    substance_list = sorted(substance_set)
    sub_id_map = {name: i + 1 for i, name in enumerate(substance_list)}

    # active_substances CSV
    sub_rows = [(sub_id_map[s], s) for s in substance_list]
    write_csv_file("active_substances.csv", ["substance_id", "name"], sub_rows)

    # drugs CSV
    drug_rows = []
    drug_id_map = {}
    for i, r in enumerate(sampled_prods, 1):
        ema_code = f"EMA-{r['product_id'].zfill(6)}"
        name = r["product_name"][:150]
        mfr = r.get("holder", "Unknown")[:100]
        drug_rows.append((i, ema_code, name, mfr))
        drug_id_map[r["product_id"]] = i
    write_csv_file("drugs.csv", ["drug_id", "ema_code", "name", "manufacturer"], drug_rows)

    # drug_contains_substances CSV
    dcs_rows = []
    for pid, snames in prod_subs.items():
        if pid in drug_id_map:
            did = drug_id_map[pid]
            for sn in snames:
                if sn in sub_id_map:
                    dcs_rows.append((did, sub_id_map[sn]))
    write_csv_file("drug_contains_substances.csv", ["drug_id", "substance_id"], dcs_rows)

    return list(drug_id_map.values()), substance_list, sub_id_map


def gen_medical_procedures():
    rows_raw = read_csv("medical_procedures.csv")
    sampled = random.sample(rows_raw, min(N_PROCEDURE_SAMPLE, len(rows_raw)))
    rows = []
    codes = []
    for r in sampled:
        code = r["code"][:20]
        desc = r["description"][:50]
        cat = r.get("category", "")[:100]
        dur = random.randint(15, 240)
        cost = round(random.uniform(200, 10000), 2)
        rows.append((code, desc, cat, dur, f"{cost:.2f}"))
        codes.append(code)
    write_csv_file("medical_procedures.csv", ["procedure_code", "name", "category", "standard_duration", "standard_cost"], rows)
    return codes


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
    sampled = random.sample(rows_raw, min(N_LAB_SAMPLE, len(rows_raw)))
    return [(r["code"][:20], r["description"][:100]) for r in sampled]
