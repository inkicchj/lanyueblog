#![allow(warnings, unused)]
pub mod api;
pub mod view;
pub mod model;
pub mod server;
pub mod config;
pub mod utils;

use salvo::prelude::{Text, Response, Depot, Request};
use salvo::http::header;
use sqlx::{Pool, Sqlite, sqlite::SqlitePoolOptions};
use lazy_static::lazy_static;
use tera::{Tera, Context};
use serde::{Deserialize, Serialize};
use std::mem::MaybeUninit;
use std::sync::{Arc, Mutex};
use validator::{Validate, ValidationErrorsKind};
use utils::block::get_user;
use utils::html::{moment, markdown, pagination, book_info, book_content, push_str, get_article_nums};
use config::CONF;

lazy_static! {
    pub static ref TERA: Tera = {
        let mut tera = Tera::new("views/**/*").unwrap();
        tera.register_function("moment", moment());
        tera.register_function("markdown", markdown());
        tera.register_function("pagination", pagination());
        tera.register_function("book_info", book_info());
        tera.register_function("book_content", book_content());
        tera.register_filter("add_str", push_str());
        tera.register_filter("get_nums", get_article_nums());
        tera
    };
}

// 数据库连接操作
static mut DB: MaybeUninit<Arc<Mutex<Pool<Sqlite>>>> = MaybeUninit::uninit();

pub struct Data;

impl Data {
    pub async fn set() {
        unsafe {
            let db = SqlitePoolOptions::new()
                .max_connections(CONF.database.max_connect)
                .connect(&CONF.database.uri)
                .await
                .unwrap();
            DB.as_mut_ptr().write(Arc::new(Mutex::new(db)));
        }
    }

    pub fn get() -> Pool<Sqlite> {
        let arc = unsafe {
            &*DB.as_mut_ptr()
        };
        let mu = &*arc.clone();
        let db = &*mu.lock().unwrap();
        db.to_owned()
    }
}

// 页面渲染引擎
pub struct Render<'a> {
    context: Context,
    tera: &'a TERA,
    conf: &'a CONF,
}

impl<'a> Render<'a> {
    pub fn new() -> Self {
        Self {
            context: Context::new(),
            tera: &TERA,
            conf: &CONF,
        }
    }

    pub fn insert<T: Serialize + ?Sized, S: Into<String>>(mut self, k: S, v: &T) -> Self {
        self.context.insert(k, v);
        self
    }

    pub fn render(&mut self, temp: &str, depot: &mut Depot, res: &mut Response) {
        self.context.insert("web", &self.conf.website);
        self.context.insert("file", &self.conf.attachment);
        self.context.insert("server", &self.conf.service);
        self.context.insert("user", &get_user(depot));
        let url = depot.get::<String>("url");
        if let Some(u) = url {
            let urls = u.split("/").collect::<Vec<&str>>();
            let url_res = format!("/{}", urls[3..urls.len()].join("/"));
            self.context.insert("url", &url_res);
        }

        let html = self.tera.render(temp, &self.context).unwrap();
        res.headers_mut().insert(
            header::CONTENT_TYPE,
            header::HeaderValue::from_static("text/html; charset=utf-8"),
        );
        res.render(Text::Html(html));
    }
}


// 数据校验
pub struct Validator;

impl Validator {
    pub fn validate<T>(data: T) -> Result<T, Vec<String>>
        where T: Validate
    {
        match data.validate() {
            Ok(_) => Ok(data),
            Err(errs) => {
                let mut v: Vec<String> = Vec::new();
                for (_s, kind) in errs.into_errors() {
                    if let ValidationErrorsKind::Field(e) = kind {
                        for i in e {
                            if i.message.is_some() {
                                v.push(i.message.unwrap().to_string())
                            } else {
                                v.push("数据验证失败".to_string())
                            }

                        }
                    }
                }
                Err(v)
            }
        }
    }
}