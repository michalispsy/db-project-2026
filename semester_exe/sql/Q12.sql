-- Απαιτούμενος αριθμός προσωπικού ανά τμήμα και ανά βάρδια για συγκεκριμένη εβδομάδα, με ανάλυση ανά υποκλάση προσωπικού.
SET @target_week = '2026-05-11';
WITH weekly_shifts AS (
    SELECT shift_id, shift_date, shift_slot, dept_id
    FROM shifts
    WHERE shift_date BETWEEN @target_week AND DATE_ADD(@target_week, INTERVAL 6 DAY)
),
all_staff_roles AS (
    SELECT AMKA, specialty AS role, 'Doctor' AS category FROM doctors
    UNION ALL
    SELECT AMKA, `rank` AS role, 'Nurse' AS category FROM nurses
    UNION ALL
    SELECT AMKA, position AS role, 'Admin' AS category FROM admin_staff
)
SELECT
    d.name AS Department,
    ws.shift_date AS Date,
    ws.shift_slot AS Shift,
    asr.category AS Staff_Type,
    asr.role AS Subclass,
    COUNT(ss.staff_AMKA) AS Required_Staff_Count
FROM weekly_shifts ws
JOIN departments d ON ws.dept_id = d.dept_id
JOIN shift_staffing ss ON ws.shift_id = ss.shift_id
JOIN all_staff_roles asr ON ss.staff_AMKA = asr.AMKA
GROUP BY d.name, ws.shift_date, ws.shift_slot, asr.category, asr.role
ORDER BY ws.shift_date, d.name, ws.shift_slot;
