-- (β) Εναλλακτική έκδοση με FORCE INDEX στο staff.last_name

CREATE INDEX IF NOT EXISTS idx_staff_last_name ON staff(last_name);

EXPLAIN SELECT
    doc.AMKA                               AS doctor_AMKA,
    s.last_name                            AS doctor_last_name,
    ROUND(AVG(dr.medical_care_quality), 2) AS avg_medical_care_quality,
    ROUND(AVG(ar.overall), 2)              AS avg_overall_admission_rating,
    COUNT(dr.rating_id)                    AS total_ratings
FROM doctors doc
JOIN staff s FORCE INDEX (idx_staff_last_name) ON doc.AMKA = s.AMKA
JOIN doctor_ratings dr ON doc.AMKA          = dr.doctor_AMKA
JOIN admissions a      ON dr.admission_id   = a.admission_id
JOIN admission_ratings ar ON a.admission_id = ar.admission_id
WHERE s.last_name = 'Alexiou'
GROUP BY doc.AMKA, s.last_name;
