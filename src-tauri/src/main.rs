#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::net::{UdpSocket};
use rosc::encoder;
use rosc::{OscMessage, OscPacket, OscType};

#[tauri::command]
fn send_float(addr: &str, path: &str, value: f32) {
    let sock = UdpSocket::bind("127.0.0.1:0").unwrap();

    let msg_buf = encoder::encode(&OscPacket::Message(OscMessage {
        addr: path.to_string(),
        args: vec![OscType::Float(value)],
    })).unwrap();

    sock.send_to(&msg_buf, addr).unwrap();
}

#[tauri::command]
fn send_bool(addr: &str, path: &str, value: bool) {
    let sock = UdpSocket::bind("127.0.0.1:0").unwrap();

    let msg_buf = encoder::encode(&OscPacket::Message(OscMessage {
        addr: path.to_string(),
        args: vec![OscType::Bool(value)],
    })).unwrap();

    sock.send_to(&msg_buf, addr).unwrap();
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        // .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![send_float, send_bool])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
