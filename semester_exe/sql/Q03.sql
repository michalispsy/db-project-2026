-- Q3: Ασθενείς με περισσότερες από 3 νοσηλείες στο ίδιο τμήμα
SELECT
    p.AMKA,
    p.first_name,
    p.last_name,
    d.name AS department_name,
    COUNT(a.admission_id) AS admission_count,
    SUM(a.base_cost + a.extra_cost) AS total_cost
FROM patients p
JOIN admissions a ON p.AMKA = a.patient_AMKA
JOIN departments d ON a.department_id = d.dept_id
GROUP BY p.AMKA, p.first_name, p.last_name, d.name
HAVING COUNT(a.admission_id) > 3
ORDER BY admission_count DESC;
