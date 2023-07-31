use std::f32::consts::E;
use std::process::id;
use super::super::{Data, CONF};
use chrono::Local;
use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow, Type};
use validator::{Validate, ValidationError};
use super::Pagination;
use anyhow::{anyhow, Result};
use crate::model::category;
use crate::utils::cache;

#[derive(Default, Type, Serialize, Deserialize, PartialEq, Debug, Clone)]
#[repr(u8)]
pub enum Status {
    #[default]
    // 活动
    Publish = 1,
    // 审核
    Review = 2,
    // 草稿,
    Draft = 3,
    // 垃圾箱
    Brush = 4,
}

impl From<&str> for Status {
    fn from(value: &str) -> Self {
        match value {
            "Publish" => Status::Publish,
            "Review" => Status::Review,
            "Draft" => Status::Draft,
            "Brush" => Status::Brush,
            _ => Status::Draft,
        }
    }
}

#[derive(Default, Type, Serialize, Deserialize, PartialEq, Debug, Clone)]
#[repr(u8)]
pub enum Types {
    #[default]
    // 博文
    Blog = 1,
    // 页面
    Page = 2,
    // 书录
    Book = 3,
    // 动态,
    Activity = 4,
    // 链接
    Link = 5,
}

impl From<&str> for Types {
    fn from(value: &str) -> Self {
        match value {
            "Blog" => Types::Blog,
            "Page" => Types::Page,
            "Book" => Types::Book,
            "Activity" => Types::Activity,
            "Link" => Types::Link,
            _ => Types::Blog,
        }
    }
}

// type: pushed, draft, web
#[derive(Serialize, Deserialize, FromRow, Default, Clone)]
pub struct Article {
    pub id: i32,
    pub cover: Option<String>,
    pub title: String,
    pub alias: Option<String>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub created: i64,
    pub updated: i64,
    pub r#type: Types,
    pub status: Status,
    pub allow_comment: u8,
    pub likes: i32,
    pub views: i32,
    pub user_id: i32,
    pub category_id: Option<i32>,
}

impl Article {
    pub fn new(user_id: i32, article: NewArticle) -> Self {
        let c = || {
            if Types::from(article.r#type.unwrap()) == Types::Page {
                None
            } else {
                article.category_id
            }
        };
        let alias = || {
            match article.alias {
                Some(a) => {
                    if a == "" {
                        None
                    } else {
                        Some(a)
                    }
                }
                None => None
            }
        };
        Self {
            cover: article.cover,
            title: article.title.unwrap(),
            alias: alias(),
            description: article.description,
            content: article.content,
            r#type: Types::from(article.r#type.unwrap()),
            allow_comment: article.allow_comment.unwrap(),
            status: Status::from(article.status.unwrap()),
            user_id,
            category_id: c(),
            ..Default::default()
        }
    }
}

#[derive(Serialize, Deserialize, FromRow, Default, Debug, Clone)]
pub struct ArticleByVisit {
    pub id: Option<i32>,
    pub cover: Option<String>,
    pub title: Option<String>,
    pub alias: Option<String>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub created: Option<i64>,
    pub updated: Option<i64>,
    pub r#type: Option<Types>,
    pub status: Option<Status>,
    pub allow_comment: Option<u8>,
    pub comments: Option<i32>,
    pub likes: Option<i32>,
    pub views: Option<i32>,
    pub user_id: Option<i32>,
    pub user_avatar: Option<String>,
    pub user_nickname: Option<String>,
    pub category_id: Option<i32>,
    pub category_name: Option<String>,
    pub category_alias: Option<String>,
}

pub struct ArticleOperate;

impl ArticleOperate {
    pub async fn exists_alias(alias: Option<String>) -> Result<bool> {
        if let Some(ali) = alias {
            let mut builder = sqlx::QueryBuilder::new("SELECT COUNT(*) FROM article WHERE alias=");
            builder.push_bind(ali);
            let count: (i64, ) = builder.build_query_as()
                .fetch_one(&Data::get())
                .await?;
            Ok(count.0 > 0)
        } else {
            Ok(false)
        }
    }

