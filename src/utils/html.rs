use std::collections::HashMap;
use tera::{from_value, to_value, Function, Result, Value};
use chrono::Local;
use visdom::Vis;

pub fn moment() -> impl Function {
    Box::new(move |args: &HashMap<String, Value>| -> Result<Value> {
        match args.get("time") {
            Some(val) => match from_value::<i64>(val.clone()) {
                Ok(tp01) => {
                    let minute = 60;
                    let hour = 60 * minute;
                    let day = 24 * hour;
                    let mouth = 30 * day;
                    let year = 12 * mouth;
                    let tp02 = Local::now().timestamp();
                    let diff_value = tp02 - tp01;
                    let minute_res = diff_value / minute;
                    let hour_res = diff_value / hour;
                    let day_res = diff_value / day;
                    let mouth_res = diff_value / mouth;
                    let year_res = diff_value / year;
                    let mut res = String::new();
                    if year_res >= 1 {
                        res.push_str(&format!("{}年前", year_res)[..]);
                    } else if mouth_res >= 1 {
                        res.push_str(&format!("{}月前", mouth_res)[..]);
                    } else if day_res >= 1 {
                        res.push_str(&format!("{}天前", day_res)[..]);
                    } else if hour_res >= 1 {
                        res.push_str(&format!("{}小时前", hour_res)[..]);
                    }  else if minute_res >= 1 {
                        res.push_str(&format!("{}分钟前", minute_res)[..]);
                    } else {
                        res.push_str("刚刚");
                    }
                    Ok(to_value(res).unwrap())
                }
                Err(_) => Err("oops".into()),
            },
            None => Err("oops".into()),
        }
    })
}

pub fn parse_role() -> impl Function {
    Box::new(move |args: &HashMap<String, Value>| -> Result<Value> {
        match args.get("role") {
            Some(r) => match from_value::<String>(r.clone()) {
                Ok(r) => match &r[..] {
                    "superadmin" => Ok(to_value("超级管理员").unwrap()),
                    "admin" => Ok(to_value("管理员").unwrap()),
                    "genaral" => Ok(to_value("普通用户").unwrap()),
                    _ => Err("oops".into()),
                },
                Err(_) => Err("oops".into()),
            },
            None => Err("oops".into()),
        }
    })
}

pub fn parse_status() -> impl Function {
    Box::new(move |args: &HashMap<String, Value>| -> Result<Value> {
        match args.get("status") {
            Some(r) => match from_value::<i32>(r.clone()) {
                Ok(r) => match r {
                    1 => Ok(to_value("活动").unwrap()),
                    2 => Ok(to_value("限制").unwrap()),
                    0 => Ok(to_value("封禁").unwrap()),
                    _ => Err("oops".into()),
                },
                Err(_) => Err("oops".into()),
            },
            None => Err("oops".into()),
        }
    })
}

pub fn have_page() -> impl Function {
    Box::new(move |args: &HashMap<String, Value>| -> Result<Value> {
        let url = match args.get("url") {
            Some(r) => r,
            None => return Err("no args".into()),
        };
        let url_str = from_value::<String>(url.clone()).unwrap();
        let li01: Vec<&str> = url_str.split("?").collect();
        if li01.len() <= 1 {
            return Ok(to_value(1).unwrap());
        } else {
            let queries = li01[1].to_string();
            let li02: Vec<&str> = queries.split("&").collect();
            let mut count = Vec::new();
            for item in li02.iter() {
                if item.to_string().contains("page=") {
                    count.push(item[5..].parse::<i32>().unwrap());
                }
            }
            if count.len() == 0 {
                return Ok(to_value(1).unwrap());
            } else {
                return Ok(to_value(count[0]).unwrap());
            }
   
        }
    })
}

pub fn img_onclick() -> impl Function {
    Box::new(move | args: &HashMap<String, Value> | -> Result<Value>{
        let h = match args.get("html")  {
            Some(r) => r,
            None => return Err("html参数未传入".into()),
        }; 
        let html = from_value::<String>(h.clone()).unwrap();
        let root = Vis::load(html).unwrap();
        let img = root.find("img");
        for (i, mut node) in img.into_iter().enumerate() {
            node.set_attribute("onclick", Some("look(this)"));
            let index = i.to_string();
            node.set_attribute("id", Some(&format!("img{}", index)[..]));
            node.set_attribute("style", Some("width: 100%;"));
        };
        Ok(to_value(root.outer_html()).unwrap())
    })
}
