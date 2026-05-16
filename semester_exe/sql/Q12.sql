-- Q12: Απαιτούμενος αριθμός προσωπικού ανά τμήμα και ανά βάρδια για συγκεκριμένη εβδομάδα, με ανάλυση ανά υποκλάση προσωπικού.
SET @target_week = '2026-05-11';
SELECT
    d.name AS department_name,
    ws.shift_date AS date,
    ws.shift_slot AS shift,
    CASE 
        WHEN doc.AMKA IS NOT NULL THEN 'Ιατρός'
        WHEN n.AMKA IS NOT NULL THEN 'Νοσηλευτής'
        WHEN adm.AMKA IS NOT NULL THEN 'Διοικητικός'
    END AS staff_type,
    COALESCE(doc.specialty, n.rank, adm.position) AS role,
    COUNT(ss.staff_AMKA) AS staff_count
FROM shifts ws
JOIN departments d ON ws.dept_id = d.dept_id
JOIN shift_staffing ss ON ws.shift_id = ss.shift_id
LEFT JOIN doctors doc ON ss.staff_AMKA = doc.AMKA
LEFT JOIN nurses n ON ss.staff_AMKA = n.AMKA
LEFT JOIN admin_staff adm ON ss.staff_AMKA = adm.AMKA
WHERE ws.shift_date BETWEEN @target_week AND DATE_ADD(@target_week, INTERVAL 6 DAY)
GROUP BY d.name, ws.shift_date, ws.shift_slot, staff_type, role
ORDER BY ws.shift_date, d.name, ws.shift_slot;
