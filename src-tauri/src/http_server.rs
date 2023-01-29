use axum::{
    routing::{get, post},
    Router,
};
use hyper::Uri;
use std::{cell::RefCell, net::SocketAddr, str::FromStr, time::UNIX_EPOCH};

pub static mut HTTP_HEARTRATE: i32 = 0;
pub static mut LAST_RECEIVED: i64 = 0;

thread_local! {
    static LAST_PORT: RefCell<u16> = RefCell::new(0);
    static SHUTDOWN: RefCell<Option<tokio::sync::oneshot::Sender<()>>> = RefCell::new(None);
    static SERVER_HANDLE: RefCell<Option<tauri::async_runtime::TokioJoinHandle<()>>> = RefCell::new(None);

    // pub static HTTP_HEARTRATE: RefCell<i32> = RefCell::new(0);
    // pub static LAST_RECEIVED: RefCell<i64> = RefCell::new(0);
}

pub fn stop_server() {
    log::debug!("stop_server");

    SERVER_HANDLE.with(|server_handle| {
        if let Some(handle) = server_handle.borrow_mut().take() {
            log::debug!("stopping server");

            SHUTDOWN.with(|shutdown| {
                if let Some(tx) = shutdown.borrow_mut().take() {
                    tx.send(()).unwrap();
                }
            });

            handle.abort();
            tokio::spawn(async {
                let port = LAST_PORT.with(|last_port| *last_port.borrow());
                if port != 0 {
                    if let Ok(req_uri) = Uri::from_str(&format!("http://localhost:{}", port)) {
                        let client = hyper::client::Client::new();
                        client.get(req_uri).await.ok();
                    }
                }
            });
        }
    });
}

pub fn start_server(port: u16) {
    stop_server();

    log::debug!("start_server {}", port);
    LAST_PORT.with(move |last_port| {
        *last_port.borrow_mut() = port;
    });

    let handle = tokio::task::spawn(async move {
        let addr = SocketAddr::from(([0, 0, 0, 0], port));

        let app = Router::new()
            .route("/", get(root))
            .route("/", post(post_heartrate));

        log::debug!("listening on {}", addr);

        let (tx, rx) = tokio::sync::oneshot::channel::<()>();

        SHUTDOWN.with(move |shutdown| {
            *shutdown.borrow_mut() = Some(tx);
        });

        drop(
            axum::Server::bind(&addr)
                .serve(app.into_make_service())
                .with_graceful_shutdown(async move {
                    rx.await.ok();
                })
                .await
                .unwrap(),
        );
    });

    SERVER_HANDLE.with(move |server_handle| {
        *server_handle.borrow_mut() = Some(handle);
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

            unsafe {
                HTTP_HEARTRATE = heartrate;
                LAST_RECEIVED = std::time::SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as i64;
            }

            "ok"
        }
        Err(err) => {
            log::error!("error parsing heartrate: {}", err);

            "error parsing heartrate"
        }
    }
}
