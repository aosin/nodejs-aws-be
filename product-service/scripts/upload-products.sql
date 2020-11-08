BEGIN TRANSACTION;

DROP TABLE IF EXISTS json_product_list;
CREATE TEMP TABLE json_product_list (
    id UUID,
    title text,
    description text,
    price numeric(13, 2),
    "count" int
) ON COMMIT DROP;

INSERT INTO json_product_list
SELECT * FROM json_populate_recordset(null::json_product_list, %L);

TRUNCATE products CASCADE;
INSERT INTO products
SELECT id,
    title,
    description,
    (price * 100) AS price
FROM json_product_list;

TRUNCATE stocks CASCADE;
INSERT INTO stocks
SELECT id AS product_id,
    "count"
FROM json_product_list;

DROP TABLE json_product_list;

COMMIT;
