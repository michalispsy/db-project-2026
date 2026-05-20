+----+-------------+-------+--------+--------------------------------------------------+-------------------+---------+----------------------------+------+-------------+
| id | select_type | table | type   | possible_keys                                    | key               | key_len | ref                        | rows | Extra       |
+----+-------------+-------+--------+--------------------------------------------------+-------------------+---------+----------------------------+------+-------------+
|  1 | SIMPLE      | doc   | index  | PRIMARY                                          | PRIMARY           | 44      | <null>                     | 300  |             |
|  1 | SIMPLE      | s     | eq_ref | PRIMARY                                          | PRIMARY           | 44      | ygeiopolis.doc.amka        | 1    | Using where |
|  1 | SIMPLE      | dr    | ref    | uni_admission_doctor_duplicate,fk_doc_rating_doc | fk_doc_rating_doc | 44      | ygeiopolis.doc.amka        | 1    |             |
|  1 | SIMPLE      | a     | eq_ref | PRIMARY                                          | PRIMARY           | 4       | ygeiopolis.dr.admission_id | 1    |             |
|  1 | SIMPLE      | ar    | eq_ref | PRIMARY                                          | PRIMARY           | 4       | ygeiopolis.dr.admission_id | 1    |             |
+----+-------------+-------+--------+--------------------------------------------------+-------------------+---------+----------------------------+------+-------------+
