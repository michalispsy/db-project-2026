-- Q13: Ιεραρχία εποπτείας του, από τον άμεσο επόπτη έως τον Διευθυντή, με ένδειξη του επιπέδου σε κάθε βαθμίδα
WITH RECURSIVE supervisor_hierarchy AS (
    SELECT
        d.amka AS leaf_amka,
        d.supervisor_amka AS next_supervisor_amka,
        CAST(CONCAT(s_leaf.first_name, ' ', s_leaf.last_name) AS VARCHAR(100)) AS doctor_name,
        CASE WHEN d.supervisor_amka IS NULL THEN 1 ELSE 2 END AS level,
        CAST(CASE WHEN d.supervisor_amka IS NULL THEN '/' ELSE CONCAT('/', s_sup.first_name, ' ', s_sup.last_name, '/') END AS VARCHAR(500)) AS hierarchy_path
    FROM doctors d
    JOIN staff s_leaf ON d.amka = s_leaf.amka
    LEFT JOIN staff s_sup ON d.supervisor_amka = s_sup.amka
    UNION ALL
    SELECT
        sh.leaf_amka,
        d.supervisor_amka,
        sh.doctor_name,
        sh.level + 1,
        CONCAT('/', s.first_name, ' ', s.last_name, sh.hierarchy_path)
    FROM supervisor_hierarchy sh
    INNER JOIN doctors d ON sh.next_supervisor_amka = d.amka
    INNER JOIN staff s ON d.supervisor_amka = s.amka
    WHERE d.supervisor_amka IS NOT NULL
)
SELECT
    doctor_name,
    hierarchy_path
    level,
FROM (
    SELECT *, ROW_NUMBER() OVER(PARTITION BY leaf_amka ORDER BY level DESC) as `number`
    FROM supervisor_hierarchy
) ranked_hierarchy
WHERE `number` = 1
ORDER BY hierarchy_path, doctor_name;
