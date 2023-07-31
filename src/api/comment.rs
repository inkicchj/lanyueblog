use salvo::prelude::*;
use crate::api::Resp;
use crate::model::comment::{NewComment, CommentOperate, UpdateStatus, CommentFindMany, Status};
use crate::utils::block::{
    must_login, must_admin, get_user
};
use crate::Validator;
use crate::utils::cache;
use crate::utils::review;

#[handler]
async fn create(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let mut new_remark = req.parse_json::<NewComment>().await.unwrap();



    if let Some(user) = get_user(depot) {
        new_remark.from_user_id = Some(user.id);
        new_remark.nickname = Some(user.nickname.clone());
        new_remark.email = Some(user.email.clone());
        new_remark.avatar = user.avatar.clone();
    };

    let header = req.headers();
    let user_agent = header.get("user-agent");
    if let Some(agent) = user_agent {
        if let Ok(agent_1) = agent.to_str() {
            new_remark.agent = Some(agent_1.to_string());
        }
    }

    let real_ip = header.get("x-real-ip");
    if let Some(rip) = real_ip {
        if let Ok(ip) = rip.to_str() {
            new_remark.ip = Some(ip.to_string());
            if let Some(is_limiter) = cache::get::<String>(ip) {
                Resp::err_msg("操作太频繁，请1分钟后再尝试").json_resp(res);
            } else {
                cache::put( ip, "comment_limiter".to_string(), Some(60)).await;
            }
        }
    }

    if new_remark.reply_id != None {
        let replied = CommentOperate::find_one(new_remark.reply_id.unwrap()).await.unwrap();
        if replied.from_user_id != None {
            new_remark.to_user_id = replied.from_user_id;
        };
    };

    if new_remark.parent_id == None {
        new_remark.reply_id = None;
        new_remark.to_user_id = None;
    };

    let status = match review::text(new_remark.content.clone().unwrap()).await {
        Ok(b) => {
            if b {
                Some(Status::Publish)
            } else {
                Some(Status::Review)
            }
        },
        Err(_) => Some(Status::Review)
    };

    match Validator::validate(&new_remark) {
        Ok(_) => match CommentOperate::create_one(new_remark, status.clone()).await {
            Ok(comm) => {
                match status {
                    Some(st) => {
                        match st {
                            Status::Publish => Resp::ok(comm).json_resp(res),
                            Status::Review => Resp::err_msg("请等待审核").json_resp(res),
                            _ => Resp::err_msg("请等待审核").json_resp(res),
                        }
                    },
                    None => Resp::err_msg("请等待审核").json_resp(res),
                }
            },
            Err(_) => Resp::err_msg("服务君开小差了，请稍后再试").json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn delete(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let coid = req.param::<i32>("coid").unwrap();
    match CommentOperate::delete_one(coid).await {
        Ok(_) => Resp::ok_msg("删除成功").json_resp(res),
        Err(_) => Resp::ok_msg("删除失败").json_resp(res),
    }
}

#[handler]
async fn find_many_with_article(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let cid = req.param::<i32>("cid").unwrap();
    let page = req.query::<u32>("page");
    match CommentOperate::find_many_with_article(cid, page).await {
        Ok(data) => Resp::ok(data).json_resp(res),
        Err(_) => Resp::err_msg("未找到评论").json_resp(res),
    }
}

#[handler]
async fn find_many_with_admin(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let page = req.query::<u32>("page");
    let filter = req.parse_json::<CommentFindMany<'_>>().await.unwrap();
    match CommentOperate::find_many_with_admin(filter, page).await {
        Ok(data) => Resp::ok(data).json_resp(res),
        Err(_) => {
            Resp::err_msg("未找到评论").json_resp(res);
        }
    }
}

#[handler]
async fn set_status(req: &mut Request, _depot: & mut Depot, res: & mut Response) {
    let coid = req.param::<i32>("coid").unwrap();
    let status = req.parse_json::<UpdateStatus<'_>>().await.unwrap();
    match Validator::validate(&status) {
        Ok(_) => match CommentOperate::set_status(coid, status).await {
            Ok(_) => Resp::ok_msg("设置状态成功").json_resp(res),
            Err(_) => Resp::err_msg("设置状态失败").json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}



pub struct CommentApi;

impl CommentApi {
    pub fn build() -> Router {
        Router::with_path("comment")
            .push(Router::new().path("list_with_article/<cid:num>").post(find_many_with_article))
            .push(Router::new().path("create").post(create))
            .push(
                Router::new()
                    .hoop(must_login)
                    .hoop(must_admin)
                    .push(Router::new().path("delete/<coid:num>").post(delete))
                    .push(Router::new().path("list_with_admin").post(find_many_with_admin))
                    .push(Router::new().path("set_status/<coid:num>").post(set_status))
            )
    }
}
