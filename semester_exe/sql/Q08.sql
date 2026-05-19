-- Q08: Προσωπικό χωρίς προγραμματισμένη εφημερία για συγκεκριμένη ημερομηνία και τμήμα
-- Παράμετροι: @target_date = η ημερομηνία, @target_dept = το dept_id του τμήματος
SET @target_date = '2026-01-05';
SET @target_dept = 1;

SELECT
    s.AMKA,
    s.first_name,
    s.last_name,
    s.staff_type,
    COALESCE(doc.rank, n.rank, a.position)  AS role,
    COALESCE(dd.dept_name, dep_n.name, dep_a.name) AS department
FROM staff s
LEFT JOIN doctors doc           ON s.AMKA = doc.AMKA
LEFT JOIN (
    SELECT dd.doctor_AMKA, GROUP_CONCAT(dep.name SEPARATOR ', ') AS dept_name
    FROM doctor_departments dd
    JOIN departments dep ON dd.dept_id = dep.dept_id
    GROUP BY dd.doctor_AMKA
) dd                            ON doc.AMKA = dd.doctor_AMKA
LEFT JOIN nurses n              ON s.AMKA = n.AMKA
LEFT JOIN departments dep_n     ON n.dept_id = dep_n.dept_id
LEFT JOIN admin_staff a         ON s.AMKA = a.AMKA
LEFT JOIN departments dep_a     ON a.dept_id = dep_a.dept_id
WHERE (
    -- Ανήκει στο συγκεκριμένο τμήμα
    EXISTS (SELECT 1 FROM doctor_departments dd2 WHERE dd2.doctor_AMKA = s.AMKA AND dd2.dept_id = @target_dept)
    OR n.dept_id = @target_dept
    OR a.dept_id = @target_dept
)
AND NOT EXISTS (
    SELECT NULL
    FROM shift_staffing ss
    JOIN shifts sh ON ss.shift_id = sh.shift_id
    WHERE ss.staff_AMKA = s.AMKA
      AND sh.shift_date = @target_date
      AND sh.dept_id    = @target_dept
)
ORDER BY s.staff_type, s.last_name;
