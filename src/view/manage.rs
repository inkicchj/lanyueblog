use super::super::model::user::UserOperate;
use super::super::model::category::CategoryOperate;
use salvo::prelude::*;
use crate::model::article::ArticleOperate;
use crate::model::file::FileOperate;
use super::super::utils::block::{must_login, must_admin};
use crate::utils::delay_tasks::Message;

use super::super::Render;

// 控制台概览页
#[handler]
async fn overview(_req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let nums = if let Ok(n) = ArticleOperate::sum_nums().await {
        Some(n)
    } else {
        None
    };
    let nums_info = Message::get();
    Render::new()
        .insert("nums", &nums)
        .insert("nums_info", &nums_info)
        .render("manage/overview.html", depot, res);
}

// 用户管理页(superadmin)
#[handler]
async fn user_manage(_req: &mut Request, depot: &mut Depot, res: &mut Response) {
    Render::new().render("manage/user.html", depot, res);
}

// 文章撰写页
#[handler]
async fn edit(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    Render::new().render("manage/edit.html", depot, res);
}

// 文章管理页
#[handler]
async fn article_manage(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let categories = CategoryOperate::find_many_with_all().await.unwrap();
    Render::new().insert("categories", &categories).render("manage/article.html", depot, res);
}

// 附件管理页
#[handler]
async fn file_manage(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    Render::new().render("manage/file.html", depot, res);
}

// 分类管理页
#[handler]
async fn category_manage(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let categories = CategoryOperate::find_many_with_all().await.unwrap();
    Render::new().insert("categories", &categories).render("manage/category.html", depot, res);
}

// 评论管理页
#[handler]
async fn comment_manage(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    Render::new().render("manage/comment.html", depot, res);
}


pub struct ManageView;

impl ManageView {
    pub fn build() -> Router {
        Router::with_path("manage")
            // .hoop(must_login)
            // .hoop(must_admin)
            .push(Router::new().get(overview))
            .push(Router::new().path("edit").get(edit))
            .push(Router::new().path("article").get(article_manage))
            .push(Router::new().path("category").get(category_manage))
            .push(Router::new().path("comment").get(comment_manage))
            .push(Router::new().path("user").get(user_manage))
            .push(Router::new().path("file").get(file_manage))
    }
}