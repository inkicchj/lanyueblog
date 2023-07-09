use super::super::Data;
use chrono::Local;
use serde::{Deserialize, Serialize};
use sqlx::{self, sqlite::SqliteQueryResult, Error};
use super::super::utils::pbkdf::Encrypt;
use validator::{Validate, ValidationError};
use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref PASSWORD_PATTERN: Regex = Regex::new("^[0-9a-zA-Z.*@!]{6,18}$").unwrap();
}

#[derive(Serialize, Deserialize, Clone)]
pub struct LoginedUser{
    pub id: i32,
    pub role: String,
    pub username: String,
    pub avatar: Option<String>,
    pub email: String,
}

#[derive(sqlx::FromRow, Clone)]
struct CreateUser {
    email: Option<String>,
    username: Option<String>,
    password: Option<String>,
    status: Option<i8>,
    created: Option<i64>,
    role: Option<String>,
}

#[derive(sqlx::FromRow, Clone ,Serialize)]
pub struct User {
    pub id: Option<i32>,
    pub email: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub signature: Option<String>,
    pub background: Option<String>,
    pub status: Option<i8>,
    pub created: Option<i64>,
    pub logined: Option<i64>,
    pub avatar: Option<String>,
    pub role: Option<String>,
}

impl User {
    pub async fn insert_one(new_user: NewUser, role: &str) -> Result<u64, &'static str> {
        let user: CreateUser =  CreateUser {
            email: Some(new_user.email.unwrap()),
            username: Some(new_user.username.unwrap()),
            password: Some(new_user.password.unwrap()),
            status: Some(1),
            created: Some(Local::now().timestamp()),
            role: Some(role.to_string()),
        };
        let res:u64 = sqlx::query(
            "INSERT INTO user 
            (email, password, username, created,  role, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            ")
            .bind(user.email)
            .bind(user.password)
            .bind(user.username)
            .bind(user.created)
            .bind(user.role)
            .bind(user.status)
            .execute(&Data::get())
            .await
            .map(|r: SqliteQueryResult| r.rows_affected())
            .map_err(|_e: Error| "创建用户失败")?;
        Ok(res)

    }

    pub async fn delete_one(id: i32) -> Result<u64, &'static str> {
        let res:u64 = sqlx::query("DELEET FROM user WHERE id = $1")
            .bind(id)
            .execute(&Data::get())
            .await
            .map(|r: SqliteQueryResult| r.rows_affected())
            .map_err(|_e: Error | "删除用户失败")?;
        Ok(res)
    }

    pub async fn view_one(id: i32) -> Result<User, &'static str> {
        let user= sqlx::query_as::<_, User>(
            "SELECT * FROM user WHERE id = $1
            ")
            .bind(id)
            .fetch_one(&Data::get())
            .await
            .map(|r| r )
            .map_err(|_e: Error| "查找用户失败")?;
        Ok(user)
    }

    pub async fn view_list(data: ListUser) -> Result<Vec<User>, &'static str> {
        let users = sqlx::query_as::<_, User>("
            SELECT * FROM user 
            WHERE email LIKE $1 
            AND username LIKE $2 
            LIMIT $3, 30
            ")
            .bind(format!("%{}%",&data.email.unwrap_or("".to_string())))
            .bind(format!("%{}%",&data.username.unwrap_or("".to_string()) ))
            .bind((&data.page.unwrap_or(1) - 1) * 30)
            .fetch_all(&Data::get())
            .await.unwrap();
        Ok(users)
    }

    pub async fn update_info(id: i32, info: UpdateInfo) -> Result<u64, &'static str> {
        let res: u64 = sqlx::query("
            UPDATE user SET avatar = $1, background = $2, username = $3, signature = $4 WHERE id = $5
            ")
            .bind(info.avatar)
            .bind(info.background)
            .bind(info.username)
            .bind(info.signature)
            .bind(id)
            .execute(&Data::get())
            .await
            .map(|r| r.rows_affected())
            .map_err(|_e| "更新用户信息失败")?;
        Ok(res)
    }

    pub async fn update_role(id: i32, role: UpdateRole) -> Result<u64, &'static str> {
        let res: u64 = sqlx::query("
            UPDATE user SET role = $1 WHERE id = $2
            ")
            .bind(role.content.unwrap_or("general".to_string()))
            .bind(id)
            .execute(&Data::get())
            .await
            .map(|r| r.rows_affected())
            .map_err(|_e| "更新用户角色失败")?;
        Ok(res)
    }

