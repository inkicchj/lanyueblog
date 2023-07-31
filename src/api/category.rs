use salvo::prelude::*;
use crate::api::Resp;
use crate::model::category::{CategoryOperate, NewCategory, Category};
use crate::utils::block::{
    must_login, must_admin
};
use crate::utils::filehandler::FileSave;
use crate::Validator;
use crate::CONF;
use std::fs;
use crate::utils::cache;
use crate::utils::delay_tasks::Message;

#[handler]
async fn create(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let new_meta = req.parse_json::<NewCategory<'_>>().await.unwrap();
    match Validator::validate(&new_meta) {
        Ok(_) => match CategoryOperate::create_one(new_meta).await {
            Ok(_) => {
                Message::put(format!("category create successful")).await;
                Resp::ok_msg("创建成功").json_resp(res)
            },
            Err(e) => {
                Message::put(format!("category create failed")).await;
                Resp::err_msg(&e.to_string()).json_resp(res)
            },
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn update(req: &mut Request, res: &mut Response) {
    let mid = req.param::<i32>("cid").unwrap();
    let update_info = req.parse_json::<NewCategory<'_>>().await.unwrap();
    match Validator::validate(&update_info) {
        Ok(_) => match CategoryOperate::update_one(mid, update_info).await {
            Ok(_) => {
                Message::put(format!("category_id: {} category update successful", mid)).await;
                Resp::ok_msg("更新成功").json_resp(res)
            },
            Err(e) => {
                Message::put(format!("category_id: {} category update failed", mid)).await;
                Resp::err_msg(&e.to_string()).json_resp(res)
            },
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn delete(req: &mut Request, res: &mut Response) {
    let mid = req.param::<i32>("cid").unwrap();
    match CategoryOperate::delete_one(mid).await {
        Ok(_) => {
            Message::put(format!("category_id: {} category delete successful", mid)).await;
            Resp::ok_msg("删除成功").json_resp(res)
        },
        Err(e) => {
            Message::put(format!("category_id: {} category delete failed", mid)).await;
            Resp::err_msg(&e.to_string()).json_resp(res)
        },
    }
}

#[handler]
async fn set_default(req: &mut Request, res: &mut Response) {
    let mid = req.param::<i32>("cid").unwrap();
    match CategoryOperate::set_default(mid).await {
        Ok(_) => {
            Message::put(format!("category_id: {} category set default successful", mid)).await;
            Resp::ok_msg("设置默认成功").json_resp(res)
        },
        Err(_) => {
            Message::put(format!("category_id: {} category set default failed", mid)).await;
            Resp::err_msg("设置默认失败").json_resp(res)
        },
    }
}

#[handler]
async fn find_many_with_all(req: &mut Request, res: &mut Response) {
    match CategoryOperate::find_many_with_all().await {
        Ok(category) => Resp::ok(category).json_resp(res),
        Err(_) => Resp::err_msg("获取分类失败").json_resp(res),
    }
}

#[handler]
async fn find_one(req: &mut Request, res: &mut Response) {
    let cid = req.param::<i32>("cid").unwrap();
    match CategoryOperate::find_one(cid).await {
        Ok(cate) => Resp::ok(cate).json_resp(res),
        Err(_) => Resp::err_msg("获取分类详情失败").json_resp(res),
    }
}

// 更换背景
#[handler]
async fn change_cover(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let cid = req.param::<i32>("cid").unwrap();
    let image = req.file("image").await.unwrap();
    match FileSave::new(cid, image, &CONF.attachment.cate_cover_dir).save().await {
        Ok(r) => {
            match  CategoryOperate::update_cover(cid, r.clone().1.unwrap()).await {
                Ok(_) => {
                    Resp::ok_msg("更换背景成功").json_resp(res)
                }
                Err(_) => {
                    fs::remove_file(r.0).unwrap();
                    if let Some(r1) = r.1 {
                        fs::remove_file(&r1).unwrap();
                    }
                    return Resp::err_msg("更换背景失败").json_resp(res)
                }
            }
        },
        Err(_) => Resp::err_msg("更换背景失败").json_resp(res),
    }
}

// header
#[handler]
async fn del_header(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    if let Some(_) = cache::get::<Vec<Category>>("headers") {
        cache::delete("headers").await;
    }
    ctrl.call_next(req, depot, res).await;
}

pub struct CategoryApi;

impl CategoryApi {
    pub fn build() -> Router {
        Router::with_path("category")
            .hoop(must_login)
            .hoop(must_admin)
            .push(Router::new().path("list_with_all").post(find_many_with_all))
            .push(Router::new().path("set_default/<cid:num>").post(set_default))
            .push(Router::new().path("detail/<cid:num>").post(find_one))
            .push(
                Router::new()
                    .hoop(del_header)
                    .push(Router::new().path("create").post(create))
                    .push(Router::new().path("delete/<cid:num>").post(delete))
                    .push(Router::new().path("update/<cid:num>").post(update))
                    .push(Router::new().path("update_cover/<cid:num>").post(change_cover))
            )
    }
}