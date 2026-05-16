import os
from flask import Flask, jsonify, send_from_directory, request
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

    # 1. Pre-fetch Prescriptions (Used by both global list and patient profiles)
    cursor.execute("""
        SELECT pr.patient_AMKA, CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
               CONCAT(s.first_name, ' ', s.last_name) AS doctor_name,
               d.name AS drug_name, d.manufacturer AS drug_ema, pr.dosage, pr.frequency,
               DATE_FORMAT(pr.start_date, '%Y-%m-%d') AS start,
               DATE_FORMAT(pr.end_date, '%Y-%m-%d') AS end,
               di.img_url AS drug_img
        FROM prescriptions pr
        JOIN patients p ON pr.patient_AMKA = p.AMKA
        JOIN staff s ON pr.doctor_AMKA = s.AMKA
        JOIN drugs d ON pr.drug_id = d.drug_id
        LEFT JOIN drug_images di ON d.drug_id = di.drug_id
        ORDER BY pr.start_date DESC
    """)
    prescs = cursor.fetchall()
    presc_by_patient = {}
    for r in prescs:
        if not r['drug_img']:
            # Use name hash or AMKA for a consistent fallback image
            r['drug_img'] = f"https://loremflickr.com/400/400/pills,medicine/all?lock={abs(hash(r['drug_name'])) % 1000}"
        presc_by_patient.setdefault(r['patient_AMKA'], []).append(r)
    data['PRESCRIPTIONS'] = prescs

    # 1.5 Pre-fetch Surgeries
    cursor.execute("""
        SELECT pe.execution_id AS id, o.room_name AS room, mp.name, mp.category,
               CONCAT(s.first_name, ' ', s.last_name) AS surgeon_name,
               pe.main_doctor_AMKA AS surgeon,
               CONCAT(p.first_name, ' ', p.last_name) AS patient,
               p.AMKA AS patient_AMKA,
               DATE_FORMAT(pe.start_time, '%Y-%m-%d %H:%i') AS start,
               ROUND(TIMESTAMPDIFF(MINUTE, pe.start_time, IFNULL(pe.end_time, CURRENT_TIMESTAMP)) / 60.0, 1) AS dur
        FROM procedure_executions pe
        JOIN medical_procedures mp ON pe.procedure_code = mp.procedure_code
        JOIN operating_rooms o ON pe.room_id = o.room_id
        JOIN admissions a ON pe.admission_id = a.admission_id
        JOIN patients p ON a.patient_AMKA = p.AMKA
        LEFT JOIN staff s ON pe.main_doctor_AMKA = s.AMKA
        ORDER BY pe.start_time DESC
    """)
    surgeries = cursor.fetchall()
    surgeries_by_patient = {}
    for s in surgeries:
        s['id'] = str(s['id'])
        if s['dur'] is not None:
            s['dur'] = float(s['dur'])
        s['assistants'] = [] # simplified
        surgeries_by_patient.setdefault(s['patient_AMKA'], []).append(s)
    data['SURGERIES'] = surgeries

    # 2. Departments
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
               GROUP_CONCAT(DISTINCT dd.dept_id) AS deptIds, 
               d.supervisor_AMKA AS supervisorId
        FROM doctors d
        JOIN staff s ON d.AMKA = s.AMKA
        LEFT JOIN doctor_departments dd ON d.AMKA = dd.doctor_AMKA
        GROUP BY d.AMKA
    """)
    docs = cursor.fetchall()
    
    # Separate image fetch to be ultra-safe
    cursor.execute("SELECT doctor_AMKA, img_url FROM doctor_images ORDER BY ordering ASC")
    img_rows = cursor.fetchall()
    img_map = {row['doctor_AMKA']: row['img_url'] for row in img_rows}
    print(f" * Found {len(img_map)} doctor images in DB")
    
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
        doc['img'] = img_map.get(doc['id'])
        # Convert comma-separated string to list of ints
        if doc.get('deptIds'):
            try:
                doc['deptIds'] = [int(x) for x in str(doc['deptIds']).split(',') if x.strip()]
            except:
                doc['deptIds'] = []
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

    # 5. Triage (History and Outcomes)
    cursor.execute("""
        SELECT t.triage_id AS id, t.urgency_level AS level, IFNULL(CONCAT(p.first_name, ' ', p.last_name), 'Unknown Patient') AS name,
               t.patient_AMKA AS amka, t.symptoms, DATE_FORMAT(t.arrival_time, '%Y-%m-%d %H:%i') AS arrival, 
               IFNULL(t.minutes_waited, TIMESTAMPDIFF(MINUTE, t.arrival_time, NOW())) AS waitMin, 
               t.outcome
        FROM triages t
        LEFT JOIN patients p ON t.patient_AMKA = p.AMKA
        ORDER BY t.arrival_time DESC
    """)
    triages = cursor.fetchall()
    for t in triages:
        if t['level'] is not None:
            t['level'] = int(t['level'])
    print(f" * Found {len(triages)} triages in DB")
    data['PATIENTS_TRIAGE'] = triages

    # 6. Patients (Complex with Nested Lists)
    cursor.execute("""
        SELECT AMKA AS id, AMKA AS amka, first_name AS first, last_name AS last, fathers_name AS father,
               age, gender, weight, height, phone_number AS phone, email, occupation AS job, nationality,
               insurance_provider AS insurance
        FROM patients
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
               a.admission_diagnosis_code AS icd10, a.discharge_diagnosis_code, a.ken_code AS ken, b.bed_id AS bed,
               a.base_cost + a.extra_cost AS cost,
               IF(a.discharge_date IS NULL, 'ενεργή', 'εξιτήριο') AS status
        FROM admissions a
        JOIN patients p ON a.patient_AMKA = p.AMKA
        LEFT JOIN departments d ON a.department_id = d.dept_id
        LEFT JOIN beds b ON a.bed_id = b.bed_id
        ORDER BY a.admission_date DESC, a.admission_id DESC
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
        p['prescriptions'] = presc_by_patient.get(p_id, [])
        p['surgeries'] = surgeries_by_patient.get(p_id, [])
        
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
               b.status AS status,
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
    cursor.execute("""
        SELECT d.drug_id AS id, d.name, d.manufacturer AS substance, di.img_url AS img
        FROM drugs d
        LEFT JOIN drug_images di ON d.drug_id = di.drug_id
    """)
    drugs = cursor.fetchall()
    for d in drugs:
        d['id'] = str(d['id'])
        if not d['img']:
            # Fallback: Dynamic medical image based on drug ID for consistency
            d['img'] = f"https://loremflickr.com/400/400/pills,medicine/all?lock={d['id']}"
    data['DRUGS'] = drugs


    # 11. Shifts
    cursor.execute("""
        SELECT s.shift_id, s.shift_date, s.shift_slot, s.shift_status, d.name AS dept_name, s.dept_id
        FROM shifts s
        JOIN departments d ON s.dept_id = d.dept_id
        ORDER BY s.shift_date ASC
    """)
    shifts = cursor.fetchall()
    
    cursor.execute("""
        SELECT ss.shift_id, st.AMKA AS id, CONCAT(st.first_name, ' ', st.last_name) AS name, 
               CASE WHEN dr.AMKA IS NOT NULL THEN 'doctor'
                    WHEN nu.AMKA IS NOT NULL THEN 'nurse'
                    ELSE 'admin' END AS role
        FROM shift_staffing ss
        JOIN staff st ON ss.staff_AMKA = st.AMKA
        LEFT JOIN doctors dr ON st.AMKA = dr.AMKA
        LEFT JOIN nurses nu ON st.AMKA = nu.AMKA
    """)
    staffing = cursor.fetchall()
    
    staff_by_shift = {}
    for entry in staffing:
        sid = entry['shift_id']
        staff_by_shift.setdefault(sid, []).append(entry)
        
    for s in shifts:
        s['staff'] = staff_by_shift.get(s['shift_id'], [])
        s['date'] = s['shift_date'].isoformat()
        
    data['SHIFTS'] = shifts

    # 12. Prescriptions
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

