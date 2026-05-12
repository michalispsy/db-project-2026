-- Q07: Για κάθε δραστική ουσία, αριθμός αλλεργικών ασθενών και αριθμός φαρμάκων που την περιέχουν
SELECT
    sub.name                                        AS substance,
    COUNT(DISTINCT pa.patient_AMKA)                 AS allergic_patients,
    COUNT(DISTINCT dcs.drug_id)                     AS drugs_containing
FROM active_substances sub
LEFT JOIN patient_allergies pa          ON sub.substance_id = pa.substance_id
LEFT JOIN drug_contains_substances dcs  ON sub.substance_id = dcs.substance_id
GROUP BY sub.substance_id, sub.name
HAVING allergic_patients > 0 OR drugs_containing > 0
ORDER BY allergic_patients DESC;
