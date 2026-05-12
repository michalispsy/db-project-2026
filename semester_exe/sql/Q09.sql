-- Q09: Ασθενείς με ίδιο συνολικό αριθμό ημερών νοσηλείας εντός έτους (άνω των 15 ημερών)
WITH patient_days AS (
    SELECT
        p.AMKA,
        CONCAT(p.first_name, ' ', p.last_name)  AS patient_name,
        SUM(DATEDIFF(a.discharge_date, a.admission_date)) AS total_days
    FROM patients p
    JOIN admissions a ON p.AMKA = a.patient_AMKA
    WHERE YEAR(a.admission_date) = 2026
      AND a.discharge_date IS NOT NULL
    GROUP BY p.AMKA, p.first_name, p.last_name
    HAVING total_days > 15
)
SELECT
    a.patient_name   AS patient_1,
    b.patient_name   AS patient_2,
    a.total_days
FROM patient_days a
JOIN patient_days b ON a.total_days = b.total_days
                   AND a.AMKA < b.AMKA
ORDER BY a.total_days DESC, a.patient_name;
