-- (α) EXPLAIN χωρίς index στο staff.last_name

DROP INDEX IF EXISTS idx_staff_last_name ON staff;

EXPLAIN SELECT
    doc.AMKA,
    s.first_name,
    s.last_name,
    ROUND(AVG(dr.medical_care_quality), 2) AS avg_medical_care_quality,
    ROUND(AVG(ar.overall), 2)              AS avg_overall_admission_rating,
    COUNT(dr.rating_id)                    AS total_ratings
FROM doctors doc
JOIN staff s           ON doc.AMKA          = s.AMKA
JOIN doctor_ratings dr ON doc.AMKA          = dr.doctor_AMKA
JOIN admissions a      ON dr.admission_id   = a.admission_id
JOIN admission_ratings ar ON a.admission_id = ar.admission_id
WHERE s.last_name = 'Alexiou' AND s.first_name = 'Michalis'
GROUP BY doc.AMKA, s.first_name, s.last_name;
