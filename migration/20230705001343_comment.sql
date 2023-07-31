CREATE TABLE IF NOT EXISTS comment
(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    avatar TEXT,
    email TEXT,
    nickname TEXT,
    link TEXT,
    content TEXT,
    created INTEGER,
    status INTEGER,
    ip TEXT,
    agent TEXT,
    article_id INTEGER,
    from_user_id INTEGER,
    to_user_id INTEGER,
    owner_id INTEGER,
    parent_id INTEGER,
    reply_id INTEGER,
    CONSTRAINT fk_from_user_id FOREIGN KEY (from_user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_to_user_id FOREIGN KEY (to_user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_article_id FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX co_from_user_id ON comment(from_user_id);
CREATE INDEX co_to_user_id ON comment(to_user_id);
CREATE INDEX co_article_id ON comment(article_id);
CREATE INDEX co_owner_id ON comment(owner_id);