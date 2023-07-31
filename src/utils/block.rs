use salvo::prelude::*;
use crate::model::user::{UserDetail, Permission};
use super::cache;


pub fn get_user(depot: &mut Depot) -> Option<UserDetail> {
    match depot.session_mut() {
        Some(session) => match session.get::<i32>("login_user") {
            Some(uid) => match cache::get::<UserDetail>(&format!("user_{}", uid)) {
                Some(user) => Some(user),
                None => None,
            },
            None => None,
        },
        None => None
    }
}

#[handler]
pub async fn must_login(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    if let Some(session) = depot.session_mut() {
        if let Some(uid) = session.get::<i32>("login_user") {
            if let Some(user) = cache::get::<UserDetail>(&format!("user_{}", uid)) {
                depot.insert("user", user);
                ctrl.call_next(req, depot, res).await;
            } else {
                ctrl.skip_rest();
                res.render(Redirect::other("/login"));
            }
        } else {
            ctrl.skip_rest();
            res.render(Redirect::other("/login"));
        }
    } else {
        ctrl.skip_rest();
        res.render(Redirect::other("/login"));
    }
}

#[handler]
pub async fn must_admin(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    let user = get_user(depot).unwrap();
    if user.permission == Permission::Admin {
        ctrl.call_next(req, depot, res).await;
    } else {
        res.render(Redirect::other("/no_permission"))
    }
}