use super::super::model::post::{Post, ListPost};
use super::super::model::user::User;
use super::super::utils::block::{get_user, is_login};
use crate::Render;
use pulldown_cmark;
use salvo::prelude::*;
use visdom::Vis;

// 首页
#[handler]
async fn index(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let query = req.parse_queries::<ListPost>().unwrap();
    let posts = Post::view_list(query).await.unwrap();
    let url = req.uri().to_string();
    Render::new()
        .insert("posts", &posts)
        .insert("url", &url)
        .render("visit/index.html", depot, res);
}

// 登录页
#[handler]
async fn login(depot: &mut Depot, res: &mut Response) {
    Render::new().render("visit/login.html", depot, res);
}

// 用户详情页
#[handler]
async fn info(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let id = req.param::<i32>("id").unwrap();
    let user = User::view_one(id).await.unwrap();
    Render::new()
        .insert("info", &user)
        .render("visit/user_info.html", depot, res);
}

// 用户信息编辑页
#[handler]
async fn user_edit_info(depot: &mut Depot, res: &mut Response) {
    let user = get_user(depot).unwrap();
    let user = User::view_one(user.id).await.unwrap();
    Render::new()
        .insert("info", &user)
        .render("visit/user_edit_info.html", depot, res);
}

// 用户修改密码页
#[handler]
async fn user_edit_pwd(depot: &mut Depot, res: &mut Response) {
    Render::new().render("visit/user_edit_pwd.html", depot, res);
}

// 文章详情页
#[handler]
async fn post_view_one(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let id = req.param::<i32>("id").unwrap();
    let mut post = Post::view_one(id).await.unwrap();
    let content = post.content.unwrap();
    let parse_input = pulldown_cmark::Parser::new(&content[..]);
    let mut parse_ontput = String::new();
    pulldown_cmark::html::push_html(&mut parse_ontput, parse_input);
    post.content = Some(parse_ontput);
    Render::new()
        .insert("post", &post)
        .render("visit/post_view.html", depot, res);
}

pub struct VisitView;

impl VisitView {
    pub fn build() -> Router {
        Router::new()
            .push(
                Router::new()
                    .push(Router::new().path("/").get(index))
                    .push(Router::new().path("/user/info/<id:num>").get(info))
                    .push(Router::new().path("/login").get(login))
                    .push(Router::new().path("/post/<id:num>").get(post_view_one)),
            )
            .push(
                Router::new()
                    .hoop(is_login)
                    .push(Router::new().path("/user/edit_info").get(user_edit_info))
                    .push(Router::new().path("/user/edit_pwd").get(user_edit_pwd)),
            )
    }
}
