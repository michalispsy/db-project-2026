-- Q14: Κατηγορίες ICD-10 διαγνώσεων είχαν τον ίδιο αριθμό εισαγωγών σε δύο συνεχόμενα έτη, με τουλάχιστον 5 περιστατικά ανά έτος.
WITH annual_diagnoses AS (
    SELECT
        i.category,
        YEAR(a.admission_date) AS diag_year,
        COUNT(*) AS total_incidents
    FROM admissions a
    JOIN icd10 i ON a.admission_diagnosis_code = i.icd10_code
    GROUP BY i.category, diag_year
    HAVING total_incidents >= 5
)
SELECT
    curr.category AS Diagnosis_Category,
    curr.diag_year AS Year_A,
    next_yr.diag_year AS Year_B,
    curr.total_incidents AS Frequency
FROM annual_diagnoses curr
JOIN annual_diagnoses next_yr
    ON curr.category = next_yr.category
    AND curr.diag_year = next_yr.diag_year - 1
WHERE curr.total_incidents = next_yr.total_incidents
ORDER BY Year_A DESC, Diagnosis_Category;
