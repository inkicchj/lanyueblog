use super::super::model::count;
use super::super::model::user::User;
use salvo::prelude::*;

use super::super::Render;
use crate::utils::block::{is_admin, is_login, is_superadmin, get_user};

// 控制台概览页
#[handler]
async fn manage_overview(_req: &mut Request, depot: &mut Depot, res: &mut Response) {
    Render::new().render("manage/index.html", depot, res);
}

// 用户信息编辑页(superadmin)
#[handler]
async fn manage_user_edit_info(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let id = req.query::<i32>("id").unwrap();
    let user = User::view_one(id).await.unwrap();
    Render::new().insert("info", &user).render("manage/user_edit_info.html", depot, res);
}

// 用户管理页(superadmin)
#[handler]
async fn manage_user(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let url = req.uri().to_string();
    let c = count("user").await.unwrap();
    Render::new().insert("url", &url).insert("total", &c).render("manage/user.html", depot, res);
}

// 无权限页
#[handler]
async fn no_permission(depot: &mut Depot, res: &mut Response) {
    Render::new().render("no_permission.html", depot, res);
}

// 文章撰写页
#[handler]
async fn manage_post_edit(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    Render::new().render("manage/post_edit.html", depot, res);
}


pub struct ManageView;

impl ManageView {
    pub fn build() -> Router {
        Router::with_path("/manage")
        .hoop(is_login)
        .get(manage_overview)
        .push(Router::new().path("/no_permission").get(no_permission))
        .push(
            Router::new()
            .hoop(is_superadmin)
            .push(
                Router::with_path("/user")
                .get(manage_user)
                .push(Router::new().path("/edit_info").get(manage_user_edit_info))
            )
        )
        .push(
            Router::with_path("/post")
            .push(Router::new().path("/edit_content").get(manage_post_edit))
        )
    }
}