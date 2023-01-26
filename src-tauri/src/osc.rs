use std::net::UdpSocket;

use log::error;
use once_cell::sync::Lazy;
use rosc::{encoder, OscMessage, OscPacket};

static SOCKET: Lazy<UdpSocket> = Lazy::new(|| UdpSocket::bind("0.0.0.0:0").unwrap());

pub fn send_osc_message(addr: &str, msg: OscMessage) {
    match encoder::encode(&OscPacket::Message(msg)) {
        Ok(buf) => {
            if let Err(err) = SOCKET.send_to(&buf, addr) {
                error!("Error sending OSC message: {} / {}", addr, err);
            }
        }
        Err(err) => error!("Error encoding OSC message: {}", err),
    }
}
