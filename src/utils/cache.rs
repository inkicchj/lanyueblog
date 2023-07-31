use tinylfu_cached::cache::cached::CacheD;
use tinylfu_cached::cache::config::ConfigBuilder;
use tinylfu_cached::cache::put_or_update::PutOrUpdateRequestBuilder;
use tinylfu_cached::cache::types::{Weight, TotalCapacity, TotalCounters};
use tinylfu_cached::cache::command::{CommandStatus, RejectionReason};
use crate::CONF;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use serde_json;
use anyhow::{anyhow, Result};
use std::time::Duration;



lazy_static! {
    static ref CACHE: CacheD<String, String> = CacheD::new(
        ConfigBuilder::new(
            CONF.cache.counter as TotalCounters,
            CONF.cache.capacity as TotalCapacity,
            CONF.cache.weight as Weight
        ).build()
    );
}

pub async fn put<T: Serialize + Sized>(key: &str, data: T, secs: Option<u64>) -> Result<()> {
    let data_json = serde_json::to_string(&data).unwrap();
    let result = match secs {
        Some(s) => {
            CACHE.put_or_update(
                PutOrUpdateRequestBuilder::new(key.to_string())
                    .value(data_json)
                    .time_to_live(Duration::from_secs(s))
                    .build()
            ).unwrap()
        },
        None => {
            CACHE.put(key.to_string(), data_json).unwrap()
        }
    };
    let status = result.handle().await;
    render_status(status)?;
    Ok(())
}

pub async fn update<T: Serialize + Sized>(key: &str, data: T, secs: Option<u64>) -> Result<()> {
    let data_json = serde_json::to_string(&data).unwrap();
    let result = match secs {
        Some(s) => {
            CACHE.put_or_update(
                PutOrUpdateRequestBuilder::new(key.to_string())
                    .value(data_json)
                    .time_to_live(Duration::from_secs(s))
                    .build()
            ).unwrap()
        },
        None => {
            CACHE.put_or_update(
                PutOrUpdateRequestBuilder::new(key.to_string())
                    .value(data_json)
                    .build()
            ).unwrap()
        }
    };
    let status = result.handle().await;
    render_status(status)?;
    Ok(())

}

pub fn get<T: for<'a> Deserialize<'a>>(key: &str) -> Option<T> {
    let value = CACHE.get(&key.to_string());
    match value {
        Some(v) => {
            let data: T = serde_json::from_str(&v).unwrap();
            Some(data)
        },
        None => None
    }
}

pub async fn delete(key: &str) -> Result<()> {
    let res = CACHE.delete(key.to_string()).unwrap();
    let status = res.handle().await;
    render_status(status)?;
    Ok(())
}

pub fn render_status(status: CommandStatus) -> Result<()> {
    match status {
        CommandStatus::Accepted => Ok(()),
        CommandStatus::Rejected(reason) => match reason {
            RejectionReason::KeyAlreadyExists => Err(anyhow!("key已经存在")),
            RejectionReason::KeyWeightIsGreaterThanCacheWeight => Err(anyhow!("key的容量大于缓存容量")),
            RejectionReason::EnoughSpaceIsNotAvailableAndKeyFailedToEvictOthers => Err(anyhow!("缓存容量不足")),
            _ => Err(anyhow!("缓存失败"))
        },
        _ => Err(anyhow!("缓存失败"))
    }
}