pub mod api;
pub mod view;
pub mod model;
pub mod server;
pub mod config;
pub mod utils;

use salvo::prelude::{Text, Response, Depot};
use salvo::http::header;
use sqlx::{Pool, Sqlite, sqlite::SqlitePoolOptions};
use lazy_static::lazy_static;
use tera::{Tera, Context};
use config::{config_load, Config};
use serde::Serialize;
use std::mem::MaybeUninit;
use std::sync::{Arc, Mutex};
use validator::{Validate, ValidationErrorsKind};
use utils::block::get_user;
use utils::html::{moment, parse_role, parse_status, have_page, img_onclick};

pub type Db = Pool<Sqlite>;

lazy_static! {
    pub static ref TERA: Tera = {
        let mut tera = Tera::new("views/**/*").unwrap();
        tera.register_function("moment", moment());
        tera.register_function("parse_role", parse_role());
        tera.register_function("parse_status", parse_status());
        tera.register_function("have_page", have_page());
        tera.register_function("img_onclick", img_onclick());
        tera
    };
    static ref CONF: Config = config_load().unwrap();
}


static mut DB: MaybeUninit<Arc<Mutex<Pool<Sqlite>>>> = MaybeUninit::uninit();

pub struct Data;

impl Data {
    pub async fn set() {
        unsafe {
            let db = SqlitePoolOptions::new().max_connections(50).connect(&CONF.database.uri).await.unwrap();
            DB.as_mut_ptr().write(Arc::new(Mutex::new(db)));
        }
    }

    pub fn get() -> Pool<Sqlite>{
        let arc = unsafe {
            &*DB.as_mut_ptr()
        };
        let mu = &*arc.clone();
        let db = &*mu.lock().unwrap();
        db.to_owned()
    }
}


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

    pub fn render(&mut self, temp: &str, depot: &mut Depot, res: &mut Response,) {
        self.context.insert("web", &self.conf.website);
        self.context.insert("service", &self.conf.service);
        let user = get_user(depot);
        self.context.insert("user", &user);
        let html = self.tera.render(temp, &self.context).unwrap();
        res.headers_mut().insert(
            header::CONTENT_TYPE,
            header::HeaderValue::from_static("text/html; charset=utf-8"),
        );
        res.render(Text::Html(html));
    }
}


pub struct Validator;

impl Validator {
    pub fn validate<T>(data: T) -> std::result::Result<T, Vec<String>>
    where T: Validate
    {
        match data.validate() {
            Ok(_) => Ok(data),
            Err(errs) =>{
                let mut v: Vec<String> = Vec::new();
                for (_s, kind) in errs.into_errors() {
                    if let ValidationErrorsKind::Field(e) = kind {
                        for i in e {
                            v.push(i.message.unwrap().to_string())
                        }
                    }
                }
                Err(v)
            }
        }
    }
}

