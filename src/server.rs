use salvo::serve_static::StaticDir;
use salvo::{affix, prelude::*};
use sqlx::{migrate, migrate::MigrateDatabase, Sqlite};
use std::{env, io::stdin, process};
use salvo::session::{SessionHandler, CookieStore};
use super::{CONF, Data};
use super::model::user::{User, NewUser};
use super::utils::pbkdf::Encrypt;
use super::view::manage::ManageView;
use super::view::visit::VisitView;
use super::api::user::PostUser;
use super::api::post::PostApi;


pub async fn launch() {
    tracing_subscriber::fmt().init();


    // 判断程序是否初始化
    let args: Vec<String> = env::args().collect();
    if args.len() == 1 {
        if !Sqlite::database_exists(&CONF.database.uri).await.unwrap() {
            println!("应用还未初始化，请执行--- lanyue.exe init ---");
            process::exit(1)
        } else {
            // 设置数据库
            Data::set().await;
        }
    } else if args.len() > 1 {
        if !Sqlite::database_exists(&CONF.database.uri).await.unwrap() {
            println!("正在初始化数据库...");
            if Sqlite::create_database(&CONF.database.uri).await.is_err() {
                println!("创建数据库失败，请稍后再次尝试");
                process::exit(1);
            }
            // 设置数据库
            Data::set().await;

            let db = Data::get();

            if migrate!("./migration").run(&db).await.is_err() {
                println!("创建表失败，请稍后再次尝试");
                let _ = &db.close().await;
                Sqlite::drop_database(&CONF.database.uri).await.unwrap();
                process::exit(1);
            }
            println!("成功创建数据库");
            println!("开始创建超级管理员账户:");
            let mut username = String::new();
            let mut email = String::new();
            let mut password = String::new();

            loop {
                println!("昵称:");
                stdin().read_line(&mut username).unwrap();
                if username.len() < 2 || username.len() > 20 {
                    println!("昵称长度在2-20之间");
                    continue;
                } else {
                    break;
                }
            }

            loop {
                println!("邮箱:");
                stdin().read_line(&mut email).unwrap();
                if email.len() > 30 {
                    continue;
                } else {
                    break;
                }
            }

            loop {
                println!("密码:");
                stdin().read_line(&mut password).unwrap();
                if password.len() < 6 || password.len() > 18 {
                    println!("密码长度在6-18之间");
                    continue;
                } else {
                    break;
                }
            }

            println!("{}", password.len());
            match User::insert_one(
                NewUser{
                    email: Some(email.trim().to_string()), 
                    password: Some(Encrypt::generate(&password.trim()[..]).unwrap()), 
                    username: Some(username.trim().to_string())
                }, "superadmin").await {
                Ok(r) => {
                    if r == 1 {
                        println!("成功创建超级管理员账户!")
                    } else {
                        println!("创建失败，请稍后再次尝试");
                        let _ = &db.close().await;
                        Sqlite::drop_database(&CONF.database.uri).await.unwrap();
                        process::exit(1);
                    }
                },
                Err(_) => {
                    println!("创建失败，请稍后再次尝试");
                    let _ = &db.close().await;
                    Sqlite::drop_database(&CONF.database.uri).await.unwrap();
                    process::exit(1);
                }
            };
        }
    }

    let session = SessionHandler::builder(
        CookieStore::new(), 
        &CONF.service.secret_key.as_bytes()
    ).build().unwrap();

    let listener = TcpListener::new(&CONF.service.host).bind().await;
    let router = Router::new()
        .push(Router::with_path("/static/<**path>").get(StaticDir::new("static").listing(true)))
        .hoop(session)
        .push(VisitView::build())
        .push(ManageView::build())
        .push(PostUser::build())
        .push(PostApi::build());
    Server::new(listener).serve(router).await;
}
