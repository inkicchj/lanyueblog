use super::super::Data;
use chrono::Local;
use salvo::http::form::FilePart;
use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};
use crypto::md5::Md5;
use std::fs;
use std::io::Read;
use std::process::id;
use crypto::digest::Digest;
use super::Pagination;
use anyhow::Result;

#[derive(FromRow, Clone, Serialize, Default)]
pub struct File {
    pub id: i32,
    pub size: i64,
    pub name: String,
    pub preview: String,
    pub thumbnail: Option<String>,
    pub uploaded: i64,
    pub user_id: i32,
    pub article_id: Option<i32>,
}

#[derive(FromRow, Clone, Serialize, Default)]
pub struct FileRender {
    pub id: i32,
    pub size: i64,
    pub name: String,
    pub preview: String,
    pub thumbnail: Option<String>,
    pub uploaded: i64,
    pub user_id: i32,
    pub user_nickname: String,
    pub article_id: Option<i32>,
    pub article_title: Option<String>,
    pub article_alias: Option<String>,
}

impl File {
    pub fn new(file: &FilePart, user_id: i32, article_id: Option<i32>) -> Self {
        Self {
            size: file.size() as i64,
            name: file.name().unwrap().to_string(),
            uploaded: Local::now().timestamp(),
            user_id,
            article_id,
            ..Default::default()
        }
    }
}


pub struct FileOperate;

impl FileOperate {
    pub async fn create_one(file: &File) -> Result<File> {
        let sql = r##"
            INSERT INTO file (size,name,preview,thumbnail,uploaded,user_id,article_id)
            VALUES (?,?,?,?,?,?,?)
        "##;
        let result = sqlx::query(sql)
            .bind(file.size)
            .bind(file.name.clone())
            .bind(file.preview.clone())
            .bind(file.thumbnail.clone())
            .bind(file.uploaded)
            .bind(file.user_id)
            .bind(file.article_id)
            .execute(&Data::get())
            .await?;
        let mut f = file.clone();
        f.id = result.last_insert_rowid() as i32;
        Ok(f)
    }

    pub async fn update_with_article(id: i32, article_id: i32) -> Result<u64> {
        let sql = "UPDATE file SET article_id=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(article_id)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn delete_one(id: i32) -> Result<u64> {
        let sql = "DELETE FROM file";
        let mut builder = sqlx::QueryBuilder::new(sql);
        builder.push(" WHERE id=").push_bind(id);
        let result = builder.build()
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn find_one(id: i32) -> Result<File> {
        let sql = r##"
            SELECT f.*,u.nickname as user_nickname,a.title as article_title,a.alias as article_alias FROM file as f
            LEFT JOIN user as u ON f.user_id = u.id
            LEFT JOIN article as a ON f.article_id = a.id
        "##;
        let mut builder = sqlx::QueryBuilder::new(sql);
        builder.push(" WHERE f.id=").push_bind(id);
        let file = builder.build_query_as()
            .fetch_one(&Data::get()).await?;
        Ok(file)
    }

    pub async fn find_many(page: Option<u32>) -> Result<Pagination<Vec<FileRender>>> {
        let sql = r##"
            SELECT f.*,u.nickname as user_nickname,a.title as article_title,a.alias as article_alias FROM file as f
            LEFT JOIN user as u ON f.user_id = u.id
            LEFT JOIN article as a ON f.article_id = a.id
            ORDER BY uploaded DESC
        "##;
        let count_sql = "SELECT count(*) FROM file";
        let mut builder = sqlx::QueryBuilder::new(sql);
        let mut builder_count = sqlx::QueryBuilder::new(count_sql);
        builder.push(" LIMIT 15 OFFSET ").push_bind((page.unwrap_or(1)-1)*15);
        let files: Vec<FileRender> = builder.build_query_as().fetch_all(&Data::get()).await?;
        let count: (i64,) = builder_count.build_query_as()
            .fetch_one(&Data::get()).await?;
        Ok(Pagination::new(count.0 as u32, page.unwrap_or(1), files))
    }

    pub async fn find_many_with_article(aid:i32) -> Result<Vec<File>> {
        let sql = r##"
            SELECT * FROM file WHERE article_id=
        "##;
        let mut builder = sqlx::QueryBuilder::new(sql);
        builder.push_bind(aid);
        let files: Vec<File> = builder.build_query_as().fetch_all(&Data::get()).await?;
        Ok(files)
    }
}

#[derive(Serialize, Deserialize)]
pub struct FileDeleteById {
    pub id: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct FileManyByArticle {
    pub article_id: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct FileUpdateByArticle {
    pub aid: Option<i32>,
}