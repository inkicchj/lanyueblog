use std::collections::HashMap;
use std::env::args;
use tera::{from_value, to_value, Function, Result, Value, Filter};
use chrono::Local;
use visdom::Vis;
use pulldown_cmark;
use regex;
use crate::model::article::CacheNums;
use crate::utils::cache;

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
                    } else if minute_res >= 1 {
                        res.push_str(&format!("{}分钟前", minute_res)[..]);
                    } else {
                        res.push_str("几秒前");
                    }
                    Ok(to_value(res).unwrap())
                }
                Err(_) => Err("oops".into()),
            },
            None => Err("oops".into()),
        }
    })
}

pub fn pagination() -> impl Function {
    Box::new(move |args: &HashMap<String, Value>| -> Result<Value> {
        let pages = match args.get("pages") {
            Some(total_page) => from_value::<u32>(total_page.clone()).unwrap(),
            None => return Err("总页数未传入".into()),
        };
        let cur = match args.get("cur") {
            Some(current) => from_value::<u32>(current.clone()).unwrap(),
            None => return Err("总页数未传入".into()),
        };

        let col = 5 as u32;

        let mut pagination_list: Vec<String> = Vec::new();

        if pages <= col {
            for p in 1..pages+1 {
                let mut html = String::from("<a class='mdui-color-theme-100 mdui-ripple");
                if p == cur {
                    html.push_str(&format!(" page-active'>{}</a>", p));
                };
                if p != cur {
                    html.push_str(&format!("' href='.?page={}'>{}</a>", p, p))
                };
                pagination_list.push(html);
            };
        } else {
            let mut page_list: Vec<u32> = Vec::new();
            for p in 1..pages+1 {
                page_list.push(p)
            }

            let center = col / 2 + 1;

            let mut show_pages: Vec<u32> = Vec::new();
            if cur < center {
                show_pages.extend_from_slice(&page_list[0..(col as usize)]);
            } else if cur >= center && cur <= pages - center + 1 {
                show_pages.extend_from_slice(&page_list[(cur-center) as usize..((cur+center-1) as usize)]);
            } else if cur > pages - center + 1 {
                show_pages.extend_from_slice(&page_list[(pages-col) as usize..(pages as usize)]);
            };

            for p in show_pages.iter() {
                let mut html = String::from("<a class='mdui-color-theme-100 mdui-ripple");
                if *p == cur {
                    html.push_str(&format!(" page-active'>{}</a>", p));
                };
                if *p != cur {
                    html.push_str(&format!("' href='.?page={}'>{}</a>", p, p))
                };
                pagination_list.push(html);
            };
        };

        Ok(to_value(pagination_list).unwrap())
    })
}


pub fn markdown() -> impl Function {
    Box::new(move |args: &HashMap<String, Value>| -> Result<Value> {
        let md = match args.get("md") {
            Some(r) => r,
            None => return Err("markdown未传入".into()),
        };
        let id = match args.get("aid") {
            Some(r) => r,
            None => return Err("article_id未传入".into()),
        };
        let tp = match args.get("type") {
            Some(r) => r,
            None => return Err("article_type未传入".into()),
        };
        let md = from_value::<String>(md.clone()).unwrap();
        let parse_input = pulldown_cmark::Parser::new(&md[..]);
        let mut parse_output = String::new();
        pulldown_cmark::html::push_html(&mut parse_output, parse_input);
        let root = Vis::load(parse_output).unwrap();
        let img = root.find("img");
        let mut srcs: Vec<String> = Vec::new();
        for (i, mut node) in img.into_iter().enumerate() {
            // node.set_attribute("onclick", Some("look(this)"));
            let index = i.to_string();
            if tp == "Activity" {
                let src = node.get_attribute("src").unwrap().to_string();
                srcs.push(src);
            } else {
                node.set_attribute("id", Some(&format!("image-{}-{}", id, index)[..]));
            }
        };
        if tp == "Activity" {
            Ok(to_value(srcs).unwrap())
        } else {
            Ok(to_value(root.outer_html()).unwrap())
        }

    })
}


pub fn book_info() -> impl Function {
    Box::new(move |args: &HashMap<String, Value>| -> Result<Value> {
        let info = match args.get("data") {
            Some(r) => from_value::<String>(r.clone()).unwrap(),
            None => return Err("数据未传入".into()),
        };

        let info_regex = regex::Regex::new("@author:(.*)@summary:(.*)").unwrap();
        let mut result: Vec<&str> = Vec::new();
        for (_, [author, summary]) in info_regex.captures_iter(&info).map(|c| c.extract()) {
            result.push(author);
            result.push(summary);
        }
        Ok(to_value(result).unwrap())

    })
}

pub fn book_content() -> impl Function {
    Box::new(move |args: &HashMap<String, Value>| -> Result<Value> {
        let info = match args.get("data") {
            Some(r) => from_value::<String>(r.clone()).unwrap(),
            None => return Err("数据未传入".into()),
        };

        let data_split = info.split("@end").collect::<Vec<&str>>();
        let mut result: Vec<(String, String)> = Vec::new();
        for d in data_split {
            let info_regex = regex::Regex::new(r"@name:(.*)@text:([\s\S]*)").unwrap();

            for (_, [name, text]) in info_regex.captures_iter(d).map(|c| c.extract()) {
                result.push((name.to_string(), text.to_string()));
            }
        }
        Ok(to_value(result).unwrap())
    })
}


pub fn push_str() -> impl Filter {
    Box::new(move |value: &Value, args: &HashMap<String, Value>| -> Result<Value> {
        let mut value = from_value::<String>(value.clone()).unwrap();

        let start = if let Some(r) = args.get("start") {
            from_value::<String>(r.clone()).unwrap()
        } else {
            String::from("")
        };

        let end = if let Some(r) = args.get("end") {
            from_value::<String>(r.clone()).unwrap()
        } else {
            String::from("")
        };
        value.insert_str(0, &start);
        value.push_str(&end);
        Ok(to_value(value).unwrap())
    })
}


pub fn get_article_nums() -> impl Filter {
    Box::new(move |value: &Value, args: &HashMap<String, Value>| -> Result<Value> {
        let num = from_value::<i32>(value.clone()).unwrap();

        let aid = if let Some(r) = args.get("id") {
            from_value::<i32>(r.clone()).unwrap()
        } else {
            return Err("id未传入".into())
        };

        let mode = if let Some(r) = args.get("mode") {
            from_value::<u8>(r.clone()).unwrap()
        } else {
            return Err("mode未传入".into())
        };

        match cache::get::<CacheNums>("article_nums") {
            Some(nums) => {
                let mut having: Vec<usize> = Vec::new();
                for index in 0..nums.content.len() {
                    if aid == nums.content[index].id {
                        having.push(index);
                    }
                };
                if having.len() == 0 {
                    Ok(to_value(num).unwrap())
                } else {
                    if mode == 0 {
                        let likes = nums.content[having[0]].likes;
                        Ok(to_value(likes).unwrap())
                    } else {
                        let views = nums.content[having[0]].views;
                        Ok(to_value(views).unwrap())
                    }
                }
            },
            None => return Ok(to_value(num).unwrap()),
        }
    })
}


