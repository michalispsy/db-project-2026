import os
from flask import Flask, jsonify, send_from_directory
import mysql.connector

app = Flask(__name__, static_folder='frontend')

def get_db_connection():
    # Connect using root and unix socket
    return mysql.connector.connect(
        user='root',
        unix_socket='/run/mysqld/mysqld.sock',
        database='ygeiopolis'
    )

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'Ygeipoli.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/data')
def get_data():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    data = {}

    # 1. Departments
    cursor.execute("""
        SELECT d.dept_id AS id, d.name, d.description AS `desc`, 
               (SELECT COUNT(*) FROM beds WHERE dept_id = d.dept_id) AS beds, 
               d.floor,
               CONCAT(s.first_name, ' ', s.last_name) AS director
        FROM departments d
        LEFT JOIN staff s ON d.director_AMKA = s.AMKA
    """)
    data['DEPARTMENTS'] = cursor.fetchall()
    for d in data['DEPARTMENTS']:
        d['icon'] = 'building'

    # 2. Doctors
    cursor.execute("""
        SELECT d.AMKA AS id, CONCAT(s.first_name, ' ', s.last_name) AS name,
               d.license_number AS lic, d.rank, 
               GROUP_CONCAT(dd.dept_id) AS deptIds, 
               d.supervisor_AMKA AS supervisorId
        FROM doctors d
        JOIN staff s ON d.AMKA = s.AMKA
        LEFT JOIN doctor_departments dd ON d.AMKA = dd.doctor_AMKA
        GROUP BY d.AMKA
    """)
    docs = cursor.fetchall()
    
    # Count surgeries per doctor
    cursor.execute("""
        SELECT main_doctor_AMKA AS amka, COUNT(*) AS count
        FROM procedure_executions
        GROUP BY main_doctor_AMKA
    """)
    doc_surgeries = {row['amka']: row['count'] for row in cursor.fetchall()}
    
    for doc in docs:
        doc['spec'] = doc['rank']
        doc['surgeries'] = doc_surgeries.get(doc['id'], 0)
        # Convert comma-separated string to list of ints
        if doc['deptIds']:
            doc['deptIds'] = [int(x) for x in doc['deptIds'].split(',')]
        else:
            doc['deptIds'] = []
    data['DOCTORS'] = docs

    # 3. Nurses
    cursor.execute("""
        SELECT n.AMKA AS id, CONCAT(s.first_name, ' ', s.last_name) AS name, n.rank, n.dept_id AS deptId
        FROM nurses n
        JOIN staff s ON n.AMKA = s.AMKA
    """)
    data['NURSES'] = cursor.fetchall()

    # 4. Admin
    cursor.execute("""
        SELECT a.AMKA AS id, CONCAT(s.first_name, ' ', s.last_name) AS name, a.position AS role, a.office_location AS office, a.dept_id AS deptId
        FROM admin_staff a
        JOIN staff s ON a.AMKA = s.AMKA
    """)
    data['ADMIN'] = cursor.fetchall()

    # 5. Patients Triage
    cursor.execute("""
        SELECT t.triage_id AS id, t.urgency_level AS level, CONCAT(p.first_name, ' ', p.last_name) AS name,
               t.symptoms, DATE_FORMAT(t.arrival_time, '%H:%i') AS arrival, t.minutes_waited AS waitMin
        FROM triages t
        JOIN patients p ON t.patient_AMKA = p.AMKA
        ORDER BY t.arrival_time DESC LIMIT 50
    """)
    data['PATIENTS_TRIAGE'] = cursor.fetchall()

    # 6. Patients (Complex with Nested Lists)
    cursor.execute("""
        SELECT AMKA AS id, AMKA AS amka, first_name AS first, last_name AS last, fathers_name AS father,
               age, gender, weight, height, phone_number AS phone, email, occupation AS job, nationality,
               insurance_provider AS insurance
        FROM patients
        LIMIT 50
    """)
    patients = cursor.fetchall()
    
    # Pre-fetch Allergies
    cursor.execute("""
        SELECT pa.patient_AMKA, sub.name
        FROM patient_allergies pa
        JOIN active_substances sub ON pa.substance_id = sub.substance_id
    """)
    all_allergies = cursor.fetchall()
    allergies_by_patient = {}
    for a in all_allergies:
        allergies_by_patient.setdefault(a['patient_AMKA'], []).append(a['name'])

    # Pre-fetch Contacts
    cursor.execute("""
        SELECT patient_AMKA, CONCAT(first_name, ' ', last_name) AS name, phone_number AS phone
        FROM patient_emergency_contacts
    """)
    all_contacts = cursor.fetchall()
    contacts_by_patient = {}
    for c in all_contacts:
        contacts_by_patient.setdefault(c['patient_AMKA'], []).append({"name": c['name'], "phone": c['phone']})

    # Pre-fetch Hospitalizations
    cursor.execute("""
        SELECT a.admission_id AS id, a.patient_AMKA, 
               CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
               DATE_FORMAT(a.admission_date, '%Y-%m-%d') AS `from`, 
               DATE_FORMAT(a.discharge_date, '%Y-%m-%d') AS `to`, d.name AS dept, 
               a.admission_diagnosis_code AS icd10, a.ken_code AS ken, b.bed_id AS bed,
               a.base_cost + a.extra_cost AS cost,
               IF(a.discharge_date IS NULL, 'ενεργή', 'εξιτήριο') AS status
        FROM admissions a
        JOIN patients p ON a.patient_AMKA = p.AMKA
        LEFT JOIN departments d ON a.department_id = d.dept_id
        LEFT JOIN beds b ON a.bed_id = b.bed_id
        ORDER BY a.admission_date DESC
    """)
    all_hosp = cursor.fetchall()
    hosp_by_patient = {}
    for h in all_hosp:
        p_id = h.pop('patient_AMKA')
        # format decimal
        if h['cost'] is not None:
            h['cost'] = float(h['cost'])
        h['id'] = str(h['id'])
        h['bed'] = str(h['bed'])
        hosp_by_patient.setdefault(p_id, []).append(h)

    for p in patients:
        p_id = p['id']
        p['allergies'] = allergies_by_patient.get(p_id, [])
        p['contacts'] = contacts_by_patient.get(p_id, [])
        p['hospitalizations'] = hosp_by_patient.get(p_id, [])
        
    data['PATIENTS'] = patients
    data['ADMISSIONS'] = all_hosp  # Full list for the Hospitalizations tab

    # 7. ICD10
    cursor.execute("SELECT icd10_code AS code, description AS name FROM icd10")
    data['ICD10'] = cursor.fetchall()

    # 8. KEN
    cursor.execute("SELECT ken_code AS code, description AS name, base_cost AS base, avg_length_of_stay AS mdn FROM ken")
    ken_rows = cursor.fetchall()
    for k in ken_rows:
        if k['base'] is not None: k['base'] = float(k['base'])
    data['KEN'] = ken_rows

    # 9. BEDS
    cursor.execute("""
        SELECT b.bed_id AS id, b.dept_id AS dept, b.bed_type AS type, 
               CASE WHEN b.status = 'Free' THEN 'available'
                    WHEN b.status = 'Occupied' THEN 'occupied'
                    ELSE 'maintenance' END AS status,
               CONCAT(p.first_name, ' ', p.last_name) AS patient,
               p.AMKA AS patient_AMKA
        FROM beds b
        LEFT JOIN admissions a ON b.assigned_to = a.admission_id
        LEFT JOIN patients p ON a.patient_AMKA = p.AMKA
    """)
    beds = cursor.fetchall()
    for b in beds:
        b['id'] = str(b['id'])
    data['BEDS'] = beds

    # 10. Drugs
    cursor.execute("SELECT drug_id AS id, name, manufacturer AS substance FROM drugs")
    drugs = cursor.fetchall()
    for d in drugs:
        d['id'] = str(d['id'])
    data['DRUGS'] = drugs

    # 11. Surgeries (medical procedures)
    cursor.execute("""
        SELECT pe.execution_id AS id, o.room_name AS room, mp.name, mp.category,
               pe.main_doctor_AMKA AS surgeon,
               CONCAT(p.first_name, ' ', p.last_name) AS patient,
               DATE_FORMAT(pe.start_time, '%H:%i') AS start,
               ROUND(TIMESTAMPDIFF(MINUTE, pe.start_time, IFNULL(pe.end_time, CURRENT_TIMESTAMP)) / 60.0, 1) AS dur
        FROM procedure_executions pe
        JOIN medical_procedures mp ON pe.procedure_code = mp.procedure_code
        JOIN operating_rooms o ON pe.room_id = o.room_id
        JOIN admissions a ON pe.admission_id = a.admission_id
        JOIN patients p ON a.patient_AMKA = p.AMKA
    """)
    surgeries = cursor.fetchall()
    for s in surgeries:
        s['id'] = str(s['id'])
        if s['dur'] is not None:
            s['dur'] = float(s['dur'])
        s['assistants'] = [] # simplified
    data['SURGERIES'] = surgeries

    # 12. Prescriptions
    cursor.execute("""
        SELECT pr.patient_AMKA, CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
               CONCAT(s.first_name, ' ', s.last_name) AS doctor_name,
               d.name AS drug_name, pr.dosage, pr.frequency,
               DATE_FORMAT(pr.start_date, '%Y-%m-%d') AS start,
               DATE_FORMAT(pr.end_date, '%Y-%m-%d') AS end
        FROM prescriptions pr
        JOIN patients p ON pr.patient_AMKA = p.AMKA
        JOIN staff s ON pr.doctor_AMKA = s.AMKA
        JOIN drugs d ON pr.drug_id = d.drug_id
        ORDER BY pr.start_date DESC LIMIT 100
    """)
    data['PRESCRIPTIONS'] = cursor.fetchall()

    data['REVIEWS'] = []
    data['QUERIES'] = []

    cursor.close()
    conn.close()
    return jsonify(data)

@app.route('/api/tables')
def get_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(tables)

@app.route('/api/tables/<table_name>')
def get_table_data(table_name):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    if not table_name.isidentifier():
        return jsonify({"error": "Invalid table name"}), 400
        
    try:
        cursor.execute(f"SELECT * FROM `{table_name}` LIMIT 1000")
        rows = cursor.fetchall()
        for row in rows:
            for k, v in row.items():
                if hasattr(v, 'isoformat'):
                    row[k] = v.isoformat()
                elif hasattr(v, 'quantize'):
                    row[k] = float(v)
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
