CREATE TABLE IF NOT EXISTS post(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, 
        cover VARCHAR(256),
        title VARCHAR(128) UNIQUE,
        summay TEXT,
        content TEXT,
        created INT(10),
        modified INT(10),
        type VARCHAR(16),
        status INT(1) ,
        allow_comment INT(1),
        user_id INT NOT NULL,
        item_id INT NOT NULL,
        CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_item_id FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE SET NULL ON UPDATE CASCADE
    );