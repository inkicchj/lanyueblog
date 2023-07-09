use super::super::model::user::{
    ListUser, LoginUser, LoginedUser, NewUser, UpdateInfo, UpdateInt, UpdatePassword, UpdateRole,
    User,
};
use salvo::prelude::*;

use super::super::api::Resp;
use super::super::utils::block::{get_user, is_login, is_superadmin};
use super::super::Validator;
use salvo::session::Session;
use validator::Validate;

#[handler]
async fn login(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    if let Some(_) = get_user(depot) {
        return Resp::ok(Resp::err_msg("你已经登录了, 请勿重复操作")).json_resp(res);
    };
    let login_user = req.parse_json::<LoginUser>().await.unwrap();
    match Validator::validate(login_user) {
        Ok(u) => match User::login(u).await {
            Ok(user) => {
                let user_logined = LoginedUser {
                    id: user.id.unwrap(),
                    role: user.role.unwrap(),
                    username: user.username.unwrap(),
                    email: user.email.unwrap(),
                    avatar: user.avatar,
                };
                User::update_logined(user.id.unwrap()).await.unwrap();
                let mut session = Session::new();
                session.insert("logined", user_logined).unwrap();
                depot.set_session(session);
                Resp::ok_msg("登录成功").json_resp(res);
            }
            Err(e) => Resp::err_msg(e).json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    };
}

#[handler]
async fn edit_user_info(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let user_info = req.parse_json::<UpdateInfo>().await.unwrap();
    let user = get_user(depot).unwrap();
    match Validator::validate(&user_info) {
        Ok(_) => match User::update_info(user.id, user_info).await {
            Ok(_) => Resp::ok_msg("更新用户信息成功").json_resp(res),
            Err(e) => Resp::err_msg(e).json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn update_user_password(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let pwd = req.parse_json::<UpdatePassword>().await.unwrap();
    let user = get_user(depot).unwrap();
    match Validator::validate(&pwd) {
        Ok(_) => match User::update_password(user.id, pwd).await {
            Ok(_) => Resp::ok_msg("更改密码成功").json_resp(res),
            Err(e) => Resp::err_msg(e).json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn edit_user_info_manage(req: &mut Request, res: &mut Response) {
    let user_info = req.parse_json::<UpdateInfo>().await.unwrap();
    let id = req.query::<i32>("id").unwrap();
    match Validator::validate(&user_info) {
        Ok(_) => match User::update_info(id, user_info).await {
            Ok(_) => Resp::ok_msg("更新用户信息成功").json_resp(res),
            Err(e) => Resp::err_msg(e).json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn change_user_role_manage(req: &mut Request, res: &mut Response) {
    let role = req.parse_json::<UpdateRole>().await.unwrap();
    let id = req.query::<i32>("id").unwrap();
    match Validator::validate(&role) {
        Ok(_) => match User::update_role(id, role).await {
            Ok(_) => Resp::ok_msg("更新用户角色成功").json_resp(res),
            Err(e) => Resp::err_msg(e).json_resp(res),
        },
        Err(e) => Resp::err_msg(&e[0]).json_resp(res),
    }
}

#[handler]
async fn change_user_status_manage(req: &mut Request, res: &mut Response) {
    let status = req.parse_json::<UpdateInt>().await.unwrap();
    let id = req.query::<i32>("id").unwrap();
    match User::update_status(id, status).await {
        Ok(_) => Resp::ok_msg("更新用户状态成功").json_resp(res),
        Err(e) => Resp::err_msg(e).json_resp(res),
    }
}

#[handler]
async fn user_list(req: &mut Request, res: &mut Response) {
    let query = req.parse_json::<ListUser>().await.unwrap();
    match User::view_list(query).await {
        Ok(users) => {
            Resp::ok(users).json_resp(res);
        }
        Err(_) => {
            Resp::err_msg("获取用户列表失败").json_resp(res);
        }
    }
}

pub struct PostUser;

impl PostUser {
    pub fn build() -> Router {
        Router::with_path("/user")
            .push(Router::new().path("/login").post(login))
            .push(
                Router::new()
                    .hoop(is_login)
                    .push(Router::new().path("/edit/info").post(edit_user_info))
                    .push(Router::new().path("/edit/pwd").post(update_user_password)),
            )
            .push(
                Router::new()
                    .hoop(is_superadmin)
                    .push(Router::new().path("/list").post(user_list))
                    .push(
                        Router::with_path("/manage")
                            .push(Router::new().path("/edit").post(edit_user_info_manage))
                            .push(Router::new().path("/change_role").post(change_user_role_manage))
                            .push(Router::new().path("/change_status").post(change_user_status_manage))
                    )
            )
    }
}
