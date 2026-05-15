-- Q11: Όλοι οι ιατροί που έχουν εκτελέσει τουλάχιστον 5 λιγότερες επεμβάσεις από τον ιατρό με τις περισσότερες επεμβάσεις στο τρέχον έτος
WITH doctor_totals AS (
    SELECT
        main_doctor_AMKA,
        COUNT(*) AS total_procedures
    FROM procedure_executions
    WHERE YEAR(start_time) = YEAR(CURDATE())
    GROUP BY main_doctor_AMKA
)
SELECT
    d.AMKA,
    s.first_name,
    s.last_name,
    dt.total_procedures
FROM doctor_totals dt
JOIN doctors d ON dt.main_doctor_AMKA = d.AMKA
JOIN staff s ON d.AMKA = s.AMKA
WHERE dt.total_procedures <= (SELECT MAX(total_procedures) FROM doctor_totals) - 5
ORDER BY dt.total_procedures DESC;