    pub async fn create_one(user_id: i32, article: NewArticle<'_>) -> Result<i64> {
        let mut content = Article::new(user_id, article);
        if ArticleOperate::exists_alias(content.alias.clone()).await.unwrap() {
            return Err(anyhow!("该别名已存在"));
        }
        content.created = Local::now().timestamp();
        content.updated = Local::now().timestamp();

        let sql = r##"
            INSERT INTO article (cover,title,alias,description,content,created,updated,type,status,user_id,category_id, allow_comment, likes, views)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        "##;
        match sqlx::query(sql)
            .bind(content.cover)
            .bind(content.title)
            .bind(content.alias)
            .bind(content.description)
            .bind(content.content)
            .bind(content.created)
            .bind(content.updated)
            .bind(content.r#type)
            .bind(content.status)
            .bind(content.user_id)
            .bind(content.category_id)
            .bind(content.allow_comment)
            .bind(content.likes)
            .bind(content.views)
            .execute(&Data::get())
            .await {
            Ok(r) => {
                Ok(r.last_insert_rowid())
            }
            Err(e) => {
                Err(anyhow!("新建文章失败"))
            }
        }
    }

    pub async fn find_one(id: Option<i32>, alias: Option<String>, status: Option<Status>) -> Result<ArticleByVisit> {
        let sql = r##"
        SELECT a.*,u.avatar as user_avatar,u.nickname as user_nickname,c.name as category_name,c.alias as category_alias,count(co.id) as comments
        FROM article as a
        LEFT JOIN user as u ON a.user_id=u.id
        LEFT JOIN category as c ON a.category_id=c.id
        LEFT JOIN comment as co ON co.article_id = a.id
        "##;
        let mut builder = sqlx::QueryBuilder::new(sql);
        if let Some(s) = status {
            builder.push(" WHERE a.status=").push_bind(s);
            if let Some(c) = id {
                builder.push(" AND a.id=").push_bind(c);
            } else {
                builder.push(" AND a.alias=").push_bind(alias);
            };
        } else {
            if let Some(c) = id {
                builder.push(" WHERE a.id=").push_bind(c);
            } else {
                builder.push(" WHERE a.alias=").push_bind(alias);
            };
        }

        let article: ArticleByVisit = builder.build_query_as()
            .fetch_one(&Data::get())
            .await?;
        Ok(article)
    }

    pub async fn find_many(filter: ListArticle<'_>, page: Option<u32>) -> Result<Pagination<Vec<ArticleByVisit>>> {
        let sql = r##"
            SELECT a.*,u.avatar as user_avatar,u.nickname as user_nickname,c.name as category_name,c.alias as category_alias,comments
            FROM article as a
            LEFT JOIN user as u ON a.user_id=u.id
            LEFT JOIN category as c ON a.category_id=c.id
            LEFT JOIN (SELECT co.article_id, count(co.id) as comments from comment as co GROUP BY co.article_id) s ON s.article_id=a.id
        "##;
        let mut builder = sqlx::QueryBuilder::new(sql);
        let count_sql = "SELECT count(a.id) FROM article as a LEFT JOIN category as c ON a.category_id=c.id";
        let mut builder_count = sqlx::QueryBuilder::new(count_sql);
        builder.push(" WHERE a.title LIKE ")
            .push_bind(format!("%{}%", &filter.title.as_ref().unwrap_or(&"".to_string())));
        builder_count.push(" WHERE a.title LIKE ")
            .push_bind(format!("%{}%", &filter.title.as_ref().unwrap_or(&"".to_string())));
        if let Some(t) = filter.r#type {
            builder.push(" AND a.type=").push_bind(Types::from(t));
            builder_count.push(" AND a.type=").push_bind(Types::from(t));
        };
        if let Some(s) = filter.status {
            builder.push(" AND a.status=").push_bind(Status::from(s));
            builder_count.push(" AND a.status=").push_bind(Status::from(s));
        };
        if let Some(m) = filter.category_id {
            builder.push(" AND a.category_id=").push_bind(m);
            builder_count.push(" AND a.category_id=").push_bind(m);
        };
        if let Some(cate_status) = filter.category_type {
            builder.push(" AND c.type=").push_bind(category::Types::from(cate_status));
            builder_count.push(" AND c.type=").push_bind(category::Types::from(cate_status));
        }
        if let Some(no_type) = filter.no_type {
            builder.push(" AND a.type!=").push_bind(Types::from(no_type));
            builder_count.push(" AND a.type!=").push_bind(Types::from(no_type));
        }

        builder.push(" ORDER BY updated DESC LIMIT 15 OFFSET ")
            .push_bind((page.unwrap_or(1) - 1) * 15);
        let data = builder.build_query_as().fetch_all(&Data::get()).await?;
        let total: (i64, ) = builder_count.build_query_as()
            .fetch_one(&Data::get()).await?;
        Ok(Pagination::new(total.0 as u32, page.unwrap_or(1), data))
    }


