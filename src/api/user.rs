use super::super::model::user::{
    FindManyUser, LoginUser, NewUser, UpdateInfo, UpdateStatus, UpdatePassword, UpdatePermission,
    UserOperate, Permission, Status, UpdateEmail
};
use salvo::prelude::*;
use crate::utils::{cache, filehandler::FileSave};

use super::super::api::Resp;
use crate::utils::block::{
    must_login, must_admin, get_user
};
use super::super::Validator;
use salvo::session::Session;
use crate::model::user::User;
use std::fs;
use crate::CONF;
use crate::utils::delay_tasks::Message;

// 登录
#[handler]
async fn login(req: &mut Request, depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
    if let Some(_) = get_user(depot) {
        return Resp::err_msg("你已经登录了, 请勿重复操作").json_resp(res);
    };

    let login_user = req.parse_json::<LoginUser>().await.unwrap();
    match Validator::validate(login_user) {
        Ok(u) => match UserOperate::logined(u.clone()).await {
            Ok(user) => {
                UserOperate::update_logined(user.id).await.unwrap();
                let key = format!("user_{}", user.id);
                if let Err(_) = cache::put(&key, &user, Some(CONF.service.max_secs)).await {
                    Resp::err_msg("登录失败").json_resp(res)
                };
                let mut session = Session::new();
                session.insert("login_user", user.id).unwrap();
                depot.set_session(session);
                Resp::ok_msg("登录成功").json_resp(res);
            }
            Err(e) => {
                Resp::err_msg(&e.to_string()).json_resp(res)
            },
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    };
}

// 登出
#[handler]
async fn logout(_req: &mut Request, depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
    let user = get_user(depot).unwrap();
    match cache::delete(&format!("user_{}", user.id)).await {
        Ok(_) => Resp::ok_msg("退出成功").json_resp(res),
        Err(_) => Resp::ok_msg("退出失败").json_resp(res),
    }

}

// 注册
#[handler]
async fn register(req: &mut Request, _depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
    let register_user = req.parse_json::<NewUser>().await.unwrap();
    match Validator::validate(register_user) {
        Ok(u) => match UserOperate::create_one(u, Permission::General).await {
            Ok(_) => {
                Resp::ok_msg("注册成功").json_resp(res);
            }
            Err(e) => Resp::err_msg(&e.to_string()).json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    };
}


// 更新账户信息
#[handler]
async fn update_info(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let uid = req.query::<i32>("uid");
    let user_info = req.parse_json::<UpdateInfo>().await.unwrap();
    let user_id;
    if let Some(u) = uid {
        user_id = u;
    } else {
        user_id = get_user(depot).unwrap().id;
    }
    match Validator::validate(&user_info) {
        Ok(_) => match UserOperate::update_info(user_id, user_info.clone()).await {
            Ok(_) => {
                let mut cache_user = cache::get::<User>(&format!("user_{}", user_id));
                if let Some(mut cache_u) = cache_user {
                    cache_u.nickname = user_info.nickname.unwrap();
                    cache_u.signature = user_info.signature.unwrap();
                    cache_u.social = user_info.social.unwrap();
                    match  cache::update(&format!("user_{}", user_id), cache_u, Some(CONF.service.max_secs)).await {
                        Ok(_) =>  Resp::ok_msg("更新用户信息成功").json_resp(res),
                        Err(_) => Resp::err_msg("更新用户信息成功,但未更新缓存").json_resp(res)
                    }
                } else {
                    Resp::ok_msg("更新用户信息成功").json_resp(res)
                }
            },
            Err(_) => Resp::err_msg("更新用户信息失败").json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

// 更改账户密码
#[handler]
async fn change_password(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let pwd = req.parse_json::<UpdatePassword>().await.unwrap();
    let user = get_user(depot).unwrap();
    match Validator::validate(&pwd) {
        Ok(_) => match UserOperate::update_password(user.id, pwd).await {
            Ok(_) => Resp::ok_msg("更改密码成功").json_resp(res),
            Err(_) => Resp::err_msg("更改密码失败").json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

// 更改用户邮箱
#[handler]
async fn change_email(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let uid = req.query::<i32>("uid");
    let email = req.parse_json::<UpdateEmail>().await.unwrap();
    let user_id;
    if let Some(u) = uid {
        user_id = u;
    } else {
        user_id = get_user(depot).unwrap().id;
    }
    match Validator::validate(&email) {
        Ok(_) => match UserOperate::update_email(user_id, email.clone()).await {
            Ok(_) => {
                let mut cache_user = cache::get::<User>(&format!("user_{}", user_id));
                if let Some(mut cache_u) = cache_user {
                    cache_u.email = email.content.unwrap();
                    match  cache::update(&format!("user_{}", user_id), cache_u, Some(CONF.service.max_secs)).await {
                        Ok(_) =>  {
                            Message::put(format!("user_id: {} user change email successful", uid.unwrap())).await;
                            Resp::ok_msg("更新用户邮箱成功").json_resp(res)
                        },
                        Err(_) => {
                            Message::put(format!("user_id: {} user change email failed", uid.unwrap())).await;
                            Resp::err_msg("更新用户邮箱成功,但未更新缓存").json_resp(res)
                        }
                    }
                } else {
                    Resp::ok_msg("更新用户邮箱成功").json_resp(res)
                }
            }
            Err(_) => Resp::err_msg("更改邮箱失败").json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

// 更改用户权限
#[handler]
async fn change_permission(req: &mut Request, res: &mut Response) {
    let uid = req.param::<i32>("uid").unwrap();
    let perm = req.parse_json::<UpdatePermission<'_>>().await.unwrap();
    match Validator::validate(&perm) {
        Ok(_) => match UserOperate::update_permission(uid, perm.clone()).await {
            Ok(_) => {
                let mut user: User = cache::get(&format!("user_{}", uid)).unwrap();
                user.permission = Permission::from(perm.content.unwrap());
                cache::update(&format!("user_{}", uid), user, Some(CONF.service.max_secs)).await.unwrap();
                Resp::ok_msg("更新用户权限成功").json_resp(res)
            }
            Err(_) => Resp::err_msg("更新用户权限失败").json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

// 更改用户状态
#[handler]
async fn change_status(req: &mut Request, res: &mut Response) {
    let uid = req.param::<i32>("uid").unwrap();
    let status = req.parse_json::<UpdateStatus<'_>>().await.unwrap();
    match UserOperate::update_status(uid, &status).await {
        Ok(_) => {
            let mut cache_user = cache::get::<User>(&format!("user_{}", uid));
            if let Some(mut cache_u) = cache_user {
                cache_u.status = Status::from(status.content.unwrap());
                match  cache::update(&format!("user_{}", cache_u.id), cache_u, Some(CONF.service.max_secs)).await {
                    Ok(_) =>  {
                        Message::put(format!("user_id: {} user set status successful", uid)).await;
                        Resp::ok_msg("更新用户状态成功").json_resp(res)
                    },
                    Err(_) => {
                        Message::put(format!("user_id: {} user set status failed", uid)).await;
                        Resp::err_msg("更新用户状态成功,但未更新缓存").json_resp(res)
                    }
                }
            } else {
                Resp::ok_msg("更新用户状态成功").json_resp(res)
            }
        },
        Err(_) => Resp::err_msg("更新用户状态失败").json_resp(res),
    }
}

// 查找用户
#[handler]
async fn find_many(req: &mut Request, res: &mut Response) {
    let page = req.query::<u32>("page");
    let query = req.parse_json::<FindManyUser<'_>>().await.unwrap();
    match UserOperate::find_many(query, page).await {
        Ok(users) => Resp::ok(users).json_resp(res),
        Err(e) => {
            Resp::err_msg(&e.to_string()).json_resp(res)
        },
    }
}

// 删除用户
#[handler]
async fn delete_one(req: &mut Request, res: &mut Response) {
    let uid = req.param::<i32>("uid").unwrap();
    match UserOperate::delete_one(uid).await {
        Ok(_) => Resp::ok_msg("删除用户成功").json_resp(res),
        Err(_) => Resp::err_msg("删除用户失败").json_resp(res),
    }
}

// 更换头像
#[handler]
async fn change_avatar(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let uid = req.query::<i32>("uid");
    let image = req.file("image").await.unwrap();
    let user_id;
    if let Some(u) = uid {
        user_id = u;
    } else {
        user_id = get_user(depot).unwrap().id;
    }
    match FileSave::new(user_id, image, &CONF.attachment.avatar_dir).save().await {
        Ok(r) => {
            match  UserOperate::update_avatar(user_id, r.clone().1.unwrap()).await {
                Ok(_) => {
                    let mut cache_user = cache::get::<User>(&format!("user_{}", user_id));
                    if let Some(mut cache_u) = cache_user {
                        if let Some(r1) = r.1.clone() {
                            cache_u.avatar = Some(r1);
                        } else {
                            cache_u.avatar = Some(r.0);
                        }

                        match  cache::update(&format!("user_{}", user_id), cache_u, Some(CONF.service.max_secs)).await {
                            Ok(_) =>  Resp::ok_msg("更新用户头像成功").json_resp(res),
                            Err(_) => Resp::err_msg("更新用户头像成功,但未更新缓存").json_resp(res)
                        }
                    } else {
                        Resp::ok_msg("更新用户头像成功").json_resp(res)
                    }
                }
                Err(_) => {
                    fs::remove_file(r.0).unwrap();
                    if let Some(r1) = r.1 {
                        fs::remove_file(&r1).unwrap();
                    }
                    return Resp::err_msg("更换头像失败").json_resp(res)
                }
            }
        },
        Err(_) => Resp::err_msg("更换头像失败").json_resp(res),
    }
}

// 更换背景
#[handler]
async fn change_cover(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let uid = req.query::<i32>("uid");
    let image = req.file("image").await.unwrap();
    let user_id;
    if let Some(u) = uid {
        user_id = u;
    } else {
        user_id = get_user(depot).unwrap().id;
    }
    match FileSave::new(user_id, image, &CONF.attachment.cover_dir).save().await {
        Ok(r) => {
            match  UserOperate::update_cover(user_id, r.clone().1.unwrap()).await {
                Ok(_) => {
                    let mut cache_user = cache::get::<User>(&format!("user_{}", user_id));
                    if let Some(mut cache_u) = cache_user {
                        if let Some(r1) = r.1.clone() {
                            cache_u.avatar = Some(r1);
                        } else {
                            cache_u.avatar = Some(r.0);
                        }

                        match  cache::update(&format!("user_{}", user_id), cache_u, Some(CONF.service.max_secs)).await {
                            Ok(_) =>  Resp::ok_msg("更新用户背景成功").json_resp(res),
                            Err(_) => Resp::err_msg("更新用户背景成功,但未更新缓存").json_resp(res)
                        }
                    } else {
                        Resp::ok_msg("更新用户背景成功").json_resp(res)
                    }
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

// 用户详情信息
#[handler]
async fn user_detail(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let uid = req.param::<i32>("uid").unwrap();
    match UserOperate::find_one(uid).await {
        Ok(user) => Resp::ok(user).json_resp(res),
        Err(e) => Resp::err_msg(&e.to_string()).json_resp(res),
    }
}


pub struct UserApi;

impl UserApi {
    pub fn build() -> Router {
        Router::with_path("user")
            .push(Router::new().path("register").post(register))
            .push(Router::new().path("login").post(login))
            .push(
                Router::new()
                    .hoop(must_login)
                    .hoop(must_admin)
                    .push(Router::new().path("logout").post(logout))
                    .push(Router::new().path("list").post(find_many))
                    .push(Router::new().path("update_pwd").post(change_password))
                    .push(Router::new().path("update_info").post(update_info))
                    .push(Router::new().path("update_avatar").post(change_avatar))
                    .push(Router::new().path("update_cover").post(change_cover))
                    .push(Router::new().path("update_email").post(change_email))
                    .push(Router::new().path("detail/<uid:num>").post(user_detail))
                    .push(Router::new().path("set_status/<uid:num>").post(change_status))
            )
    }
}
