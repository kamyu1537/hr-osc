package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"github.com/hypebeast/go-osc/osc"
	"log"
	"time"
)

var connected bool
var heartRate int64

func SetConnectedValue(conn bool) {
	_ = oscc.Send(osc.NewMessage(config.OscConnectedPath, conn))
	connected = conn
}

func ConnectWebSocketServer(address string) {
	timeout := time.NewTimer(0)
	go receiveTimeout(timeout)

	log.Println("connecting to stromno websocket server")
	ws, _, err := websocket.DefaultDialer.Dial(address, nil)
	if err != nil {
		oscError = "websocket server connection failed"
		return
	}
	log.Println("stromno websocket server connected!")
	defer func() { _ = ws.Close() }()

	receiveMessage(ws, timeout)
}

func receiveMessage(ws *websocket.Conn, timer *time.Timer) {
	for {
		select {
		case <-done:
			log.Println("websocket client closed")
			break
		default:
			_, message, err := ws.ReadMessage()
			if err != nil {
				log.Println(err.Error())
				oscError = "message receive error!"
				continue
			}

			var msg WebSocketReceiveMessage
			err = json.Unmarshal(message, &msg)
			if err != nil {
				log.Println(err.Error())
				oscError = "json read failed!"
				continue
			}

			heartRate = msg.Data.HeartRate
			heartRatePercent := float64(msg.Data.HeartRate) / float64(config.MaxHeartRate)
			_ = oscc.Send(osc.NewMessage(config.OscPercentPath, float32(heartRatePercent)))
			timer.Reset(time.Second * time.Duration(config.Timeout))
			SetConnectedValue(true)
		}
	}
}

func receiveTimeout(timer *time.Timer) {
	for {
		<-timer.C
		if connected == true {
			SetConnectedValue(false)
			log.Println("websocket disconnected")
		}
	}
}