    pub async fn find_many_with_page() -> Result<Vec<Article>> {
        let sql = r##"
            SELECT a.*,u.avatar as user_avatar,u.nickname as user_nickname,c.name as category_name,c.alias as category_alias,comments
            FROM article as a
            LEFT JOIN user as u ON a.user_id=u.id
            LEFT JOIN category as c ON a.category_id=c.id
            LEFT JOIN (SELECT co.article_id, count(co.id) as comments from comment as co GROUP BY co.article_id) s ON s.article_id=a.id
            WHERE a.type=
        "##;
        let mut builder = sqlx::QueryBuilder::new(sql);
        builder.push_bind(Types::Page);
        builder.push(" AND a.status=").push_bind(Status::Publish);
        builder.push(" ORDER BY a.updated ASC");
        let result = builder.build_query_as::<Article>()
            .fetch_all(&Data::get())
            .await?;
        Ok(result)
    }

    pub async fn update_one(id: i32, con: NewArticle<'_>) -> Result<i64> {
        let ali = if let Some(ali) = con.alias.clone() {
            if ali == "" {
                None
            } else {
                Some(ali)
            }
        } else {
            None
        };
        if let Ok(article) = ArticleOperate::find_one(Some(id), ali.clone(), None).await {
            if article.alias != ali {
                if ArticleOperate::exists_alias(ali).await.unwrap() {
                    return Err(anyhow!("该别名已存在"));
                }
            }
        }
        let sql = r##"
            UPDATE article
            SET cover=?,title=?,alias=?,description=?,content=?,updated=?,type=?,category_id=?,status=?,allow_comment=?
            WHERE id=?
        "##;
        match sqlx::query(sql)
            .bind(con.cover)
            .bind(con.title)
            .bind(con.alias)
            .bind(con.description)
            .bind(con.content)
            .bind(Local::now().timestamp())
            .bind(Types::from(con.r#type.unwrap()))
            .bind(con.category_id)
            .bind(Status::from(con.status.unwrap()))
            .bind(con.allow_comment)
            .bind(id)
            .execute(&Data::get())
            .await {
            Ok(r) => {
                Ok(id as i64)
            }
            Err(_) => {
                Err(anyhow!("更新内容失败"))
            }
        }
    }

    pub async fn set_status(id: i32, status: UpdateStatus<'_>) -> Result<u64> {
        let sql = "UPDATE article SET status=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(Status::from(status.content.unwrap()))
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn delete_one(id: i32) -> Result<u64> {
        let sql = "DELETE FROM article WHERE id=";
        let mut builder = sqlx::QueryBuilder::new(sql);
        builder.push_bind(id);
        match builder.build().execute(&Data::get()).await {
            Ok(r) => {
                Ok(r.rows_affected())
            }
            Err(_) => {
                Err(anyhow!("删除文章失败"))
            }
        }
    }

    pub async fn update_nums(nums: &LikesAndViews) -> Result<u64> {
        let sql = "UPDATE article SET likes=?,views=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(nums.likes)
            .bind(nums.views)
            .bind(nums.id)
            .execute(&Data::get())
            .await?;
        if result.rows_affected() == 1 {
            Ok(result.rows_affected())
        } else {
            Err(anyhow!("更新likes失败"))
        }
    }

    pub async fn sum_nums() -> Result<(i64, i64)> {
        let sql = "SELECT sum(views),sum(likes) FROM article";
        let result: (i64, i64) = sqlx::query_as(sql).fetch_one(&Data::get()).await?;
        Ok(result)
    }

    pub async fn cache_nums(article: &mut ArticleByVisit, mode: NumsMode) -> LikesAndViews {
        if let NumsMode::ViewsAddOne = mode {
            let views = article.views.unwrap() + 1;
            let mut lv = LikesAndViews {
                id: article.id.unwrap(),
                views: article.views.unwrap(),
                likes: article.likes.unwrap(),
            };
            match cache::get::<CacheNums>("article_nums") {
                Some(mut nums) => {
                    let mut con = nums.content;
                    let mut having: Vec<usize> = Vec::new();
                    for index in 0..con.len() {
                        if con[index].id == article.id.unwrap() {
                            having.push(index);
                        }
                    }
                    if having.len() == 0 {
                        lv.views = views;
                        con.push(lv.clone());
                    } else if having.len() == 1 {
                        con[having[0]].views += 1;
                        lv.views = con[having[0]].views;
                        lv.likes = con[having[0]].likes;
                    }
                    let cache_nums = CacheNums {
                        content: con
                    };
                    cache::update("article_nums", cache_nums, None).await;
                    lv
                }
                None => {
                    let mut con = Vec::new();
                    lv.views = views;
                    con.push(lv.clone());
                    let cache_nums = CacheNums {
                        content: con
                    };
                    cache::put("article_nums", cache_nums, None).await;
                    lv
                }
            }
        } else {
            let mut lv = LikesAndViews {
                id: article.id.unwrap(),
                ..Default::default()
            };
            if let Some(nums) = cache::get::<CacheNums>("article_nums") {
                let mut con = nums.content;
                let mut having: Vec<usize> = Vec::new();
                for index in 0..con.len() {
                    if con[index].id == article.id.unwrap() {
                        having.push(index);
                    }
                }
                if having.len() == 0 {
                    lv
                } else {
                    match mode {
                        NumsMode::LikesAddOne => con[having[0]].likes += 1,
                        NumsMode::LikesSubOne => {
                            if con[having[0]].likes > 0 {
                                con[having[0]].likes -= 1
                            }
                        },
                        _ => {}
                    };
                    lv.likes = con[having[0]].likes;
                    lv.views = con[having[0]].views;
                    let cache_nums = CacheNums {
                        content: con
                    };
                    cache::update("article_nums", cache_nums, None).await;
                    lv
                }

            } else {
                lv
            }
        }
    }
}

pub enum NumsMode {
    ViewsAddOne,
    LikesAddOne,
    LikesSubOne,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct LikesAndViews {
    pub id: i32,
    pub likes: i32,
    pub views: i32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CacheNums {
    pub content: Vec<LikesAndViews>,
}

#[derive(Validate, Serialize, Deserialize, Clone)]
pub struct NewArticle<'a> {
    #[validate(length(max = 200, message = "封面字数不超过200"))]
    pub cover: Option<String>,
    #[validate(length(max = 50, message = "标题字数不超过50"))]
    pub title: Option<String>,
    #[validate(length(max = 50, message = "别名字数不能超过50"))]
    pub alias: Option<String>,
    #[validate(length(max = 200, message = "描述字数不能超过200"))]
    pub description: Option<String>,
    pub content: Option<String>,
    #[validate(required(message = "类型不能为空"), custom = "validate_type_by_create")]
    pub r#type: Option<&'a str>,
    #[validate(required(message = "状态不能为空"), custom = "validate_status_by_create")]
    pub status: Option<&'a str>,
    pub category_id: Option<i32>,
    #[validate(required(message = "是否允许评论不能为空"))]
    pub allow_comment: Option<u8>,
}

fn validate_type_by_create(t: &str) -> std::result::Result<(), ValidationError> {
    match t {
        "Blog" => Ok(()),
        "Page" => Ok(()),
        "Book" => Ok(()),
        "Activity" => Ok(()),
        "Link" => Ok(()),
        _ => Err(ValidationError::new("不存在的类型")),
    }
}

fn validate_status_by_create(status: &str) -> std::result::Result<(), ValidationError> {
    match status {
        "Publish" => Ok(()),
        "Review" => Ok(()),
        "Draft" => Ok(()),
        _ => Err(ValidationError::new("不存在的状态")),
    }
}

#[derive(Validate, Serialize, Deserialize, Clone)]
pub struct ListArticle<'s> {
    pub r#type: Option<&'s str>,
    pub status: Option<&'s str>,
    pub category_id: Option<i32>,
    pub title: Option<String>,
    pub category_type: Option<&'s str>,
    pub no_type: Option<&'s str>,
}


#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdateStatus<'a> {
    #[validate(required, custom = "validate_status_by_update")]
    pub content: Option<&'a str>,
}


fn validate_status_by_update(status: &str) -> std::result::Result<(), ValidationError> {
    match status {
        "Publish" => Ok(()),
        "Review" => Ok(()),
        "Draft" => Ok(()),
        "Brush" => Ok(()),
        _ => Err(ValidationError::new("不存在的状态")),
    }
}