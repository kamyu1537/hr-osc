use axum::{
    routing::{get, post},
    Router,
};
use once_cell::sync::Lazy;

use std::{
    borrow::BorrowMut, cell::RefCell, net::SocketAddr, str::FromStr, sync::Mutex, time::UNIX_EPOCH,
};

use tokio::sync::oneshot::Sender;

static HTTP_FUNC_MUTEX: Lazy<tokio::sync::Mutex<i8>> = Lazy::new(|| tokio::sync::Mutex::new(0));
static HTTP_STOP_MUTEX: Lazy<tokio::sync::Mutex<i8>> = Lazy::new(|| tokio::sync::Mutex::new(0));
static HTTP_SERVER_TX: Mutex<RefCell<Option<Sender<()>>>> = Mutex::new(RefCell::new(None));

pub static HTTP_HEARTRATE: Mutex<RefCell<i32>> = Mutex::new(RefCell::new(0));
pub static HTTP_HEARTRATE_UPDATE: Mutex<RefCell<i64>> = Mutex::new(RefCell::new(0));

fn stop_server() {
    match HTTP_SERVER_TX.lock() {
        Ok(mut http_server_tx) => match http_server_tx.borrow_mut().take() {
            Some(tx) => {
                log::debug!("stopping server");
                tx.send(()).ok();
            }
            None => {
                log::debug!("no server to stop");
            }
        },
        Err(err) => {
            log::error!("error locking http_server_tx: {}", err);
            return;
        }
    }
}

pub fn start_server(port: u16) {
    tokio::spawn(async move {
        log::debug!("=======================================");

        let mutex2 = HTTP_FUNC_MUTEX.lock().await;
        log::debug!("start_server {}", port);
        stop_server();

        let mutex1 = HTTP_STOP_MUTEX.lock().await;

        log::debug!("preparing server");

        let (tx, rx) = tokio::sync::oneshot::channel::<()>();

        let server = async move {
            let addr = SocketAddr::from(([0, 0, 0, 0], port));
            let app = Router::new()
                .route("/", get(root))
                .route("/", post(post_heartrate));

            log::debug!("listening on {}", addr);

            let mut print_err = true;
            let serve = loop {
                match axum::Server::try_bind(&addr) {
                    Ok(bind) => {
                        break bind.serve(app.into_make_service());
                    }
                    Err(err) => {
                        if print_err {
                            println!("error binding server: {}", err);
                            print_err = false;
                        }
                    }
                }
            };

            drop(mutex2);
            serve.await.expect("server error");
        };

        let receive = async {
            HTTP_SERVER_TX.lock().unwrap().replace(Some(tx));
            rx.await.ok();
        };

        tokio::select! {
            _ = server => {}
            _ = receive => {}
        }

        log::debug!("server stopped");
        drop(mutex1);
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
