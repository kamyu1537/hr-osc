use std::{cell::RefCell, net::SocketAddr};

use axum::{routing::get, Router, Server};

use log::{debug, error};
use tokio::sync::oneshot::{Receiver, Sender};

thread_local! {
    static HTTP_SHUTDOWN_SENDER: RefCell<Option<Sender<()>>> = RefCell::new(None);
    static SERVER_STOP_RECEIVER: RefCell<Option<Receiver<()>>> = RefCell::new(None);
    static SERVER_STOP_STATUS: RefCell<bool> = RefCell::new(false);
}

pub fn stop_server() {
    let check_stop = SERVER_STOP_STATUS.with(|server_stop_status| *server_stop_status.borrow());
    if check_stop {
        debug!("Already waiting for HTTP server to stop.");
        return;
    }

    debug!("Stopping HTTP server...");

    HTTP_SHUTDOWN_SENDER.with(|sender| match sender.borrow_mut().take() {
        Some(sender) => {
            if let Err(e) = sender.send(()) {
                error!("Failed to send HTTP shutdown signal: {:?}", e);
            }
        }
        None => debug!("No HTTP server to stop."),
    });
}

pub async fn start_server(port: u16) {
    stop_server();
    debug!("=======================================");

    let check_stop = SERVER_STOP_STATUS.with(|server_stop_status| *server_stop_status.borrow());
    if check_stop {
        debug!("Already waiting for HTTP server to stop.");
        return;
    }

    if let Some(receiver) =
        SERVER_STOP_RECEIVER.with(|server_stop_receiver| server_stop_receiver.borrow_mut().take())
    {
        debug!("Waiting for HTTP server to stop... {receiver:?}");

        SERVER_STOP_STATUS.with(|server_stop_status| {
            *server_stop_status.borrow_mut() = true;
        });

        receiver.await.ok();
    }

    let (stop_sender, stop_receiver) = tokio::sync::oneshot::channel::<()>();
    SERVER_STOP_RECEIVER.with(move |receiver| {
        debug!("Setting HTTP stop receiver...");
        *receiver.borrow_mut() = Some(stop_receiver);
    });

    debug!("=======================================");
    debug!("Starting HTTP server on port {}...", port);

    // router.
    let app = Router::new().route("/", get(root));

    // server binding
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let server = Server::bind(&addr).serve(app.into_make_service());

    // graceful shutdown
    let (shutdown_sender, shutdown_receiver) = tokio::sync::oneshot::channel::<()>();
    let graceful = server.with_graceful_shutdown(async {
        shutdown_receiver.await.ok();
        debug!("HTTP stop signal received.");
    });

    // set shutdown sender
    HTTP_SHUTDOWN_SENDER.with(move |sender| {
        debug!("Setting HTTP shutdown sender...");
        *sender.borrow_mut() = Some(shutdown_sender);
    });

    debug!("HTTP server started on port {}", port);
    debug!("=======================================");

    match graceful.await {
        Ok(_) => {
            debug!("HTTP server stopped.");
            SERVER_STOP_STATUS.with(|server_stop_status| {
                *server_stop_status.borrow_mut() = false;
            });

            if let Err(e) = stop_sender.send(()) {
                error!("Failed to send stop signal: {:?}", e);
            }
        }
        Err(e) => error!("HTTP server error: {:?}", e),
    }
}

async fn root() -> &'static str {
    "Hello, world!"
}
