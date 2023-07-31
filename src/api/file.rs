use salvo::prelude::*;
use super::Resp;
use crate::model::file::{File, FileOperate, FileDeleteById, FileUpdateByArticle, FileManyByArticle};
use crate::utils::block::{must_login, must_admin, get_user};
use crate::utils::filehandler::FileSave;
use std::fs;
use crate::config::CONF;



#[handler]
async fn upload(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    // let user = get_user(depot).unwrap();
    let cid = req.query::<i32>("aid");
    let file = if let Some(data) = req.file("file").await {
        data
    } else {
        return Resp::err_msg("没有要上传的文件").json_resp(res);
    };
    let mut file_info = File::new(file, 1, cid);
    match FileSave::new(1, file, &CONF.attachment.save_dir).save().await {
        Ok(r) => {
            file_info.preview = r.0;
            if let Some(thumb) = r.1 {
                file_info.thumbnail = Some(thumb)
            };
            match FileOperate::create_one(&file_info).await {
                Ok(f) => {
                    Resp::ok(f).json_resp(res)
                },
                Err(_e) => {
                    fs::remove_file(file_info.preview).unwrap();
                    if let Some(th) = file_info.thumbnail {
                        fs::remove_file(th).unwrap();
                    };
                    Resp::err_msg("上传失败").json_resp(res)
                }
            }
        },
        Err(e) => {
            Resp::err_msg(&e.to_string()).json_resp(res)
        }
    }
}

#[handler]
async fn find_many(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let page = req.query::<u32>("page");
    let aid = req.parse_json::<FileManyByArticle>().await.unwrap();
    match aid.article_id {
        Some(id) => {
            match FileOperate::find_many_with_article(id).await {
                Ok(file) => Resp::ok(file).json_resp(res),
                Err(_) => Resp::err_msg("获取附件列表失败").json_resp(res),
            }
        },
        None => {
            match FileOperate::find_many(page).await {
                Ok(data) => Resp::ok(data).json_resp(res),
                Err(_) => {
                    Resp::err_msg("获取附件列表失败").json_resp(res)},
            }
        }
    }

}

#[handler]
async fn delete_one(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let fid = req.param::<i32>("fid").unwrap();
    let file = if let Ok(data) = FileOperate::find_one(fid).await {
        data
    } else {
        return Resp::err_msg("要删除的附件不存在").json_resp(res);
    };
    match FileOperate::delete_one(fid).await {
        Ok(_) => {
            fs::remove_file(file.preview).unwrap();
            if let Some(t) = file.thumbnail {
                fs::remove_file(t).unwrap();
            };
            Resp::ok_msg("删除成功").json_resp(res)
        },
        Err(_) => Resp::err_msg("删除失败").json_resp(res),
    }
}


#[handler]
async fn find_one(req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    let fid = req.param::<i32>("fid").unwrap();
    match FileOperate::find_one(fid).await {
        Ok(data) => Resp::ok(data).json_resp(res),
        Err(_) => Resp::err_msg("未找到该附件").json_resp(res)
    }
}

#[handler]
async fn update_with_article(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    let fid = req.param::<i32>("fid").unwrap();
    let aid = req.parse_json::<FileUpdateByArticle>().await.unwrap();
    match FileOperate::update_with_article(fid, aid.aid.unwrap()).await {
        Ok(_) => Resp::ok_msg(&format!("更新附件{}成功", fid)).json_resp(res),
        Err(e) => Resp::err_msg(&e.to_string()).json_resp(res)
    }
}


pub struct FileApi;

impl FileApi {
    pub fn build() -> Router {
        Router::with_path("file")
            .push(
                Router::new()
                    .hoop(must_login)
                    .hoop(must_admin)
                    .push(Router::new().path("upload").post(upload))
                    .push(Router::new().path("list").post(find_many))
                    .push(Router::new().path("detail/<fid:num>").post(find_one))
                    .push(Router::new().path("delete/<fid:num>").post(delete_one))
                    .push(Router::new().path("update_with_article/<fid:num>").post(update_with_article))
            )
    }
}