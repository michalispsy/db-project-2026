-- Q2: Ιατροί συγκεκριμένης ειδικότητας και επεμβάσεις
SELECT
    s.AMKA,
    s.first_name,
    s.last_name,
    spec.name AS specialty,
    EXISTS (
        SELECT 1 FROM shift_staffing ss
        JOIN shifts sh ON ss.shift_id = sh.shift_id
        WHERE ss.staff_AMKA = s.AMKA AND YEAR(sh.shift_date) = YEAR(CURRENT_DATE)
    ) AS had_shift_this_year,
    (
        SELECT COUNT(*) FROM procedure_executions pe
        WHERE pe.main_doctor_AMKA = s.AMKA
    ) AS surgeries_as_main
FROM doctors doc
JOIN staff s ON doc.AMKA = s.AMKA
JOIN specialties spec ON doc.specialty = spec.code
WHERE spec.name = 'Surgery'
ORDER BY surgeries_as_main DESC;
