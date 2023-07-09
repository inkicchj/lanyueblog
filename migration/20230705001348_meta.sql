CREATE TABLE IF NOT EXISTS meta(
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, 
        view_num INT,
        like_num INT,
        comment_num INT,
        post_id INT NOT NULL UNIQUE,
        CONSTRAINT fk_post_id FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE ON UPDATE CASCADE
    );