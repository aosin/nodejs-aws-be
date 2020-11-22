CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN TRANSACTION;
DROP TABLE IF EXISTS products cascade;
CREATE TABLE IF NOT EXISTS products(
        id uuid DEFAULT uuid_generate_v4(),
        title text not null,
        description text,
        price int,
        image_url text,
        PRIMARY KEY (id)
);
DROP TABLE IF EXISTS stocks cascade;
CREATE TABLE IF NOT EXISTS stocks(
        product_id uuid not null UNIQUE,
        "count" int not null,
        FOREIGN KEY (product_id) REFERENCES products (id)
);
COMMIT TRANSACTION;
