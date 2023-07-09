CREATE TABLE IF NOT EXISTS item(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, 
        name VARCHAR(64) NOT NULL UNIQUE,
        count INT,
        type VARCHAR(16),
        status INT(1),
        parent_id INT
    );