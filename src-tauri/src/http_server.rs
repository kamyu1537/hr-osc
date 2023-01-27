use std::{cell::RefCell, net::SocketAddr};

use axum::{routing::get, Router, Server};

use log::{debug, error};
use tokio::sync::oneshot::Sender;

thread_local! {
    static SENDER: RefCell<Option<Sender<()>>> = RefCell::new(None);
}

pub fn stop_server() {
    debug!("Stopping HTTP server...");

    SENDER.with(move |sender| {
        if let Some(tx) = sender.borrow_mut().take() {
            if let Err(e) = tx.send(()) {
                error!("Failed to send stop signal: {:?}", e);
            }
        }
    });
}

pub async fn start_server(port: u16) {
    stop_server();

    let (tx, rx) = tokio::sync::oneshot::channel::<()>();

    debug!("Starting HTTP server on port {}...", port);
    let app = Router::new().route("/", get(root));
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let server = Server::bind(&addr).serve(app.into_make_service());
    let graceful = server.with_graceful_shutdown(async {
        rx.await.ok();
        debug!("HTTP server stopped.");
    });

    SENDER.with(move |sender| {
        *sender.borrow_mut() = Some(tx);
    });

    debug!("HTTP server started on port {}", port);
    if let Err(e) = graceful.await {
        error!("server error: {}", e);
    }
}

async fn root() -> &'static str {
    "Hello, world!"
}
