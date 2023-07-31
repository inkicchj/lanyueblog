CREATE TABLE IF NOT EXISTS article
(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    cover TEXT,
    title TEXT,
    alias TEXT UNIQUE ,
    description TEXT,
    content TEXT,
    type INTEGER,
    status INTEGER,
    created INTEGER,
    updated INTEGER,
    allow_comment INTEGER,
    likes INTEGER,
    views INTEGER,
    user_id INTEGER,
    category_id INTEGER,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX ar_user_id ON article(user_id);
CREATE INDEX ar_category_id ON article(category_id);