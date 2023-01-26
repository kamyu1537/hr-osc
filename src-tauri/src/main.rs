#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rosc::{OscMessage, OscType};
use tauri_plugin_log::LogTarget;

pub use osc::*;

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

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![send_float, send_bool])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
