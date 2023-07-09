use salvo::prelude::*;
use super::super::model::post::{Post, ListPostByUser};
use crate::api::Resp;
#[handler]
async fn list_in_user_info(req: &mut Request, res: &mut Response) {
    let id = req.param("id").unwrap();
    let page = req.parse_json::<ListPostByUser>().await.unwrap();
    match Post::view_list_in_user_info(id, page).await {
        Ok(posts) => {
            Resp::ok(posts).json_resp(res);
        }
        Err(_) => {
            Resp::err_msg("获取文章列表失败").json_resp(res);
        }
    }
}

pub struct PostApi;

impl PostApi {
    pub fn build() -> Router {
        Router::with_path("/post")
        .push(
            Router::new().path("/list/<id:num>").post(list_in_user_info)
        )
    }
}