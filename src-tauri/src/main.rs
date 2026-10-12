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
async fn send_float(host: String, port: u16, path: String, value: f32) -> Result<(), String> {
    let osc_message = OscMessage {
        addr: path,
        args: vec![OscType::Float(value)],
    };

    send_osc_message(&host, port, osc_message)
        .await
        .inspect_err(|err| log::error!("Error sending OSC message: {err}"))
}

#[tauri::command]
async fn send_bool(host: String, port: u16, path: String, value: bool) -> Result<(), String> {
    let osc_message = OscMessage {
        addr: path,
        args: vec![OscType::Bool(value)],
    };

    send_osc_message(&host, port, osc_message)
        .await
        .inspect_err(|err| log::error!("Error sending OSC message: {err}"))
}

#[tauri::command]
async fn start_http_server(port: u16, lan: bool) -> Result<(), String> {
    http_server::start_server(port, lan)
        .await
        .inspect_err(|err| log::error!("Error starting HTTP server: {err}"))
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

fn pulsoid_token_entry() -> keyring::Result<keyring::Entry> {
    keyring::Entry::new("me.kamyu.hr-osc", "pulsoid_token")
}

#[tauri::command]
async fn get_pulsoid_token() -> Result<String, String> {
    match pulsoid_token_entry().and_then(|entry| entry.get_password()) {
        Err(keyring::Error::NoEntry) => Ok(String::new()),
        result => result.map_err(|err| err.to_string()),
    }
    .inspect_err(|err| log::error!("Error reading Pulsoid token: {err}"))
}

#[tauri::command]
async fn set_pulsoid_token(token: String) -> Result<(), String> {
    pulsoid_token_entry()
        .and_then(|entry| match token.as_str() {
            "" => match entry.delete_credential() {
                Err(keyring::Error::NoEntry) => Ok(()),
                result => result,
            },
            token => entry.set_password(token),
        })
        .map_err(|err| err.to_string())
        .inspect_err(|err| log::error!("Error saving Pulsoid token: {err}"))
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
            get_pulsoid_token,
            set_pulsoid_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
