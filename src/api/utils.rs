// use salvo::prelude::*;
// use serde::Serialize;
// use validator::Validate;
// use super::super::config::Config;
// use sqlx::{Sqlite, migrate::MigrateDatabase};
// use sqlx::sqlite::SqlitePool;
// use super::super::model::{user::NewUser, role::RoleField, create_table};

// #[derive(Clone, Serialize)]
// pub struct Message {
//     text: String,
//     code: i32
// }

// impl Message {
//     pub fn out(code: i32, text: &str) -> Self {
//         Self { text: text.to_string(), code}
//     } 
// }

// #[handler]
// async fn install(req: &mut Request, depot: &mut Depot, res: &mut Response) {
//     let conf = depot.obtain::<Config>().unwrap();
//     if Sqlite::database_exists(&conf.database.uri).await.unwrap_or(false) {
//         res.render(Redirect::other("/"));
//     } else {
//         Sqlite::create_database(&conf.database.uri).await.unwrap();
//         let pool = SqlitePool::connect(&conf.database.uri).await.unwrap();
//         create_table(&pool).await;
//         let new_role_sa = RoleField {
//             name: Some("superadmin".to_string()),
//             rename: Some("超级管理员".to_string()),
//         };
//         RoleField::create(&new_role_sa, &pool).await.unwrap();
//         let new_role_a = RoleField {
//             name: Some("general".to_string()),
//             rename: Some("普通用户".to_string()),
//         };
//         RoleField::create(&new_role_a, &pool).await.unwrap();
//         let new_user: NewUser = req.parse_form::<NewUser>().await.unwrap();
//         match new_user.validate() {
//             Ok(_) => {
//                 NewUser::create(&new_user, &new_role_sa.name.unwrap(), &pool).await.unwrap();
//                 res.render(Json(Message::out(200, "Successful!")));
//             },
//             Err(_) => {
//                 Sqlite::drop_database(&conf.database.uri).await.unwrap();
//                 res.render(Json(Message::out(442, "Failed.")));
//             }
//         }
//     };
// }

// pub struct Utils;

// impl Utils {
//     pub fn new() -> Router {
//         Router::new()
//         .push(Router::new().path("/utils/install").post(install))
//     }
// }
