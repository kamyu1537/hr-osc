use axum::body::BoxBody;
use axum::http::header::CONNECTION;
use axum::http::{HeaderValue, Request, Response};
use axum::{
    middleware::{self, Next},
    routing::{get, post},
    Router,
};
use once_cell::sync::Lazy;
use std::net::SocketAddr;
use std::str::FromStr;
use std::time::Duration;
use tokio::sync::{oneshot, Mutex};

pub struct HttpHeartRateReceiver {
    tx: Mutex<Option<oneshot::Sender<()>>>,

    func_mutex: Mutex<()>,
    stop_mutex: Mutex<()>,

    heartrate: Mutex<i32>,
    heartrate_update: Mutex<i64>,
}

impl HttpHeartRateReceiver {
    fn new() -> Self {
        Self {
            tx: Mutex::new(None),
            func_mutex: Mutex::new(()),
            stop_mutex: Mutex::new(()),
            heartrate: Mutex::new(0),
            heartrate_update: Mutex::new(0),
        }
    }

    async fn set_heartrate(&self, heartrate: i32) {
        let mut lock = self.heartrate.lock().await;
        *lock = heartrate;
    }

    pub async fn get_heartrate(&self) -> i32 {
        let lock = self.heartrate.lock().await;
        *lock
    }

    async fn set_heartrate_update(&self) {
        let now = std::time::SystemTime::now();
        if let Ok(since_the_epoch) = now.duration_since(std::time::UNIX_EPOCH) {
            let mut lock = self.heartrate_update.lock().await;
            *lock = since_the_epoch.as_millis() as i64;
        }
    }

    pub async fn get_heartrate_update(&self) -> i64 {
        let lock = self.heartrate_update.lock().await;
        *lock
    }
}

pub static HTTP_HEARTRATE_RECEIVER: Lazy<HttpHeartRateReceiver> =
    Lazy::new(HttpHeartRateReceiver::new);

pub async fn stop_server() {
    log::debug!("stop http server");

    if let Some(tx) = HTTP_HEARTRATE_RECEIVER.tx.lock().await.take() {
        log::debug!("send stop http server");
        tx.send(()).ok();
    } else {
        log::error!("stop http server: tx is None");
    }
}

pub fn start_server(port: u16) {
    tokio::spawn(async move {
        log::debug!("start http server: {}", port);
        let func_mutex = HTTP_HEARTRATE_RECEIVER.func_mutex.lock().await;
        stop_server().await;

        let stop_mutex = HTTP_HEARTRATE_RECEIVER.stop_mutex.lock().await;
        let mut sender_lock = HTTP_HEARTRATE_RECEIVER.tx.lock().await;
        let (tx, rx) = oneshot::channel::<()>();

        let addr = SocketAddr::from(([0, 0, 0, 0], port));
        let app = Router::new()
            .route("/", get(root))
            .route("/", post(post_heartrate))
            .layer(middleware::from_fn(change_connection_header));

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

                    // 500ms 마다 재시도
                    tokio::time::sleep(Duration::from_millis(500)).await;
                }
            }
        };

        log::debug!("server binding: {}", addr);
        drop(func_mutex);

        serve
            .with_graceful_shutdown(async {
                *sender_lock = Some(tx);
                drop(sender_lock);

                rx.await.ok();

                log::debug!("receive server graceful shutdown");
            })
            .await
            .expect("server error");

        log::debug!("server stopped");
        drop(stop_mutex);
    });
}

async fn change_connection_header<B>(request: Request<B>, next: Next<B>) -> Response<BoxBody> {
    let mut response = next.run(request).await;
    response
        .headers_mut()
        .insert(CONNECTION, HeaderValue::from_static("close"));
    response
}

async fn root() -> &'static str {
    "hr-osc http server"
}

async fn post_heartrate(payload: String) -> &'static str {
    log::debug!("post_heartrate {}", payload);

    match i32::from_str(&payload) {
        Ok(heartrate) => {
            log::debug!("heartrate {}", heartrate);
            HTTP_HEARTRATE_RECEIVER.set_heartrate(heartrate).await;
            HTTP_HEARTRATE_RECEIVER.set_heartrate_update().await;
            "ok"
        }
        Err(err) => {
            log::error!("error parsing heartrate: {}", err);

            "error parsing heartrate"
        }
    }
}
