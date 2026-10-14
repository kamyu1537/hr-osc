use axum::extract::Request;
use axum::http::header::CONNECTION;
use axum::http::{HeaderValue, StatusCode};
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

pub async fn start_server(port: u16, lan: bool) -> Result<(), String> {
    log::debug!("start http server: {}", port);
    let mut server = HTTP_HEARTRATE_RECEIVER.server.lock().await;
    stop(&mut server).await;

    let generation = HTTP_HEARTRATE_RECEIVER.generation.load(Ordering::SeqCst);
    let ip = if lan { [0, 0, 0, 0] } else { [127, 0, 0, 1] };
    let addr = SocketAddr::from((ip, port));
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

async fn post_heartrate(generation: u64, payload: String) -> (StatusCode, &'static str) {
    let heartrate = match i64::from_str(&payload) {
        Ok(heartrate) => heartrate,
        Err(err) => {
            log::warn!("invalid heartrate body ({} bytes): {}", payload.len(), err);
            return (StatusCode::BAD_REQUEST, "invalid heartrate");
        }
    };
    if !(0..=300).contains(&heartrate) {
        log::warn!("heartrate out of range: {}", heartrate);
        return (StatusCode::UNPROCESSABLE_ENTITY, "heartrate out of range");
    }

    log::debug!("heartrate {}", heartrate);
    if HTTP_HEARTRATE_RECEIVER
        .set_heartrate(generation, heartrate as i32)
        .await
    {
        (StatusCode::OK, "ok")
    } else {
        (StatusCode::OK, "server stopped")
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
    async fn receiver_restarts_reset_samples_and_reject_stale_posts() {
        let busy = std::net::TcpListener::bind(("0.0.0.0", 0)).unwrap();
        let port = busy.local_addr().unwrap().port();

        let err = timeout(Duration::from_secs(1), start_server(port, true))
            .await
            .expect("start_server blocked")
            .unwrap_err();
        assert!(err.starts_with(&format!("0.0.0.0:{port}: ")), "{err}");
        timeout(Duration::from_secs(1), stop_server())
            .await
            .expect("stop_server blocked");

        drop(busy);
        timeout(Duration::from_secs(1), start_server(port, true))
            .await
            .expect("start_server blocked")
            .unwrap();

        let response = post(port, "60").await;
        assert!(response.starts_with("HTTP/1.1 200 "), "{response}");
        assert!(response.ends_with("\r\n\r\nok"), "{response}");
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate().await, 60);
        assert!(HTTP_HEARTRATE_RECEIVER.get_heartrate_update().await > 0);

        for body in ["", "abc", "60.5", "99999999999999999999"] {
            let response = post(port, body).await;
            assert!(response.starts_with("HTTP/1.1 400 "), "{body}: {response}");
        }
        for body in ["-1", "301", "2147483647"] {
            let response = post(port, body).await;
            assert!(response.starts_with("HTTP/1.1 422 "), "{body}: {response}");
        }
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
        timeout(Duration::from_secs(1), start_server(next_port, true))
            .await
            .expect("start_server blocked")
            .unwrap();
        std::net::TcpListener::bind(("0.0.0.0", port)).unwrap();
        stale.write_all(b"0").await.unwrap();
        let mut response = String::new();
        stale.read_to_string(&mut response).await.unwrap();
        assert!(response.ends_with("\r\n\r\nserver stopped"), "{response}");
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate().await, 0);
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate_update().await, 0);

        let response = post(next_port, "72").await;
        assert!(response.ends_with("\r\n\r\nok"), "{response}");
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate().await, 72);
        assert!(HTTP_HEARTRATE_RECEIVER.get_heartrate_update().await > 0);

        let _idle = TcpStream::connect(("127.0.0.1", next_port)).await.unwrap();
        tokio::time::sleep(Duration::from_millis(100)).await;
        timeout(Duration::from_secs(1), stop_server())
            .await
            .expect("stop_server blocked");
        std::net::TcpListener::bind(("0.0.0.0", next_port)).unwrap();
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate().await, 0);
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate_update().await, 0);

        let busy = std::net::TcpListener::bind(("127.0.0.1", 0)).unwrap();
        let local_port = busy.local_addr().unwrap().port();
        let err = timeout(Duration::from_secs(1), start_server(local_port, false))
            .await
            .expect("start_server blocked")
            .unwrap_err();
        assert!(
            err.starts_with(&format!("127.0.0.1:{local_port}: ")),
            "{err}"
        );

        drop(busy);
        timeout(Duration::from_secs(1), start_server(local_port, false))
            .await
            .expect("start_server blocked")
            .unwrap();
        for (body, heartrate) in [("300", 300), ("0", 0)] {
            let response = post(local_port, body).await;
            assert!(response.ends_with("\r\n\r\nok"), "{body}: {response}");
            assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate().await, heartrate);
        }
        assert!(HTTP_HEARTRATE_RECEIVER.get_heartrate_update().await > 0);

        let busy = std::net::TcpListener::bind(("127.0.0.1", 0)).unwrap();
        let busy_port = busy.local_addr().unwrap().port();
        timeout(Duration::from_secs(1), start_server(busy_port, false))
            .await
            .expect("start_server blocked")
            .unwrap_err();
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate().await, 0);
        assert_eq!(HTTP_HEARTRATE_RECEIVER.get_heartrate_update().await, 0);
        std::net::TcpListener::bind(("127.0.0.1", local_port)).unwrap();

        timeout(Duration::from_secs(1), stop_server())
            .await
            .expect("stop_server blocked");
    }

    async fn post(port: u16, body: &str) -> String {
        let mut client = TcpStream::connect(("127.0.0.1", port)).await.unwrap();
        let request = format!(
            "POST / HTTP/1.1\r\nhost: localhost\r\ncontent-length: {}\r\n\r\n{body}",
            body.len()
        );
        client.write_all(request.as_bytes()).await.unwrap();
        let mut response = String::new();
        client.read_to_string(&mut response).await.unwrap();
        response
    }
}
