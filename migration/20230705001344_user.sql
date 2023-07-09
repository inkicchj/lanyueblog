CREATE TABLE IF NOT EXISTS user ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, 
        email VARCHAR(64) NOT NULL UNIQUE, 
        password VARCHAR(512) NOT NULL, 
        username VARCHAR(32) NOT NULL UNIQUE, 
        signature VARCHAR(64), 
        status INT(1), 
        created INT(10),
        logined INT(10),
        avatar VARCHAR(256),
        background VARCHAR(256),
        role VARCHAR(16)
    );

