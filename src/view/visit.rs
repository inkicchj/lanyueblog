use super::super::model::article::{ArticleOperate, ListArticle, self, CacheNums};
use super::super::utils::block::{get_user, must_login};
use crate::{Render, Validator};
use pulldown_cmark;
use salvo::affix::insert;
use salvo::prelude::*;
use crate::api::Resp;
use crate::config::CONF;
use crate::model::article::{Article, ArticleByVisit, NumsMode};
use crate::model::category::{Category, CategoryOperate};
use crate::model::comment::{CommentOperate};
use crate::model::Pagination;
use crate::model::user::UserOperate;
use crate::utils::cache;

// 登录页面
#[handler]
async fn login(depot: &mut Depot, res: &mut Response) {
    Render::new().render("visit/login.html", depot, res);
}

// 无权限页
#[handler]
async fn no_permission(depot: &mut Depot, res: &mut Response) {
    Render::new().render("no_permission.html", depot, res);
}

// 文章列表页
#[handler]
async fn article_list(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let pages = depot.get::<Vec<Article>>("pages");
    let headers = depot.get::<Vec<Category>>("headers");
    let title = req.query::<String>("title");
    let list_article = ListArticle {
        title,
        category_id: None,
        status: Some("Publish"),
        r#type: None,
        category_type: Some("Category"),
        no_type: Some("Page"),
    };
    let page = req.query::<u32>("page");
    match Validator::validate(list_article) {
        Ok(la) => match ArticleOperate::find_many(la, page).await {
            Ok(articles) => {
                Render::new()
                    .insert("articles", &articles)
                    .insert("pages", &pages)
                    .insert("headers", &headers)
                    .render("visit/article.html", depot, res)},
            Err(e) => {
                Render::new()
                    .insert("pages", &pages)
                    .insert("headers", &headers)
                    .render("visit/no_result.html", depot, res)
            },
        },
        Err(_) => {
            Render::new()
                .insert("headers", &headers)
                .insert("pages", &pages)
                .render("no_result.html", depot, res)
        }
    }
}

// 内容详情页面
#[handler]
async fn content_detail(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let pages = depot.get::<Vec<Article>>("pages");
    let headers = depot.get::<Vec<Category>>("headers");
    let id = req.param::<i32>("id");
    let alias = req.param::<String>("alias");
    let no_cache = req.query::<u8>("cache");
    let mut content = ArticleOperate::find_one(id, alias.clone(), Some(article::Status::Publish)).await.unwrap();
    if let None = no_cache {
        let lv = ArticleOperate::cache_nums(&mut content, NumsMode::ViewsAddOne).await;
        if lv.id == content.id.unwrap() {
            content.likes = Some(lv.likes);
            content.views = Some(lv.views);
        }
    };
    if let Some(text) = content.content {
        let parse_input = pulldown_cmark::Parser::new(&text[..]);
        let mut parse_output = String::new();
        pulldown_cmark::html::push_html(&mut parse_output, parse_input);
        content.content = Some(parse_output);
    }

    let comments = if let Ok(coms) = CommentOperate::find_many_with_article(content.id.unwrap(), None).await {
        Some(coms)
    } else {
        None
    };
    Render::new()
        .insert("article", &content)
        .insert("pages", &pages)
        .insert("headers", &headers)
        .insert("comments", &comments)
        .render("visit/article_detail.html", depot, res);
}

// 个人详情页面
#[handler]
async fn author(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let pages = depot.get::<Vec<Article>>("pages");
    let headers = depot.get::<Vec<Category>>("headers");
    let uid = req.param::<i32>("uid").unwrap();
    match UserOperate::find_one(uid).await {
        Ok(user) => {
            Render::new()
                .insert("headers", &headers)
                .insert("pages", &pages)
                .insert("author", &user)
                .render("visit/author.html", depot, res)
        },
        Err(_) => {
            Render::new()
                .insert("headers", &headers)
                .insert("pages", &pages)
                .render("visit/no_result.html", depot, res)
        }
    }
}

// 分类列表页
#[handler]
async fn category_list(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let pages = depot.get::<Vec<Article>>("pages");
    let headers = depot.get::<Vec<Category>>("headers");
    match CategoryOperate::find_many_with_category().await {
        Ok(cates) => {
            Render::new()
                .insert("headers", &headers)
                .insert("pages", &pages)
                .insert("categories", &cates)
                .render("visit/category.html", depot, res)
        },
        Err(_) => {
            Render::new()
                .insert("headers", &headers)
                .insert("pages", &pages)
                .render("no_result.html", depot, res)
        }
    }
}

