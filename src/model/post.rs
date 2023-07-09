use super::Data;
use chrono::Local;
use serde::{Deserialize, Serialize};
use sqlx::{self, Decode, FromRow};
use validator::{Validate, ValidationError};

// type: pushed, draft, web
#[derive(Serialize, Debug, FromRow, Clone)]
pub struct Post {
    pub id: Option<i32>,
    pub cover: Option<String>,
    pub title: Option<String>,
    pub summay: Option<String>,
    pub content: Option<String>,
    pub created: Option<i64>,
    pub modified: Option<i64>,
    pub r#type: Option<String>,
    pub status: Option<i8>,
    pub user_id: Option<i32>,
    pub item_id: Option<i32>,
    pub allow_comment: Option<i8>,
    pub username: Option<String>,
    pub avatar: Option<String>,
    pub name: Option<String>,
    pub view_num: Option<i32>,
    pub like_num: Option<i32>,
    pub comment_num: Option<i32>,
}

impl Post {
    pub async fn insert_one(user_id: i32, post: NewPost) -> Result<u64, &'static str> {
        let res = sqlx::query(
           " INSERT INTO post (cover, title, summary, content, type, status, allow_comment, created, modified, user_id, item_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ").bind(post.cover.unwrap())
           .bind(post.title.unwrap())
           .bind(post.summay.unwrap())
           .bind(post.content.unwrap())
           .bind(post.r#type.unwrap())
           .bind(post.status.unwrap())
           .bind(post.allow_comment.unwrap_or(1))
           .bind(Local::now().timestamp())
           .bind(Local::now().timestamp())
           .bind(user_id)
           .bind(post.item_id.unwrap())
           .execute(&Data::get())
           .await
           .map(|r| r.rows_affected() )
           .map_err(|_| "新建文章失败")?;
        Ok(res)
    }

    pub async fn update_one(id: i32, post: NewPost) -> Result<u64, &'static str> {
        let res = sqlx::query("
            UPDATE post SET
            cover=$1,
            title=$2,
            summary=$3,
            content=$4,
            type=$5,
            status=$6,
            allow_comment=$7,
            modified=$8,
            item_id=$9
            WHERE id = $10
            ")
            .bind(post.cover.unwrap())
            .bind(post.title.unwrap())
            .bind(post.summay.unwrap())
            .bind(post.content.unwrap())
            .bind(post.r#type.unwrap())
            .bind(post.status.unwrap())
            .bind(post.allow_comment.unwrap_or(1))
            .bind(Local::now().to_rfc3339())
            .bind(post.item_id.unwrap())
            .bind(id)
            .execute(&Data::get())
            .await
            .map(|r| r.rows_affected() )
            .map_err(|_| "更新文章失败")?;
        Ok(res)
    }

    pub async fn delete_one(id: i32) -> Result<u64, &'static str> {
        let res = sqlx::query("DELETE FROM post WHERE id=$1")
            .bind(id)
            .execute(&Data::get())
            .await
            .map(|r| r.rows_affected())
            .map_err(|_| "删除文章失败")?;
        Ok(res)
    }

    pub async fn view_list(filter: ListPost) -> Result<Vec<Post>, &'static str> {
        let post = sqlx::query_as::<_, Post>("
        SELECT * FROM post 
        LEFT JOIN user ON post.user_id = user.id 
        LEFT JOIN item ON post.item_id = item.id 
        LEFT JOIN meta ON post.id = meta.post_id
        WHERE post.type = 'publish'
        AND post.status = $1
        AND user.status = 1
        AND post.title LIKE $2
        ORDER BY modified DESC
        LIMIT $3, 30
        ")
            .bind(filter.status.unwrap_or(1))
            .bind(format!("%{}%", filter.title.unwrap_or("".to_string())))
            .bind((filter.page.unwrap_or(1) - 1) * 30)
            .fetch_all(&Data::get())
            .await.unwrap();
        Ok(post)
    }

    pub async fn view_list_in_user_info(id:i32, filter: ListPostByUser) -> Result<Vec<Post>, &'static str> {
        let post = sqlx::query_as::<_, Post>("
        SELECT * FROM post
        LEFT JOIN user ON post.user_id = user.id
        LEFT JOIN item ON post.item_id = item.id
        LEFT JOIN meta ON post.id = meta.post_id
        WHERE post.type = 'publish'
        AND post.status = 1
        AND post.user_id = $1
        ORDER BY modified DESC
        LIMIT $2, 10
        ")
            .bind(id)
            .bind((filter.page.unwrap_or(1) - 1) * 10)
            .fetch_all(&Data::get())
            .await.unwrap();
        Ok(post)
    }

    pub async fn view_one(id: i32) -> Result<Post, &'static str> {
        let post = sqlx::query_as::<_, Post>("
        SELECT * FROM post 
        LEFT JOIN user ON post.user_id = user.id 
        LEFT JOIN item ON post.item_id = item.id 
        LEFT JOIN meta ON post.id = meta.post_id
        WHERE post.type = 'publish' AND post.status = 1 AND user.status = 1 AND post.id = $1
        ")
        .bind(id)
        .fetch_one(&Data::get())
        .await.unwrap();
        Ok(post)
    }
}

#[derive(Validate, Serialize, Deserialize, Clone)]
pub struct NewPost {
    #[validate(url(message="url链接格式不正确"))]
    pub cover: Option<String>,
    #[validate(required(message="标题不能为空"), length(min=2, max=50, message="标题字数为2-50"))]
    pub title: Option<String>,
    #[validate(length(max=120, message="摘要字数不能超过50"))]
    pub summay: Option<String>,
    #[validate(required(message="正文不能为空"))]
    pub content: Option<String>,
    #[validate(required(message="类型不能为空"), custom="validate_type")]
    pub r#type: Option<String>,
    #[validate(required(message="状态不能为空"), custom="validate_status")]
    pub status: Option<i8>,
    #[validate(required(message="分类不能为空"))]
    pub item_id: Option<i32>,
    #[validate(required(message="是否允许评论不能为空"))]
    pub allow_comment: Option<i8>,
}

#[derive(Validate, Serialize, Deserialize, Clone)]
pub struct ListPost{
    pub status: Option<i8>,
    pub title: Option<String>,
    pub page: Option<i32>,
}

#[derive(Validate, Serialize, Deserialize, Clone)]
pub struct ListPostByUser{
    pub page: Option<i32>,
}


fn validate_type(r#type: &str) -> Result<(), ValidationError> {
    match r#type {
        "publish" => Ok(()),
        "draft" => Ok(()),
        "page" => Ok(()),
        _ => Err(ValidationError::new("文章类型错误")),
    }
}

fn validate_status(status: i8) -> Result<(), ValidationError> {
    match status {
        1 => Ok(()),
        2 => Ok(()),
        0 => Ok(()),
        _ => Err(ValidationError::new("状态错误")),
    }
}
