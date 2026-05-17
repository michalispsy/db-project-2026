-- Q10: top-3 ζεύγη δραστικών ουσιών που συνταγογραφήθηκαν ταυτόχρονα στον ίδιο ασθενή κατά την ίδια νοσηλεία, ταξινομημένα κατά συχνότητα εμφάνισης
WITH prescription_substances AS (
    SELECT DISTINCT
        p.admission_id,
        p.patient_AMKA,
        a.substance_id,
        a.name as sub_name
    FROM prescriptions p
    JOIN drug_contains_substances d ON p.drug_id = d.drug_id
    JOIN active_substances a ON d.substance_id = a.substance_id
)
SELECT
    p1.sub_name AS substance_1,
    p2.sub_name AS substance_2,
    COUNT(*) AS frequency
FROM prescription_substances p1
JOIN prescription_substances p2 ON p1.admission_id = p2.admission_id
    AND p1.patient_AMKA = p2.patient_AMKA
    AND p1.substance_id < p2.substance_id
GROUP BY substance_1, substance_2
ORDER BY frequency DESC
LIMIT 3;
