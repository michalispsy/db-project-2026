-- Q1: Συνολικά έσοδα του νοσοκομείου ανά τμήμα και ανά έτος
SELECT 
    d.name AS department_name,
    YEAR(a.admission_date) AS admission_year,
    a.ken_code,
    p.insurance_provider,
    COUNT(a.admission_id) AS total_admissions,
    SUM(a.base_cost) AS total_base_cost,
    SUM(a.extra_cost) AS total_extra_cost,
    SUM(a.base_cost + a.extra_cost) AS total_revenue
FROM admissions a
JOIN departments d ON a.department_id = d.dept_id
JOIN patients p ON a.patient_AMKA = p.AMKA
GROUP BY d.name, YEAR(a.admission_date), a.ken_code, p.insurance_provider
ORDER BY admission_year DESC, d.name, total_revenue DESC;