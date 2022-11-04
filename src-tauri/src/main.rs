#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[macro_use]
extern crate lazy_static;

use rosc::encoder;
use rosc::{OscMessage, OscPacket, OscType};
use std::net::UdpSocket;

lazy_static! {
    static ref SOCKET: UdpSocket = UdpSocket::bind("127.0.0.1:0").unwrap();
}

#[tauri::command]
fn send_float(addr: &str, path: &str, value: f32) {
    let msg_buf = encoder::encode(&OscPacket::Message(OscMessage {
        addr: path.to_string(),
        args: vec![OscType::Float(value)],
    }))
    .unwrap();

    SOCKET.send_to(&msg_buf, addr).unwrap();
}

#[tauri::command]
fn send_bool(addr: &str, path: &str, value: bool) {
    let msg_buf = encoder::encode(&OscPacket::Message(OscMessage {
        addr: path.to_string(),
        args: vec![OscType::Bool(value)],
    }))
    .unwrap();

    SOCKET.send_to(&msg_buf, addr).unwrap();
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_float, send_bool])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
