use std::f32::consts::E;
use super::super::Data;
use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow, Type};
use validator::{Validate, ValidationError};
use lazy_static::lazy_static;
use regex::Regex;
use anyhow::{anyhow, Result};

lazy_static! {
    static ref ALIAS_PATTERN: Regex = Regex::new("^[0-9a-zA-Z-_]{2,50}$").unwrap();
}

#[derive(Default, Type, Serialize, Deserialize, Clone)]
#[repr(u8)]
pub enum Types {
    #[default]
    // 分类
    Category = 1,
    // 书录
    Header = 2,
}

impl From<&str> for Types {
    fn from(value: &str) -> Self {
        match value {
            "Category" => Types::Category,
            "Header" => Types::Header,
            _ => Types::Category,
        }
    }
}

#[derive(Default, Type, Serialize, Deserialize, PartialEq, Clone)]
#[repr(u8)]
pub enum Status {
    #[default]
    // 普通
    Common = 2,
    // 默认
    Default = 1,
}

impl From<&str> for Status {
    fn from(value: &str) -> Self {
        match value {
            "Common" => Status::Common,
            "Default" => Status::Default,
            _ => Status::Common,
        }
    }
}


#[derive(Deserialize, FromRow ,Default, Serialize, Clone)]
pub struct Category {
    pub id: i32,
    cover: String,
    name: String,
    alias: Option<String>,
    r#type: Types,
    status: Status,
    count: Option<i32>,
    sort: i32,
    description: Option<String>,
}


impl Category {
    pub fn new(category: NewCategory) -> Self {
        let alias = || {
            match category.alias {
                Some(a) => {
                    if a == "" {
                        None
                    } else {
                        Some(a)
                    }
                },
                None => None
            }
        };
        Self {
            name: category.name.unwrap(),
            alias: alias(),
            r#type: Types::from(category.r#type.unwrap()),
            sort: category.sort.unwrap_or(0),
            description: category.description,
            ..Default::default()
        }
    }
}

pub struct CategoryOperate;

impl CategoryOperate {
    pub async fn exists(name: String, alias: Option<String>) -> Result<bool> {
        let mut builder = sqlx::QueryBuilder::new("SELECT COUNT(*) FROM category WHERE name=");
        builder.push_bind(name);
        if let Some(n) = alias {
            builder.push(" OR alias=").push_bind(n);
        };
        let count: (i64, ) = builder.build_query_as()
            .fetch_one(&Data::get())
            .await?;
        Ok(count.0 > 0)
    }