    pub async fn update_status(id: i32, status: UpdateInt) -> Result<u64, &'static str> {
        let res: u64 = sqlx::query("
            UPDATE user SET status = $1 WHERE id = $2
            ")
            .bind(status.content.unwrap_or(1))
            .bind(id)
            .execute(&Data::get())
            .await
            .map(|r| r.rows_affected())
            .map_err(|_e| "更新用户背景失败")?;
        Ok(res)
    }

    pub async fn update_password(id: i32, pwds: UpdatePassword) -> Result<u64, &'static str> {
        if pwds.old_pwd == pwds.new_pwd {
           return Err("新旧密码不能相同");
        };
        let user = sqlx::query_as::<_, User>("
            SELECT * FROM user WHERE id = $1
            ")
            .bind(id)
            .fetch_one(&Data::get())
            .await
            .unwrap();

        if Encrypt::check(&pwds.old_pwd.unwrap()[..], &user.password.unwrap()[..]){
            let res = sqlx::query("
                UPDATE user SET password = $1 WHERE id = $2
                ")
                .bind(Encrypt::generate(&pwds.new_pwd.unwrap()[..]).unwrap())
                .bind(id)
                .execute(&Data::get())
                .await
                .map(|r| r.rows_affected() )
                .map_err(|_e| "更新用户密码失败")?;
            Ok(res)
        } else {
            Err("原密码不正确")
        }
    }

    pub async fn update_logined(id: i32) -> Result<u64, &'static str>{
        let res = sqlx::query("
            UPDATE user SET logined = $1 WHERE id = $2
        ")
        .bind(Local::now().timestamp())
        .bind(id)
        .execute(&Data::get())
        .await
        .map(|r| r.rows_affected() )
        .map_err(|_e| "更新登陆时间失败")?;
        Ok(res)
    }

    pub async fn login(data: LoginUser) -> Result<User, &'static str> {
        let user = match sqlx::query_as::<_, User>("
                    SELECT * FROM user WHERE email = $1
                ")
                .bind(data.email.unwrap())
                .fetch_one(&Data::get()).await {
            Ok(r) => {r},
            Err(_) => return Err("该用户不存在")
        };

        if Encrypt::check(&data.password.as_ref().unwrap()[..], &user.password.as_ref().unwrap()[..]) {
            Ok(user)
        } else {
            Err("密码不正确")
        }
    }

}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct NewUser {
    #[validate(required(message="不能为空"), email(message="邮箱格式应为example@xxx.com"))]
    pub email: Option<String>,
    #[validate(required(message="不能为空"), regex(path="PASSWORD_PATTERN", message="密码长度为6-18位, 特殊字符包括.*@!"))]
    pub password: Option<String>,
    #[validate(required(message="不能为空"), length(min=2, max=20, message="昵称长度为2-20"))]
    pub username: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct LoginUser {
    #[validate(required(message="不能为空"), email(message="邮箱格式应为example@xxx.com"))]
    pub email: Option<String>,
    #[validate(required(message="不能为空"), regex(path="PASSWORD_PATTERN", message="密码长度为6-18位, 特殊字符包括.*@!"))]
    pub password: Option<String>,
}


#[derive(Serialize, Deserialize, Clone)]
pub struct ListUser {
    pub email: Option<String>,
    pub username: Option<String>,
    pub page: Option<i32>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdateInfo{
    #[validate(url(message="url格式不正确"))]
    pub avatar: Option<String>,
    #[validate(url(message="url格式不正确"))]
    pub background: Option<String>,
    #[validate(required(message="不能为空"), length(min=2, max=20, message="昵称长度为2-20"))]
    pub username: Option<String>,
    #[validate(length(max=50, message="字数不超过50"))]
    pub signature: Option<String>,
}


#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdateRole{
    #[validate(required(message="不能为空"), length(max=16, message="长度不超过16"), custom="validate_role")]
    pub content: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct UpdateInt{
    pub content: Option<i8>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdatePassword{
    #[validate(required(message="不能为空"), regex(path="PASSWORD_PATTERN", message="密码长度为6-18位, 特殊字符包括.*@!"))]
    pub old_pwd: Option<String>,
    #[validate(required(message="不能为空"), regex(path="PASSWORD_PATTERN", message="密码长度为6-18位, 特殊字符包括.*@!"))]
    pub new_pwd: Option<String>,
}

fn validate_role(role: &str) -> Result<(), ValidationError> {
    match role {
        "superadmin" => Ok(()),
        "admin" => Ok(()),
        "general" => Ok(()),
        _ => Err(ValidationError::new("角色名称错误")),
    }
}
