-- Q15: Κατανομή triage ανά επίπεδο επείγοντος με μέσο χρόνο αναμονής,
--      ποσοστό νοσηλείας και κατανομή παραπομπών ανά τμήμα
SELECT
    t.urgency_level                                                         AS level,
    ul.name                                                                 AS level_name,
    COALESCE(d.name, 'Not Hospitalized')                                    AS department,
    COUNT(*)                                                                AS cases_in_dept,
    SUM(COUNT(*)) OVER (PARTITION BY t.urgency_level)                       AS total_per_level,
    ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.arrival_time, t.triage_time))
          OVER (PARTITION BY t.urgency_level), 1)                           AS avg_wait_minutes,
    ROUND(
        SUM(CASE WHEN t.outcome = 'Hospitalized' THEN 1 ELSE 0 END)
            OVER (PARTITION BY t.urgency_level)
        / SUM(COUNT(*)) OVER (PARTITION BY t.urgency_level) * 100
    , 1)                                                                    AS hospitalization_pct
FROM triages t
JOIN urgency_levels ul ON t.urgency_level = ul.level
LEFT JOIN admissions a  ON t.admission_id = a.admission_id
LEFT JOIN departments d ON a.department_id = d.dept_id
WHERE t.triage_time IS NOT NULL
GROUP BY t.urgency_level, ul.name, d.name
ORDER BY t.urgency_level, cases_in_dept DESC;
