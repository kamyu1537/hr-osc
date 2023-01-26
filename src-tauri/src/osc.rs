use once_cell::sync::Lazy;
use rosc::{encoder, OscMessage, OscPacket};
use std::net::UdpSocket;

use log::{error, info};

static SOCKET: Lazy<UdpSocket> = Lazy::new(|| UdpSocket::bind("0.0.0.0:0").unwrap());

pub fn encode_message(msg: OscMessage) -> Option<Vec<u8>> {
    match encoder::encode(&OscPacket::Message(msg)) {
        Ok(buf) => Some(buf),
        Err(_) => None,
    }
}

pub fn send_osc_message(addr: &str, msg_buf: Option<Vec<u8>>) {
    match msg_buf {
        Some(buf) => match SOCKET.send_to(&buf, addr) {
            Ok(_) => info!("OSC message sent"),
            Err(_) => error!("Error sending OSC message"),
        },
        None => error!("Error encoding OSC message"),
    }
}
