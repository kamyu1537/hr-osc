#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use http_server::HTTP_HEARTRATE_RECEIVER;
use rosc::{OscMessage, OscType};
use tauri_plugin_log::{Target, TargetKind};

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
async fn stop_http_server() {
    http_server::stop_server().await;
}

#[tauri::command]
async fn get_http_heartrate() -> i32 {
    HTTP_HEARTRATE_RECEIVER.get_heartrate().await
}

#[tauri::command]
async fn get_http_update_time() -> i64 {
    HTTP_HEARTRATE_RECEIVER.get_heartrate_update().await
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
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
