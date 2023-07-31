use salvo::prelude::*;
use crate::api::Resp;
use crate::model::article::{Article, ArticleByVisit, ArticleOperate, ListArticle, NewArticle, UpdateStatus, NumsMode};
use crate::utils::block::{must_login, must_admin, get_user};
use crate::Validator;
use crate::utils::cache;
use crate::utils::delay_tasks::Message;

#[handler]
async fn list(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let page = req.query::<u32>("page");
    let lc = req.parse_json::<ListArticle>().await.unwrap();
    match Validator::validate(&lc) {
        Ok(_) => match ArticleOperate::find_many(lc, page).await {
            Ok(contents) => {
                Resp::ok(contents).json_resp(res);
            },
            Err(e) => {
                Resp::err_msg("获取文章列表失败").json_resp(res)
            },
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn update(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let aid = req.param::<i32>("aid").unwrap();
    let update_info = req.parse_json::<NewArticle<'_>>().await.unwrap();
    match Validator::validate(&update_info) {
        Ok(_) => match ArticleOperate::update_one(aid, update_info).await {
            Ok(id) => Resp::ok(id).json_resp(res),
            Err(e) => Resp::err_msg(&e.to_string()).json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }

}

#[handler]
async fn create(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let content = req.parse_json::<NewArticle<'_>>().await.unwrap();
    let user = get_user(depot).unwrap();
    match Validator::validate(&content) {
        Ok(_) => match ArticleOperate::create_one(user.id, content).await {
            Ok(id) => Resp::ok(id).json_resp(res),
            Err(e) => Resp::err_msg(&e.to_string()).json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn delete(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let aid = req.param::<i32>("aid").unwrap();
    match ArticleOperate::delete_one(aid).await {
        Ok(_) => {
            Message::put(format!("article_id: {} article delete successful", aid)).await;
            Resp::ok_msg("删除成功").json_resp(res)
        },
        Err(_) => {
            Message::put(format!("article_id: {} article delete failed", aid)).await;
            Resp::err_msg("删除失败").json_resp(res)
        },
    }
}

#[handler]
async fn set_status(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let aid = req.param::<i32>("aid").unwrap();
    let status = req.parse_json::<UpdateStatus<'_>>().await.unwrap();
    match Validator::validate(&status) {
        Ok(_) => match ArticleOperate::set_status(aid, status).await {
            Ok(_) => {
                Message::put(format!("article_id: {} article set status successful", aid)).await;
                Resp::ok_msg("设置状态成功").json_resp(res)
            },
            Err(_) => {
                Message::put(format!("article_id: {} article set status failed", aid)).await;
                Resp::err_msg("设置状态失败").json_resp(res)
            },
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn find_one(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let aid = req.param::<i32>("aid").unwrap();
    match ArticleOperate::find_one(Some(aid), None, None).await {
        Ok(article) => Resp::ok(article).json_resp(res),
        Err(_) => Resp::err_msg("获取文章详情失败").json_resp(res),
    }
}

//点赞
#[handler]
async fn like(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let mode = req.param::<String>("mode").unwrap();
    let id = req.param::<i32>("aid").unwrap();
    let mut article = ArticleByVisit {
        id: Some(id),
        ..Default::default()
    };
    match &mode[..] {
        "like" => {
            let lv = ArticleOperate::cache_nums(&mut article, NumsMode::LikesAddOne).await;
            Resp::ok(lv).json_resp(res)
        },
        "unlike" => {
            let lv = ArticleOperate::cache_nums(&mut article, NumsMode::LikesSubOne).await;
            Resp::ok(lv).json_resp(res)
        },
        _ => {
            Resp::err_msg("参数错误").json_resp(res)
        }
    }
}

// pages
#[handler]
async fn del_pages(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    if let Some(_) = cache::get::<Vec<Article>>("pages") {
        cache::delete("pages").await;
    }
    ctrl.call_next(req, depot, res).await;
}

pub struct ContentApi;

impl ContentApi {
    pub fn build() -> Router {
        Router::with_path("/article")
            .push(
                Router::new()
                    .hoop(must_login)
                    .hoop(must_admin)
                    .push(Router::new().path("list").post(list))
                    .push(Router::new().path("detail/<aid:num>").post(find_one))
                    .push(
                        Router::new()
                            .hoop(del_pages)
                            .push(Router::new().path("create").post(create))
                            .push(Router::new().path("delete/<aid:num>").post(delete))
                            .push(Router::new().path("update/<aid:num>").post(update))
                            .push(Router::new().path("set_status/<aid:num>").post(set_status))
                    )
            )
            .push(
                Router::new()
                    .push(Router::new().path("num/<aid:num>/<mode>").post(like))
            )
    }
}