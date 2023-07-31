CREATE TABLE IF NOT EXISTS category
(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    cover TEXT,
    name TEXT UNIQUE,
    alias TEXT UNIQUE,
    description TEXT,
    type INTEGER,
    status INTEGER,
    sort INTEGER
);