-- Q08: Προσωπικό χωρίς προγραμματισμένη εφημερία για συγκεκριμένη εβδομάδα
SELECT
    s.AMKA,
    s.first_name,
    s.last_name,
    s.staff_type,
    COALESCE(doc.rank, n.rank, a.position)        AS role,
    COALESCE(
        dd.dept_name,
        dep_n.name,
        dep_a.name
    )                                           AS department
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
WHERE NOT EXISTS (
    SELECT NULL
    FROM shift_staffing ss
    JOIN shifts sh ON ss.shift_id = sh.shift_id
    WHERE ss.staff_AMKA = s.AMKA
      AND sh.shift_date BETWEEN '2026-01-05' AND '2026-01-11'
)
ORDER BY s.staff_type, s.last_name;