@app.route('/api/triage/update', methods=['POST'])
def update_triage():
    try:
        data = request.json
        triage_id = data.get('id')
        level = data.get('level')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # When updating level, we also set triage_time to now
        cursor.execute("""
            UPDATE triages 
            SET urgency_level = %s, triage_time = NOW() 
            WHERE triage_id = %s
        """, (level, triage_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----- QUERY EXPLORER ROUTES -----
QUERIES = [
    {"id": "01", "title": "Έσοδα ανά Τμήμα", "desc": "1. Βρείτε τα συνολικά έσοδα του νοσοκομείου ανά τμήμα και ανά έτος, με ανάλυση ανά ΚΕΝ κωδικό..."},
    {"id": "02", "title": "Ιατροί Ειδικότητας", "desc": "2. Για συγκεκριμένη ειδικότητα ιατρού, βρείτε όλους τους ιατρούς που ανήκουν σε αυτήν..."},
    {"id": "03", "title": "Συχνές Νοσηλείες", "desc": "3. Βρείτε ποιοι ασθενείς έχουν νοσηλευτεί περισσότερες από 3 φορές στο ίδιο τμήμα..."},
    {"id": "04", "title": "Αξιολογήσεις Ιατρού", "desc": "4. Για συγκεκριμένο ιατρό, βρείτε τον μέσο όρο αξιολογήσεων των ασθενών του..."},
    {"id": "05", "title": "Νέοι Χειρουργοί", "desc": "5. Βρείτε τους νέους ιατρούς (ηλικία < 35 ετών) που έχουν εκτελέσει τις περισσότερες χειρουργικές επεμβάσεις..."},
    {"id": "06", "title": "Ιστορικό Ασθενούς", "desc": "6. Για συγκεκριμένο ασθενή, βρείτε το ιστορικό νοσηλειών του, τις αντίστοιχες διαγνώσεις (ICD-10)..."},
    {"id": "07", "title": "Ουσίες & Αλλεργίες", "desc": "7. Βρείτε για κάθε δραστική ουσία τον αριθμό ασθενών που έχουν δηλώσει αλλεργία και τον αριθμό φαρμάκων..."},
    {"id": "08", "title": "Διαθέσιμο Προσωπικό", "desc": "8. Βρείτε το προσωπικό (ιατροί, νοσηλευτές, διοικητικό προσωπικό) που δεν έχει προγραμματισμένη εφημερία..."},
    {"id": "09", "title": "Διάρκεια Νοσηλειών", "desc": "9. Βρείτε ποιοι ασθενείς νοσηλεύτηκαν τον ίδιο αριθμό ημερών σε διάστημα ενός έτους..."},
    {"id": "10", "title": "Top Ζεύγη Ουσιών", "desc": "10. Πολλοί ασθενείς λαμβάνουν συνδυασμούς φαρμάκων. Βρείτε τα top-3 ζεύγη δραστικών ουσιών..."},
    {"id": "11", "title": "Σύγκριση Επεμβάσεων", "desc": "11. Βρείτε όλους τους ιατρούς που έχουν εκτελέσει τουλάχιστον 5 λιγότερες επεμβάσεις..."},
    {"id": "12", "title": "Απαιτήσεις Βαρδιών", "desc": "12. Βρείτε τον απαιτούμενο αριθμό προσωπικού ανά τμήμα και ανά βάρδια για συγκεκριμένη εβδομάδα..."},
    {"id": "13", "title": "Ιεραρχία Εποπτείας", "desc": "13. Βρείτε για κάθε ιατρό όλη την ιεραρχία εποπτείας του, από τον άμεσο επόπτη έως τον Διευθυντή..."},
    {"id": "14", "title": "ICD-10 Εισαγωγές", "desc": "14. Βρείτε ποιες κατηγορίες ICD-10 διαγνώσεων είχαν τον ίδιο αριθμό εισαγωγών σε δύο συνεχόμενα έτη..."},
    {"id": "15", "title": "Κατανομή Triage", "desc": "15. Βρείτε την κατανομή των περιστατικών triage ανά επίπεδο επείγοντος, με μέσο χρόνο αναμονής..."}
]

@app.route('/api/queries')
def get_queries():
    return jsonify(QUERIES)

@app.route('/api/queries/<query_id>')
def execute_query(query_id):
    import os
    sql_path = os.path.join(os.path.dirname(__file__), '..', 'sql', f'Q{query_id}.sql')
    
    if not os.path.exists(sql_path):
        return jsonify({
            "error": f"Το αρχείο sql/Q{query_id}.sql δεν βρέθηκε. Δημιουργήστε το αρχείο και γράψτε το SQL ερώτημα."
        }), 404

    try:
        with open(sql_path, 'r', encoding='utf-8') as f:
            sql_query = f.read().strip()
            
        if not sql_query:
            return jsonify({
                "error": f"Το αρχείο sql/Q{query_id}.sql είναι άδειο."
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql_query)
        rows = cursor.fetchall()
        
        # Format types
        for row in rows:
            for k, v in row.items():
                if hasattr(v, 'isoformat'):
                    row[k] = v.isoformat()
                elif hasattr(v, 'quantize') or hasattr(v, 'real'):
                    row[k] = float(v)
                    
        return jsonify({
            "sql": sql_query,
            "results": rows
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
