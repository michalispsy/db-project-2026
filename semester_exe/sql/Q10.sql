-- Q10: top-3 ζεύγη δραστικών ουσιών που συνταγογραφήθηκαν ταυτόχρονα στον ίδιο ασθενή κατά την ίδια νοσηλεία, ταξινομημένα κατά συχνότητα εμφάνισης
SELECT
    d1.name AS drug_1,
    d2.name AS drug_2,
    COUNT(*) AS frequency
FROM prescriptions p1
JOIN drugs d1 ON p1.drug_id = d1.drug_id
JOIN prescriptions p2 ON p1.admission_id = p2.admission_id
    AND p1.patient_AMKA = p2.patient_AMKA
    AND p1.drug_id < p2.drug_id
JOIN drugs d2 ON p2.drug_id = d2.drug_id
GROUP BY drug_1, drug_2
ORDER BY frequency DESC
-- FETCH FIRST 3 ROWS WITH TIES;
LIMIT 3;
