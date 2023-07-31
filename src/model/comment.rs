use super::super::Data;
use chrono::Local;
use serde::{Deserialize, Serialize};
use sqlx;
use validator::{Validate, ValidationError};
use anyhow::{anyhow, Result};
use json::from;
use super::Pagination;

#[derive(Default, sqlx::Type, Serialize, Deserialize, PartialEq, Clone)]
#[repr(u8)]
pub enum Status {

    // 发布
    Publish = 1,
    // 审核
    #[default]
    Review = 2,
    // 垃圾箱,
    Brush = 3,
}

impl From<&str> for Status {
    fn from(value: &str) -> Self {
        match value {
            "Publish" => Status::Publish,
            "Review" => Status::Review,
            "Brush" => Status::Brush,
            _ => Status::Review,
        }
    }
}

#[derive(Serialize, Deserialize, sqlx::FromRow, Default)]
pub struct Comment {
    pub id: i32,
    pub avatar: Option<String>,
    pub email: String,
    pub nickname: String,
    pub link: Option<String>,
    pub content: String,
    pub created: i64,
    pub status: Status,
    pub ip: String,
    pub agent: String,
    pub article_id: i32,
    pub owner_id: i32,
    pub from_user_id: Option<i32>,
    pub to_user_id: Option<i32>,
    pub parent_id: Option<i32>,
    pub reply_id: Option<i32>,
}

#[derive(Serialize, Deserialize, sqlx::FromRow, Default, Debug)]
pub struct CommentByArticle {
    pub id: i32,
    pub avatar: Option<String>,
    pub nickname: String,
    pub link: Option<String>,
    pub content: String,
    pub created: i64,
    pub parent_id: Option<i32>,
    pub reply_id: Option<i32>,
    pub from_user_id: Option<i32>,
    pub to_user_id: Option<i32>,
}

#[derive(Serialize, Deserialize, sqlx::FromRow, Default)]
pub struct CommentByAdmin {
    pub id: i32,
    pub avatar: Option<String>,
    pub email: String,
    pub nickname: String,
    pub link: String,
    pub content: String,
    pub created: i64,
    pub status: Status,
    pub ip: String,
    pub agent: String,
    pub article_id: i32,
    pub article_title: String,
    pub from_user_id: Option<i32>,
}


impl Comment {
    pub fn new(new_remark: NewComment) -> Self {
        Self {
            avatar: new_remark.avatar,
            email: new_remark.email.unwrap(),
            nickname: new_remark.nickname.unwrap(),
            link: new_remark.link,
            content: new_remark.content.unwrap(),
            created: Local::now().timestamp(),
            owner_id: new_remark.owner_id.unwrap(),
            article_id: new_remark.article_id.unwrap(),
            parent_id: new_remark.parent_id,
            reply_id: new_remark.reply_id,
            to_user_id: new_remark.to_user_id,
            from_user_id: new_remark.from_user_id,
            ip: new_remark.ip.unwrap_or("".to_string()),
            agent: new_remark.agent.unwrap_or("".to_string()),
            ..Default::default()
        }
    }
}


pub struct CommentOperate;

