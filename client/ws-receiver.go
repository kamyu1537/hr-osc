package client

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/gorilla/websocket"
	"github.com/hypebeast/go-osc/osc"
)

type WebSocketReceiveMessage struct {
	Timestamp int64                `json:"timestamp"`
	Data      WebSocketReceiveData `json:"data"`
}

type WebSocketReceiveData struct {
	HeartRate int64 `json:"heartRate"`
}

func ConnectWebSocketServer(address string) {
	log.Println("connecting to stromno websocket server")
	ws, _, err := websocket.DefaultDialer.Dial(address, nil)

	timeout := time.NewTimer(0)
	go receiveTimeout(timeout)

	if err != nil {
		setDisplayError(fmt.Sprintf("ws connection: %s", err.Error()))
		return
	}
	log.Println("stromno websocket server connected!")
	defer func() { _ = ws.Close() }()

	setConnected(false)
	receiveMessage(ws, timeout)
}

func receiveMessage(ws *websocket.Conn, timer *time.Timer) {
	defer func() {
		select {
		case <-wsCloseChannel:
			log.Println("channel closed")
		default:
			recover()
		}
	}()

	for {
		// 서버가 활성화 되어있음
		select {
		case <-wsCloseChannel:
			log.Println("channel closed")
			break
		default:
			_ = ws.SetReadDeadline(time.Time{})
			_, message, err := ws.ReadMessage()
			if err != nil {
				setDisplayError(fmt.Sprintf("ws message: %s", err.Error()))
				continue
			}

			var msg WebSocketReceiveMessage
			err = json.Unmarshal(message, &msg)
			if err != nil {
				setDisplayError(fmt.Sprintf("ws message: %s", err.Error()))
				continue
			}

			setHeartRate(msg.Data.HeartRate)
			heartRatePercent := float64(msg.Data.HeartRate) / float64(config.MaxHeartRate)
			heartRatePercent *= 100
			heartRatePercent = math.Floor(heartRatePercent)
			heartRatePercent *= 0.01

			setHeartRatePercent(heartRatePercent)
			_ = oscClient.Send(osc.NewMessage(config.OscPercentPath, float32(heartRatePercent)))
			timer.Reset(time.Second * time.Duration(config.Timeout))
			setConnected(true)
		}
	}
}

func receiveTimeout(timer *time.Timer) {
	for {
		<-timer.C
		if IsConnected == true {
			setConnected(false)
			log.Println("websocket disconnected")
		}
	}
}
