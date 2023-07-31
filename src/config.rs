use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::io::Error;
use toml;
use lazy_static::lazy_static;

lazy_static!{
    pub static ref CONF: Config = config_load().unwrap();
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Config {
    pub database: Database,
    pub website: Website,
    pub service: Service,
    pub cache: Cache,
    pub attachment: Attachment,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Database {
    pub uri: String,
    pub max_connect: u32,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Website {
    pub name: String,
    pub icon: Option<String>,
    pub background: Option<String>,
    pub copyright: Option<String>,
    pub beian: Option<String>,
    pub avatar: Option<String>,
    pub register: Option<bool>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Service {
    pub host: String,
    pub secret_key: String,
    pub max_secs: u64,
    pub access_api_key: String,
    pub access_secret_key: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Cache {
    pub counter: i32,
    pub capacity: i32,
    pub weight: i32,
    pub max_secs: u64,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Attachment {
    pub allow_ext: Vec<String>,
    pub require_thumbnail: Vec<String>,
    pub resize_thumbnail: i32,
    pub save_dir: String,
    pub thumbnail_extend: String,
    pub max_size: u64,
    pub avatar_dir: String,
    pub cover_dir: String,
    pub parallel: i32,
    pub max_files: i32,
    pub cate_cover_dir: String,
}


fn config_load() -> Result<Config, Error> {
    match fs::metadata("./Lanyue.toml") {
        Ok(_) => {
            let toml_str = fs::read_to_string("./Lanyue.toml").unwrap();
            let conf: Config = toml::from_str(&toml_str).unwrap();
            Ok(conf)
        }
        Err(e) => Err(e),
    }
}
