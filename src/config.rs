use serde::Deserialize;
use serde::Serialize;
use std::fs;
use std::io::Error;
use toml;

#[derive(Deserialize, Serialize, Clone)]
pub struct Config {
    pub database: Database,
    pub website: Website,
    pub service: Service,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Database {
    pub uri: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Website {
    pub name: String,
    pub icon: Option<String>,
    pub background: Option<String>,
    pub copyright: Option<String>,
    pub beian: Option<String>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Service {
    pub host: String,
    pub secret_key: String,
}

pub fn config_load() -> Result<Config, Error> {
    match fs::metadata("./Lanyue.toml") {
        Ok(_) => {
            let toml_str = fs::read_to_string("./Lanyue.toml").unwrap();
            let conf: Config = toml::from_str(&toml_str).unwrap();
            Ok(conf)
        }
        Err(e) => Err(e),
    }
}