impl CommentOperate {
    pub async fn create_one(new_remark: NewComment, status: Option<Status>) -> Result<CommentByArticle> {
        let mut remark = Comment::new(new_remark.clone());
        if let Some(s) = status {
            remark.status = s;
        }
        let result = sqlx::query(r##"
            INSERT INTO comment (avatar, nickname, email, link, content, created, status, ip, agent, from_user_id, to_user_id, owner_id, article_id, parent_id, reply_id)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        "##)
            .bind(remark.avatar)
            .bind(remark.nickname)
            .bind(remark.email)
            .bind(remark.link)
            .bind(remark.content)
            .bind(remark.created)
            .bind(remark.status)
            .bind(remark.ip)
            .bind(remark.agent)
            .bind(remark.from_user_id)
            .bind(remark.to_user_id)
            .bind(remark.owner_id)
            .bind(remark.article_id)
            .bind(remark.parent_id)
            .bind(remark.reply_id)
            .execute(&Data::get())
            .await?;
        let comment = CommentByArticle {
            id: result.last_insert_rowid() as i32,
            avatar: new_remark.avatar,
            nickname: new_remark.nickname.unwrap(),
            link: new_remark.link,
            content: new_remark.content.unwrap(),
            created: remark.created,
            parent_id: new_remark.parent_id,
            reply_id: new_remark.reply_id,
            from_user_id: new_remark.from_user_id,
            to_user_id: new_remark.to_user_id,
        };
        Ok(comment)
    }

    pub async fn find_one(id: i32) -> Result<Comment> {
        let sql = "SELECT * FROM comment WHERE id=?";
        let remark: Comment = sqlx::query_as(sql).bind(id).fetch_one(&Data::get()).await?;
        Ok(remark)
    }

    pub async fn delete_one(id: i32) -> Result<u64> {
        let mut tx = Data::get().begin().await?;
        let sql = "DELETE FROM comment";
        let mut builder = sqlx::QueryBuilder::new(sql);
        builder.push(" WHERE id=").push_bind(id);
        let remark = CommentOperate::find_one(id).await?;
        if remark.parent_id == None {
            if let Err(_) = sqlx::query("DELETE FROM comment WHERE parent_id=?")
                .bind(id)
                .execute(&mut tx)
                .await {
                tx.rollback().await?;
                return Err(anyhow!("删除失败"));
            }
        };
        if let Err(_) = sqlx::query("DELETE FROM comment WHERE reply_id=?")
            .bind(id)
            .execute(&mut tx)
            .await {
            tx.rollback().await?;
            return Err(anyhow!("删除失败"));
        }
        let result = match builder.build().execute(&mut tx).await {
            Ok(r) => r.rows_affected(),
            Err(_) => {
                tx.rollback().await?;
                return Err(anyhow!("删除失败"));
            }
        };
        tx.commit().await?;
        Ok(result)
    }

    pub async fn find_many_with_article(cid: i32, page: Option<u32>) -> Result<Pagination<Vec<CommentByArticle>>> {
        let sql = r##"
            SELECT * FROM comment
        "##;
        let count_sql = "SELECT count(*) FROM comment";
        let mut builder = sqlx::QueryBuilder::new(sql);
        let mut builder_count = sqlx::QueryBuilder::new(count_sql);
        builder.push(" WHERE article_id=").push_bind(cid);
        builder.push(" AND status=").push_bind(Status::Publish);
        builder_count.push(" WHERE article_id=").push_bind(cid);
        builder_count.push(" AND status=").push_bind(Status::Publish);
        let remarks: Vec<CommentByArticle> = builder.build_query_as().fetch_all(&Data::get()).await?;
        let total: (i64,) = builder_count.build_query_as()
            .fetch_one(&Data::get()).await?;
        Ok(Pagination::new(total.0 as u32, page.unwrap_or(1), remarks))
    }

    pub async fn find_many_with_admin(many: CommentFindMany<'_>, page: Option<u32>) -> Result<Pagination<Vec<CommentByAdmin>>> {
        let sql = r##"
            SELECT r1.*,c.title as article_title
            FROM comment as r1
            LEFT JOIN article as c
            ON r1.article_id=c.id
        "##;
        let mut count_sql = "SELECT count(*) FROM comment";
        let mut builder = sqlx::QueryBuilder::new(sql);
        let mut count_builder = sqlx::QueryBuilder::new(count_sql);
        if let Some(status) = many.status {
            builder.push(" WHERE r1.status=").push_bind(Status::from(status));
            count_builder.push(" WHERE status=").push_bind(Status::from(status));
        }
        builder.push(" LIMIT 15 OFFSET ").push_bind((page.unwrap_or(1)-1)*15);
        let remarks: Vec<CommentByAdmin> = builder.build_query_as().fetch_all(&Data::get()).await?;
        let total: (i64,) = count_builder.build_query_as().fetch_one(&Data::get()).await?;
        Ok(Pagination::new(total.0 as u32, page.unwrap_or(1), remarks))
    }

    pub async fn set_status(id: i32, status: UpdateStatus<'_>) -> Result<u64> {
        let sql = "UPDATE comment SET status=";
        let mut builder = sqlx::QueryBuilder::new(sql);
        builder.push_bind(Status::from(status.content.unwrap()));
        builder.push(" WHERE id=").push_bind(id);
        let result = builder.build()
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

}

#[derive(Serialize, Deserialize, Validate, Clone)]
pub struct NewComment {
    pub avatar: Option<String>,
    #[validate(required(message="昵称不能为空"), length(min=2, max=20, message="昵称字数为2-20"))]
    pub nickname: Option<String>,
    #[validate(required(message="邮箱不能为空"), email(message="邮箱格式错误"))]
    pub email: Option<String>,
    #[validate(url(message="网址格式不正确"))]
    pub link: Option<String>,
    #[validate(required(message="评论内容不能为空"), length(min=1, max=200, message="评论字数为1~200"))]
    pub content: Option<String>,
    pub ip: Option<String>,
    pub agent: Option<String>,
    pub from_user_id: Option<i32>,
    pub to_user_id: Option<i32>,
    #[validate(required)]
    pub owner_id: Option<i32>,
    #[validate(required)]
    pub article_id: Option<i32>,
    pub parent_id: Option<i32>,
    pub reply_id: Option<i32>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct CommentFindMany<'s> {
    #[validate(required, custom="validate_status")]
    pub status: Option<&'s str>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdateStatus<'s> {
    #[validate(required, custom="validate_status")]
    pub content: Option<&'s str>,
}

fn validate_status(status: &str) -> std::result::Result<(), ValidationError> {
    match status {
        "Publish" => Ok(()),
        "Review" => Ok(()),
        "Brush" => Ok(()),
        _ => Err(ValidationError::new("不存在的状态")),
    }
}

