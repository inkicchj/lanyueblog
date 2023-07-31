pub mod user;
pub mod article;
pub mod category;
pub mod comment;
pub mod file;

use serde::Serialize;

pub type Result<T> = std::result::Result<T, &'static str>;

#[derive(Serialize, Debug)]
pub struct Pagination<T: Serialize> {
    pub total: u32,
    pub total_page: u32,
    pub page: u32,
    pub page_size: u32,
    pub data: T,
}

impl<T: Serialize> Pagination<T> {
    pub fn new(total: u32, page: u32, data: T) -> Self {
        let total_page = f64::ceil(total as f64 / 15 as f64) as u32;
        Self {
            total,
            total_page,
            page,
            page_size: 15,
            data
        }
    }
}