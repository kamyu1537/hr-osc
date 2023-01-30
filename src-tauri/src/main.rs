#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use http_server::{HTTP_HEARTRATE, HTTP_HEARTRATE_UPDATE};
use rosc::{OscMessage, OscType};
use tauri_plugin_log::LogTarget;

pub use osc::*;

mod http_server;
mod osc;

#[tauri::command]
fn send_float(addr: &str, path: &str, value: f32) {
    let osc_message = OscMessage {
        addr: path.to_owned(),
        args: vec![OscType::Float(value)],
    };

    send_osc_message(addr, osc_message)
}

#[tauri::command]
fn send_bool(addr: &str, path: &str, value: bool) {
    let osc_message = OscMessage {
        addr: path.to_owned(),
        args: vec![OscType::Bool(value)],
    };

    send_osc_message(addr, osc_message)
}

#[tauri::command]
fn start_http_server(port: u16) {
    http_server::start_server(port);
}

#[tauri::command]
fn stop_http_server() {
    http_server::stop_server();
}

#[tauri::command]
fn get_http_heartrate() -> i32 {
    HTTP_HEARTRATE.lock().unwrap().borrow_mut().clone()
}

#[tauri::command]
fn get_http_update_time() -> i64 {
    HTTP_HEARTRATE_UPDATE.lock().unwrap().borrow_mut().clone()
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            send_float,
            send_bool,
            start_http_server,
            stop_http_server,
            get_http_heartrate,
            get_http_update_time,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
