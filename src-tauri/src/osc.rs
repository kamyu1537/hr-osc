use std::net::UdpSocket;

use log::error;
use once_cell::sync::Lazy;
use rosc::{encoder, OscMessage, OscPacket};

static SOCKET: Lazy<UdpSocket> = Lazy::new(|| UdpSocket::bind("0.0.0.0:0").unwrap());

pub fn encode_message(msg: OscMessage) -> Option<Vec<u8>> {
    match encoder::encode(&OscPacket::Message(msg)) {
        Ok(buf) => Some(buf),
        Err(_) => None,
    }
}

pub fn send_osc_message(addr: &str, msg_buf: Option<Vec<u8>>) {
    match msg_buf {
        Some(buf) => {
            if let Err(err) = SOCKET.send_to(&buf, addr) {
                error!("Error sending OSC message: {} / {}", addr, err);
            }
        }
        None => error!("Error encoding OSC message"),
    }
}
