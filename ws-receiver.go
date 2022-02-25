package main

import (
	"encoding/json"
	"fmt"
	"github.com/hypebeast/go-osc/osc"
	"time"
)

func WsReceiver() {
	defer close(done)
	for {
		_, message, err := wsConn.ReadMessage()
		if err != nil {
			fmt.Println("message receive error!")
			return
		}

		msg := new(WebSocketReceiveMessage)
		err = json.Unmarshal(message, msg)
		if err != nil {
			fmt.Println("json read failed!")
			return
		}

		fmt.Printf("Your HeartRate: %d\n", msg.Data.HeartRate)
		heartRatePercent := float64(msg.Data.HeartRate) / float64(config.MaxHeartRate)
		_ = oscClient.Send(osc.NewMessage(config.OscPercentPath, float32(heartRatePercent)))
		timeout.Reset(time.Second * time.Duration(config.Timeout))
		SetConnectedValue(true)
	}
}

func WsTimeoutChecker() {
	defer close(done)
	for {
		<-timeout.C
		if connected == true {
			SetConnectedValue(false)
			fmt.Println("websocket disconnected")
		}
	}
}

func SetConnectedValue(conn bool) {
	_ = oscClient.Send(osc.NewMessage(config.OscConnectedPath, conn))
	connected = conn
}
