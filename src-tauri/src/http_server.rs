use axum::extract::Request;
use axum::http::header::CONNECTION;
use axum::http::HeaderValue;
use axum::response::Response;
use axum::{
    middleware::{self, Next},
    routing::{get, post},
    Router,
};
use once_cell::sync::Lazy;
use std::net::SocketAddr;
use std::str::FromStr;
use std::sync::atomic::{AtomicU64, Ordering};
use tokio::sync::Mutex;
use tokio::task::JoinHandle;

pub struct HttpHeartRateReceiver {
    server: Mutex<Option<JoinHandle<std::io::Result<()>>>>,
    generation: AtomicU64,

    heartrate: Mutex<i32>,
    heartrate_update: Mutex<i64>,
}

impl HttpHeartRateReceiver {
    fn new() -> Self {
        Self {
            server: Mutex::new(None),
            generation: AtomicU64::new(0),
            heartrate: Mutex::new(0),
            heartrate_update: Mutex::new(0),
        }
    }

    async fn set_heartrate(&self, generation: u64, heartrate: i32) -> bool {
        let mut lock = self.heartrate.lock().await;
        if self.generation.load(Ordering::SeqCst) != generation {
            return false;
        }
        *lock = heartrate;
        self.set_heartrate_update().await;
        true
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

async fn stop(server: &mut Option<JoinHandle<std::io::Result<()>>>) {
    HTTP_HEARTRATE_RECEIVER
        .generation
        .fetch_add(1, Ordering::SeqCst);
    if let Some(server) = server.take() {
        server.abort();
        server.await.ok();
        log::debug!("server stopped");
    }
}

pub async fn stop_server() {
    log::debug!("stop http server");
    stop(&mut *HTTP_HEARTRATE_RECEIVER.server.lock().await).await;
}

pub async fn start_server(port: u16) -> Result<(), String> {
    log::debug!("start http server: {}", port);
    let mut server = HTTP_HEARTRATE_RECEIVER.server.lock().await;
    stop(&mut server).await;

    let generation = HTTP_HEARTRATE_RECEIVER.generation.load(Ordering::SeqCst);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let app = Router::new()
        .route("/", get(root))
        .route(
            "/",
            post(move |payload| post_heartrate(generation, payload)),
        )
        .layer(middleware::from_fn(change_connection_header));

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .map_err(|err| format!("{addr}: {err}"))?;

    log::debug!("server binding: {}", addr);
    *server = Some(tokio::spawn(
        async move { axum::serve(listener, app).await },
    ));
    Ok(())
}

async fn change_connection_header(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;
    response
        .headers_mut()
        .insert(CONNECTION, HeaderValue::from_static("close"));
    response
}

async fn root() -> &'static str {
    "hr-osc http server"
}

async fn post_heartrate(generation: u64, payload: String) -> &'static str {
    log::debug!("post_heartrate {}", payload);

    match i32::from_str(&payload) {
        Ok(heartrate) => {
            log::debug!("heartrate {}", heartrate);
            if HTTP_HEARTRATE_RECEIVER
                .set_heartrate(generation, heartrate)
                .await
            {
                "ok"
            } else {
                "server stopped"
            }
        }
        Err(err) => {
            log::error!("error parsing heartrate: {}", err);

            "error parsing heartrate"
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use tokio::net::TcpStream;
    use tokio::time::timeout;

    #[tokio::test]
    async fn busy_port_fails_without_blocking_restart() {
        let busy = std::net::TcpListener::bind(("0.0.0.0", 0)).unwrap();
        let port = busy.local_addr().unwrap().port();

        let err = timeout(Duration::from_secs(1), start_server(port))
            .await
            .expect("start_server blocked")
            .unwrap_err();
        assert!(err.starts_with(&format!("0.0.0.0:{port}: ")), "{err}");
        timeout(Duration::from_secs(1), stop_server())
            .await
            .expect("stop_server blocked");

        drop(busy);
        timeout(Duration::from_secs(1), start_server(port))
            .await
            .expect("start_server blocked")
            .unwrap();

        let mut client = TcpStream::connect(("127.0.0.1", port)).await.unwrap();
        client
            .write_all(b"POST / HTTP/1.1\r\nhost: localhost\r\ncontent-length: 2\r\n\r\n60")
            .await
            .unwrap();
        let mut response = String::new();
        client.read_to_string(&mut response).await.unwrap();
        assert!(response.ends_with("\r\n\r\nok"), "{response}");
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate().await, 60);

        let mut stale = TcpStream::connect(("127.0.0.1", port)).await.unwrap();
        stale
            .write_all(b"POST / HTTP/1.1\r\nhost: localhost\r\ncontent-length: 2\r\n\r\n7")
            .await
            .unwrap();
        tokio::time::sleep(Duration::from_millis(100)).await;
        let next_port = std::net::TcpListener::bind(("0.0.0.0", 0))
            .unwrap()
            .local_addr()
            .unwrap()
            .port();
        timeout(Duration::from_secs(1), start_server(next_port))
            .await
            .expect("start_server blocked")
            .unwrap();
        std::net::TcpListener::bind(("0.0.0.0", port)).unwrap();
        stale.write_all(b"0").await.unwrap();
        let mut response = String::new();
        stale.read_to_string(&mut response).await.unwrap();
        assert!(response.ends_with("\r\n\r\nserver stopped"), "{response}");
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate().await, 60);

        let _idle = TcpStream::connect(("127.0.0.1", next_port)).await.unwrap();
        tokio::time::sleep(Duration::from_millis(100)).await;
        timeout(Duration::from_secs(1), stop_server())
            .await
            .expect("stop_server blocked");
        std::net::TcpListener::bind(("0.0.0.0", next_port)).unwrap();
    }
}
