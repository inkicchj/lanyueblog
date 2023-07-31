use super::super::Data;
use chrono;
use serde::{Deserialize, Serialize};
use sqlx::{self, Type, FromRow};
use super::super::utils::pbkdf::Encrypt;
use validator::{Validate, ValidationError};
use lazy_static::lazy_static;
use regex::Regex;
use super::Pagination;
use anyhow::{anyhow, Result};

lazy_static! {
    static ref PASSWORD_PATTERN: Regex = Regex::new("^[0-9a-zA-Z.*@!]{6,18}$").unwrap();
    static ref SOCIAL_PATTERN: Regex = Regex::new(r#"((weibo|qq|twitter|instagram|github)>(http|https)://(www.)?(\w+(\.)?)+.*,)*"#).unwrap();
}

#[derive(Default, Type, Serialize, Deserialize)]
#[repr(u8)]
pub enum Status {
    #[default]
    // 活动
    Active = 1,
    // 封禁
    Ban = 0,
}

impl From<&str> for Status {
    fn from(value: &str) -> Self {
        match value {
            "Active" => Status::Active,
            "Ban" => Status::Ban,
            _ => Status::Active,
        }
    }
}

#[derive(Default, Type, Serialize, Deserialize, Eq, PartialEq)]
#[repr(u8)]
pub enum Permission {
    // 管理员
    Admin = 1,
    #[default]
    // 普通用户
    General = 2,
}

impl From<&str> for Permission {
    fn from(value: &str) -> Self {
        match value {
            "Admin" => Permission::Admin,
            "General" => Permission::General,
            _ => Permission::General,
        }
    }
}

#[derive(FromRow, Serialize, Default, Deserialize)]
pub struct User {
    pub id: i32,
    pub avatar: Option<String>,
    pub cover: Option<String>,
    pub email: String,
    pub nickname: String,
    pub password: String,
    pub social: String,
    pub signature: String,
    pub status: Status,
    pub created: i64,
    pub logined: i64,
    pub permission: Permission,
}


#[derive(FromRow, Serialize, Default, Deserialize)]
pub struct UserDetail {
    pub id: i32,
    pub avatar: Option<String>,
    pub cover: Option<String>,
    pub email: String,
    pub nickname: String,
    pub password: String,
    pub social: String,
    pub signature: String,
    pub status: Status,
    pub created: i64,
    pub logined: i64,
    pub permission: Permission,
    pub articles: Option<i32>,
}



impl User {
    pub fn new(info: NewUser, perm: Permission) -> Self {
        Self {
            avatar: None,
            cover: None,
            email: info.email.unwrap(),
            nickname: info.nickname.unwrap(),
            password: Encrypt::generate(&info.password.unwrap()).unwrap(),
            created: chrono::Local::now().timestamp(),
            permission: perm,
            ..Default::default()
        }
    }
}



pub struct UserOperate;

impl UserOperate {
    pub async fn exists(email: &str, nickname: Option<&str>) -> Result<bool> {

        let mut builder = sqlx::QueryBuilder::new("SELECT COUNT(*) FROM user WHERE email=");
        builder.push_bind(email);
        if let Some(n) = nickname {
            builder.push(" OR nickname=").push_bind(n);
        };
        let count: (i64,) = builder.build_query_as()
            .fetch_one(&Data::get())
            .await?;
        Ok(count.0 > 0)
    }

    pub async fn create_one(register: NewUser, perm: Permission) -> Result<i64> {
        if UserOperate::exists(&register.email.as_ref().unwrap(), Some(&register.nickname.as_ref().unwrap())).await.unwrap() {
          return Err(anyhow!("该邮箱或昵称已存在"));
        };
        let sql = r##"
            INSERT INTO user (avatar,cover,email,nickname,password,social,signature,status,created,logined,permission)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        "##;
        let user = User::new(register, perm);
        let result = sqlx::query(sql)
            .bind(user.avatar)
            .bind(user.cover)
            .bind(user.email)
            .bind(user.nickname)
            .bind(user.password)
            .bind(user.social)
            .bind(user.signature)
            .bind(user.status)
            .bind(user.created)
            .bind(user.logined)
            .bind(user.permission)
            .execute(&Data::get())
            .await?;
        Ok(result.last_insert_rowid())
    }

    pub async fn delete_one(id: i32) -> Result<u64> {
        let sql = "DELETE FROM user WHERE id=?";
        let result = sqlx::query(sql)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn find_one(id: i32) -> Result<UserDetail> {
        let sql = r##"
            SELECT user.*,articles FROM user
            LEFT JOIN (SELECT a.user_id, count(a.id) as articles from article as a GROUP BY a.user_id) s ON s.user_id=user.id
            WHERE user.id=?
        "##;
        let result: UserDetail = sqlx::query_as(sql)
            .bind(id)
            .fetch_one(&Data::get())
            .await?;
        Ok(result)
    }

    pub async fn find_many(filter: FindManyUser<'_>, page: Option<u32>) -> Result<Pagination<Vec<User>>> {
        let sql = "SELECT * FROM user";
        let count_sql = "SELECT count(*) FROM user";
        let mut builder = sqlx::QueryBuilder::new(sql);
        let mut builder_count = sqlx::QueryBuilder::new(count_sql);
        builder.push(" WHERE ");
        builder_count.push(" WHERE ");
        builder.push("email like ")
            .push_bind(format!("%{}%", &filter.email.as_ref().unwrap_or(&"".to_string())));
        builder_count.push("email like ")
            .push_bind(format!("%{}%", &filter.email.as_ref().unwrap_or(&"".to_string())));
        builder.push("AND nickname like ")
            .push_bind(format!("%{}%", &filter.nickname.as_ref().unwrap_or(&"".to_string())));
        builder_count.push("AND nickname like ")
            .push_bind(format!("%{}%", &filter.nickname.as_ref().unwrap_or(&"".to_string())));
        if let Some(status) = filter.status {
            builder.push(" AND status=").push_bind(Status::from(status));
            builder_count.push(" AND status=").push_bind(Status::from(status));
        }
        builder.push("LIMIT 30 OFFSET ")
            .push_bind((page.unwrap_or(1)-1) * 30);
        let data: Vec<User> = builder.build_query_as().fetch_all(&Data::get()).await?;
        let total: (i64,) = builder_count.build_query_as()
            .fetch_one(&Data::get()).await?;
        Ok(Pagination::new(total.0 as u32, page.unwrap_or(1), data))
    }

    pub async fn update_info(id: i32, info: UpdateInfo) -> Result<u64> {
        let sql = "UPDATE user SET nickname=?,social=?,signature=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(info.nickname)
            .bind(info.social)
            .bind(info.signature)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn update_permission(id: i32, perm: UpdatePermission<'_>) -> Result<u64> {
        let permission = Permission::from(perm.content.unwrap());
        let sql = "UPDATE user SET permission=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(permission)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn update_status(id: i32, stat: &UpdateStatus<'_>) -> Result<u64> {
        let status = Status::from(stat.content.unwrap());
        let sql = "UPDATE user SET status=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(status)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn update_password(id: i32, pwd: UpdatePassword) -> Result<u64> {
        if pwd.old_pwd == pwd.new_pwd {
            return Err(anyhow!("新旧密码不能相同"));
        };
        let user = UserOperate::find_one(id).await?;
        if Encrypt::check(&pwd.old_pwd.unwrap(), &user.password) {
            let sql = "UPDATE user SET password=? WHERE id=?";
            let result = sqlx::query(sql)
                .bind(Encrypt::generate(&pwd.new_pwd.unwrap()[..]).unwrap())
                .bind(id)
                .execute(&Data::get())
                .await?;
            Ok(result.rows_affected())
        } else {
            Err(anyhow!("新旧密码不能相同"))
        }
    }

    pub async fn update_avatar(id: i32, url: String) -> Result<u64> {
        let sql = "UPDATE user SET avatar=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(url)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn update_cover(id: i32, url: String) -> Result<u64> {
        let sql = "UPDATE user SET cover=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(url)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn update_logined(id: i32) -> Result<u64> {
        let sql = "UPDATE user SET logined=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(chrono::Local::now().timestamp())
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn update_email(id: i32, email: UpdateEmail) -> Result<u64> {
        match UserOperate::find_one(id).await {
            Ok(user) => {
                if user.email == email.clone().content.unwrap() {
                    return Ok(1)
                } else {
                    if UserOperate::exists(&email.clone().content.unwrap(), None).await.unwrap() {
                        return Err(anyhow!("该邮箱已存在"));
                    };
                }
            },
            Err(_) => {
                return Err(anyhow!("该用户不存在"));
            }
        }
        let sql = "UPDATE user SET email=? WHERE id=?";
        let result = sqlx::query(sql)
            .bind(email.content)
            .bind(id)
            .execute(&Data::get())
            .await?;
        Ok(result.rows_affected())
    }

    pub async fn logined(login: LoginUser) -> Result<UserDetail> {
        if !UserOperate::exists(&login.email.as_ref().unwrap(), None).await.unwrap() {
            return Err(anyhow!("该邮箱还未注册"));
        };

        let sql = r##"
            SELECT user.*,articles FROM user
            LEFT JOIN (SELECT a.user_id, count(a.id) as articles from article as a GROUP BY a.user_id) s ON s.user_id=user.id
            WHERE user.email=?

        "##;
        let user: UserDetail = sqlx::query_as(sql)
            .bind(login.email)
            .fetch_one(&Data::get()).await?;
        if Encrypt::check(&login.password.unwrap(), &user.password) {
            Ok(user)
        } else {
            Err(anyhow!("密码错误"))
        }
    }
}

#[derive(Deserialize)]
pub struct FindManyUser<'a> {
    pub email: Option<String>,
    pub nickname: Option<String>,
    pub status: Option<&'a str>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct NewUser {
    #[validate(required(message = "不能为空"), email(message = "邮箱格式应为example@xxx.com"))]
    pub email: Option<String>,
    #[validate(required(message = "不能为空"), regex(path = "PASSWORD_PATTERN", message = "密码长度为6-18位, 特殊字符包括.*@!"))]
    pub password: Option<String>,
    #[validate(required(message = "不能为空"), length(min = 2, max = 20, message = "昵称长度为2-20"))]
    pub nickname: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct LoginUser {
    #[validate(required(message = "不能为空"), email(message = "邮箱格式应为example@xxx.com"))]
    pub email: Option<String>,
    #[validate(required(message = "不能为空"), regex(path = "PASSWORD_PATTERN", message = "密码长度为6-18位, 特殊字符包括.*@!"))]
    pub password: Option<String>,
    pub remember: Option<bool>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdateInfo {
    #[validate(length(min=2, max=20, message = "昵称长度为2-30"))]
    pub nickname: Option<String>,
    #[validate(regex(path="SOCIAL_PATTERN", message="社交平台信息格式不正确"))]
    pub social: Option<String>,
    #[validate(length(max = 50, message = "字数不超过200"))]
    pub signature: Option<String>,
}


#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdatePermission<'s> {
    #[validate(required, custom="validate_permission")]
    pub content: Option<&'s str>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdateStatus<'s> {
    #[validate(required, custom="validate_status")]
    pub content: Option<&'s str>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdateEmail {
    #[validate(required, email(message="邮箱格式不正确"))]
    pub content: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Validate)]
pub struct UpdatePassword {
    #[validate(required(message = "不能为空"), regex(path = "PASSWORD_PATTERN", message = "密码长度为6-18位, 特殊字符包括.*@!"))]
    pub old_pwd: Option<String>,
    #[validate(required(message = "不能为空"), regex(path = "PASSWORD_PATTERN", message = "密码长度为6-18位, 特殊字符包括.*@!"))]
    pub new_pwd: Option<String>,
}

fn validate_permission(perm: &str) -> std::result::Result<(), ValidationError> {
    match perm {
        "Admin" => Ok(()),
        "General" => Ok(()),
        _ => Err(ValidationError::new("不存在的权限")),
    }
}

fn validate_status(status: &str) -> std::result::Result<(), ValidationError> {
    match status {
        "Ban" => Ok(()),
        "Active" => Ok(()),
        _ => Err(ValidationError::new("不存在的状态")),
    }
}