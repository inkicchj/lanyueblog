pub mod user;
pub mod article;
pub mod file;
pub mod category;
pub mod comment;

use serde::Serialize;
use salvo::prelude::{Json, Response};

#[derive(Serialize, Clone)]
pub struct Resp<T>
    where T: Serialize
{
    code: i16,
    msg: Option<String>,
    data: Option<T>,
}

impl<T: Serialize> Resp<T> {
    pub fn ok(data: T) -> Self {
        Resp { code: 200, msg: None, data: Some(data) }
    }

    pub fn json_resp(self, res: &mut Response) {
        res.render(Json(self))
    }
}

impl Resp<()> {
    pub fn ok_msg(msg: &str) -> Self {
        Self { code: 200, msg: Some(msg.to_owned()), data: None }
    }

    pub fn err(code: i16, msg: &str) -> Self {
        Self { code, msg: Some(msg.to_owned()), data: None }
    }

    pub fn err_msg(msg: &str) -> Self {
        Self { code: 410, msg: Some(msg.to_owned()), data: None }
    }
}

unsafe impl<T: Serialize> Send for Resp<T> {}

