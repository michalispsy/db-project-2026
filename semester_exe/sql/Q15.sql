-- Q15: Κατανομή triage ανά επίπεδο επείγοντος με μέσο χρόνο αναμονής, ποσοστό νοσηλείας και κατανομή παραπομπών ανά τμήμα
WITH level_stats AS (
    SELECT
        t.urgency_level,
        COUNT(*)                                                     AS total_per_level,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.arrival_time,
                                        t.triage_time)), 1)         AS avg_wait_minutes,
        ROUND(SUM(t.outcome = 'Hospitalized') * 100.0
              / COUNT(*), 1)                                         AS hospitalization_pct
    FROM triages t
    WHERE t.triage_time IS NOT NULL
    GROUP BY t.urgency_level
)
SELECT
    t.urgency_level          AS level,
    ul.name                  AS level_name,
    COALESCE(d.name, 'Not Hospitalized') AS department_name,
    COUNT(*)                 AS cases_in_dept,
    ls.total_per_level,
    ls.avg_wait_minutes,
    ls.hospitalization_pct
FROM triages t
JOIN urgency_levels ul  ON t.urgency_level = ul.level
JOIN level_stats ls     ON t.urgency_level = ls.urgency_level
LEFT JOIN admissions a  ON t.admission_id  = a.admission_id
LEFT JOIN departments d ON a.department_id = d.dept_id
WHERE t.triage_time IS NOT NULL
GROUP BY t.urgency_level, ul.name, d.name,
         ls.total_per_level, ls.avg_wait_minutes, ls.hospitalization_pct
ORDER BY t.urgency_level, cases_in_dept DESC;
