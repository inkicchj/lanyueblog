use salvo::serve_static::StaticDir;
// use salvo::cache::{Cache, MemoryStore, RequestIssuer};
use salvo::{prelude::*};
use sqlx::{self, migrate::MigrateDatabase, Sqlite};
use salvo::session::{SessionHandler, CookieStore};
use salvo::logging::Logger;
use super::{CONF, Data};
use super::view::manage::ManageView;
use super::view::visit::VisitView;
use super::api::user::UserApi;
use super::api::article::ContentApi;
use super::api::file::FileApi;
use super::api::category::CategoryApi;
use super::api::comment::CommentApi;
use std::process;
use super::model::user::{UserOperate, NewUser, Permission};
use rand;
use rand::Rng;
use std::time::Duration;
use crate::utils::delay_tasks::tasks_build;

pub async fn launch() {
    tracing_subscriber::fmt().init();
    // session
    let session = SessionHandler::builder(
        CookieStore::new(),
        &CONF.service.secret_key.as_bytes(),
    ).build().unwrap();

    // cache
    // let page_cache = Cache::new(
    //     MemoryStore::builder()
    //         .time_to_live(Duration::from_secs(10))
    //         .build(),
    //     RequestIssuer::default(),
    // );

    // delay_timer
    if let Ok(_) = tasks_build().await {
        println!("后台任务启动")
    }


    // 初始化
    init().await;

    let listener = TcpListener::new(&CONF.service.host).bind().await;
    let router = Router::new()

        .push(Router::with_path("/assets/<**path>").get(StaticDir::new("assets").listing(true)))
        .push(Router::with_path("/uploads/<**path>").get(StaticDir::new("uploads").listing(true)))
        .hoop(session)
        .push(UserApi::build())
        .push(FileApi::build())
        .push(CommentApi::build())
        .push(CategoryApi::build())
        .push(ContentApi::build())
        .push(
            Router::new()
                .push(VisitView::build())
                .push(ManageView::build())
        );
    Server::new(listener).serve(router).await;
}

async fn init() {
    match Sqlite::database_exists(&CONF.database.uri).await {
        Ok(r) => {
            if !r {
                if let Err(e) = Sqlite::create_database(&CONF.database.uri).await {
                    println!("创建数据库时发生错误: {}", e.to_string());
                    process::exit(1);
                };
                Data::set().await;
                if let Err(e) = sqlx::migrate!("./migration").run(&Data::get()).await {
                    println!("创建数据库表发生错误: {}", e.to_string());
                    if !Data::get().is_closed() {
                        Data::get().close().await;
                    };
                    Sqlite::drop_database(&CONF.database.uri).await.unwrap();
                    process::exit(1);
                };
                let nickname = rand::thread_rng()
                    .sample_iter(&rand::distributions::Alphanumeric)
                    .take(10)
                    .map(char::from)
                    .collect::<String>();
                let pwd = rand::thread_rng()
                    .sample_iter(&rand::distributions::Alphanumeric)
                    .take(10)
                    .map(char::from)
                    .collect::<String>();
                let user = NewUser {
                    email: Some("admin@lanyue.com".to_string()),
                    nickname: Some(nickname.clone()),
                    password: Some(pwd.clone()),
                };
                match UserOperate::create_one(user, Permission::Admin).await {
                    Ok(_) => {
                        println!("已创建管理员账户");
                        println!("邮箱: {}", "admin@lanyue.com");
                        println!("密码: {}", pwd);
                    },
                    Err(_) => {
                        println!("创建管理员账户失败");
                        if !Data::get().is_closed() {
                            Data::get().close().await;
                        };
                        Sqlite::drop_database(&CONF.database.uri).await.unwrap();
                        process::exit(1);
                    }
                }

            } else {
                Data::set().await;
            }
        },
        Err(e) => {
            println!("程序启动时发生错误: {}", e.to_string());
            process::exit(1);
        }
    }
}
