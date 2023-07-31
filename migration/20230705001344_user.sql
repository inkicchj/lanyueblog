CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    avatar TEXT,
    cover TEXT,
    email TEXT NOT NULL UNIQUE,
    nickname TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    social TEXT,
    signature TEXT,
    status INT(10),
    created INT(10),
    logined INT(10),
    permission INT(10)
)

