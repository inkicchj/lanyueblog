use salvo::prelude::*;
use super::super::model::user::LoginedUser;
use super::super::Render;

pub fn get_user(depot: &mut Depot) -> Option<LoginedUser> {
    match depot.session_mut() {
        Some(s) => {
            match s.get::<LoginedUser>("logined") {
                Some(user) => {Some(user)}
                None => None
            }
        },
        None => None
    }
}

#[handler]
pub async fn is_login(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    match depot.session_mut() {
        Some(s) => {
            match s.get::<LoginedUser>("logined") {
                Some(_) => {
                    ctrl.call_next(req, depot, res).await;
                },
                None => {
                    res.render(Redirect::other("/login"));
                }
            }
        },
        None => {
            res.render(Redirect::other("/login"));
        },
    }
}

#[handler]
pub async fn is_superadmin(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    match depot.session_mut() {
        Some(s) => {
            match s.get::<LoginedUser>("logined") {
                Some(user) => {
                    if user.role == "superadmin" {
                        
                        ctrl.call_next(req, depot, res).await;
                    } else {
                        res.render(Redirect::other("/control/no_permission"))
                    }
                },
                None => {
                    res.render(Redirect::other("/login"));
                }
            }
        },
        None => {
            res.render(Redirect::other("/login"));
        },
    }
}

#[handler]
pub async fn is_admin(req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
    match depot.session_mut() {
        Some(s) => {
            match s.get::<LoginedUser>("logined") {
                Some(user) => {
                    if user.role == "admin" {
                        ctrl.call_next(req, depot, res).await;
                    } else {
                        res.render(Redirect::other("/no_permission"))
                    }
                },
                None => {
                    res.render(Redirect::other("/login"));
                }
            }
        },
        None => {
            res.render(Redirect::other("/login"));
        },
    }
}