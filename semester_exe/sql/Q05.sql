-- Q5: Νέοι ιατροί (<35 ετών) με τις περισσότερες χειρουργικές επεμβάσεις
SELECT
    s.AMKA,
    s.first_name,
    s.last_name,
    s.age,
    COUNT(pe.execution_id) AS total_surgeries
FROM doctors doc
JOIN staff s              ON doc.AMKA          = s.AMKA
JOIN procedure_executions pe ON doc.AMKA       = pe.main_doctor_AMKA
JOIN medical_procedures mp   ON pe.procedure_code = mp.procedure_code
WHERE s.age < 35
  AND mp.category = 'Surgical'
GROUP BY s.AMKA, s.first_name, s.last_name, s.age
ORDER BY total_surgeries DESC;
