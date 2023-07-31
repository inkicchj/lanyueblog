CREATE TABLE IF NOT EXISTS file
(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    name INTEGER,
    size INT,
    preview TEXT,
    thumbnail TEXT,
    uploaded INTEGER,
    user_id INTEGER,
    article_id INTEGER,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_article_id FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX fi_user_id ON file(user_id);
CREATE INDEX fi_article_id ON file(article_id);