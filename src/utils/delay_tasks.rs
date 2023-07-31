use delay_timer::prelude::*;
use smol::Timer;
use std::time::Duration;
use super::cache;
use crate::model::article::{CacheNums, ArticleOperate};
use chrono::Local;
use serde::{Deserialize, Serialize};
use sqlx::ty_match;
use crate::CONF;

pub async fn tasks_build() -> Result<TaskInstancesChain, TaskError> {
    let delay_timer = DelayTimerBuilder::default().build();
    let task_chain = delay_timer.insert_task(build_task_article_likes()?)?;
    Ok(task_chain)
}


fn build_task_article_likes() -> Result<Task, TaskError> {
    let mut task_builder = TaskBuilder::default();

    let body = || async {
        match cache::get::<CacheNums>("article_nums") {
            Some(nums) => {
                let con = nums.content;
                if con.len() != 0 {
                    for c in &con {
                        match ArticleOperate::update_nums(&c.clone()).await {
                            Ok(_) => {
                                Message::put(format!("article_id: {} update nums successful", c.id)).await;
                            },
                            Err(_) => {
                                Message::put(format!("article_id: {} update nums failed", c.id)).await;
                            }
                        }
                    }
                }
            },
            None => {
                Message::put(format!("article nums cache not fount")).await;
            }
        }
    };

    task_builder
        .set_task_id(1)
        .set_frequency_repeated_by_days(1)
        .set_maximum_parallel_runnable_num(2)
        .spawn_async_routine(body)
}


#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Info {
    pub messages: Vec<(String, String)>,
}

pub struct Message;

impl Message {
    pub async fn put(s: String) {
        let ts = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        match cache::get::<Info>("nums_info") {
            Some(info) => {
                let mut msgs = info.messages;
                if msgs.len() >= 1000 {
                    msgs.clear();
                };
                msgs.push((ts, s));
                let nums_info = Info {
                    messages: msgs,
                };
                cache::update("nums_info", nums_info, None).await;
            },
            None => {
                let mut msg: Vec<(String, String)> = Vec::new();
                msg.push((ts, s));
                let nums_info = Info {
                    messages: msg,
                };
                cache::put("nums_info", nums_info, None).await;
            }
        }
    }

    pub fn get() -> Option<Info> {
        cache::get::<Info>("nums_info")
    }
}