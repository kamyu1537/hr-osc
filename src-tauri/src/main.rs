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

fn encode_message(msg: OscMessage) -> Option<Vec<u8>> {
    match encoder::encode(&OscPacket::Message(msg)) {
        Ok(buf) => Some(buf),
        Err(_) => None,
    }
}

fn send_osc_message(addr: &str, msg_buf: Option<Vec<u8>>) {
    match msg_buf {
        Some(buf) => match SOCKET.send_to(&buf, addr) {
            Ok(_) => println!("Sent OSC message to {}", addr),
            Err(err) => println!("Error sending OSC message: {}", err),
        },
        None => println!("Error encoding OSC message"),
    }
}

#[tauri::command]
fn send_float(addr: &str, path: &str, value: f32) {
    send_osc_message(
        addr,
        encode_message(OscMessage {
            addr: path.to_string(),
            args: vec![OscType::Float(value)],
        }),
    )
}

#[tauri::command]
fn send_bool(addr: &str, path: &str, value: bool) {
    send_osc_message(
        addr,
        encode_message(OscMessage {
            addr: path.to_string(),
            args: vec![OscType::Bool(value)],
        }),
    )
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_float, send_bool])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
