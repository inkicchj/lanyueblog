use std::path::Path;
use anyhow::{anyhow, Result};
use crate::CONF;
use std::fs;
use chrono::{Datelike, Local};
use crypto::digest::Digest;
use image::io::Reader as ImageReader;
use salvo::http::form::FilePart;
use crypto::md5::Md5;

pub struct FileSave<'a> {
    file: &'a FilePart,
    id: i32,
    path: &'a str,
    result: String,
}

impl<'a> FileSave<'a> {
    pub fn new(id: i32, file: &'a FilePart, path: &'a str) -> Self {
        Self {id, file, path, result: String::new()}
    }

    pub async fn save(&mut self) -> Result<(String, Option<String>)> {
        if self.file.size() > CONF.attachment.max_size {
            let conf_size = (CONF.attachment.max_size / 1024 / 1024) as f64;
            return Err(anyhow!("附件大于{}M,无法上传", conf_size));
        };

        let name_full = self.file.name().unwrap().to_string().to_lowercase();
        let name_split: Vec<&str> = name_full.split(".").collect();
        let extend = &name_split[name_split.len()-1..][0];

        if !CONF.attachment.allow_ext.contains(&extend.to_string()) {
            return Err(anyhow!("扩展名必须为{:#?}", CONF.attachment.allow_ext));
        }

        let file_path = self.build();
        let dir_split: Vec<&str> = file_path.split("/").collect();
        let dir = dir_split[0..dir_split.len()-1].join("/");
        if fs::metadata(&dir).is_err() {
            fs::create_dir_all(&dir)?;
        };

        match fs::copy(&self.file.path(), Path::new(&file_path)) {
            Ok(_) => {
                if CONF.attachment.require_thumbnail.contains(&extend.to_string()) {
                    let path_split: Vec<&str> = file_path.split(".").collect();
                    let mut th_path = path_split[0..path_split.len()-1].join(".");
                    th_path.push_str(&CONF.attachment.thumbnail_extend);
                    th_path.push_str(".");
                    th_path.push_str(path_split[path_split.len()-1..][0]);
                    image_resize(&file_path, &th_path).await.unwrap();
                    return Ok((file_path, Some(th_path)))
                };
                return Ok((file_path, None))
            },
            Err(_) => Err(anyhow!("附件上传出错")),
        }
    }

    fn build(&mut self) -> String {
        let mut replace: Vec<(&str, String)> = Vec::new();
        let positions = self.find_position();
        for pos in positions {
            match &self.path[pos.0..pos.1] {
                "year" => replace.push(("{year}", format!("{}",Local::now().year()))),
                "month" => replace.push(("{month}", format!("{}",Local::now().month()))),
                "ident" => {
                    let ident = format!("{}{}{}",
                                        self.file.name().unwrap(),
                                        self.file.size(),
                                        Local::now());
                    let mut hasher = Md5::new();
                    let mut buf = fs::read(self.file.path()).unwrap();
                    buf.extend(ident.as_bytes());
                    hasher.input(&buf);
                    replace.push(("{ident}", hasher.result_str()));
                },
                "ext" => {
                    let name_split = &self.file.name().unwrap().split(".").collect::<Vec<&str>>();
                    let ext = name_split[name_split.len()-1..][0];
                    replace.push(("{ext}", ext.to_string()));
                },
                "id_hash" => {
                    let mut hasher = Md5::new();
                    hasher.input(format!("{}", self.id).as_bytes());
                    replace.push(("{id_hash}", hasher.result_str()));
                },
                "id" => replace.push(("{id}", format!("{}", self.id))),
                _ => replace.push(("", "".to_string())),

            }
        }
        for parse in &replace {
            if self.result.is_empty() {
                self.result.push_str(&self.path.replace(parse.0, &parse.1));
            } else {
                let r = self.result.replace(parse.0, &parse.1);
                self.result.clear();
                self.result.push_str(&r);
            }
        }
        self.result.clone()
    }

    fn find_position(&self) -> Vec<(usize, usize)> {
        let mut positions: Vec<(usize,usize)> = Vec::new();
        for start in 0..self.path.len() {
            if &self.path[start..start+1] == "{" {
                for end in start+1..self.path.len() {
                    if &self.path[end..end+1] == "}" {
                        positions.push((start+1, end))
                    }
                }
            }
        };
        positions
    }

}




struct ImageSize{
    width: u32,
    height: u32,
}

impl ImageSize {
    fn new() -> Self {
        Self {width:0, height:0}
    }
}


async fn image_resize(path: &String, th_path: &String) -> Result<()> {
    let img = ImageReader::open(&path).unwrap().decode().unwrap();
    let resize_val = 1000;
    let mut s = ImageSize::new();
    if img.height() > img.width() {
        if img.width() > resize_val {
            let p = resize_val as f32 / img.width() as f32;
            s.width = resize_val;
            s.height = (img.height() as f32 * p) as u32
        } else {
            s.width = img.width();
            s.height = img.height();
        }
    } else if img.width() > img.height() {
        if img.height() > resize_val {
            let p = resize_val as f32 / img.height() as f32;
            s.height = resize_val;
            s.width = (img.width() as f32 * p) as u32
        } else {
            s.width = img.width();
            s.height = img.height();
        }
    }
    let th = img.thumbnail(s.width, s.height);
    th.save(th_path.clone()).unwrap();
    Ok(())
}
