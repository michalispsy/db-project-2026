-- (α) EXPLAIN χωρίς index στο patients.last_name

DROP INDEX IF EXISTS idx_patients_last_name ON patients;

EXPLAIN SELECT
    CONCAT(p.first_name, ' ', p.last_name)              AS patient_name,
    p.AMKA                                              AS patient_AMKA,
    a.admission_id,
    DATE_FORMAT(a.admission_date, '%Y-%m-%d')           AS admission_date,
    DATE_FORMAT(a.discharge_date, '%Y-%m-%d')           AS discharge_date,
    DATEDIFF(
        COALESCE(a.discharge_date, CURDATE()),
        a.admission_date
    )                                                   AS days_stayed,
    d.name                                              AS department,
    CONCAT(i1.icd10_code, ' — ', i1.description)       AS admission_diagnosis,
    CONCAT(i2.icd10_code, ' — ', i2.description)       AS discharge_diagnosis,
    a.base_cost + a.extra_cost                          AS total_cost,
    GROUP_CONCAT(
        DISTINCT dr.name
        ORDER BY dr.name
        SEPARATOR ' | '
    )                                                   AS prescriptions,
    GROUP_CONCAT(
        DISTINCT et.name
        ORDER BY et.name
        SEPARATOR ' | '
    )                                                   AS lab_exams
FROM patients p
JOIN admissions a    ON p.AMKA              = a.patient_AMKA
JOIN departments d   ON a.department_id     = d.dept_id
JOIN icd10 i1        ON a.admission_diagnosis_code  = i1.icd10_code
LEFT JOIN icd10 i2   ON a.discharge_diagnosis_code  = i2.icd10_code
LEFT JOIN prescriptions pr  ON a.admission_id = pr.admission_id
LEFT JOIN drugs dr          ON pr.drug_id     = dr.drug_id
LEFT JOIN lab_exams le      ON a.admission_id = le.admission_id
LEFT JOIN exam_types et     ON le.exam_code   = et.exam_code
WHERE p.last_name = 'Papadopoulos'
GROUP BY a.admission_id, p.first_name, p.last_name, p.AMKA,
         a.admission_date, a.discharge_date, a.base_cost, a.extra_cost,
         d.name, i1.icd10_code, i1.description, i2.icd10_code, i2.description
ORDER BY a.admission_date DESC;