    pub async fn create_one(cate: NewCategory<'_>) -> Result<i64> {



        let meta = Category::new(cate);
        if CategoryOperate::exists(
            meta.name.clone(),
            meta.alias.clone())
            .await
            .unwrap() {
            return Err(anyhow!("该名称或别名已存在"));
        }
        let sql = r##"
            INSERT INTO category (name, alias, type, description, status, sort)
            VALUES (?,?,?,?,?,?)
        "##;
        let mid = sqlx::query(sql)
            .bind(meta.name)
            .bind(meta.alias)
            .bind(meta.r#type)
            .bind(meta.description)
            .bind(meta.status)
            .bind(meta.sort)
            .execute(&Data::get())
            .await?;
        Ok(mid.last_insert_rowid())
    }

    pub async fn delete_one(id: i32) -> Result<u64> {
        let meta = CategoryOperate::find_one(id).await?;
        if let Status::Default = meta.status {
            return Err(anyhow!("默认分类不可被删除"));
        };
        let mut tx = Data::get().begin().await?;


        let default = CategoryOperate::find_one_by_default().await.unwrap();

        let _ = match sqlx::query("UPDATE article SET category_id=? WHERE category_id=?")
            .bind(default.id)
            .bind(id)
            .execute(&mut tx)
            .await {
            Ok(r) => r.rows_affected(),
            Err(_) => {
                tx.rollback().await.unwrap();
                return Err(anyhow!("删除分类失败"))
            }
        };

        let sql = "DELETE FROM category WHERE id=?";
        let result = match sqlx::query(sql).bind(id).execute(&mut tx).await {
            Ok(r) => r.rows_affected(),
            Err(_) => {
                tx.rollback().await.unwrap();
                return Err(anyhow!("删除分类失败"))
            }
        };

        match result {
            1 => {
                tx.commit().await?;
                Ok(result)
            },
            _ => {
                tx.rollback().await.unwrap();
                return Err(anyhow!("删除分类失败"));
            }
        }
    }

    pub async fn find_one(id: i32) -> Result<Category> {
        let sql = r##"
            SELECT cate.*,count FROM category as cate
            LEFT JOIN (
                SELECT a.category_id,count(*) as count FROM article as a
                WHERE a.category_id IS NOT NULL
                AND a.status=1
                GROUP BY a.category_id
            ) art ON art.category_id=cate.id
            WHERE cate.id=?
        "##;
        let meta: Category = sqlx::query_as(sql)
            .bind(id)
            .fetch_one(&Data::get())
            .await?;
        Ok(meta)
    }

    pub async fn find_one_by_alias(alias: String) -> Result<Category> {
        let sql = r##"
            SELECT cate.*,count FROM category as cate
            LEFT JOIN (
                SELECT a.category_id,count(*) as count FROM article as a
                WHERE a.category_id IS NOT NULL
                AND a.status=1
                GROUP BY a.category_id
            ) art ON art.category_id=cate.id
            WHERE cate.alias=?
        "##;
        let meta: Category = sqlx::query_as(sql)
            .bind(alias)
            .fetch_one(&Data::get())
            .await?;
        Ok(meta)
    }

    pub async fn find_one_by_default() -> Result<Category> {
        let sql = r##"
            SELECT cate.*,count FROM category as cate
            LEFT JOIN (
                SELECT a.category_id,count(*) as count FROM article as a
                WHERE a.category_id IS NOT NULL
                AND a.status=1
                GROUP BY a.category_id
            ) art ON art.category_id=cate.id
            WHERE cate.status=?
        "##;
        let meta: Category = sqlx::query_as(sql)
            .bind(Status::Default)
            .fetch_one(&Data::get())
            .await?;
        Ok(meta)
    }


    pub async fn find_many_with_category() -> Result<Vec<Category>> {
        let sql = r##"
            SELECT cate.*,count FROM category as cate
            LEFT JOIN (
                SELECT a.category_id,count(*) as count FROM article as a
                WHERE a.category_id IS NOT NULL
                AND a.status=1
                GROUP BY a.category_id
            ) art ON art.category_id=cate.id
            WHERE cate.type=?
            ORDER BY cate.sort ASC"##;
        let metas: Vec<Category> = sqlx::query_as(sql)
            .bind(Types::Category)
            .fetch_all(&Data::get())
            .await?;
        Ok(metas)
    }

    pub async fn find_many_with_header() -> Result<Vec<Category>> {
        let sql = r##"
            SELECT cate.*,count FROM category as cate
            LEFT JOIN (
                SELECT a.category_id,count(*) as count FROM article as a
                WHERE a.category_id IS NOT NULL
                AND a.status=1
                GROUP BY a.category_id
            ) art ON art.category_id=cate.id
            WHERE cate.type=?
            ORDER BY cate.sort ASC
        "##;
        let metas: Vec<Category> = sqlx::query_as(sql)
            .bind(Types::Header)
            .fetch_all(&Data::get())
            .await?;
        Ok(metas)
    }

    pub async fn find_many_with_all() -> Result<Vec<Category>> {
        let sql = r##"
            SELECT cate.*,count FROM category as cate
            LEFT JOIN (
                SELECT a.category_id,count(*) as count FROM article as a
                WHERE a.category_id IS NOT NULL
                AND a.status=1
                GROUP BY a.category_id
            ) art ON art.category_id=cate.id
            ORDER BY cate.sort ASC
            "##;
        let metas: Vec<Category> = sqlx::query_as(sql)
            .fetch_all(&Data::get())
            .await?;
        Ok(metas)
    }

    pub async fn update_one(id: i32, meta: NewCategory<'_>) -> Result<u64> {
        let alias = if let Some(ali) = meta.alias.clone() {
            if ali == "" {
                None
            } else {
                Some(ali)
            }
        } else {
            None
        };
        if let Ok(cate) = CategoryOperate::find_one(id).await {
            if cate.alias != alias {
                if CategoryOperate::exists(meta.name.clone().unwrap(), alias.clone()).await.unwrap() {
                    return Err(anyhow!("该名称或别名已存在"));
                };
            } else if cate.name != meta.name.clone().unwrap() {
                if CategoryOperate::exists(meta.name.clone().unwrap(), None).await.unwrap() {
                    return Err(anyhow!("该名称已存在"));
                };
            };
        }

        let sql = "UPDATE category SET name=?,alias=?,type=?,description=?,sort=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(meta.name)
            .bind(alias)
            .bind(Types::from(meta.r#type.unwrap()))
            .bind(meta.description)
            .bind(meta.sort)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn update_cover(id: i32, url: String) -> Result<u64> {
        let sql = "UPDATE category SET cover=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(url)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn set_default(id: i32) -> Result<u64> {
        let meta = CategoryOperate::find_one(id).await?;
        if Status::Default == meta.status {
            return Err(anyhow!("该分类已经为默认"));
        };
        let mut tx = Data::get().begin().await.unwrap();
        let sql = "UPDATE category SET status=? WHERE status=?";
        let _ = match sqlx::query(sql)
            .bind(Status::Common)
            .bind(Status::Default)
            .execute(&mut tx).await {
            Ok(r) => r,
            Err(_) => {
                tx.rollback().await?;
                return Err(anyhow!("设置分类为默认失败"));
            }
        };
        let sql = "UPDATE category SET status=? WHERE id=?";
        let result = match sqlx::query(sql)
            .bind(Status::Default)
            .bind(id)
            .execute(&mut tx).await {
                Ok(r) => r,
                Err(_) => {
                    tx.rollback().await.unwrap();
                    return Err(anyhow!("设置分类为默认失败"));
                }
        };
        match result.rows_affected() {
            1 => {
                tx.commit().await.unwrap();
                Ok(result.rows_affected())
            },
            _ => {
                tx.rollback().await.unwrap();
                return Err(anyhow!("设置分类为默认失败"));
            }
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct NewCategory<'s> {
    #[validate(required(message="名称不能为空"), length(min=2, max=50, message="名称长度为2-50"))]
    pub name: Option<String>,
    #[validate(regex(path="ALIAS_PATTERN", message="别名不包括汉字"), length(min=2, max=50, message="别名长度为2-50"))]
    pub alias: Option<String>,
    #[validate(required(message="类型不能为空"), custom="validate_type")]
    pub r#type: Option<&'s str>,
    #[validate(required)]
    pub sort: Option<i32>,
    #[validate(length(max=200, message="描述字数最大为200"))]
    pub description: Option<String>
}

fn validate_type(t: &str) -> std::result::Result<(), ValidationError> {
    match t {
        "Category" => Ok(()),
        "Header" => Ok(()),
        _ => Err(ValidationError::new("不存在的类型")),
    }
}
