pub mod user;
pub mod post;
use sqlx;
use super::Data;
use serde::Deserialize;

#[derive(Deserialize, sqlx::FromRow)]
pub struct Count {
    pub count: i64,
}

pub async fn count(table: &str) -> Result<i64, &'static str> {
    let sql = format!("SELECT COUNT(*) as count FROM {}", table);
    let res = sqlx::query_as::<_, Count>(&sql).fetch_one(&Data::get()).await;
    match res {
        Ok(r) => Ok(r.count),
        Err(e) => {
            println!("error: {}", e);    
            Err("获取总数失败")
        }
    }
}