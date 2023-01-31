use axum::{
    routing::{get, post},
    Router,
};
use std::{
    borrow::BorrowMut, cell::RefCell, net::SocketAddr, str::FromStr, sync::Mutex, time::UNIX_EPOCH,
};

pub static HTTP_HEARTRATE: Mutex<RefCell<i32>> = Mutex::new(RefCell::new(0));
pub static HTTP_HEARTRATE_UPDATE: Mutex<RefCell<i64>> = Mutex::new(RefCell::new(0));
static HTTP_SERVER_RUNNING: Mutex<RefCell<bool>> = Mutex::new(RefCell::new(false));

pub fn start_server(port: u16) {
    log::debug!("start_server {}", port);

    if *HTTP_SERVER_RUNNING
        .lock()
        .unwrap()
        .borrow_mut()
        .clone()
        .borrow_mut()
    {
        return;
    }

    HTTP_SERVER_RUNNING
        .lock()
        .unwrap()
        .borrow_mut()
        .replace(true);

    tokio::task::spawn(async move {
        log::debug!("preparing server");
        let addr = SocketAddr::from(([0, 0, 0, 0], port));
        let app = Router::new()
            .route("/", get(root))
            .route("/", post(post_heartrate));

        log::debug!("listening on {}", addr);
        drop(
            axum::Server::bind(&addr)
                .serve(app.into_make_service())
                .await
                .ok(),
        );
    });
}

async fn root() -> &'static str {
    "hr-osc http server"
}

async fn post_heartrate(payload: String) -> &'static str {
    log::debug!("post_heartrate {}", payload);

    match i32::from_str(&payload) {
        Ok(heartrate) => {
            log::debug!("heartrate {}", heartrate);

            match HTTP_HEARTRATE.lock() {
                Ok(mut http_heartrate) => {
                    http_heartrate.borrow_mut().replace(heartrate);
                }
                Err(err) => {
                    log::error!("error locking http_heartrate: {}", err);
                }
            }

            match HTTP_HEARTRATE_UPDATE.lock() {
                Ok(mut http_heartrate_update) => {
                    match std::time::SystemTime::now().duration_since(UNIX_EPOCH) {
                        Ok(n) => {
                            http_heartrate_update
                                .borrow_mut()
                                .replace(n.as_millis() as i64);
                        }
                        Err(err) => {
                            log::error!("error getting system time: {}", err);
                        }
                    }
                }
                Err(err) => {
                    log::error!("error locking http_heartrate_update: {}", err);
                }
            }

            "ok"
        }
        Err(err) => {
            log::error!("error parsing heartrate: {}", err);

            "error parsing heartrate"
        }
    }
}
