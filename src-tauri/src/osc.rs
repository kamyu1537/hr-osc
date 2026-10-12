use std::{io, net::UdpSocket};

use once_cell::sync::Lazy;
use rosc::{encoder, OscMessage, OscPacket};

static SOCKET_V4: Lazy<io::Result<UdpSocket>> = Lazy::new(|| UdpSocket::bind("0.0.0.0:0"));
static SOCKET_V6: Lazy<io::Result<UdpSocket>> = Lazy::new(|| UdpSocket::bind("[::]:0"));

pub async fn send_osc_message(host: &str, port: u16, msg: OscMessage) -> Result<(), String> {
    let buf = encoder::encode(&OscPacket::Message(msg)).map_err(|err| err.to_string())?;
    let addrs: Vec<_> = tokio::net::lookup_host((host, port))
        .await
        .map_err(|err| format!("{host}: {err}"))?
        .collect();
    let addr = addrs
        .iter()
        .find(|addr| addr.is_ipv4())
        .or(addrs.first())
        .ok_or_else(|| format!("{host}: no address"))?;
    let socket = if addr.is_ipv4() { &*SOCKET_V4 } else { &*SOCKET_V6 };
    socket
        .as_ref()
        .map_err(|err| err.to_string())?
        .send_to(&buf, addr)
        .map_err(|err| format!("{addr}: {err}"))?;
    Ok(())
}