// 分类_文章列表页
#[handler]
async fn category_article_list(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let pages = depot.get::<Vec<Article>>("pages");
    let headers = depot.get::<Vec<Category>>("headers");
    let alias = req.param::<String>("alias");
    let cid = req.param::<i32>("cid");
    let cate = if let Some(ali) = alias {
        CategoryOperate::find_one_by_alias(ali).await.unwrap()
    } else {
        CategoryOperate::find_one(cid.unwrap()).await.unwrap()
    };
    let list_article = ListArticle {
        title: None,
        category_id: Some(cate.id),
        status: Some("Publish"),
        r#type: None,
        category_type: None,
        no_type: Some("Page"),
    };
    let page = req.query::<u32>("page");
    match Validator::validate(list_article) {
        Ok(la) => match ArticleOperate::find_many(la, page).await {
            Ok(articles) => {
                Render::new()
                    .insert("articles", &articles)
                    .insert("category", &cate)
                    .insert("pages", &pages)
                    .insert("headers", &headers)
                    .render("visit/article_by_category.html", depot, res)},
            Err(e) => {
                Render::new()
                    .insert("pages", &pages)
                    .insert("headers", &headers)
                    .render("no_result.html", depot, res)
            },
        },
        Err(_e) => {
            Render::new()
                .insert("headers", &headers)
                .insert("pages", &pages)
                .render("no_result.html", depot, res)
        }
    }
}

// 文章搜索列表页
#[handler]
async fn article_search_list(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let pages = depot.get::<Vec<Article>>("pages");
    let headers = depot.get::<Vec<Category>>("headers");
    let title = req.query::<String>("title");
    match title {
        Some(t) => {
            if t == "" {
                Render::new()
                    .insert("articles", &Pagination::new(1,1,Vec::<i32>::new()))
                    .insert("pages", &pages)
                    .insert("headers", &headers)
                    .render("visit/article_by_search.html", depot, res);
            } else {
                let list_article = ListArticle {
                    title: Some(t),
                    category_id: None,
                    status: Some("Publish"),
                    r#type: None,
                    category_type: Some("Category"),
                    no_type: Some("Page"),
                };
                let page = req.query::<u32>("page");
                match Validator::validate(list_article) {
                    Ok(la) => match ArticleOperate::find_many(la, page).await {
                        Ok(articles) => {
                            Render::new()
                                .insert("articles", &articles)
                                .insert("pages", &pages)
                                .insert("headers", &headers)
                                .render("visit/article_by_search.html", depot, res)},
                        Err(e) => {
                            Render::new()
                                .insert("pages", &pages)
                                .insert("headers", &headers)
                                .render("no_result.html", depot, res)
                        },
                    },
                    Err(_) => {
                        Render::new()
                            .insert("headers", &headers)
                            .insert("pages", &pages)
                            .render("no_result.html", depot, res)
                    }
                }
            }
        },
        None => Render::new()
            .insert("articles", &Pagination::new(1,1,Vec::<i32>::new()))
            .insert("pages", &pages)
            .insert("headers", &headers)
            .render("visit/article_by_search.html", depot, res),
    };

}


// page
#[handler]
async fn get_page(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    let pages = cache::get::<Vec<Article>>("pages");
    match pages {
        Some(pages) => {
            depot.insert("pages", pages);
        },
        None => {
            if let Ok(pages) = ArticleOperate::find_many_with_page().await {
                cache::put("pages", pages.clone(), Some(CONF.cache.max_secs)).await;
                depot.insert("pages", pages);
            };
        }
    }

    ctrl.call_next(req, depot, res).await;
}




// header
#[handler]
async fn get_header(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    let headers = cache::get::<Vec<Category>>("headers");
    match headers {
        Some(headers) => {
            depot.insert("headers", headers);
        },
        None => {
            if let Ok(headers) = CategoryOperate::find_many_with_header().await {
                cache::put("headers", headers.clone(), Some(CONF.cache.max_secs)).await;
                depot.insert("headers", headers);
            };
        }
    }

    ctrl.call_next(req, depot, res).await;
}


// url
#[handler]
async fn get_url(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    depot.insert("url", req.uri().to_string());
    ctrl.call_next(req, depot, res).await;
}


pub struct VisitView;

impl VisitView {
    pub fn build() -> Router {
        Router::new()
            .push(
                Router::new()
                    .hoop(get_url)
                    .hoop(get_page)
                    .hoop(get_header)
                    .push(Router::new().path("/").get(article_list))
                    .push(Router::new().path("/category").get(category_list))
                    .push(Router::new().path("/search").get(article_search_list))
                    .push(Router::new().path("/detail/<id:num>").get(content_detail))
                    .push(Router::new().path("/detail/<alias>").get(content_detail))
                    .push(Router::new().path("/author/<uid:num>").get(author))
                    .push(Router::new().path("/category/<cid:num>").get(category_article_list))
                    .push(Router::new().path("/category/<alias>").get(category_article_list))

            )
            .push(
                Router::new()
                    .push(Router::new().path("/login").get(login))
                    .push(Router::new().path("/register"))
                    .push(Router::new().path("no_permission").get(no_permission))
                    // .push(Router::new().path("/author/<id:num>").get(author))

            )
    }
}
