use axum::{
    routing::{get, post},
    Router,
};
use std::{
    borrow::BorrowMut, cell::RefCell, net::SocketAddr, str::FromStr, sync::Mutex, time::UNIX_EPOCH,
};
use tokio::sync::oneshot::Sender;

pub static HTTP_HEARTRATE: Mutex<RefCell<i32>> = Mutex::new(RefCell::new(0));
pub static HTTP_HEARTRATE_UPDATE: Mutex<RefCell<i64>> = Mutex::new(RefCell::new(0));

static HTTP_SHUTDOWN: Mutex<RefCell<Option<Sender<()>>>> = Mutex::new(RefCell::new(None));
static HTTP_SERVER_RUNNING: Mutex<RefCell<bool>> = Mutex::new(RefCell::new(false));

pub fn stop_server() {
    if !(*HTTP_SERVER_RUNNING
        .lock()
        .unwrap()
        .borrow_mut()
        .clone()
        .borrow_mut())
    {
        log::debug!("server not running");
        return;
    }

    log::debug!("stop_server");
    match HTTP_SHUTDOWN.lock() {
        Ok(mut shutdown) => {
            if let Some(tx) = shutdown.borrow_mut().take() {
                tx.send(()).ok();

                log::debug!("SHUTDOWN.lock() ok");
            } else {
                log::debug!("SHUTDOWN.lock() already stopped")
            }
        }
        Err(e) => log::error!("SHUTDOWN.lock() error: {}", e),
    }
}

pub fn start_server(port: u16) {
    log::debug!("start_server {}", port);

    tokio::task::spawn(async move {
        // wait SERVER_RUNNING to be true
        while *HTTP_SERVER_RUNNING
            .lock()
            .unwrap()
            .borrow_mut()
            .clone()
            .borrow_mut()
        {
            stop_server();
            log::debug!("waiting for server to stop (1000ms)...");
            tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
        }

        HTTP_SERVER_RUNNING
            .lock()
            .unwrap()
            .borrow_mut()
            .replace(true);

        log::debug!("preparing server");
        let addr = SocketAddr::from(([0, 0, 0, 0], port));
        let app = Router::new()
            .route("/", get(root))
            .route("/", post(post_heartrate));

        let (tx, rx) = tokio::sync::oneshot::channel::<()>();
        log::debug!("listening on {}", addr);
        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .with_graceful_shutdown(async move {
                if let Ok(mut shutdown) = HTTP_SHUTDOWN.lock() {
                    shutdown.borrow_mut().replace(Some(tx));
                }

                log::debug!("server started");
                rx.await.ok();

                HTTP_SERVER_RUNNING
                    .lock()
                    .unwrap()
                    .borrow_mut()
                    .replace(false);
                log::debug!("server stopped");
            })
            .await
            .ok();

        log::debug!("server stopped");
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
